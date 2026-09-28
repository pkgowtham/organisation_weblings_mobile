import React from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "@/components/ui/typography";
import CustomButton from "@/components/ui/button";
import OtpInput from "@/components/ui/otpInput";
import SvgClose from "@/svg_icons/Close";

interface EnableMfaOtpModalProps {
  open: boolean;
  title?: string;
  email: string;
  otp: string;
  timer: number;
  isLoading: boolean;
  onOtpChange: (code: string) => void;
  onResendOtp: () => void;
  onVerify: () => void;
  onClose: () => void;
}

export const EnableMfaOtpModal: React.FC<EnableMfaOtpModalProps> = ({
  open,
  title = "Enable MFA",
  email,
  otp,
  timer,
  isLoading,
  onOtpChange,
  onResendOtp,
  onVerify,
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
              {title}
            </Typography>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <SvgClose color={theme.colors.neutral.onSurface.light} width={20} height={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Typography fontVariant="TS" variant="semibold" color="colors.neutral.onSurface.light" style={{ textAlign: "center" }}>
              Verify OTP
            </Typography>
            <Typography fontVariant="BM" variant="medium" color="colors.neutral.onSurface.dark" style={{ textAlign: "center", marginBottom: 12 }}>
              Enter the OTP sent to {email}
            </Typography>

            <View style={styles.otpContainer}>
              <OtpInput
                length={6}
                onComplete={onOtpChange}
                autoFocus
                focusColor={theme.colors.brand.surface.medium}
                selectionColor={theme.colors.brand.surface.medium}
              />
            </View>

            <CustomButton
              variant="primary"
              title="Verify"
              weightVariant="semibold"
              disabled={otp.length < 6 || isLoading}
              loading={isLoading}
              onPress={onVerify}
              buttonStyle={{ marginTop: 16 }}
            />

            <View style={styles.resendRow}>
              <Typography fontVariant="BM" color="colors.neutral.onSurface.dark">
                Didn't get it?{" "}
              </Typography>
              {timer > 0 ? (
                <Typography fontVariant="BM" color="colors.neutral.onSurface.dark">
                  Resend OTP in {timer}s
                </Typography>
              ) : (
                <TouchableOpacity onPress={onResendOtp}>
                  <Typography fontVariant="BM" variant="semibold" color="colors.brand.onSurface.light">
                    Resend OTP
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
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
      gap: 8,
    },
    otpContainer: {
      marginVertical: 12,
    },
    resendRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
    },
  });

export default EnableMfaOtpModal;
