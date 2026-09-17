const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/v1';

type RequestOptions = RequestInit & { authenticated?: boolean };
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export function accessToken() { return sessionStorage.getItem('safedrive_access_token'); }
export function setAccessToken(token: string) { sessionStorage.setItem('safedrive_access_token', token); }
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = accessToken(); if (options.authenticated !== false && token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) throw new ApiError(response.status, (await response.json().catch(() => null))?.detail ?? 'Request failed');
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
export type TelemetrySample = { client_event_id: string; occurred_at: string; latitude?: number; longitude?: number; speed_mps?: number; accuracy_m?: number; acceleration_g?: number; event_type?: string; payload?: Record<string, unknown> };
export const tripsApi = {
  start: () => api<{ id: string }>('/trips', { method: 'POST', body: JSON.stringify({ client_trip_id: crypto.randomUUID() }) }),
  upload: (id: string, samples: TelemetrySample[]) => api(`/trips/${id}/telemetry`, { method: 'POST', body: JSON.stringify({ samples }) }),
  finish: (id: string) => api<{ score: number; points_awarded: number }>(`/trips/${id}/finish`, { method: 'POST' }),
};
