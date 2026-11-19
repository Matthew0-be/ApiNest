const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some responses have no body
  }

  if (!res.ok) {
    const error = new Error((data && data.message) || 'Request failed');
    error.status = res.status;
    throw error;
  }
  return data;
}