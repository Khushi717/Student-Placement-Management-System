import apiClient, { unwrap } from '../../services/apiClient';

export const listCompanies = (params) => unwrap(apiClient.get('/companies', { params }));
export const updateCompany = (id, payload) => unwrap(apiClient.patch(`/companies/${id}`, payload));
export const verifyCompany = (id, payload) => unwrap(apiClient.patch(`/companies/${id}/verification`, payload));
