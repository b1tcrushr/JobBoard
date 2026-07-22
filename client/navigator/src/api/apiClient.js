
const BASE_URL = "http://localhost:3000";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if ((res.status === 401 || res.status === 403) && (data.error === "Access token required" || data.error === "Invalid or expired token")) {
    if (token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth_logout"));
    }
  }

  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  post:   (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  get:    (path)      => request(path, { method: "GET" }),
  patch:  (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path)      => request(path, { method: "DELETE" }),
};