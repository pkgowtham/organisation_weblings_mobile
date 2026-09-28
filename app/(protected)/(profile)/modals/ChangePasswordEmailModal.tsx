import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "@/components/ui/typography";
import CustomButton from "@/components/ui/button";
import Input from "@/components/ui/textInput";
import SvgClose from "@/svg_icons/Close";

interface ChangePasswordEmailModalProps {
  open: boolean;
  email: string;
  isLoading: boolean;
  onSendOtp: () => void;
  onClose: () => void;
}

export const ChangePasswordEmailModal: React.FC<ChangePasswordEmailModalProps> = ({
  open,
  email,
  isLoading,
  onSendOtp,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

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
              label="Email"
              placeholder="Email address"
              value={email}
              editable={false}
              keyboardType="email-address"
            />
            <CustomButton
              variant="primary"
              title="Verify"
              weightVariant="semibold"
              disabled={isLoading}
              loading={isLoading}
              onPress={onSendOtp}
              buttonStyle={{ marginTop: 12 }}
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
      marginBottom: 20,
    },
    body: {
      gap: 16,
    },
  });

export default ChangePasswordEmailModal;
