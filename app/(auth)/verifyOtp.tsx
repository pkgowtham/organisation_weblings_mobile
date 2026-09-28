import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import CustomButton from "@/components/ui/button";
import { MediumText, SemiBoldText } from "@/components/ui/typography";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTheme } from "@/context/CustomThemeContext";
import SvgShieldCheck from "@/svg_icons/ShieldCheck";
import OtpInput from "@/components/ui/otpInput";
import { useToast } from "@/context/ToastContext";
import { setItemAsync, getItemAsync } from "@/utils/secureStorage";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const VerifyOTP = () => {
  const { theme } = useTheme();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { safePush } = useSafeNavigation();
  const params = useLocalSearchParams();
  const { showToast } = useToast();

  const [otp, setOtp] = useState("");
  const { timer, resetTimer } = useOtpTimer({ initialSeconds: 60 });
  const styles = createStyles(theme);

  const isLoginFlow = params.flow === "login";

  const isLoading = isLoginFlow
    ? store.auth.isLoadingVerifyLoginOtp
    : store.auth.isLoadingVerifyMobile;
  const isResending = store.auth.isLoadingResendOtp;
  const email = store.auth.email || "your email";
  const mobileParam = (params.mobile as string) || "";
  const targetRecipient = isLoginFlow
    ? email
    : (mobileParam || store.profile?.profileData?.primaryMobile || "your mobile number");

  useEffect(() => {
    if (isLoginFlow && store.auth.isSuccessVerifyLoginOtp) {
      (dispatch as any)({ type: "VERIFY_LOGIN_OTP_API_CLEAR" });
      safePush("/(protected)/(tabs)");
    } else if (!isLoginFlow && store.auth.isSuccessVerifyMobile) {
      (dispatch as any)({ type: "VERIFY_MOBILE_OTP_API_CLEAR" });
      safePush("/(auth)/enableTwoFactor");
    }
  }, [
    store.auth.isSuccessVerifyLoginOtp,
    store.auth.isSuccessVerifyMobile,
    isLoginFlow,
  ]);

  useEffect(() => {
    if (isLoginFlow && store.auth.isErrorVerifyLoginOtp) {
      showToast({
        iconType: "error",
        type: "error",
        title: "Login OTP verification failed",
      });
      (dispatch as any)({ type: "VERIFY_LOGIN_OTP_API_CLEAR" });
    } else if (!isLoginFlow && store.auth.isErrorVerifyMobile) {
      showToast({
        iconType: "error",
        type: "error",
        title: "Mobile OTP verification failed",
      });
      (dispatch as any)({ type: "VERIFY_MOBILE_OTP_API_CLEAR" });
    }
  }, [
    store.auth.isErrorVerifyLoginOtp,
    store.auth.isErrorVerifyMobile,
    isLoginFlow,
  ]);

  const handleSubmit = async () => {
    if (otp.length < 6 || isLoading) return;

    const userId =
      store.auth.userId || (await getItemAsync("authUserId")) || "";

    if (isLoginFlow) {
      const result: any = await dispatch({
        type: "VERIFY_LOGIN_OTP_API_REQUEST",
        payload: {
          url: "orguser/verifyLoginOtp",
          method: "POST",
          body: { userId, code: otp },
        },
      });

      if (result) {
        const resData = result?.data || result;
        const token = resData?.token || result?.token;
        if (token) {
          await setItemAsync("authToken", token);
          (dispatch as any)({
            type: "SET_AUTH_TOKEN",
            payload: { authToken: token },
          });
        }
        const orgAuthId =
          resData?.orgAuthId ||
          resData?.user?.orgAuthId ||
          resData?.orgId ||
          resData?.organisationId ||
          resData?.user?.orgId;
        if (orgAuthId) {
          await setItemAsync("orgAuthId", orgAuthId);
          (dispatch as any)({
            type: "SET_AUTH_ORG_AUTH_ID",
            payload: { orgAuthId },
          });
        }
      }
    } else {
      await dispatch({
        type: "VERIFY_MOBILE_OTP_API_REQUEST",
        payload: {
          url: "orguser/verifyMobileOtp",
          method: "POST",
          body: { userId, code: otp },
        },
      });
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;

    const userId =
      store.auth.userId || (await getItemAsync("authUserId")) || "";

    await dispatch({
      type: "RESEND_OTP_API_REQUEST",
      payload: {
        url: "orguser/resendOtp",
        method: "POST",
        body: { userId, type: isLoginFlow ? "MFA" : "MOBILE" },
      },
    });

    resetTimer(60);
    showToast({
      iconType: "success",
      type: "success",
      title: "OTP resent successfully",
    });
  };

  return (
    <AuthScreenLayout showBackButton>
      <View style={styles.textContainer}>
        <SvgShieldCheck color={theme.colors.neutral.onSurface.light} />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          {isLoginFlow
            ? "Two-Step Verification"
            : "Verify Mobile OTP"}
        </SemiBoldText>
        <View style={styles.supportText}>
          <MediumText
            fontVariant="LS"
            color="colors.neutral.onSurface.dark"
          >
            Enter the 6 digit code sent to
          </MediumText>
          <SemiBoldText
            fontVariant="LS"
            color="colors.neutral.onSurface.medium"
          >
            {targetRecipient}
          </SemiBoldText>
        </View>
      </View>
      <View style={styles.input}>
        <OtpInput
          length={6}
          onComplete={(code) => setOtp(code)}
          autoFocus={true}
          focusColor={theme.colors.brand.surface.medium}
        />
        <View style={styles.resendContainer}>
          <MediumText
            fontVariant="BS"
            color="colors.neutral.onSurface.dark"
          >
            {timer > 0
              ? `Resend OTP in ${timer}s`
              : "Didn't receive the code? "}
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
        title="Continue"
        weightVariant="semibold"
        disabled={otp.length < 6 || isLoading}
        loading={isLoading}
        onPress={handleSubmit}
      />
    </AuthScreenLayout>
  );
};

export default VerifyOTP;

const createStyles = (_theme: any) =>
  StyleSheet.create({
    textContainer: {
      gap: 12,
      marginTop: 48,
      alignItems: "center",
    },
    supportText: {
      alignItems: "center",
      justifyContent: "center",
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
