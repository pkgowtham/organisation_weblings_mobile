import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/CustomThemeContext";
import OrgSetupComponent from "@/components/accounts/orgSetup";
import EOfficeTopBar from "@/components/ui/eOfficeTopBar";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import { ArrowBackIos } from "@/svg_icons";

import { useLocalSearchParams } from "expo-router";

export default function OrgSetupPage() {
  const { theme } = useTheme();
  const { safeBack, safeReplace } = useSafeNavigation();
  const params = useLocalSearchParams<{ initialView?: string; isOnboarding?: string }>();

  const isOnboarding = params.isOnboarding === "true";

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.colors.neutral.surface.light }]}>
      <EOfficeTopBar
        heading={isOnboarding ? "Setup Business Unit" : "Org Setup"}
        onMenuPress={() => {
          if (isOnboarding) {
            safeReplace("/(protected)/(tabs)");
          } else {
            safeBack();
          }
        }}
        optIcon={<View style={{ width: 24, height: 24 }} />}
        menuIcon={<ArrowBackIos />}
      />
      <OrgSetupComponent
        initialView={(params.initialView as any) || "unit_list"}
        isOnboarding={isOnboarding}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
