import apiClient, { unwrap } from '../../services/apiClient';

export const createOffer = (payload) => unwrap(apiClient.post('/offers', payload));
export const myOffers = () => unwrap(apiClient.get('/offers/me'));
export const respondToOffer = (id, response) => unwrap(apiClient.patch(`/offers/${id}/respond`, { response }));
