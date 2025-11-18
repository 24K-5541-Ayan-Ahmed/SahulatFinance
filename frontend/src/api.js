import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Client APIs
export const createClient = (clientData) => api.post('/clients/', clientData);
export const getAllClients = () => api.get('/clients/');
export const getClient = (clientId) => api.get(`/clients/${clientId}`);
export const updateClient = (clientId, payload) => api.put(`/clients/${clientId}`, payload);
export const deleteClient = (clientId) => api.delete(`/clients/${clientId}`);

// Loan APIs
export const getLoanSuggestions = (clientId, loanAmount) => 
  api.post('/loans/suggest', { client_id: clientId, loan_amount: loanAmount });
export const createLoan = (loanData) => api.post('/loans/', loanData);
export const getAllLoans = () => api.get('/loans/');
export const getLoan = (loanId) => api.get(`/loans/${loanId}`);
export const getClientLoans = (clientId) => api.get(`/clients/${clientId}/loans`);
export const updateLoan = (loanId, payload) => api.put(`/loans/${loanId}`, payload);
export const deleteLoan = (loanId) => api.delete(`/loans/${loanId}`);

// Installment APIs
export const getLoanInstallments = (loanId) => api.get(`/loans/${loanId}/installments`);
export const markInstallmentPaid = (installmentId) => api.put(`/installments/${installmentId}/pay`);
export const updateOverdueStatus = () => api.put('/installments/update-overdue');
export const markAllInstallmentsPaid = (loanId) => api.put(`/loans/${loanId}/mark-all-paid`);

// Alert APIs
export const getLoanAlerts = (loanId) => api.get(`/loans/${loanId}/alerts`);
export const getAllAlerts = () => api.get('/alerts/all');

// Dashboard APIs
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;

