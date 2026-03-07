/**
 * Auth API - login, register, password reset.
 * Uses axios directly (no auth token) but includes X-API-Key.
 */
import axios from "axios";
import { BASE_URL, API_KEY } from "./axios.js";

const headers = () => ({
  "Content-Type": "application/json",
  ...(API_KEY && { "X-API-Key": API_KEY }),
});

export const authApi = {
  login: (body) =>
    axios.post(`${BASE_URL}user/login`, body, { headers: headers() }).then((r) => r.data),

  forgotPassword: (email) =>
    axios.post(`${BASE_URL}user/forgot-password`, { email }, { headers: headers() }).then((r) => r.data),

  verifyResetCode: (email, code) =>
    axios.post(`${BASE_URL}user/verify-reset-code`, { email, code }, { headers: headers() }).then((r) => r.data),

  resetPassword: (password, token) =>
    axios.post(`${BASE_URL}user/reset-password`, { password }, {
      headers: { ...headers(), Authorization: `Bearer ${token}` },
    }).then((r) => r.data),

  register: (body) =>
    axios.post(`${BASE_URL}user/register`, body, { headers: headers() }).then((r) => r.data),

  getRegistrationDraft: (email) =>
    axios.get(`${BASE_URL}user/registration-draft?email=${encodeURIComponent(email)}`, { headers: headers() }).then((r) => r.data),

  saveRegistrationDraft: (body) =>
    axios.post(`${BASE_URL}user/registration-draft`, body, { headers: headers() }).then((r) => r.data),
};

export default authApi;
