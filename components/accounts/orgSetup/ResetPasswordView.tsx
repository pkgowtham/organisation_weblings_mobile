import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Typography } from "@/components/ui/typography";
import Input from "@/components/ui/textInput";
import CustomButton from "@/components/ui/button";
import { Eye, EyeClose, ArrowBackIos, Close } from "@/svg_icons";
import { useTheme } from "@/context/CustomThemeContext";

interface ResetPasswordViewProps {
  businessUnitName: string;
  isLoadingReset: boolean;
  onConfirm: (passwords: { newPassword: string; confirmPassword: string }) => void;
  onBack: () => void;
  paddingBottom: number;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  businessUnitName,
  isLoadingReset,
  onConfirm,
  onBack,
  paddingBottom,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [resetPassData, setResetPassData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [passError, setPassError] = useState("");

  const handleConfirm = () => {
    if (!resetPassData.newPassword || !resetPassData.confirmPassword) {
      setPassError("Both password fields are required");
      return;
    }
    if (resetPassData.newPassword.length < 6) {
      setPassError("Password must be at least 6 characters");
      return;
    }
    if (resetPassData.newPassword !== resetPassData.confirmPassword) {
      setPassError("Passwords do not match");
      return;
    }
    onConfirm(resetPassData);
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom }]}
      showsVerticalScrollIndicator={false}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowBackIos width={18} height={18} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.light} />
        </TouchableOpacity>
        <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light" style={{ flex: 1 }}>
          {businessUnitName}
        </Typography>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Close width={20} height={20} color={theme.colors.neutral.onSurface.light} />
        </TouchableOpacity>
      </View>

      <View style={styles.credentialsCard}>
        <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={{ textAlign: "center", marginBottom: 16 }}>
          Edit Password
        </Typography>

        <Input
          label="Enter new Password *"
          value={resetPassData.newPassword}
          onChangeText={(v) => {
            setResetPassData((prev) => ({ ...prev, newPassword: v }));
            if (passError) setPassError("");
          }}
          placeholder="••••••••"
          secureTextEntry={!showPass1}
          rightIcon={
            showPass1 ? (
              <Eye width={20} height={20} color={theme.colors.neutral.onSurface.dark} />
            ) : (
              <EyeClose width={20} height={20} color={theme.colors.neutral.onSurface.dark} />
            )
          }
          onRightIconClick={() => setShowPass1(!showPass1)}
        />

        <Input
          label="Confirm Password *"
          value={resetPassData.confirmPassword}
          onChangeText={(v) => {
            setResetPassData((prev) => ({ ...prev, confirmPassword: v }));
            if (passError) setPassError("");
          }}
          placeholder="••••••••"
          secureTextEntry={!showPass2}
          rightIcon={
            showPass2 ? (
              <Eye width={20} height={20} color={theme.colors.neutral.onSurface.dark} />
            ) : (
              <EyeClose width={20} height={20} color={theme.colors.neutral.onSurface.dark} />
            )
          }
          onRightIconClick={() => setShowPass2(!showPass2)}
          error={passError}
        />

        <CustomButton
          title="Confirm"
          variant="primary"
          size="medium"
          loading={isLoadingReset}
          disabled={!resetPassData.newPassword || !resetPassData.confirmPassword || isLoadingReset}
          onPress={handleConfirm}
          buttonStyle={{ marginTop: 16 }}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.s400,
      gap: theme.spacing.s200,
    },
    backBtn: {
      padding: theme.spacing.s100,
    },
    credentialsCard: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderColor: theme.colors.neutral.border.light,
      borderWidth: 1,
      borderRadius: theme.borderRadius?.b300 || 12,
      padding: theme.spacing.s500,
      marginTop: theme.spacing.s200,
      gap: theme.spacing.s200,
    },
  });
