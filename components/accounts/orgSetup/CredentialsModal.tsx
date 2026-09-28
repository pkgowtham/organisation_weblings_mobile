import React, { useState } from "react";
import { View, StyleSheet, Modal, TouchableOpacity, Clipboard } from "react-native";
import { Typography } from "@/components/ui/typography";
import Input from "@/components/ui/textInput";
import CustomButton from "@/components/ui/button";
import { Eye, EyeClose, Close } from "@/svg_icons";
import { useTheme } from "@/context/CustomThemeContext";
import { WarningIcon, ContentCopyIcon } from "./OrgSetupIcons";

interface CredentialsModalProps {
  visible: boolean;
  creds: { email: string; password: string } | null;
  isOnboarding?: boolean;
  onClose: () => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  visible,
  creds,
  isOnboarding,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [showTempPass, setShowTempPass] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!creds) return null;

  const copyToClipboard = (text: string, field: string) => {
    Clipboard.setString(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.credModalContainer}>
          <View style={styles.credModalHeader}>
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light">
              Location Credentials
            </Typography>
            <TouchableOpacity onPress={onClose}>
              <Close width={20} height={20} color={theme.colors.neutral.onSurface.light} />
            </TouchableOpacity>
          </View>

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <WarningIcon width={20} height={20} color="#B78103" />
            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" style={{ flex: 1, marginLeft: 8 }}>
              If you do not reset the password within 1 day, it will expire. You will need to reset the password in Org Setup.
            </Typography>
          </View>

          {/* User Name / Email Input with Copy */}
          <Input
            label="User Name / Email"
            value={creds.email}
            editable={false}
            placeholder="Username"
            rightIcon={<ContentCopyIcon width={16} height={16} color={theme.colors.brand.onSurface.light} />}
            onRightIconClick={() => copyToClipboard(creds.email, "email")}
            helperText={copiedField === "email" ? "Email copied to clipboard!" : undefined}
          />

          {/* Temporary Password Input with Eye & Copy */}
          <Input
            label="Temporary Password"
            value={creds.password}
            editable={false}
            secureTextEntry={!showTempPass}
            placeholder="Password"
            rightIcon={
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <TouchableOpacity onPress={() => setShowTempPass(!showTempPass)}>
                  {showTempPass ? (
                    <Eye width={20} height={20} color={theme.colors.neutral.onSurface.dark} />
                  ) : (
                    <EyeClose width={20} height={20} color={theme.colors.neutral.onSurface.dark} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => copyToClipboard(creds.password, "password")}>
                  <ContentCopyIcon width={16} height={16} color={theme.colors.brand.onSurface.light} />
                </TouchableOpacity>
              </View>
            }
            helperText={copiedField === "password" ? "Password copied to clipboard!" : undefined}
          />

          <CustomButton
            title={isOnboarding ? "Go to Dashboard" : "Done"}
            variant="primary"
            size="small"
            onPress={onClose}
            buttonStyle={{ marginTop: 16 }}
          />
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
    credModalContainer: {
      width: "100%",
      maxWidth: 440,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius?.b300 || 12,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      padding: 20,
    },
    credModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    warningBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFBEB",
      borderColor: "#FCD34D",
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
  });
