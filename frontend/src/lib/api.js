import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, "");
if (!BACKEND_URL) {
  console.error("Missing REACT_APP_BACKEND_URL. Set it to the public backend URL before deploying.");
}
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// Settings
export const fetchSettings = () => api.get("/settings").then((r) => r.data);
export const updateSettings = (p) => api.put("/settings", p).then((r) => r.data);

// Log entries
export const fetchLogEntries = (date) => api.get("/log", { params: { date } }).then((r) => r.data);
export const createLogEntry = (p) => api.post("/log", p).then((r) => r.data);
export const deleteLogEntry = (id) => api.delete(`/log/${id}`).then((r) => r.data);
export const fetchLogStats = () => api.get("/log/stats").then((r) => r.data);
export const createSession = (p) => api.post("/sessions", p).then((r) => r.data);
