import apiClient, { unwrap } from '../../services/apiClient';

export const updateMe = (payload) => unwrap(apiClient.patch('/users/me', payload));
export const listUsers = (params) => unwrap(apiClient.get('/users', { params }));
export const setUserStatus = (id, status) => unwrap(apiClient.patch(`/users/${id}/status`, { status }));
