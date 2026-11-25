
import { apiRequest } from "@/services/api/api";
import AUTH_ENDPOINTS from "@/services/endpoints/auth-endpoints";

export const registerUser = (userData) => {
  return apiRequest(AUTH_ENDPOINTS.REGISTER, {
    method: "POST",
    body: JSON.stringify(userData),
    skipAuthRefresh: true,
  });
};

export const loginUser = (credentials) => {
  return apiRequest(AUTH_ENDPOINTS.LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuthRefresh: true,
  });
};

export const logoutUser = () => {
  return apiRequest(AUTH_ENDPOINTS.LOGOUT, {
    method: "POST",
    skipAuthRefresh: true,
  });
};

export const getCurrentUser = () => {
  return apiRequest(AUTH_ENDPOINTS.ME);
};

export const forgotPassword = (email) => {
  return apiRequest(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuthRefresh: true,
  });
};

export const verifyResetOtp = (email, otp) => {
  return apiRequest(AUTH_ENDPOINTS.VERIFY_RESET_OTP, {
    method: "POST",
    body: JSON.stringify({ email, otp }),
    skipAuthRefresh: true,
  });
};

export const resetPassword = (email, otp, newPassword) => {
  return apiRequest(AUTH_ENDPOINTS.RESET_PASSWORD, {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
    skipAuthRefresh: true,
  });
};

export const updateProfile = (fullName) => {
  return apiRequest(AUTH_ENDPOINTS.UPDATE_PROFILE, {
    method: "PATCH",
    body: JSON.stringify({ fullName }),
  });
};

export const changePassword = (currentPassword, newPassword) => {
  return apiRequest(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

export const getAdminDashboard = () => {
  return apiRequest(AUTH_ENDPOINTS.ADMIN_DASHBOARD);
};
