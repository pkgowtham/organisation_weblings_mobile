import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { SemiBoldText } from "@/components/ui/typography";
import Input from "@/components/ui/textInput";
import Dropdown from "@/components/ui/dropdown";
import CustomButton from "@/components/ui/button";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useToast } from "@/context/ToastContext";
import { getItemAsync } from "@/utils/secureStorage";
import { isValidMobile } from "@/utils/validation";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const COUNTRY_CODE_OPTIONS = [
  { value: "+91", label: "🇮🇳 +91" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+44", label: "🇬🇧 +44" },
];

export default function EnterMobileScreen() {
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [touched, setTouched] = useState(false);

  const { theme } = useTheme();
  const { safePush } = useSafeNavigation();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { showToast } = useToast();
  const styles = createStyles(theme);

  const mobileError =
    touched && !isValidMobile(mobileNumber)
      ? "Enter a valid 10-digit mobile number"
      : "";
  const isFormValid = isValidMobile(mobileNumber);
  const isLoading = store.auth.isLoadingMobileOtp;

  useEffect(() => {
    if (store.auth.isSuccessMobileOtp) {
      (dispatch as any)({ type: "SEND_MOBILE_OTP_API_CLEAR" });
      safePush("/(auth)/verifyOtp", {
        flow: "signup_mobile",
        mobile: `${countryCode} ${mobileNumber.trim()}`,
      });
    }
  }, [store.auth.isSuccessMobileOtp, countryCode, mobileNumber]);

  useEffect(() => {
    if (store.auth.isErrorMobileOtp) {
      showToast({
        iconType: "error",
        type: "error",
        title: "Failed to send mobile OTP",
      });
      (dispatch as any)({ type: "SEND_MOBILE_OTP_API_CLEAR" });
    }
  }, [store.auth.isErrorMobileOtp]);

  const handleSendOtp = async () => {
    setTouched(true);
    if (!isFormValid || isLoading) return;

    const userId =
      store.auth.userId || (await getItemAsync("authUserId")) || "";

    await dispatch({
      type: "SEND_MOBILE_OTP_API_REQUEST",
      payload: {
        url: "orguser/sendMobileOtp",
        method: "POST",
        body: { userId, mobile: mobileNumber.trim() },
      },
    });
  };

  return (
    <AuthScreenLayout>
      <View style={styles.textContainer}>
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Enter Mobile Number
        </SemiBoldText>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.dropdownWrap}>
          <Dropdown
            options={COUNTRY_CODE_OPTIONS}
            selectedValue={countryCode}
            onValueChange={setCountryCode}
            placeholder="+91"
            label="Code"
          />
        </View>
        <View style={styles.inputWrap}>
          <Input
            label="Mobile Number"
            placeholder="9876543210"
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text);
              if (!touched) setTouched(true);
            }}
            onBlur={() => setTouched(true)}
            error={mobileError}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <CustomButton
        variant="primary"
        title="Send OTP"
        weightVariant="semibold"
        disabled={!isFormValid || isLoading}
        loading={isLoading}
        onPress={handleSendOtp}
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
      marginBottom: 30,
    },
    inputRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
      marginBottom: 20,
    },
    dropdownWrap: {
      width: 100,
    },
    inputWrap: {
      flex: 1,
    },
  });
