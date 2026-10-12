import apiClient, { unwrap } from '../../services/apiClient';

export const listJobs = (params) => unwrap(apiClient.get('/jobs', { params }));
export const getJob = (id) => unwrap(apiClient.get(`/jobs/${id}`));
export const createJob = (payload) => unwrap(apiClient.post('/jobs', payload));
export const updateJob = (id, payload) => unwrap(apiClient.patch(`/jobs/${id}`, payload));
export const setJobStatus = (id, status) => unwrap(apiClient.patch(`/jobs/${id}/status`, { status }));
export const deleteJob = (id) => unwrap(apiClient.delete(`/jobs/${id}`));
