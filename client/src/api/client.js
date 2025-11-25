export const API_BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
	const url = `${API_BASE_URL}${path}`;
	const defaultHeaders = { 'Content-Type': 'application/json' };
	const response = await fetch(url, {
		method: options.method || 'GET',
		headers: { ...defaultHeaders, ...(options.headers || {}) },
		body: options.body ? JSON.stringify(options.body) : undefined,
		credentials: 'include',
	});
	let data = null;
	const type = response.headers.get('content-type') || '';
	if (type.includes('application/json')) {
		data = await response.json().catch(() => null);
	}
	if (!response.ok) {
		const message = (data && (data.message || data.error)) || `Request failed: ${response.status}`;
		throw new Error(message);
	}
	return data ?? {};
}

export const api = {
	get: (p) => request(p, { method: 'GET' }),
	post: (p, body) => request(p, { method: 'POST', body }),
	put: (p, body) => request(p, { method: 'PUT', body }),
	delete: (p) => request(p, { method: 'DELETE' }),
};
