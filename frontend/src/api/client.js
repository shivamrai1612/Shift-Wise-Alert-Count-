const API_BASE = import.meta.env.VITE_API_URL || '/api';

function buildQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.blob();
}

export const api = {
  getShifts: (filters) => request(`/shifts${buildQuery(filters)}`),
  getAnalytics: (filters) => request(`/shifts/analytics${buildQuery(filters)}`),
  getShiftNames: () => request('/shifts/names'),
  createShift: (data) =>
    request('/shifts', { method: 'POST', body: JSON.stringify(data) }),
  updateShift: (id, data) =>
    request(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteShift: (id) => request(`/shifts/${id}`, { method: 'DELETE' }),
  exportExcel: (filters) =>
    request(`/shifts/export/excel${buildQuery(filters)}`),
  exportPdf: (filters) => request(`/shifts/export/pdf${buildQuery(filters)}`),
  getExcelStatus: () => request('/excel/status'),
  downloadLiveExcel: () => request('/excel/download'),
  removeExcelTemplate: () =>
    request('/excel/template', { method: 'DELETE' }),
  uploadExcelTemplate: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/excel/template`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Upload failed (${res.status})`);
    }
    return res.json();
  },
};

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
