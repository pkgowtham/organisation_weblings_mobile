import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { SemiBoldText, RegularText } from "@/components/ui/typography";
import CustomButton from "@/components/ui/button";
import OtpInput from "@/components/ui/otpInput";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useLocalSearchParams } from "expo-router";
import SvgEmailOutline from "@/svg_icons/EmailOutline";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useToast } from "@/context/ToastContext";
import { getItemAsync } from "@/utils/secureStorage";
import { useOtpTimer } from "@/hooks/useOtpTimer";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

export default function VerifyEmailOtpScreen() {
  const [otpCode, setOtpCode] = useState("");
  const { timer, resetTimer } = useOtpTimer({ initialSeconds: 60 });

  const { theme } = useTheme();
  const { safePush } = useSafeNavigation();
  const params = useLocalSearchParams();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { showToast } = useToast();
  const styles = createStyles(theme);

  const targetEmail =
    (params.email as string) ||
    store.auth.email ||
    "your email address";

  const isLoading = store.auth.isLoadingVerifyEmail;
  const isResending = store.auth.isLoadingResendOtp;

  useEffect(() => {
    if (store.auth.isSuccessVerifyEmail) {
      (dispatch as any)({ type: "VERIFY_EMAIL_API_CLEAR" });
      safePush("/(auth)/enterMobile");
    }
  }, [store.auth.isSuccessVerifyEmail]);

  useEffect(() => {
    if (store.auth.isErrorVerifyEmail) {
      showToast({
        iconType: "error",
        type: "error",
        title: "Failed to verify email OTP",
      });
      (dispatch as any)({ type: "VERIFY_EMAIL_API_CLEAR" });
    }
  }, [store.auth.isErrorVerifyEmail]);

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6 || isLoading) return;

    const userId =
      store.auth.userId || (await getItemAsync("authUserId")) || "";

    await dispatch({
      type: "VERIFY_EMAIL_API_REQUEST",
      payload: {
        url: "orguser/verifyEmail",
        method: "POST",
        body: { userId, code: otpCode },
      },
    });
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
        body: { userId, type: "EMAIL" },
      },
    });

    resetTimer(60);
    showToast({
      iconType: "success",
      type: "success",
      title: "OTP sent to email",
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
        <RegularText
          fontVariant="BS"
          color="colors.neutral.onSurface.dark"
          style={styles.instructionText}
        >
          {`We sent a reset link to `}
          <SemiBoldText
            fontVariant="BS"
            color="colors.neutral.onSurface.light"
          >
            {targetEmail}
          </SemiBoldText>
          {` enter 6 digit code that is mentioned in the email`}
        </RegularText>
      </View>

      <View style={styles.input}>
        <OtpInput
          length={6}
          onComplete={setOtpCode}
          containerStyle={{ marginBottom: 0 }}
        />
        <View style={styles.resendContainer}>
          <RegularText
            fontVariant="BS"
            color="colors.neutral.onSurface.dark"
          >
            {timer > 0
              ? `Resend in ${timer}s`
              : "Didn't receive the email? "}
          </RegularText>
          {timer === 0 && (
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={isResending}
            >
              <SemiBoldText
                fontVariant="BS"
                color="colors.brand.onSurface.light"
              >
                {isResending ? "Resending..." : "Click to resend"}
              </SemiBoldText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <CustomButton
        variant="primary"
        title="Verify Code"
        weightVariant="semibold"
        disabled={otpCode.length < 6 || isLoading}
        loading={isLoading}
        onPress={handleVerifyOtp}
      />
    </AuthScreenLayout>
  );
}

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
