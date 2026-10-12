import apiClient, { unwrap } from '../../services/apiClient';

export const register = (payload) => unwrap(apiClient.post('/auth/register', payload));
export const login = (payload) => unwrap(apiClient.post('/auth/login', payload));
export const logout = () => unwrap(apiClient.post('/auth/logout'));
export const me = () => unwrap(apiClient.get('/auth/me'));
export const forgotPassword = (email) => unwrap(apiClient.post('/auth/forgot-password', { email }));
export const resetPassword = (payload) => unwrap(apiClient.post('/auth/reset-password', payload));
export const changePassword = (payload) => unwrap(apiClient.patch('/auth/change-password', payload));
