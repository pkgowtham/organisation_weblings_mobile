import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Typography } from "@/components/ui/typography";
import SectionCard from "@/components/ui/sectionCard";
import Input from "@/components/ui/textInput";
import TextField from "@/components/ui/textField";
import CustomButton from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";
import { ArrowBackIos, Close } from "@/svg_icons";
import { useTheme } from "@/context/CustomThemeContext";

export interface LocFormData {
  name: string;
  description: string;
  countryId: string;
  stateId: string;
  cityId: string;
  addressLine1: string;
  addressLine2: string;
  zipcode: string;
  subDomain: string;
  employeePrefix: string;
}

interface AddLocationViewProps {
  businessUnitName: string;
  formData: LocFormData;
  errors: Partial<Record<keyof LocFormData, string>>;
  countryOptions: { label: string; value: string }[];
  stateOptions: { label: string; value: string }[];
  cityOptions: { label: string; value: string }[];
  isLoadingCreate: boolean;
  isValid: boolean;
  onFieldChange: (field: keyof LocFormData, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onClose: () => void;
  paddingBottom: number;
  onEndReachedCountry?: () => void;
  onEndReachedState?: () => void;
  onEndReachedCity?: () => void;
}

export const AddLocationView: React.FC<AddLocationViewProps> = ({
  businessUnitName,
  formData,
  errors,
  countryOptions,
  stateOptions,
  cityOptions,
  isLoadingCreate,
  isValid,
  onFieldChange,
  onSubmit,
  onBack,
  onClose,
  paddingBottom,
  onEndReachedCountry,
  onEndReachedState,
  onEndReachedCity,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

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
          {businessUnitName} - Add Location
        </Typography>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Close width={20} height={20} color={theme.colors.neutral.onSurface.light} />
        </TouchableOpacity>
      </View>

      <SectionCard title="Setup Location Details">
        <Input
          label="Location Name *"
          value={formData.name}
          onChangeText={(v) => onFieldChange("name", v)}
          placeholder="Enter location name"
          error={errors.name}
        />
        <TextField
          label="Description *"
          value={formData.description}
          onChangeText={(v) => onFieldChange("description", v)}
          placeholder="Enter description"
          fixedHeight={100}
          expandable={false}
          error={errors.description}
        />
        <Input
          label="Address Line 1 *"
          value={formData.addressLine1}
          onChangeText={(v) => onFieldChange("addressLine1", v)}
          placeholder="Enter address line 1"
          error={errors.addressLine1}
        />
        <Input
          label="Address Line 2"
          value={formData.addressLine2}
          onChangeText={(v) => onFieldChange("addressLine2", v)}
          placeholder="Enter address line 2"
        />
        <Dropdown
          label="Country *"
          options={countryOptions}
          selectedValue={formData.countryId}
          onValueChange={(v) => onFieldChange("countryId", v)}
          placeholder="Select Country"
          error={errors.countryId}
          onEndReached={onEndReachedCountry}
        />
        <Dropdown
          label="State *"
          options={stateOptions}
          selectedValue={formData.stateId}
          onValueChange={(v) => onFieldChange("stateId", v)}
          placeholder="Select State"
          error={errors.stateId}
          onEndReached={onEndReachedState}
        />
        <Dropdown
          label="City *"
          options={cityOptions}
          selectedValue={formData.cityId}
          onValueChange={(v) => onFieldChange("cityId", v)}
          placeholder="Select City"
          error={errors.cityId}
          onEndReached={onEndReachedCity}
        />
        <Input
          label="Zip code *"
          value={formData.zipcode}
          onChangeText={(v) => onFieldChange("zipcode", v.replace(/[^0-9]/g, ""))}
          placeholder="Enter zipcode"
          keyboardType="number-pad"
          error={errors.zipcode}
        />
        <Input
          label="Sub Domain *"
          value={formData.subDomain}
          onChangeText={(v) => onFieldChange("subDomain", v)}
          placeholder="Enter subdomain"
          error={errors.subDomain}
        />
        <Input
          label="Employee Prefix *"
          value={formData.employeePrefix}
          onChangeText={(v) => onFieldChange("employeePrefix", v)}
          placeholder="Enter employee prefix"
          error={errors.employeePrefix}
        />

        <View style={styles.formActionRow}>
          <CustomButton
            title="Cancel"
            variant="outline"
            size="small"
            onPress={onBack}
          />
          <CustomButton
            title="Create"
            variant="primary"
            size="small"
            loading={isLoadingCreate}
            disabled={!isValid || isLoadingCreate}
            onPress={onSubmit}
          />
        </View>
      </SectionCard>
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
    formActionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: theme.spacing.s300,
      marginTop: theme.spacing.s400,
    },
  });
