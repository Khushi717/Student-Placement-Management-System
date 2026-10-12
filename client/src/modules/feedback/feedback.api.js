import apiClient, { unwrap } from '../../services/apiClient';

export const submitFeedback = (payload) => unwrap(apiClient.post('/feedback', payload));
export const listFeedback = () => unwrap(apiClient.get('/feedback'));
