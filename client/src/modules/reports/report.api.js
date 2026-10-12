import apiClient, { unwrap } from '../../services/apiClient';

export const getDashboard = () => unwrap(apiClient.get('/reports/dashboard'));
export const getPlacementRecords = (params) => unwrap(apiClient.get('/reports/placements', { params }));
// Placeholder on the server (returns 501 until report generation is implemented).
export const generateReport = (format) => unwrap(apiClient.post('/reports/generate', { format }));
