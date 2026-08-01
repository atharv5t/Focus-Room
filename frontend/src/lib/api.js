import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, "");
if (!BACKEND_URL) {
  console.error("Missing REACT_APP_BACKEND_URL. Set it to the public backend URL before deploying.");
}
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { 
    "Content-Type": "application/json",
    "X-API-Key": process.env.REACT_APP_API_SECRET_KEY 
  },
});

// Settings
export const fetchSettings = (userId) => api.get("/settings", { params: { userId } }).then((r) => r.data);
export const updateSettings = (p) => api.put("/settings", p).then((r) => r.data);

// Log entries
export const fetchLogEntries = (date, userId) => api.get("/log", { params: { date, userId } }).then((r) => r.data);
export const createLogEntry = (p) => api.post("/log", p).then((r) => r.data);
export const deleteLogEntry = (id, userId) => api.delete(`/log/${id}`, { params: { userId } }).then((r) => r.data);
export const fetchLogStats = (userId) => api.get("/log/stats", { params: { userId } }).then((r) => r.data);
export const createSession = (p) => api.post("/sessions", p).then((r) => r.data);