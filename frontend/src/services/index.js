import api from './api';

export const authService = {
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        accountStatus: data.accountStatus
      }));
    }
    return data;
  },

  loginStudent: async (name, email, password) => {
    const data = await api.post('/auth/student/login', { name, email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        accountStatus: data.accountStatus
      }));
    }
    return data;
  },

  registerStudent: async (studentData) => {
    return api.post('/auth/register', studentData);
  },

  register: async (name, email, password, phone, personalEmail) => {
    return api.post('/auth/register', { name, email, password, phone, personalEmail });
  },

  sendAdminOtp: async (phone, email, adminCode) => {
    return api.post('/auth/admin/send-otp', { phone, email, adminCode });
  },

  registerAdmin: async (adminData, email, adminCode, otp) => {
    const payload = (typeof adminData === 'object' && adminData !== null)
      ? adminData
      : { name: adminData, email, adminCode, otp };
    const data = await api.post('/auth/admin/register', payload);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        accountStatus: data.accountStatus
      }));
    }
    return data;
  },

  loginAdmin: async (name, email, adminCode) => {
    const data = await api.post('/auth/admin/login', { name, email, adminCode });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        accountStatus: data.accountStatus
      }));
    }
    return data;
  },

  getMe: () => api.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  deleteAccount: async (password, confirmation) => {
    return api.delete('/auth/account', { password, confirmation });
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('token')
};

export const itemService = {
  reportLost: (data) => api.post('/lost', data),
  getLostItems: (params) => api.get('/lost', params),
  getLostItem: (id) => api.get(`/lost/${id}`),
  getMyLost: () => api.get('/lost/my'),
  resolveLost: (id) => api.put(`/lost/${id}/resolve`),
  cancelLost: (id) => api.put(`/lost/${id}/cancel`),
  deleteLost: (id) => api.delete(`/lost/${id}`),
  updateLostVerification: (id, ownerDescription) => api.put(`/lost/${id}/verification-details`, { ownerDescription }),

  reportFound: (data) => api.post('/found', data),
  getFoundItems: (params) => api.get('/found', params),
  getFoundItem: (id) => api.get(`/found/${id}`),
  getMyFound: () => api.get('/found/my'),
  resolveFound: (id) => api.put(`/found/${id}/resolve`),
  cancelFound: (id) => api.put(`/found/${id}/cancel`),
  deleteFound: (id) => api.delete(`/found/${id}`),
  updateFoundProgress: (id, progressData) => api.put(`/found/${id}/progress`, progressData),

  search: (params) => api.get('/search', params),
  getAutocomplete: (q) => api.get('/search/autocomplete', { q })
};

export const matchService = {
  getMatchesForLost: (lostId) => api.get(`/matches/lost/${lostId}`),
  getMatchesForFound: (foundId) => api.get(`/matches/found/${foundId}`),
  getMatchById: (matchId) => api.get(`/matches/${matchId}`)
};

export const campusService = {
  getLocations: () => api.get('/campus/locations'),
  getGraph: () => api.get('/campus/graph'),
  getShortestPath: (fromId, toId) => api.get('/campus/shortest-path', { from: fromId, to: toId }),
  runBfs: (startId) => api.get('/campus/bfs', { start: startId }),
  runDfs: (startId) => api.get('/campus/dfs', { start: startId })
};

export const claimService = {
  submitClaim: (data) => api.post('/claims', data),
  getMyClaims: () => api.get('/claims/my'),
  getAllClaims: () => api.get('/claims'),
  reviewClaim: (id, status, reviewerNotes, finderNotes) =>
    api.put(`/claims/${id}/review`, { status, reviewerNotes, finderNotes })
};

export const dsaService = {
  insertTrie: (word) => api.post('/dsa/trie/insert', { word }),
  searchTrie: (word) => api.get('/dsa/trie/search', { word }),
  prefixTrie: (prefix) => api.get('/dsa/trie/prefix', { prefix }),

  insertHeap: (value) => api.post('/dsa/heap/insert', { value }),
  extractHeap: () => api.post('/dsa/heap/extract', {}),
  getHeap: () => api.get('/dsa/heap'),

  sortNumbers: (numbers) => api.post('/dsa/sort', { numbers }),
  binarySearch: (sortedNumbers, target) => api.post('/dsa/binary-search', { sortedNumbers, target })
};

export const adminService = {
  getStatistics: () => api.get('/admin/statistics'),
  getUsers: () => api.get('/admin/users'),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle-status`),
  getPendingStudents: () => api.get('/admin/pending-students'),
  getAllStudents: () => api.get('/admin/students'),
  getAllLostItems: () => api.get('/lost'),
  getAllFoundItems: () => api.get('/found'),
  reviewStudentApproval: (id, status) => api.put(`/admin/students/${id}/approval`, { status }),
  deleteLostItem: (id) => api.delete(`/admin/lost/${id}`),
  deleteFoundItem: (id) => api.delete(`/admin/found/${id}`)
};
