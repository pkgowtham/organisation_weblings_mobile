import React from "react";
import { StyleSheet, View, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "@/components/ui/typography";
import Svg, { Path } from "react-native-svg";

const GlobeIcon = ({ color = "#0072C4", size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 12C22 17.5228 17.5228 22 12 22M22 12C22 6.47715 17.5228 2 12 2M22 12H2M12 22C6.47715 22 2 17.5228 2 12M12 22C14.5013 19.2616 15.9228 15.708 16 12C15.9228 8.29203 14.5013 4.73835 12 2M12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2M2 12C2 6.47715 6.47715 2 12 2"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ExternalLinkIcon = ({ color = "#0072C4", size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17L17 7M17 7H7M17 7V17"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface BusinessUnitData {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  subDomain?: string;
  subdomain?: string;
  [key: string]: any;
}

export interface BusinessHubCardProps {
  /** The business unit data object */
  bu?: BusinessUnitData;
  /** Explicit title override */
  title?: string;
  /** Explicit description override */
  description?: string;
  /** Explicit subdomain override */
  subdomain?: string;
  /** Press handler */
  onPress?: () => void;
  /** Optional container style */
  containerStyle?: ViewStyle;
}

export default function BusinessHubCard({
  bu,
  title,
  description,
  subdomain,
  onPress,
  containerStyle,
}: BusinessHubCardProps) {
  const { theme } = useTheme();

  const displayTitle = title || bu?.name || "Business Unit";
  const displayDescription =
    description ||
    bu?.description ||
    "No description provided for this business unit.";
  const displaySubdomain =
    subdomain ||
    bu?.subDomain ||
    bu?.subdomain ||
    "logistics-hub.adminsuite.io";

  const brandColor = theme.colors?.brand?.onSurface?.light || "#0072C4";

  return (
    <TouchableOpacity
      style={[styles.card, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Row: Business Unit Name + Open External Icon */}
      <View style={styles.topRow}>
        <Typography
          fontVariant="TM"
          variant="bold"
          color="colors.neutral.onSurface.dark"
          style={styles.title}
          numberOfLines={1}
        >
          {displayTitle}
        </Typography>
        <View style={styles.externalIconWrapper}>
          <ExternalLinkIcon color={brandColor} size={18} />
        </View>
      </View>

      {/* Description */}
      <Typography
        fontVariant="BS"
        color="colors.neutral.onSurface.medium"
        style={styles.description}
        numberOfLines={4}
      >
        {displayDescription}
      </Typography>

      {/* Footer: Globe Icon + Subdomain */}
      <View style={styles.footer}>
        <GlobeIcon color={brandColor} size={16} />
        <Typography
          fontVariant="BS"
          variant="medium"
          style={[styles.subdomain, { color: brandColor }]}
          numberOfLines={1}
        >
          {displaySubdomain}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    minHeight: 180,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  externalIconWrapper: {
    padding: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  subdomain: {
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },
});
