import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/ui/button";
import { SemiBoldText } from "@/components/ui/typography";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import Input from "@/components/ui/textInput";
import { useTheme } from "@/context/CustomThemeContext";
import SvgEmailOutline from "@/svg_icons/EmailOutline";
import { useToast } from "@/context/ToastContext";
import { setItemAsync } from "@/utils/secureStorage";
import { isValidEmail } from "@/utils/validation";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const ForgetPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [touched, setTouched] = useState(false);

  const { theme } = useTheme();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { safePush } = useSafeNavigation();
  const { showToast } = useToast();
  const styles = createStyles(theme);

  const emailError =
    touched && !isValidEmail(email) ? "Please enter a valid email address" : "";
  const isFormValid = isValidEmail(email);
  const isLoading = store.auth.isLoadingForgotPassword;

  useEffect(() => {
    if (store.auth.isSuccessForgotPassword) {
      (dispatch as any)({ type: "FORGOT_PASSWORD_API_CLEAR" });
      safePush("/(forgetPassword)/forgetPasswordOtp", { email: email.trim() });
    }
  }, [store.auth.isSuccessForgotPassword]);

  useEffect(() => {
    if (store.auth.isErrorForgotPassword && store.auth.errorForgotPassword) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.auth.errorForgotPassword || "Forgot password request failed",
      });
      (dispatch as any)({ type: "FORGOT_PASSWORD_API_CLEAR" });
    }
  }, [store.auth.isErrorForgotPassword, store.auth.errorForgotPassword]);

  const handleSubmit = async () => {
    setTouched(true);
    if (!isFormValid || isLoading) return;

    await setItemAsync("authEmail", email.trim());
    (dispatch as any)({
      type: "SET_AUTH_EMAIL",
      payload: { email: email.trim() },
    });

    await dispatch({
      type: "FORGOT_PASSWORD_API_REQUEST",
      payload: {
        url: "orguser/forgotPassword",
        method: "POST",
        body: { email: email.trim() },
      },
    });
  };

  return (
    <AuthScreenLayout showBackButton>
      <View style={styles.textContainer}>
        <SvgEmailOutline color={theme.colors.neutral.onSurface.light} />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Forget Password
        </SemiBoldText>
      </View>
      <View style={styles.input}>
        <Input
          label="Email address"
          placeholder="Enter email address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (!touched) setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <CustomButton
        variant="primary"
        title="Get OTP"
        weightVariant="semibold"
        disabled={!isFormValid || isLoading}
        loading={isLoading}
        onPress={handleSubmit}
      />
    </AuthScreenLayout>
  );
};

export default ForgetPassword;

const createStyles = (_theme: any) =>
  StyleSheet.create({
    textContainer: {
      gap: 12,
      marginTop: 48,
      alignItems: "center",
    },
    input: {
      marginTop: 30,
      marginBottom: 30,
    },
  });
