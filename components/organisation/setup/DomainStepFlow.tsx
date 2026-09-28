import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, SemiBoldText, RegularText } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import CustomButton from '@/components/ui/button';
import { ArrowForwardIos, Search } from '@/svg_icons';
import { useTheme } from '@/context/CustomThemeContext';
import {
  CheckmarkSquareIcon,
  BuildingPlusIcon,
  CartIcon,
  CreditCardIcon,
  ClipboardIcon,
  GreenCheckCircleIcon,
} from './SetupIcons';

export type ExistingDomainSubStep = 'preference' | 'beforeBegin' | 'verifyInfo' | 'enterDomain' | 'pending';
export type BuyDomainSubStep = 'terms' | 'search' | 'confirm';

interface DomainStepFlowProps {
  domainMode: 'existing' | 'buy';
  setDomainMode: (mode: 'existing' | 'buy') => void;
  domainOption: 'free' | 'existing' | 'buy';
  setDomainOption: (opt: 'free' | 'existing' | 'buy') => void;
  existingSubStep: ExistingDomainSubStep;
  setExistingSubStep: (step: ExistingDomainSubStep) => void;
  domainNameInput: string;
  setDomainNameInput: (val: string) => void;
  domainError: string;
  setDomainError: (val: string) => void;
  buySubStep: BuyDomainSubStep;
  setBuySubStep: (step: BuyDomainSubStep) => void;
  buySearchInput: string;
  setBuySearchInput: (val: string) => void;
  selectedBuyDomain: string;
  // Handlers
  onExistingDomainNext: () => void;
  onBuyDomainNext: () => void;
  onBack: () => void;
}

