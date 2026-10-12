import apiClient, { unwrap } from '../../services/apiClient';

export const scheduleInterview = (payload) => unwrap(apiClient.post('/interviews', payload));
export const myInterviews = () => unwrap(apiClient.get('/interviews/me'));
