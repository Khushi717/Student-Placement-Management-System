import { User } from '../users/user.model.js';
import { Company } from '../companies/company.model.js';
import { JobPosting } from '../jobs/job.model.js';
import { Application } from '../applications/application.model.js';
import { Offer } from '../offers/offer.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { JOB_STATUS, OFFER_STATUS, ROLES, VERIFICATION_STATUS } from '../../utils/constants.js';

const ACCEPTED = { status: OFFER_STATUS.ACCEPTED };

/** Placement statistics computed live from offers/applications (read-only; no extra collection needed yet). */
export async function getDashboard() {
  const [totalStudents, approvedCompanies, pendingCompanies, openJobs, totalApplications, offersMade, acceptedStudentIds, applicationsByStatus] =
    await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      Company.countDocuments({ verificationStatus: VERIFICATION_STATUS.APPROVED }),
      Company.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING }),
      JobPosting.countDocuments({ status: JOB_STATUS.PUBLISHED, deadline: { $gte: new Date() } }),
      Application.countDocuments(),
      Offer.countDocuments(),
      Offer.distinct('student', ACCEPTED),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

  const placed = acceptedStudentIds.length;
  const [branchWise, companyWise, packageWise, packageStats] = await Promise.all([
    branchWiseStats(),
    companyWiseStats(),
    packageWiseStats(),
    Offer.aggregate([{ $match: ACCEPTED }, { $group: { _id: null, avg: { $avg: '$packageLPA' }, max: { $max: '$packageLPA' }, min: { $min: '$packageLPA' } } }]),
  ]);

  const round = (n) => (n == null ? 0 : Math.round(n * 100) / 100);
  return {
    totals: {
      totalStudents,
      placedStudents: placed,
      placementRate: totalStudents ? round((placed / totalStudents) * 100) : 0,
      approvedCompanies,
      pendingCompanies,
      openJobs,
      totalApplications,
      offersMade,
      averagePackageLPA: round(packageStats[0]?.avg),
      highestPackageLPA: round(packageStats[0]?.max),
    },
    applicationsByStatus: applicationsByStatus.map((s) => ({ status: s._id, count: s.count })),
    branchWise,
    companyWise,
    packageWise,
  };
}

async function branchWiseStats() {
  const [students, placed] = await Promise.all([
    User.aggregate([{ $match: { role: ROLES.STUDENT } }, { $group: { _id: '$studentProfile.branch', total: { $sum: 1 } } }]),
    Offer.aggregate([
      { $match: ACCEPTED },
      { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 's' } },
      { $unwind: '$s' },
      { $group: { _id: '$s.studentProfile.branch', students: { $addToSet: '$student' } } },
      { $project: { placed: { $size: '$students' } } },
    ]),
  ]);
  const placedMap = new Map(placed.map((p) => [p._id, p.placed]));
  return students.map((s) => ({ branch: s._id || 'UNKNOWN', total: s.total, placed: placedMap.get(s._id) || 0 })).sort((a, b) => b.placed - a.placed);
}

async function companyWiseStats() {
  const rows = await Offer.aggregate([
    { $match: ACCEPTED },
    { $group: { _id: '$company', placed: { $sum: 1 }, avgPackageLPA: { $avg: '$packageLPA' } } },
    { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'c' } },
    { $unwind: '$c' },
    { $project: { _id: 0, company: '$c.name', placed: 1, avgPackageLPA: { $round: ['$avgPackageLPA', 2] } } },
    { $sort: { placed: -1 } },
    { $limit: 15 },
  ]);
  return rows;
}

async function packageWiseStats() {
  const buckets = [0, 5, 10, 15, 20, 1001];
  const labels = ['< 5 LPA', '5-10 LPA', '10-15 LPA', '15-20 LPA', '20+ LPA'];
  const rows = await Offer.aggregate([{ $match: ACCEPTED }, { $bucket: { groupBy: '$packageLPA', boundaries: buckets, default: 'other', output: { count: { $sum: 1 } } } }]);
  const byStart = new Map(rows.map((r) => [r._id, r.count]));
  return labels.map((range, i) => ({ range, count: byStart.get(buckets[i]) || 0 }));
}

/** Historical placement records (accepted offers), optionally filtered by calendar year of acceptance. */
export async function getPlacementRecords({ year } = {}) {
  const filter = { ...ACCEPTED };
  if (year) filter.respondedAt = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${Number(year) + 1}-01-01`) };
  const offers = await Offer.find(filter)
    .populate('student', 'name email studentProfile.branch studentProfile.enrollmentNo')
    .populate('company', 'name')
    .populate('job', 'title')
    .sort({ respondedAt: -1 })
    .limit(500);
  return offers.map((o) => ({
    offerId: o._id,
    student: o.student?.name,
    enrollmentNo: o.student?.studentProfile?.enrollmentNo,
    branch: o.student?.studentProfile?.branch,
    company: o.company?.name,
    role: o.job?.title,
    packageLPA: o.packageLPA,
    acceptedOn: o.respondedAt,
  }));
}

/**
 * PLACEHOLDER (integration point): real PDF/Excel generation is out of scope for the foundation phase.
 * A future implementation would call getPlacementRecords()/getDashboard() and stream a file here.
 */
export async function generateReport({ format }) {
  throw ApiError.notImplemented(`Report generation (${format}) is not implemented yet`);
}
