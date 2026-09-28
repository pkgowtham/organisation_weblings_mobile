import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { SemiBoldText, RegularText } from "@/components/ui/typography";
import CustomButton from "@/components/ui/button";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import Svg, { Path } from "react-native-svg";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useToast } from "@/context/ToastContext";
import { setItemAsync, getItemAsync } from "@/utils/secureStorage";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const ShieldCheckIcon = ({
  color = "#0072C4",
  size = 32,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
      fill={color}
    />
  </Svg>
);

export default function EnableTwoFactorScreen() {
  const { theme } = useTheme();
  const { safePush } = useSafeNavigation();
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { showToast } = useToast();
  const styles = createStyles(theme);

  const isLoading = store.auth.isLoadingUpdateMfa;
  const email = store.auth.email || "your email";

  useEffect(() => {
    if (store.auth.isSuccessUpdateMfa) {
      (dispatch as any)({ type: "UPDATE_MFA_API_CLEAR" });
      const hasOrg = Boolean(store.auth.orgAuthId);
      if (hasOrg) {
        safePush("/(protected)/(tabs)");
      } else {
        safePush("/(protected)/(organisation)/setup");
      }
    }
  }, [store.auth.isSuccessUpdateMfa, store.auth.orgAuthId]);

  useEffect(() => {
    if (store.auth.isErrorUpdateMfa) {
      showToast({
        iconType: "error",
        type: "error",
        title: "Failed to update MFA settings",
      });
      (dispatch as any)({ type: "UPDATE_MFA_API_CLEAR" });
    }
  }, [store.auth.isErrorUpdateMfa]);

  const handleMfa = async (mfaEnabled: boolean) => {
    if (isLoading) return;

    const userId =
      store.auth.userId || (await getItemAsync("authUserId")) || "";

    const result: any = await dispatch({
      type: "UPDATE_MFA_API_REQUEST",
      payload: {
        url: "orguser/updateMfa",
        method: "POST",
        body: { userId, mfaEnabled },
      },
    });

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
  };

  return (
    <AuthScreenLayout>
      <View style={styles.textContainer}>
        <ShieldCheckIcon
          color={theme.colors.neutral.onSurface.light}
          size={32}
        />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Enable Two-Factor
        </SemiBoldText>
        <RegularText
          fontVariant="BS"
          color="colors.neutral.onSurface.dark"
          style={styles.descText}
        >
          {`A 6-digit verification code will be sent to `}
          <SemiBoldText
            fontVariant="BS"
            color="colors.neutral.onSurface.light"
          >
            {email}
          </SemiBoldText>
          {` whenever you log in from a new device or browser.`}
        </RegularText>
      </View>

      <View style={styles.buttonsContainer}>
        <CustomButton
          variant="primary"
          title="Enable 2-Step Verification"
          weightVariant="semibold"
          disabled={isLoading}
          loading={isLoading}
          onPress={() => handleMfa(true)}
        />
        <CustomButton
          variant="outline"
          title="Maybe Later"
          weightVariant="semibold"
          disabled={isLoading}
          onPress={() => handleMfa(false)}
        />
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
      marginBottom: 30,
    },
    descText: {
      textAlign: "center",
      paddingHorizontal: 16,
    },
    buttonsContainer: {
      gap: 12,
      marginTop: "auto",
      marginBottom: 30,
    },
  });
