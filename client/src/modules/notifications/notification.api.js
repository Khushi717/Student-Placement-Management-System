import apiClient, { unwrap } from '../../services/apiClient';

export const listNotifications = (params) => unwrap(apiClient.get('/notifications', { params }));
export const markRead = (id) => unwrap(apiClient.patch(`/notifications/${id}/read`));
export const markAllRead = () => unwrap(apiClient.patch('/notifications/read-all'));
