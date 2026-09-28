import { StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/ui/button";
import { SemiBoldText } from "@/components/ui/typography";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import Input from "@/components/ui/textInput";
import SvgEye from "@/svg_icons/Eye";
import SvgEyeClose from "@/svg_icons/EyeClose";
import { useTheme } from "@/context/CustomThemeContext";
import SvgRefreshCw from "@/svg_icons/RefreshCw";
import { useToast } from "@/context/ToastContext";
import { getItemAsync } from "@/utils/secureStorage";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{8,}$/;

const validate = (newPassword: string, confirmPassword: string) => ({
  newPassword: !PASSWORD_REGEX.test(newPassword)
    ? "Password must be 8+ chars with uppercase, lowercase, number & special char"
    : "",
  confirmPassword:
    newPassword !== confirmPassword ? "Passwords do not match" : "",
});

const EnterNewPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const { theme } = useTheme();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { safePush } = useSafeNavigation();
  const { showToast } = useToast();
  const styles = createStyles(theme);

  const errors = validate(newPassword, confirmPassword);
  const isFormValid =
    !errors.newPassword &&
    !errors.confirmPassword &&
    newPassword.length > 0;
  const isLoading = store.auth.isLoadingResetPassword;

  useEffect(() => {
    if (store.auth.isSuccessResetPassword) {
      (dispatch as any)({ type: "RESET_PASSWORD_API_CLEAR" });
      safePush("/(forgetPassword)/resetSuccessful");
    }
  }, [store.auth.isSuccessResetPassword]);

  useEffect(() => {
    if (store.auth.isErrorResetPassword && store.auth.errorResetPassword) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.auth.errorResetPassword || "Failed to reset password",
      });
      (dispatch as any)({ type: "RESET_PASSWORD_API_CLEAR" });
    }
  }, [store.auth.isErrorResetPassword, store.auth.errorResetPassword]);

  const handleSubmit = async () => {
    setTouched({ newPassword: true, confirmPassword: true });
    if (!isFormValid || isLoading) return;

    const email = store.auth.email || (await getItemAsync("authEmail")) || "";

    await dispatch({
      type: "RESET_PASSWORD_API_REQUEST",
      payload: {
        url: "orguser/resetPassword",
        method: "POST",
        body: {
          email,
          newPassword,
        },
      },
    });
  };

  return (
    <AuthScreenLayout showBackButton>
      <View style={styles.textContainer}>
        <SvgRefreshCw color={theme.colors.neutral.onSurface.light} />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Enter New Password
        </SemiBoldText>
      </View>
      <View style={styles.input}>
        <Input
          label="Password"
          placeholder="Enter password"
          value={newPassword}
          secureTextEntry={!showNewPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (!touched.newPassword)
              setTouched((prev) => ({ ...prev, newPassword: true }));
          }}
          onBlur={() =>
            setTouched((prev) => ({ ...prev, newPassword: true }))
          }
          error={touched.newPassword ? errors.newPassword : ""}
          rightIcon={
            showNewPassword ? (
              <SvgEyeClose color={theme.colors.neutral.onSurface.dark} />
            ) : (
              <SvgEye color={theme.colors.neutral.onSurface.dark} />
            )
          }
          onRightIconClick={() => setShowNewPassword(!showNewPassword)}
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
        title="Submit"
        weightVariant="semibold"
        disabled={!isFormValid || isLoading}
        loading={isLoading}
        onPress={handleSubmit}
      />
    </AuthScreenLayout>
  );
};

export default EnterNewPassword;

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
