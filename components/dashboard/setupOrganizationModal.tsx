import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import Dropdown from '@/components/ui/dropdown';
import DatePicker from '@/components/ui/datePicker';
import CustomButton from '@/components/ui/button';
import Stepper from '@/components/ui/stepper';
import ScrollTabs from '@/components/ui/scrollTabs';
import SectionCard from '@/components/ui/sectionCard';
import { Close } from '@/svg_icons';

// ──────────────────────────────────────────────────────────────
//  Setup Organization Modal — Multi-step Setup Flow
// ──────────────────────────────────────────────────────────────

const SETUP_STEPS = [
  { label: 'Organisation Info (1/3)' },
  { label: 'Domain setup' },
  { label: 'Choose Plan' },
];

const ORG_INFO_SUBTABS = ['Company info', 'Location', 'Finance'];

// Dropdown Mock Options
const SECTOR_OPTIONS = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Logistics', value: 'Logistics' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Healthcare', value: 'Healthcare' },
];

const NATURE_OF_BUSINESS_OPTIONS = [
  { label: 'Service Provider', value: 'Service Provider' },
  { label: 'Manufacturer', value: 'Manufacturer' },
  { label: 'Wholesaler', value: 'Wholesaler' },
];

const TYPE_OF_BUSINESS_OPTIONS = [
  { label: 'Private Limited', value: 'Private Limited' },
  { label: 'Public Limited', value: 'Public Limited' },
  { label: 'LLP', value: 'LLP' },
];

const COUNTRY_OPTIONS = [
  { label: 'India', value: 'India' },
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom', value: 'United Kingdom' },
];

const STATE_OPTIONS = [
  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Maharashtra', value: 'Maharashtra' },
];

const CITY_OPTIONS = [
  { label: 'Chennai', value: 'Chennai' },
  { label: 'Coimbatore', value: 'Coimbatore' },
  { label: 'Bengaluru', value: 'Bengaluru' },
];

const CURRENCY_OPTIONS = [
  { label: 'INR (₹)', value: 'INR' },
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
];

const FINANCIAL_YEAR_OPTIONS = [
  { label: 'April - March', value: 'April - March' },
  { label: 'January - December', value: 'January - December' },
];

