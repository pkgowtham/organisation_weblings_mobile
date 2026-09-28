import { StyleSheet, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import CustomButton from "@/components/ui/button";
import { MediumText, SemiBoldText } from "@/components/ui/typography";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { useTheme } from "@/context/CustomThemeContext";
import SvgCircleCheck from "@/svg_icons/CircleCheck";
import { deleteItemAsync } from "@/utils/secureStorage";
import AuthScreenLayout from "@/components/auth/AuthScreenLayout";

const ResetSuccessful = () => {
  const { theme } = useTheme();
  const dispatch = useMiddlewareDispatch();
  const { safeReplace } = useSafeNavigation();
  const styles = createStyles(theme);

  const handleNavigation = async () => {
    (dispatch as any)({ type: "CLEAR_AUTH" });
    await deleteItemAsync("authEmail");
    await deleteItemAsync("authUserId");
    router.dismissAll();
    safeReplace("/login");
  };

  return (
    <AuthScreenLayout showBackButton>
      <View style={styles.textContainer}>
        <SvgCircleCheck color={theme.colors.positive.onSurface.light} />
        <SemiBoldText
          fontVariant="TS"
          color="colors.neutral.onSurface.light"
        >
          Password Reset Successful !
        </SemiBoldText>
        <View style={styles.supportText}>
          <MediumText
            fontVariant="LS"
            color="colors.neutral.onSurface.dark"
            style={{ textAlign: "center" }}
          >
            Your password has been updated. You can now log in with your
            new password.
          </MediumText>
        </View>
      </View>

      <CustomButton
        variant="primary"
        title="Login"
        weightVariant="semibold"
        onPress={handleNavigation}
      />
    </AuthScreenLayout>
  );
};

export default ResetSuccessful;

const createStyles = (_theme: any) =>
  StyleSheet.create({
    textContainer: {
      gap: 12,
      marginTop: 48,
      alignItems: "center",
      marginBottom: 30,
    },
    supportText: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
