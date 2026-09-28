import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/ui/button";
import { SemiBoldText, RegularText } from "@/components/ui/typography";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import Input from "@/components/ui/textInput";
import SvgEye from "@/svg_icons/Eye";
import SvgEyeClose from "@/svg_icons/EyeClose";
import { useTheme } from "@/context/CustomThemeContext";
import SvgLogIn from "@/svg_icons/LogIn";
import { setItemAsync } from "@/utils/secureStorage";
import { useToast } from "@/context/ToastContext";
import { isValidEmail } from "@/utils/validation";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const LogIn = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const { theme } = useTheme();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { safePush } = useSafeNavigation();
  const { showToast } = useToast();
  const styles = createStyles(theme);

  const emailError =
    touched.email && !isValidEmail(email)
      ? "Please enter a valid email address"
      : "";
  const passwordError =
    touched.password && password.trim() === "" ? "Password is required" : "";
  const isFormValid = isValidEmail(email) && password.trim() !== "";
  const isLoading = store.auth.isLoadingLogin;

  // Clear stale auth state when landing on login screen
  useEffect(() => {
    (dispatch as any)({ type: "LOGIN_API_CLEAR" });
    (dispatch as any)({ type: "CLEAR_AUTH" });
  }, []);

  useEffect(() => {
    if (store.auth.isErrorLogin && store.auth.errorLogin) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.auth.errorLogin || "Failed to log in",
      });
      (dispatch as any)({ type: "LOGIN_API_CLEAR" });
    }
  }, [store.auth.isErrorLogin, store.auth.errorLogin]);

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    if (!isFormValid || isLoading) return;

    const result: any = await dispatch({
      type: "LOGIN_API_REQUEST",
      payload: {
        url: "orguser/login",
        method: "POST",
        body: { email: email.trim(), password },
      },
    });

    if (!result) return;

    if (result?.message || result?.data?.message) {
      showToast({
        iconType: "success",
        type: "success",
        title: result?.message || result?.data?.message || "Login successful",
      });
    }

    const data = result?.data || {};

    const token =
      result?.token ||
      result?.authToken ||
      result?.accessToken ||
      result?.jwt ||
      data?.token ||
      data?.authToken ||
      data?.accessToken ||
      data?.jwt ||
      "";

    const userId =
      data?.userId || data?.id || result?.userId || result?.id || "";

    const userEmail = data?.email || result?.email || email.trim();

    if (token) {
      await setItemAsync("authToken", token);
      (dispatch as any)({
        type: "SET_AUTH_TOKEN",
        payload: { authToken: token },
      });
    }

    if (userId) {
      await setItemAsync("authUserId", userId);
      (dispatch as any)({ type: "SET_AUTH_USER_ID", payload: { userId } });
    }

    await setItemAsync("authEmail", userEmail);
    (dispatch as any)({
      type: "SET_AUTH_EMAIL",
      payload: { email: userEmail },
    });

    const orgAuthId =
      data?.orgAuthId ||
      data?.user?.orgAuthId ||
      data?.orgId ||
      data?.organisationId ||
      data?.user?.orgId ||
      result?.orgAuthId ||
      result?.orgId;

    if (orgAuthId) {
      await setItemAsync("orgAuthId", orgAuthId);
      (dispatch as any)({
        type: "SET_AUTH_ORG_AUTH_ID",
        payload: { orgAuthId },
      });
    }

    const isMfaRequired =
      result?.mfaRequired === true ||
      result?.mfaRequired === "true" ||
      data?.mfaRequired === true ||
      data?.mfaRequired === "true" ||
      (data?.mfaEnabled === true && result?.mfaRequired !== false) ||
      (result?.mfaEnabled === true && result?.mfaRequired !== false);

    const isEmailVerified =
      result?.isEmailVerified ??
      data?.isEmailVerified ??
      data?.primaryMailVerified;

    const isMobileVerified =
      result?.isMobileVerified ??
      data?.isMobileVerified ??
      data?.primaryMobileVerified;

    // Navigation decision tree
    if (isEmailVerified === false) {
      safePush("/(auth)/verifyEmailOtp", { email: userEmail });
      return;
    }

    if (isMobileVerified === false) {
      safePush("/(auth)/enterMobile");
      return;
    }

    if (isMfaRequired || (result?.success && !token)) {
      safePush("/(auth)/verifyOtp", { flow: "login" });
      return;
    }

    if (token) {
      safePush("/(protected)/(tabs)");
      return;
    }
  };

  return (
    <AuthScreenLayout>
      <View style={styles.textContainer}>
        <SvgLogIn color={theme.colors.neutral.onSurface.light} />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Login to your Account
        </SemiBoldText>
      </View>
      <View style={styles.input}>
        <Input
          label="Email address"
          placeholder="Enter email address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (!touched.email)
              setTouched((prev) => ({ ...prev, email: true }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="Enter password"
          value={password}
          secureTextEntry={!showPassword}
          onChangeText={(text) => {
            setPassword(text);
            if (!touched.password)
              setTouched((prev) => ({ ...prev, password: true }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          error={passwordError}
          containerStyle={{ marginBottom: 0 }}
          rightIcon={
            showPassword ? (
              <SvgEyeClose color={theme.colors.neutral.onSurface.dark} />
            ) : (
              <SvgEye color={theme.colors.neutral.onSurface.dark} />
            )
          }
          onRightIconClick={() => setShowPassword(!showPassword)}
        />
        <SemiBoldText
          onPress={() => {
            safePush("/(forgetPassword)/forgetPassword");
          }}
          fontVariant="LS"
          color="colors.neutral.onSurface.dark"
          style={styles.forgetText}
        >
          Forgot Password ?
        </SemiBoldText>
      </View>
      <CustomButton
        variant="primary"
        title="Continue"
        weightVariant="semibold"
        disabled={!isFormValid || isLoading}
        loading={isLoading}
        onPress={handleSubmit}
      />
      <View style={styles.confirmSignUpCon}>
        <RegularText color="colors.neutral.onSurface.dark">
          Don’t have an account?
        </RegularText>
        <TouchableOpacity onPress={() => safePush("/(auth)/signUp")}>
          <SemiBoldText color="colors.brand.onSurface.light">
            Sign up
          </SemiBoldText>
        </TouchableOpacity>
        <RegularText color="colors.neutral.onSurface.dark">
          or
        </RegularText>
        <TouchableOpacity onPress={() => safePush("/(auth)/createAccount")}>
          <SemiBoldText color="colors.brand.onSurface.light">
            Register account
          </SemiBoldText>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
};

export default LogIn;

const createStyles = (_theme: any) =>
  StyleSheet.create({
    textContainer: {
      gap: 12,
      marginTop: 48,
      alignItems: "center",
    },
    input: {
      marginTop: 30,
    },
    forgetText: {
      marginTop: 8,
      marginBottom: 16,
    },
    confirmSignUpCon: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      marginTop: "auto",
      marginBottom: 30,
    },
  });