interface SetupOrganizationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SetupOrganizationModal({ visible, onClose }: SetupOrganizationModalProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [currentStep, setCurrentStep] = useState(0); // Step 0: Organisation Info
  const [activeSubTab, setActiveSubTab] = useState('Company info');

  // ── Company Info State ──────────────────────────────────────
  const [legalName, setLegalName] = useState('');
  const [legalEntityName, setLegalEntityName] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [dateOfIncorporation, setDateOfIncorporation] = useState<Date | undefined>(undefined);
  const [sector, setSector] = useState('');
  const [natureOfBusiness, setNatureOfBusiness] = useState('');
  const [typeOfBusiness, setTypeOfBusiness] = useState('');
  const [employeePrefix, setEmployeePrefix] = useState('');

  // ── Location State ──────────────────────────────────────────
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');

  // ── Finance State ───────────────────────────────────────────
  const [currency, setCurrency] = useState('');
  const [financialYear, setFinancialYear] = useState('');

  // Handle Sub-tab Next button
  const handleSubTabNext = () => {
    if (activeSubTab === 'Company info') {
      setActiveSubTab('Location');
    } else if (activeSubTab === 'Location') {
      setActiveSubTab('Finance');
    } else if (activeSubTab === 'Finance') {
      // Step 1 Completed!
      setCurrentStep(1); // Moves to Step 2: Domain setup
    }
  };

  const handleSubTabBack = () => {
    if (activeSubTab === 'Finance') {
      setActiveSubTab('Location');
    } else if (activeSubTab === 'Location') {
      setActiveSubTab('Company info');
    } else {
      onClose();
    }
  };

  // ── Render Company Info Subtab ──────────────────────────────
  const renderCompanyInfo = () => (
    <View style={styles.formContainer}>
      <Input
        label="Legal Name"
        placeholder="Enter legal name"
        value={legalName}
        onChangeText={setLegalName}
      />
      <Input
        label="Legal Entity Name"
        placeholder="Enter legal entity"
        value={legalEntityName}
        onChangeText={setLegalEntityName}
      />
      <Input
        label="Identification Number"
        placeholder="Enter identification number"
        value={identificationNumber}
        onChangeText={setIdentificationNumber}
      />
      <DatePicker
        label="Date of Incorporation"
        placeholder="Select date"
        value={dateOfIncorporation}
        onChange={setDateOfIncorporation}
      />
      <Dropdown
        label="Sector"
        placeholder="Select Business Sector"
        options={SECTOR_OPTIONS}
        selectedValue={sector}
        onValueChange={setSector}
      />
      <Dropdown
        label="Nature of Business"
        placeholder="Select Nature of Business"
        options={NATURE_OF_BUSINESS_OPTIONS}
        selectedValue={natureOfBusiness}
        onValueChange={setNatureOfBusiness}
      />
      <Dropdown
        label="Type of Bussiness"
        placeholder="Select Type of Business"
        options={TYPE_OF_BUSINESS_OPTIONS}
        selectedValue={typeOfBusiness}
        onValueChange={setTypeOfBusiness}
      />
      <Input
        label="Employee prefix"
        placeholder="Enter employee prefix"
        value={employeePrefix}
        onChangeText={setEmployeePrefix}
      />
    </View>
  );

  // ── Render Location Subtab ──────────────────────────────────
  const renderLocation = () => (
    <View style={styles.formContainer}>
      <Dropdown
        label="Country"
        placeholder="Select Country"
        options={COUNTRY_OPTIONS}
        selectedValue={country}
        onValueChange={setCountry}
      />
      <Dropdown
        label="State"
        placeholder="Select State"
        options={STATE_OPTIONS}
        selectedValue={state}
        onValueChange={setState}
      />
      <Dropdown
        label="City"
        placeholder="Select City"
        options={CITY_OPTIONS}
        selectedValue={city}
        onValueChange={setCity}
      />
      <Input
        label="Zipcode"
        placeholder="Enter Zipcode"
        value={zipcode}
        onChangeText={setZipcode}
        keyboardType="number-pad"
      />
      <Input
        label="Address line 1"
        placeholder="Enter address"
        value={addressLine1}
        onChangeText={setAddressLine1}
      />
      <Input
        label="Address line 2"
        placeholder="Enter address"
        value={addressLine2}
        onChangeText={setAddressLine2}
      />
    </View>
  );

  // ── Render Finance Subtab ───────────────────────────────────
  const renderFinance = () => (
    <View style={styles.formContainer}>
      <Dropdown
        label="Currency"
        placeholder="Select Business Sector"
        options={CURRENCY_OPTIONS}
        selectedValue={currency}
        onValueChange={setCurrency}
      />
      <Dropdown
        label="financial Year"
        placeholder="Select Nature of Business"
        options={FINANCIAL_YEAR_OPTIONS}
        selectedValue={financialYear}
        onValueChange={setFinancialYear}
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.modalScreen, { paddingTop: insets.top }]}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light">
            Setup Organization
          </Typography>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Close width={20} height={20} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.light} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Stepper */}
          <Stepper steps={SETUP_STEPS} currentStep={currentStep} />

          <Typography
            fontVariant="BS"
            color="colors.neutral.onSurface.dark"
            style={styles.stepSubtitle}
          >
            Enter you organization details to continue setup
          </Typography>

          {/* Subtabs for Step 1 */}
          {currentStep === 0 && (
            <>
              <ScrollTabs
                tabs={ORG_INFO_SUBTABS}
                activeTab={activeSubTab}
                onTabChange={setActiveSubTab}
                containerStyle={styles.tabsContainer}
              />
              <View style={styles.tabDivider} />

              {activeSubTab === 'Company info' && renderCompanyInfo()}
              {activeSubTab === 'Location' && renderLocation()}
              {activeSubTab === 'Finance' && renderFinance()}
            </>
          )}

          {/* Step 2 Placeholder until next prompt */}
          {currentStep > 0 && (
            <SectionCard title={SETUP_STEPS[currentStep].label}>
              <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center', paddingVertical: 20 }}>
                Step 1 (Organisation Info) completed successfully! Next steps will be configured in the next prompt.
              </Typography>
            </SectionCard>
          )}

          {/* Bottom Footer Actions */}
          <View style={styles.footerActions}>
            <CustomButton
              title="Cancel"
              variant="outline"
              size="small"
              onPress={handleSubTabBack}
            />
            <CustomButton
              title="Next"
              variant="primary"
              size="small"
              onPress={handleSubTabNext}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalScreen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    headerBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s300,
    },
    closeBtn: {
      padding: theme.spacing.s100,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
    },
    stepSubtitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.s400,
    },
    tabsContainer: {
      paddingHorizontal: 0,
    },
    tabDivider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
      marginBottom: theme.spacing.s400,
    },
    formContainer: {
      gap: theme.spacing.s200,
    },
    footerActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.s300,
      marginTop: theme.spacing.s600,
    },
  });
