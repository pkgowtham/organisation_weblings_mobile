import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { SemiBoldText, RegularText } from "@/components/ui/typography";
import Input from "@/components/ui/textInput";
import CustomButton from "@/components/ui/button";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import SvgPerson from "@/svg_icons/Person";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useToast } from "@/context/ToastContext";
import { setItemAsync, deleteItemAsync } from "@/utils/secureStorage";
import { isValidEmail } from "@/utils/validation";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const { theme } = useTheme();
  const { safePush } = useSafeNavigation();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { showToast } = useToast();
  const styles = createStyles(theme);

  const emailError =
    touched && !isValidEmail(email) ? "Please enter a valid email address" : "";
  const isFormValid = isValidEmail(email);
  const isLoading = store.auth.isLoadingCheckEmail;

  useEffect(() => {
    if (store.auth.isSuccessCheckEmail) {
      (dispatch as any)({ type: "CHECK_EMAIL_API_CLEAR" });
      safePush("/(auth)/createAccount", { email: email.trim() });
    }
  }, [store.auth.isSuccessCheckEmail]);

  useEffect(() => {
    if (store.auth.isErrorCheckEmail && store.auth.errorCheckEmail) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.auth.errorCheckEmail || "Email check failed",
      });
      (dispatch as any)({ type: "CHECK_EMAIL_API_CLEAR" });
    }
  }, [store.auth.isErrorCheckEmail, store.auth.errorCheckEmail]);

  const handleVerifyMail = async () => {
    setTouched(true);
    if (!isFormValid || isLoading) return;

    // Purge any stale session data before starting new sign up
    await deleteItemAsync("authToken");
    await deleteItemAsync("orgAuthId");
    await deleteItemAsync("authUserId");
    await deleteItemAsync("bulId");
    dispatch({ type: "LOGOUT_CLEAR_REDUX_STORE" });

    await setItemAsync("authEmail", email.trim());
    (dispatch as any)({
      type: "SET_AUTH_EMAIL",
      payload: { email: email.trim() },
    });

    await dispatch({
      type: "CHECK_EMAIL_API_REQUEST",
      payload: {
        url: "orguser/checkEmail",
        method: "POST",
        body: { email: email.trim() },
      },
    });
  };

  return (
    <AuthScreenLayout>
      <View style={styles.textContainer}>
        <SvgPerson color={theme.colors.neutral.onSurface.light} />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Sign Up
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
        title="Verify Mail"
        weightVariant="semibold"
        disabled={!isFormValid || isLoading}
        loading={isLoading}
        onPress={handleVerifyMail}
      />

      <View style={styles.confirmSignUpCon}>
        <RegularText color="colors.neutral.onSurface.dark">
          Already have an account?
        </RegularText>
        <TouchableOpacity onPress={() => safePush("/login")}>
          <SemiBoldText color="colors.brand.onSurface.light">
            Sign In
          </SemiBoldText>
        </TouchableOpacity>
      </View>
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
