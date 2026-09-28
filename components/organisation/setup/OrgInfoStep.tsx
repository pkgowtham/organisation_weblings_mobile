import React from 'react';
import { View, StyleSheet } from 'react-native';
import Input from '@/components/ui/textInput';
import Dropdown from '@/components/ui/dropdown';
import DatePicker from '@/components/ui/datePicker';
import ScrollTabs from '@/components/ui/scrollTabs';
import CustomButton from '@/components/ui/button';
import { useTheme } from '@/context/CustomThemeContext';

export const ORG_INFO_SUBTABS = ['Company info', 'Location', 'Finance'];

interface OrgInfoStepProps {
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  // Step 1 Form values
  legalName: string;
  setLegalName: (val: string) => void;
  legalEntityName: string;
  setLegalEntityName: (val: string) => void;
  identificationNumber: string;
  setIdentificationNumber: (val: string) => void;
  dateOfIncorporation: Date | undefined;
  setDateOfIncorporation: (val: Date | undefined) => void;
  sector: string;
  setSector: (val: string) => void;
  natureOfBusiness: string;
  setNatureOfBusiness: (val: string) => void;
  typeOfBusiness: string;
  setTypeOfBusiness: (val: string) => void;
  employeePrefix: string;
  setEmployeePrefix: (val: string) => void;
  // Location
  country: string;
  setCountry: (val: string) => void;
  state: string;
  setState: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  zipcode: string;
  setZipcode: (val: string) => void;
  addressLine1: string;
  setAddressLine1: (val: string) => void;
  addressLine2: string;
  setAddressLine2: (val: string) => void;
  // Finance
  currency: string;
  setCurrency: (val: string) => void;
  financialYear: string;
  setFinancialYear: (val: string) => void;
  // Options
  sectorOptions: { label: string; value: string }[];
  natureOptions: { label: string; value: string }[];
  typeOptions: { label: string; value: string }[];
  countryOptions: { label: string; value: string }[];
  stateOptions: { label: string; value: string }[];
  cityOptions: { label: string; value: string }[];
  currencyOptions: { label: string; value: string }[];
  // Pagination callbacks
  onEndReachedSector?: () => void;
  onEndReachedNature?: () => void;
  onEndReachedType?: () => void;
  onEndReachedCountry?: () => void;
  onEndReachedState?: () => void;
  onEndReachedCity?: () => void;
  onEndReachedCurrency?: () => void;
  // Handlers
  onNext: () => void;
  onBack: () => void;
}

export default function OrgInfoStep({
  activeSubTab,
  setActiveSubTab,
  legalName,
  setLegalName,
  legalEntityName,
  setLegalEntityName,
  identificationNumber,
  setIdentificationNumber,
  dateOfIncorporation,
  setDateOfIncorporation,
  sector,
  setSector,
  natureOfBusiness,
  setNatureOfBusiness,
  typeOfBusiness,
  setTypeOfBusiness,
  employeePrefix,
  setEmployeePrefix,
  country,
  setCountry,
  state,
  setState,
  city,
  setCity,
  zipcode,
  setZipcode,
  addressLine1,
  setAddressLine1,
  addressLine2,
  setAddressLine2,
  currency,
  setCurrency,
  financialYear,
  setFinancialYear,
  sectorOptions,
  natureOptions,
  typeOptions,
  countryOptions,
  stateOptions,
  cityOptions,
  currencyOptions,
  onEndReachedSector,
  onEndReachedNature,
  onEndReachedType,
  onEndReachedCountry,
  onEndReachedState,
  onEndReachedCity,
  onEndReachedCurrency,
  onNext,
  onBack,
}: OrgInfoStepProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollTabs
        tabs={ORG_INFO_SUBTABS}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
        containerStyle={styles.tabsContainer}
      />

      {activeSubTab === 'Company info' && (
        <View style={styles.formContainer}>
          <Input label="Legal Name *" placeholder="Enter legal name" value={legalName} onChangeText={setLegalName} />
          <Input label="Legal Entity Name *" placeholder="Enter legal entity" value={legalEntityName} onChangeText={setLegalEntityName} />
          <Input label="Identification Number *" placeholder="Enter identification number" value={identificationNumber} onChangeText={setIdentificationNumber} />
          <DatePicker label="Date of Incorporation *" placeholder="Select date" value={dateOfIncorporation} onChange={setDateOfIncorporation} />
          <Dropdown label="Sector *" placeholder="Select Business Sector" options={sectorOptions} selectedValue={sector} onValueChange={setSector} onEndReached={onEndReachedSector} />
          <Dropdown label="Nature of Business *" placeholder="Select Nature of Business" options={natureOptions} selectedValue={natureOfBusiness} onValueChange={setNatureOfBusiness} onEndReached={onEndReachedNature} />
          <Dropdown label="Type of Business *" placeholder="Select Type of Business" options={typeOptions} selectedValue={typeOfBusiness} onValueChange={setTypeOfBusiness} onEndReached={onEndReachedType} />
          <Input label="Employee Prefix *" placeholder="e.g. EMP" value={employeePrefix} onChangeText={setEmployeePrefix} />
        </View>
      )}

      {activeSubTab === 'Location' && (
        <View style={styles.formContainer}>
          <Dropdown label="Country *" placeholder="Select Country" options={countryOptions} selectedValue={country} onValueChange={(v) => { setCountry(v); setState(''); setCity(''); }} onEndReached={onEndReachedCountry} />
          <Dropdown label="State *" placeholder="Select State" options={stateOptions} selectedValue={state} onValueChange={(v) => { setState(v); setCity(''); }} onEndReached={onEndReachedState} />
          <Dropdown label="City *" placeholder="Select City" options={cityOptions} selectedValue={city} onValueChange={setCity} onEndReached={onEndReachedCity} />
          <Input label="Zipcode *" placeholder="Enter Zipcode" value={zipcode} onChangeText={setZipcode} keyboardType="number-pad" />
          <Input label="Address line 1 *" placeholder="Enter address line 1" value={addressLine1} onChangeText={setAddressLine1} />
          <Input label="Address line 2" placeholder="Enter address line 2" value={addressLine2} onChangeText={setAddressLine2} />
        </View>
      )}

      {activeSubTab === 'Finance' && (
        <View style={styles.formContainer}>
          <Dropdown label="Currency *" placeholder="Select Currency" options={currencyOptions} selectedValue={currency} onValueChange={setCurrency} onEndReached={onEndReachedCurrency} />
          <Input label="Financial Year *" placeholder="e.g. 2025-2026" value={financialYear} onChangeText={setFinancialYear} />
        </View>
      )}

      <View style={styles.actionButtonsRow}>
        <CustomButton
          title="Back"
          variant="outline"
          size="medium"
          onPress={onBack}
          buttonStyle={styles.halfBtn}
        />
        <CustomButton
          title="Next"
          variant="primary"
          size="medium"
          onPress={onNext}
          buttonStyle={styles.halfBtn}
        />
      </View>
    </View>
  );
}

const createStyles = (_theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    tabsContainer: {
      marginBottom: 20,
    },
    formContainer: {
      gap: 16,
      marginBottom: 24,
    },
    actionButtonsRow: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 8,
      marginBottom: 30,
    },
    halfBtn: {
      flex: 1,
    },
  });
