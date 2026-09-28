import React, { useState } from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "@/components/ui/typography";
import CustomButton from "@/components/ui/button";
import Input from "@/components/ui/textInput";
import SvgClose from "@/svg_icons/Close";
import SvgCircleCheck from "@/svg_icons/CircleCheck";
import SvgEye from "@/svg_icons/Eye";
import SvgEyeClose from "@/svg_icons/EyeClose";

const validatePasswordRules = (password: string) => ({
  minLength: password.length >= 8,
  hasUpperCase: /[A-Z]/.test(password),
  hasLowerCase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\\/`~]/.test(password),
});

interface ChangePasswordResetModalProps {
  open: boolean;
  isLoading: boolean;
  onResetPassword: (newPassword: string) => void;
  onClose: () => void;
}

export const ChangePasswordResetModal: React.FC<ChangePasswordResetModalProps> = ({
  open,
  isLoading,
  onResetPassword,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const passRules = validatePasswordRules(newPassword);
  const isFormValid =
    Object.values(passRules).every(Boolean) &&
    newPassword.length > 0 &&
    newPassword === confirmPassword;

  const handleSubmit = () => {
    if (!isFormValid || isLoading) return;
    onResetPassword(newPassword);
  };

  const rulesList = [
    { text: "At least 8 characters long", valid: passRules.minLength },
    { text: "Includes 1 uppercase letter", valid: passRules.hasUpperCase },
    { text: "Includes 1 lowercase letter", valid: passRules.hasLowerCase },
    { text: "Contains at least one number (0-9)", valid: passRules.hasNumber },
    { text: "Includes a special character (!, @, #, etc.)", valid: passRules.hasSpecialChar },
  ];

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light">
              Change Password
            </Typography>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <SvgClose color={theme.colors.neutral.onSurface.light} width={20} height={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              secureTextEntry={!showNewPass}
              onChangeText={setNewPassword}
              rightIcon={
                showNewPass ? (
                  <SvgEyeClose color={theme.colors.neutral.onSurface.dark} />
                ) : (
                  <SvgEye color={theme.colors.neutral.onSurface.dark} />
                )
              }
              onRightIconClick={() => setShowNewPass(!showNewPass)}
            />

            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              secureTextEntry={!showConfirmPass}
              onChangeText={setConfirmPassword}
              rightIcon={
                showConfirmPass ? (
                  <SvgEyeClose color={theme.colors.neutral.onSurface.dark} />
                ) : (
                  <SvgEye color={theme.colors.neutral.onSurface.dark} />
                )
              }
              onRightIconClick={() => setShowConfirmPass(!showConfirmPass)}
            />

            <View style={styles.rulesContainer}>
              <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={{ marginBottom: 6 }}>
                Password Should be
              </Typography>
              {rulesList.map((item, index) => (
                <View key={index} style={styles.ruleItem}>
                  {item.valid ? (
                    <SvgCircleCheck color={theme.colors.positive?.onSurface?.light || "#10B981"} width={16} height={16} />
                  ) : (
                    <SvgClose color={theme.colors.negative?.onSurface?.light || "#EF4444"} width={16} height={16} />
                  )}
                  <Typography
                    fontVariant="BXS"
                    color={item.valid ? "colors.positive.onSurface.light" : "colors.neutral.onSurface.dark"}
                  >
                    {item.text}
                  </Typography>
                </View>
              ))}
            </View>

            <CustomButton
              variant="primary"
              title="Change Password"
              weightVariant="semibold"
              disabled={!isFormValid || isLoading}
              loading={isLoading}
              onPress={handleSubmit}
              buttonStyle={{ marginTop: 16 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    card: {
      width: "100%",
      maxWidth: 440,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300 || 12,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    body: {
      gap: 12,
    },
    rulesContainer: {
      marginTop: 8,
      gap: 6,
    },
    ruleItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
  });

export default ChangePasswordResetModal;