export default function DomainStepFlow({
  domainMode,
  setDomainMode,
  domainOption,
  setDomainOption,
  existingSubStep,
  setExistingSubStep,
  domainNameInput,
  setDomainNameInput,
  domainError,
  setDomainError,
  buySubStep,
  setBuySubStep,
  buySearchInput,
  setBuySearchInput,
  selectedBuyDomain,
  onExistingDomainNext,
  onBuyDomainNext,
  onBack,
}: DomainStepFlowProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // 1. Existing Domain Preference
  const renderDomainPreference = () => (
    <View style={styles.domainStepContainer}>
      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Select domain preference
      </Typography>
      <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.centerSubtitle}>
        Select your preferred method to continue the setup
      </Typography>

      <View style={styles.cardsGrid}>
        <TouchableOpacity
          style={[styles.preferenceCard, domainOption === 'free' && styles.selectedPreferenceCard]}
          onPress={() => setDomainOption('free')}
          activeOpacity={0.8}
        >
          <View style={styles.radioOuter}>
            {domainOption === 'free' && <View style={styles.radioInner} />}
          </View>
          <CheckmarkSquareIcon color={theme.colors.neutral.onSurface.light} size={28} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={styles.cardTitle}>
            Use weblings Domain (Free)*
          </Typography>
          <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.cardDesc}>
            example yourname@weblings.dev
          </RegularText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.preferenceCard, domainOption === 'existing' && styles.selectedPreferenceCard]}
          onPress={() => setDomainOption('existing')}
          activeOpacity={0.8}
        >
          <View style={styles.radioOuter}>
            {domainOption === 'existing' && <View style={styles.radioInner} />}
          </View>
          <BuildingPlusIcon color={theme.colors.brand.surface.medium} size={28} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={styles.cardTitle}>
            Add Your Existing Domain
          </Typography>
          <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.cardDesc}>
            Add Your Existing Domain to configure it with weblings
          </RegularText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.preferenceCard, styles.fullWidthCard, domainOption === 'buy' && styles.selectedPreferenceCard]}
          onPress={() => setDomainOption('buy')}
          activeOpacity={0.8}
        >
          <View style={styles.radioOuter}>
            {domainOption === 'buy' && <View style={styles.radioInner} />}
          </View>
          <CartIcon color={theme.colors.neutral.onSurface.light} size={28} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={styles.cardTitle}>
            Buy New Domain
          </Typography>
          <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.cardDesc}>
            Buy your new domain Through Weblings ?
          </RegularText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 2. Before We Begin
  const renderBeforeBegin = () => (
    <View style={styles.domainStepContainer}>
      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Before we begin
      </Typography>

      <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light" style={{ marginTop: 24, marginBottom: 8, textAlign: 'center' }}>
        Why domain setup ?
      </Typography>

      <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.centerSubtitle}>
        Select your preferred method to continue the setup
      </Typography>
    </View>
  );

  // 3. Verify Domain Ownership
  const renderVerifyInfo = () => (
    <View style={styles.domainStepContainer}>
      <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.centerSubtitle}>
        Adding Your Existing Domain
      </Typography>

      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        How we verify Domain Ownership !
      </Typography>

      <View style={styles.cardsGrid}>
        <View style={styles.preferenceCard}>
          <BuildingPlusIcon color={theme.colors.neutral.onSurface.light} size={32} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={{ marginTop: 12, marginBottom: 4 }}>
            1. Enter Domain Name
          </Typography>
          <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center' }}>
            Input the valid domain name you own.
          </RegularText>
        </View>

        <View style={styles.preferenceCard}>
          <CreditCardIcon color={theme.colors.neutral.onSurface.light} size={32} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={{ marginTop: 12, marginBottom: 4 }}>
            2. Make Payment
          </Typography>
          <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center' }}>
            Complete the transfer fee payment.
          </RegularText>
        </View>

        <View style={styles.preferenceCard}>
          <ClipboardIcon color={theme.colors.neutral.onSurface.light} size={32} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={{ marginTop: 12, marginBottom: 4 }}>
            3. Add TXT Key
          </Typography>
          <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center' }}>
            Copy and paste the TXT key in your hosting.
          </RegularText>
        </View>

        <View style={styles.preferenceCard}>
          <CheckmarkSquareIcon color={theme.colors.neutral.onSurface.light} size={32} />
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light" style={{ marginTop: 12, marginBottom: 4 }}>
            4. Claim Domain
          </Typography>
          <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center' }}>
            Once completed, you can claim your domain.
          </RegularText>
        </View>
      </View>
    </View>
  );

  // 4. Enter Domain
  const renderEnterDomain = () => (
    <View style={styles.domainStepContainer}>
      <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.centerSubtitle}>
        Add Your Existing Domain
      </Typography>

      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Enter your domain name to continue the setup
      </Typography>

      <View style={styles.enterDomainInputWrapper}>
        <Input
          placeholder="Enter a domain name"
          value={domainNameInput}
          onChangeText={(val) => {
            setDomainNameInput(val);
            if (domainError) setDomainError('');
          }}
          error={domainError}
          containerStyle={{ flex: 1, marginBottom: 0 }}
          rightIcon={
            <TouchableOpacity onPress={onExistingDomainNext} style={styles.submitArrowBtn}>
              <ArrowForwardIos width={14} height={14} viewBox="0 0 24 24" color="#FFF" />
            </TouchableOpacity>
          }
        />
      </View>

      <View style={styles.domainFooterLinks}>
        <TouchableOpacity onPress={() => setExistingSubStep('preference')}>
          <SemiBoldText fontVariant="BXS" color="colors.neutral.onSurface.dark">
            {'< Back to domain setup'}
          </SemiBoldText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setDomainMode('buy'); setBuySubStep('terms'); }}>
          <SemiBoldText fontVariant="BXS" color="colors.brand.onSurface.light">
            I Don't have a Domain! Buy Domain
          </SemiBoldText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 5. Pending
  const renderPending = () => (
    <View style={styles.domainStepContainer}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <GreenCheckCircleIcon size={72} />
      </View>

      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Your Domain "{domainNameInput || 'Domain name'}" is added successfully
      </Typography>

      <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light" style={{ marginTop: 16, marginBottom: 8, textAlign: 'center' }}>
        Verification pending
      </Typography>

      <RegularText fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center', maxWidth: 460 }}>
        Our technical support team will reach out to you for verification within 24 hours.
      </RegularText>
    </View>
  );

  // 6. Buy Terms
  const renderBuyTerms = () => (
    <View style={styles.domainStepContainer}>
      <View style={styles.buyHeaderRow}>
        <CartIcon color={theme.colors.neutral.onSurface.light} size={20} />
        <SemiBoldText fontVariant="BS" color="colors.neutral.onSurface.light">
          Buying a New Domain
        </SemiBoldText>
      </View>

      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Terms & Conditions
      </Typography>

      <View style={styles.termsBox}>
        <View style={styles.termItem}>
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
            1. Domain Management
          </Typography>
          <RegularText fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ marginTop: 4 }}>
            We will manage your domain. If you decide to leave our service, we will transfer ownership to you within 15 to 30 days at no extra cost.
          </RegularText>
        </View>

        <View style={styles.termItem}>
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
            2. Domain Purchase Policy
          </Typography>
          <RegularText fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ marginTop: 4 }}>
            Once purchased, a domain cannot be changed.
          </RegularText>
        </View>

        <View style={styles.termItem}>
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
            3. Billing and Payment
          </Typography>
          <RegularText fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ marginTop: 4 }}>
            Domain services will be billed annually.
          </RegularText>
        </View>
      </View>
    </View>
  );

  // 7. Buy Search
  const renderBuySearch = () => (
    <View style={styles.domainStepContainer}>
      <View style={styles.buyHeaderRow}>
        <CartIcon color={theme.colors.neutral.onSurface.light} size={20} />
        <SemiBoldText fontVariant="BS" color="colors.neutral.onSurface.light">
          Buying a New Domain
        </SemiBoldText>
      </View>

      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Search for Your Domain
      </Typography>

      <View style={styles.enterDomainInputWrapper}>
        <Input
          placeholder="Search domain names"
          value={buySearchInput}
          onChangeText={setBuySearchInput}
          containerStyle={{ flex: 1, marginBottom: 0 }}
          rightIcon={
            <TouchableOpacity onPress={() => setBuySubStep('confirm')} style={styles.submitArrowBtn}>
              <Search width={16} height={16} viewBox="0 0 24 24" color="#FFF" />
            </TouchableOpacity>
          }
        />
      </View>

      <View style={styles.domainFooterLinks}>
        <TouchableOpacity onPress={() => setExistingSubStep('preference')}>
          <SemiBoldText fontVariant="BXS" color="colors.neutral.onSurface.dark">
            {'< Back to domain setup'}
          </SemiBoldText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 8. Buy Confirm
  const renderBuyConfirm = () => (
    <View style={styles.domainStepContainer}>
      <View style={styles.buyHeaderRow}>
        <CartIcon color={theme.colors.neutral.onSurface.light} size={20} />
        <SemiBoldText fontVariant="BS" color="colors.neutral.onSurface.light">
          Buying a New Domain
        </SemiBoldText>
      </View>

      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Confirming Domain Name
      </Typography>

      <View style={styles.confirmBox}>
        <View style={styles.searchResultRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
              {selectedBuyDomain}
            </Typography>
            <SemiBoldText fontVariant="BS" color="colors.positive.onSurface.light">
              Available
            </SemiBoldText>
          </View>
          <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.light">
            $12/ year
          </Typography>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {domainMode === 'existing' && existingSubStep === 'preference' && renderDomainPreference()}
      {domainMode === 'existing' && existingSubStep === 'beforeBegin' && renderBeforeBegin()}
      {domainMode === 'existing' && existingSubStep === 'verifyInfo' && renderVerifyInfo()}
      {domainMode === 'existing' && existingSubStep === 'enterDomain' && renderEnterDomain()}
      {domainMode === 'existing' && existingSubStep === 'pending' && renderPending()}

      {domainMode === 'buy' && buySubStep === 'terms' && renderBuyTerms()}
      {domainMode === 'buy' && buySubStep === 'search' && renderBuySearch()}
      {domainMode === 'buy' && buySubStep === 'confirm' && renderBuyConfirm()}

      {/* Footer Navigation Buttons */}
      {existingSubStep !== 'enterDomain' && buySubStep !== 'search' && (
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
            onPress={domainMode === 'existing' ? onExistingDomainNext : onBuyDomainNext}
            buttonStyle={styles.halfBtn}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    domainStepContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    centerTitle: {
      textAlign: 'center',
      marginBottom: 8,
    },
    centerSubtitle: {
      textAlign: 'center',
      marginBottom: 24,
    },
    cardsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      justifyContent: 'center',
      width: '100%',
    },
    preferenceCard: {
      width: 260,
      borderWidth: 1,
      borderColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius?.b200 || 8,
      padding: 20,
      alignItems: 'center',
      backgroundColor: theme.colors.neutral.surface.light,
      position: 'relative',
    },
    selectedPreferenceCard: {
      borderColor: theme.colors.brand.surface.medium,
      borderWidth: 2,
    },
    fullWidthCard: {
      width: '100%',
      maxWidth: 536,
    },
    cardTitle: {
      marginTop: 12,
      marginBottom: 4,
      textAlign: 'center',
    },
    cardDesc: {
      textAlign: 'center',
    },
    radioOuter: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: theme.colors.neutral.onSurface.dark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.brand.surface.medium,
    },
    enterDomainInputWrapper: {
      width: '100%',
      maxWidth: 480,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    submitArrowBtn: {
      backgroundColor: theme.colors.brand.surface.medium,
      padding: 8,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    domainFooterLinks: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 480,
      marginTop: 16,
    },
    buyHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    termsBox: {
      width: '100%',
      maxWidth: 540,
      backgroundColor: theme.colors.neutral.surface.light,
      padding: 16,
      borderRadius: theme.borderRadius?.b200 || 8,
      gap: 16,
      marginTop: 12,
    },
    termItem: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.surface.lighter,
      paddingBottom: 12,
    },
    confirmBox: {
      width: '100%',
      maxWidth: 480,
      backgroundColor: theme.colors.neutral.surface.light,
      padding: 16,
      borderRadius: theme.borderRadius?.b200 || 8,
      marginTop: 16,
    },
    searchResultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
