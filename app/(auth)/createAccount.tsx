import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { SemiBoldText } from "@/components/ui/typography";
import Input from "@/components/ui/textInput";
import CustomButton from "@/components/ui/button";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import SvgPerson from "@/svg_icons/Person";
import SvgEye from "@/svg_icons/Eye";
import SvgEyeClose from "@/svg_icons/EyeClose";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useToast } from "@/context/ToastContext";
import { setItemAsync, getItemAsync } from "@/utils/secureStorage";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;

const validate = (
  displayName: string,
  password: string,
  confirmPassword: string
) => ({
  displayName: displayName.trim() === "" ? "Display name is required" : "",
  password: !PASSWORD_REGEX.test(password)
    ? "Password must be 8+ chars with uppercase, lowercase, number & special char"
    : "",
  confirmPassword:
    password !== confirmPassword ? "Passwords do not match" : "",
});

export default function CreateAccountScreen() {
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    displayName: false,
    password: false,
    confirmPassword: false,
  });

  const { theme } = useTheme();
  const { safePush } = useSafeNavigation();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { showToast } = useToast();
  const styles = createStyles(theme);

  const errors = validate(displayName, password, confirmPassword);
  const isFormValid =
    !errors.displayName && !errors.password && !errors.confirmPassword;
  const isLoading = store.auth.isLoadingSignup;

  useEffect(() => {
    if (store.auth.isSuccessSignup) {
      (dispatch as any)({ type: "SIGNUP_API_CLEAR" });
      safePush("/(auth)/verifyEmailOtp");
    }
  }, [store.auth.isSuccessSignup]);

  useEffect(() => {
    if (store.auth.isErrorSignup && store.auth.errorSignup) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.auth.errorSignup || "Signup failed",
      });
      (dispatch as any)({ type: "SIGNUP_API_CLEAR" });
    }
  }, [store.auth.isErrorSignup, store.auth.errorSignup]);

  const handleConfirm = async () => {
    setTouched({ displayName: true, password: true, confirmPassword: true });
    if (!isFormValid || isLoading) return;

    const email = store.auth.email || (await getItemAsync("authEmail")) || "";

    const result: any = await dispatch({
      type: "SIGNUP_API_REQUEST",
      payload: {
        url: "orguser/signup",
        method: "POST",
        body: { displayName: displayName.trim(), email, password },
      },
    });

    if (result?.data?.userId) {
      await setItemAsync("authUserId", result.data.userId);
      (dispatch as any)({
        type: "SET_AUTH_USER_ID",
        payload: { userId: result.data.userId },
      });
    }
  };

  return (
    <AuthScreenLayout>
      <View style={styles.textContainer}>
        <SvgPerson color={theme.colors.neutral.onSurface.light} />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Create Account
        </SemiBoldText>
      </View>

      <View style={styles.input}>
        <Input
          label="Display Name"
          placeholder="Enter display name"
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text);
            if (!touched.displayName)
              setTouched((prev) => ({ ...prev, displayName: true }));
          }}
          onBlur={() =>
            setTouched((prev) => ({ ...prev, displayName: true }))
          }
          error={touched.displayName ? errors.displayName : ""}
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
          onBlur={() =>
            setTouched((prev) => ({ ...prev, password: true }))
          }
          error={touched.password ? errors.password : ""}
          rightIcon={
            showPassword ? (
              <SvgEyeClose color={theme.colors.neutral.onSurface.dark} />
            ) : (
              <SvgEye color={theme.colors.neutral.onSurface.dark} />
            )
          }
          onRightIconClick={() => setShowPassword(!showPassword)}
        />
        <Input
          label="Confirm password"
          placeholder="Enter password"
          value={confirmPassword}
          secureTextEntry={!showConfirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (!touched.confirmPassword)
              setTouched((prev) => ({ ...prev, confirmPassword: true }));
          }}
          onBlur={() =>
            setTouched((prev) => ({ ...prev, confirmPassword: true }))
          }
          error={touched.confirmPassword ? errors.confirmPassword : ""}
          rightIcon={
            showConfirmPassword ? (
              <SvgEyeClose color={theme.colors.neutral.onSurface.dark} />
            ) : (
              <SvgEye color={theme.colors.neutral.onSurface.dark} />
            )
          }
          onRightIconClick={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
        />
      </View>

      <CustomButton
        variant="primary"
        title="Confirm"
        weightVariant="semibold"
        disabled={!isFormValid || isLoading}
        loading={isLoading}
        onPress={handleConfirm}
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
    input: {
      marginTop: 30,
      marginBottom: 30,
    },
  });
