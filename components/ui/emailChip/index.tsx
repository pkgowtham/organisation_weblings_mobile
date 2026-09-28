import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "../typography";
import { EmailOutline, Close } from "@/svg_icons";

export interface EmailChipProps {
  email: string;
  onRemove?: () => void;
  containerStyle?: any;
}

const EmailChip: React.FC<EmailChipProps> = ({
  email,
  onRemove,
  containerStyle,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.container, containerStyle]}>
      <EmailOutline
        width={18}
        height={18}
        color={theme.colors.neutral.onSurface.disabled}
        viewBox="0 0 24 24"
      />
      <Typography
        fontVariant="BS"
        color="colors.neutral.onSurface.light"
        style={styles.emailText}
        numberOfLines={1}
      >
        {email}
      </Typography>
      {onRemove && (
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.removeBtn}
        >
          <Close
            width={16}
            height={16}
            color={theme.colors.neutral.onSurface.disabled}
            viewBox="0 0 24 24"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b200,
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
      marginBottom: theme.spacing.s200,
    },
    emailText: {
      flex: 1,
      marginLeft: theme.spacing.s300,
    },
    removeBtn: {
      marginLeft: theme.spacing.s200,
    },
  });

export default EmailChip;
