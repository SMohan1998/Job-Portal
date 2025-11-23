import API from "./api";

export const register = (userData) => API.post("/auth/register", userData);
export const login = (credentials) => API.post("/auth/login", credentials);
export const changePassword = (currentPassword, newPassword) =>
  API.post("/auth/change-password", { currentPassword, newPassword });
export const requestPasswordReset = (email) =>
  API.post("/auth/request-password-reset", { email });
export const resetPassword = (token, newPassword) =>
  API.post("/auth/reset-password", { token, newPassword });
export const getMyProfile = () => API.get("/auth/me");
export const updateMyProfile = (profileData) =>
  API.put("/auth/me", profileData);