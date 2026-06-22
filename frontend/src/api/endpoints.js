import API from './axiosInstance';

// ── Auth ─────────────────────────────────────
export const signUp = (data) => API.post('/auth/sign-up', data);
export const signIn = (data) => API.post('/auth/sign-in', data);
export const signOut = ()     => API.post('/auth/sign-out');

// ── Users ─────────────────────────────────────
export const getUser = (id)   => API.get(`/users/${id}`);

// ── Subscriptions ─────────────────────────────
export const createSubscription  = (data)     => API.post('/subscriptions', data);
export const getUserSubscriptions = (userId)  => API.get(`/subscriptions/user/${userId}`);
export const getSubscription     = (id)       => API.get(`/subscriptions/${id}`);
export const updateSubscription  = (id, data) => API.put(`/subscriptions/${id}`, data);
export const cancelSubscription  = (id)       => API.put(`/subscriptions/${id}/cancel`);
export const deleteSubscription  = (id)       => API.delete(`/subscriptions/${id}`);
