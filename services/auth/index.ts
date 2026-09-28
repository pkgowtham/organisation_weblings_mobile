import type { ActionType } from "../../store/action.types";
import { initialState } from "../../store/initialState";
import type { Store } from "../../store/store.types";

export const authReducer = (
  state: Store["auth"] = initialState.auth,
  action: ActionType
): Store["auth"] => {
  switch (action.type) {
    // ── Non-API: store transient auth data ─────────────────────────────────
    case "SET_AUTH_EMAIL":
      return { ...state, email: (action as any).payload.email };
    case "SET_AUTH_USER_ID":
      return { ...state, userId: (action as any).payload.userId };
    case "SET_AUTH_TOKEN":
      return { ...state, authToken: (action as any).payload.authToken };
    case "SET_AUTH_ORG_AUTH_ID":
      return { ...state, orgAuthId: (action as any).payload.orgAuthId };
    case "CLEAR_AUTH":
      return initialState.auth;

    // ── Check Email ────────────────────────────────────────────────────────
    case "CHECK_EMAIL_API_LOADING":
      return { ...state, isLoadingCheckEmail: true, isSuccessCheckEmail: false, isErrorCheckEmail: false, errorCheckEmail: null };
    case "CHECK_EMAIL_API_SUCCESS":
      return { ...state, isLoadingCheckEmail: false, isSuccessCheckEmail: true, isErrorCheckEmail: false, errorCheckEmail: null };
    case "CHECK_EMAIL_API_FAILURE":
      return { ...state, isLoadingCheckEmail: false, isSuccessCheckEmail: false, isErrorCheckEmail: true, errorCheckEmail: (action as any).error?.message || null };
    case "CHECK_EMAIL_API_CLEAR":
      return { ...state, isLoadingCheckEmail: false, isSuccessCheckEmail: false, isErrorCheckEmail: false, errorCheckEmail: null };

    // ── Signup ─────────────────────────────────────────────────────────────
    case "SIGNUP_API_LOADING":
      return { ...state, isLoadingSignup: true, isSuccessSignup: false, isErrorSignup: false, errorSignup: null };
    case "SIGNUP_API_SUCCESS":
      return { ...state, isLoadingSignup: false, isSuccessSignup: true, isErrorSignup: false, errorSignup: null };
    case "SIGNUP_API_FAILURE":
      return { ...state, isLoadingSignup: false, isSuccessSignup: false, isErrorSignup: true, errorSignup: (action as any).error?.message || null };
    case "SIGNUP_API_CLEAR":
      return { ...state, isLoadingSignup: false, isSuccessSignup: false, isErrorSignup: false, errorSignup: null };

    // ── Verify Email ───────────────────────────────────────────────────────
    case "VERIFY_EMAIL_API_LOADING":
      return { ...state, isLoadingVerifyEmail: true, isSuccessVerifyEmail: false, isErrorVerifyEmail: false };
    case "VERIFY_EMAIL_API_SUCCESS":
      return { ...state, isLoadingVerifyEmail: false, isSuccessVerifyEmail: true, isErrorVerifyEmail: false };
    case "VERIFY_EMAIL_API_FAILURE":
      return { ...state, isLoadingVerifyEmail: false, isSuccessVerifyEmail: false, isErrorVerifyEmail: true };
    case "VERIFY_EMAIL_API_CLEAR":
      return { ...state, isLoadingVerifyEmail: false, isSuccessVerifyEmail: false, isErrorVerifyEmail: false };

    // ── Send Mobile OTP ────────────────────────────────────────────────────
    case "SEND_MOBILE_OTP_API_LOADING":
      return { ...state, isLoadingMobileOtp: true, isSuccessMobileOtp: false, isErrorMobileOtp: false };
    case "SEND_MOBILE_OTP_API_SUCCESS":
      return { ...state, isLoadingMobileOtp: false, isSuccessMobileOtp: true, isErrorMobileOtp: false };
    case "SEND_MOBILE_OTP_API_FAILURE":
      return { ...state, isLoadingMobileOtp: false, isSuccessMobileOtp: false, isErrorMobileOtp: true };
    case "SEND_MOBILE_OTP_API_CLEAR":
      return { ...state, isLoadingMobileOtp: false, isSuccessMobileOtp: false, isErrorMobileOtp: false };

    // ── Verify Mobile OTP ──────────────────────────────────────────────────
    case "VERIFY_MOBILE_OTP_API_LOADING":
      return { ...state, isLoadingVerifyMobile: true, isSuccessVerifyMobile: false, isErrorVerifyMobile: false };
    case "VERIFY_MOBILE_OTP_API_SUCCESS":
      return { ...state, isLoadingVerifyMobile: false, isSuccessVerifyMobile: true, isErrorVerifyMobile: false };
    case "VERIFY_MOBILE_OTP_API_FAILURE":
      return { ...state, isLoadingVerifyMobile: false, isSuccessVerifyMobile: false, isErrorVerifyMobile: true };
    case "VERIFY_MOBILE_OTP_API_CLEAR":
      return { ...state, isLoadingVerifyMobile: false, isSuccessVerifyMobile: false, isErrorVerifyMobile: false };

    // ── Update MFA ─────────────────────────────────────────────────────────
    case "UPDATE_MFA_API_LOADING":
      return { ...state, isLoadingUpdateMfa: true, isSuccessUpdateMfa: false, isErrorUpdateMfa: false };
    case "UPDATE_MFA_API_SUCCESS":
      return { ...state, isLoadingUpdateMfa: false, isSuccessUpdateMfa: true, isErrorUpdateMfa: false };
    case "UPDATE_MFA_API_FAILURE":
      return { ...state, isLoadingUpdateMfa: false, isSuccessUpdateMfa: false, isErrorUpdateMfa: true };
    case "UPDATE_MFA_API_CLEAR":
      return { ...state, isLoadingUpdateMfa: false, isSuccessUpdateMfa: false, isErrorUpdateMfa: false };

    // ── Login ──────────────────────────────────────────────────────────────
    case "LOGIN_API_LOADING":
      return { ...state, isLoadingLogin: true, isSuccessLogin: false, isErrorLogin: false, errorLogin: null };
    case "LOGIN_API_SUCCESS":
      return { ...state, isLoadingLogin: false, isSuccessLogin: true, isErrorLogin: false, errorLogin: null };
    case "LOGIN_API_FAILURE":
      return { ...state, isLoadingLogin: false, isSuccessLogin: false, isErrorLogin: true, errorLogin: (action as any).error?.message || null };
    case "LOGIN_API_CLEAR":
      return { ...state, isLoadingLogin: false, isSuccessLogin: false, isErrorLogin: false, errorLogin: null };

    // ── Verify Login OTP ───────────────────────────────────────────────────
    case "VERIFY_LOGIN_OTP_API_LOADING":
      return { ...state, isLoadingVerifyLoginOtp: true, isSuccessVerifyLoginOtp: false, isErrorVerifyLoginOtp: false };
    case "VERIFY_LOGIN_OTP_API_SUCCESS":
      return { ...state, isLoadingVerifyLoginOtp: false, isSuccessVerifyLoginOtp: true, isErrorVerifyLoginOtp: false };
    case "VERIFY_LOGIN_OTP_API_FAILURE":
      return { ...state, isLoadingVerifyLoginOtp: false, isSuccessVerifyLoginOtp: false, isErrorVerifyLoginOtp: true };
    case "VERIFY_LOGIN_OTP_API_CLEAR":
      return { ...state, isLoadingVerifyLoginOtp: false, isSuccessVerifyLoginOtp: false, isErrorVerifyLoginOtp: false };

    // ── Forgot Password ─────────────────────────────────────────────────────
    case "FORGOT_PASSWORD_API_LOADING":
      return { ...state, isLoadingForgotPassword: true, isSuccessForgotPassword: false, isErrorForgotPassword: false, errorForgotPassword: null };
    case "FORGOT_PASSWORD_API_SUCCESS":
      return { ...state, isLoadingForgotPassword: false, isSuccessForgotPassword: true, isErrorForgotPassword: false, errorForgotPassword: null };
    case "FORGOT_PASSWORD_API_FAILURE":
      return { ...state, isLoadingForgotPassword: false, isSuccessForgotPassword: false, isErrorForgotPassword: true, errorForgotPassword: (action as any).error?.message || null };
    case "FORGOT_PASSWORD_API_CLEAR":
      return { ...state, isLoadingForgotPassword: false, isSuccessForgotPassword: false, isErrorForgotPassword: false, errorForgotPassword: null };

    // ── Verify Forgot Password OTP ──────────────────────────────────────────
    case "VERIFY_FORGOT_PASSWORD_OTP_API_LOADING":
      return { ...state, isLoadingVerifyForgotPasswordOtp: true, isSuccessVerifyForgotPasswordOtp: false, isErrorVerifyForgotPasswordOtp: false };
    case "VERIFY_FORGOT_PASSWORD_OTP_API_SUCCESS":
      return { ...state, isLoadingVerifyForgotPasswordOtp: false, isSuccessVerifyForgotPasswordOtp: true, isErrorVerifyForgotPasswordOtp: false };
    case "VERIFY_FORGOT_PASSWORD_OTP_API_FAILURE":
      return { ...state, isLoadingVerifyForgotPasswordOtp: false, isSuccessVerifyForgotPasswordOtp: false, isErrorVerifyForgotPasswordOtp: true };
    case "VERIFY_FORGOT_PASSWORD_OTP_API_CLEAR":
      return { ...state, isLoadingVerifyForgotPasswordOtp: false, isSuccessVerifyForgotPasswordOtp: false, isErrorVerifyForgotPasswordOtp: false };

    // ── Reset Password ──────────────────────────────────────────────────────
    case "RESET_PASSWORD_API_LOADING":
      return { ...state, isLoadingResetPassword: true, isSuccessResetPassword: false, isErrorResetPassword: false, errorResetPassword: null };
    case "RESET_PASSWORD_API_SUCCESS":
      return { ...state, isLoadingResetPassword: false, isSuccessResetPassword: true, isErrorResetPassword: false, errorResetPassword: null };
    case "RESET_PASSWORD_API_FAILURE":
      return { ...state, isLoadingResetPassword: false, isSuccessResetPassword: false, isErrorResetPassword: true, errorResetPassword: (action as any).error?.message || null };
    case "RESET_PASSWORD_API_CLEAR":
      return { ...state, isLoadingResetPassword: false, isSuccessResetPassword: false, isErrorResetPassword: false, errorResetPassword: null };

    // ── Resend OTP ──────────────────────────────────────────────────────────
    case "RESEND_OTP_API_LOADING":
      return { ...state, isLoadingResendOtp: true, isSuccessResendOtp: false, isErrorResendOtp: false };
    case "RESEND_OTP_API_SUCCESS":
      return { ...state, isLoadingResendOtp: false, isSuccessResendOtp: true, isErrorResendOtp: false };
    case "RESEND_OTP_API_FAILURE":
      return { ...state, isLoadingResendOtp: false, isSuccessResendOtp: false, isErrorResendOtp: true };
    case "RESEND_OTP_API_CLEAR":
      return { ...state, isLoadingResendOtp: false, isSuccessResendOtp: false, isErrorResendOtp: false };

    // ── Verify MFA OTP ──────────────────────────────────────────────────────
    case "VERIFY_MFA_OTP_API_LOADING":
      return { ...state, isLoadingVerifyMfaOtp: true, isSuccessVerifyMfaOtp: false, isErrorVerifyMfaOtp: false };
    case "VERIFY_MFA_OTP_API_SUCCESS":
      return { ...state, isLoadingVerifyMfaOtp: false, isSuccessVerifyMfaOtp: true, isErrorVerifyMfaOtp: false };
    case "VERIFY_MFA_OTP_API_FAILURE":
      return { ...state, isLoadingVerifyMfaOtp: false, isSuccessVerifyMfaOtp: false, isErrorVerifyMfaOtp: true };
    case "VERIFY_MFA_OTP_API_CLEAR":
      return { ...state, isLoadingVerifyMfaOtp: false, isSuccessVerifyMfaOtp: false, isErrorVerifyMfaOtp: false };

    default:
      return state;
  }
};
