import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import CustomButton from "@/components/ui/button";
import { MediumText, SemiBoldText } from "@/components/ui/typography";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTheme } from "@/context/CustomThemeContext";
import OtpInput from "@/components/ui/otpInput";
import SvgEmailOutline from "@/svg_icons/EmailOutline";
import { useToast } from "@/context/ToastContext";
import { getItemAsync } from "@/utils/secureStorage";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const ForgetPasswordOTP = () => {
  const { theme } = useTheme();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { safePush } = useSafeNavigation();
  const params = useLocalSearchParams();
  const { showToast } = useToast();

  const [otp, setOtp] = useState("");
  const { timer, resetTimer } = useOtpTimer({ initialSeconds: 60 });
  const styles = createStyles(theme);

  const targetEmail =
    (params.email as string) || store.auth.email || "your email";
  const isLoading = store.auth.isLoadingVerifyForgotPasswordOtp;
  const isResending =
    store.auth.isLoadingResendOtp || store.auth.isLoadingForgotPassword;

  useEffect(() => {
    if (store.auth.isSuccessVerifyForgotPasswordOtp) {
      (dispatch as any)({ type: "VERIFY_FORGOT_PASSWORD_OTP_API_CLEAR" });
      safePush("/(forgetPassword)/enterNewPassword");
    }
  }, [store.auth.isSuccessVerifyForgotPasswordOtp]);

  useEffect(() => {
    if (store.auth.isErrorVerifyForgotPasswordOtp) {
      showToast({
        iconType: "error",
        type: "error",
        title: "Invalid or expired OTP",
      });
      (dispatch as any)({ type: "VERIFY_FORGOT_PASSWORD_OTP_API_CLEAR" });
    }
  }, [store.auth.isErrorVerifyForgotPasswordOtp]);

  const handleSubmit = async () => {
    if (otp.length < 6 || isLoading) return;

    const email =
      store.auth.email ||
      (params.email as string) ||
      (await getItemAsync("authEmail")) ||
      "";

    await dispatch({
      type: "VERIFY_FORGOT_PASSWORD_OTP_API_REQUEST",
      payload: {
        url: "orguser/verifyForgotPasswordOtp",
        method: "POST",
        body: { email, code: otp },
      },
    });
  };

  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;

    const email =
      store.auth.email ||
      (params.email as string) ||
      (await getItemAsync("authEmail")) ||
      "";
    const userId =
      store.auth.userId || (await getItemAsync("authUserId")) || "";

    if (userId) {
      await dispatch({
        type: "RESEND_OTP_API_REQUEST",
        payload: {
          url: "orguser/resendOtp",
          method: "POST",
          body: { userId, type: "EMAIL" },
        },
      });
    } else {
      await dispatch({
        type: "FORGOT_PASSWORD_API_REQUEST",
        payload: {
          url: "orguser/forgotPassword",
          method: "POST",
          body: { email },
        },
      });
    }

    resetTimer(60);
    showToast({
      iconType: "success",
      type: "success",
      title: "OTP resent to email",
    });
  };

  return (
    <AuthScreenLayout showBackButton>
      <View style={styles.textContainer}>
        <SvgEmailOutline
          width={32}
          height={32}
          viewBox="0 0 24 24"
          color={theme.colors.neutral.onSurface.light}
        />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Check Your Email
        </SemiBoldText>
        <MediumText
          fontVariant="BS"
          color="colors.neutral.onSurface.dark"
          style={styles.instructionText}
        >
          {`We sent a reset link to `}
          <MediumText
            fontVariant="BS"
            color="colors.neutral.onSurface.light"
          >
            {targetEmail}
          </MediumText>
          {` enter 6 digit code that is mentioned in the email`}
        </MediumText>
      </View>
      <View style={styles.input}>
        <OtpInput
          length={6}
          onComplete={setOtp}
          containerStyle={{ marginBottom: 0 }}
        />
        <View style={styles.resendContainer}>
          <MediumText
            fontVariant="BS"
            color="colors.neutral.onSurface.dark"
          >
            {timer > 0
              ? `Resend in ${timer}s`
              : "Didn't receive the email? "}
          </MediumText>
          {timer === 0 && (
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={isResending}
            >
              <MediumText
                fontVariant="BS"
                color="colors.brand.onSurface.light"
              >
                {isResending ? "Resending..." : "Click to resend"}
              </MediumText>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <CustomButton
        variant="primary"
        title="Verify Code"
        weightVariant="semibold"
        disabled={otp.length < 6 || isLoading}
        loading={isLoading}
        onPress={handleSubmit}
      />
    </AuthScreenLayout>
  );
};

export default ForgetPasswordOTP;

const createStyles = (_theme: any) =>
  StyleSheet.create({
    textContainer: {
      gap: 12,
      marginTop: 48,
      alignItems: "center",
    },
    instructionText: {
      textAlign: "center",
      paddingHorizontal: 16,
    },
    input: {
      marginTop: 30,
      marginBottom: 30,
    },
    resendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
    },
  });
