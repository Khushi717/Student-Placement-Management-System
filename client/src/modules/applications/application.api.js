import apiClient, { unwrap } from '../../services/apiClient';

export const apply = (payload) => unwrap(apiClient.post('/applications', payload));
export const myApplications = (params) => unwrap(apiClient.get('/applications/me', { params }));
export const listApplicants = (params) => unwrap(apiClient.get('/applications', { params }));
export const updateApplicationStatus = (id, payload) => unwrap(apiClient.patch(`/applications/${id}/status`, payload));
export const withdrawApplication = (id) => unwrap(apiClient.patch(`/applications/${id}/withdraw`));
