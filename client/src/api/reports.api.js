import api from './axios.js';

export async function getReportProjectPl(params = {}) {
  const { data } = await api.get('/reports/project-pl', { params });
  return data;
}

export async function getReportPaymentCollection(params = {}) {
  const { data } = await api.get('/reports/payment-collection', { params });
  return data;
}

export async function getReportPendingBills(params = {}) {
  const { data } = await api.get('/reports/pending-bills', { params });
  return data;
}

export async function getReportLabourCost(params = {}) {
  const { data } = await api.get('/reports/labour-cost', { params });
  return data;
}

export async function getReportMaterialUsage(params = {}) {
  const { data } = await api.get('/reports/material-usage', { params });
  return data;
}

/** Download export file (sends auth header). Params: report, branchId?, month?, year?, dateRange? */
export async function downloadExport(format, params) {
  const search = new URLSearchParams(params).toString();
  const url = `/api/reports/export/${format}?${search}`;
  const response = await api.get(url, { responseType: 'blob' });
  const blob = response.data;
  const disposition = response.headers['content-disposition'];
  const match = disposition && /filename="?([^"]+)"?/.exec(disposition);
  const filename = match ? match[1] : `report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
