import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Stepper from '@/components/ui/stepper';
import SectionCard from '@/components/ui/sectionCard';
import { ArrowBackIos } from '@/svg_icons';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import { getItemAsync, setItemAsync } from '@/utils/secureStorage';
import OrgInfoStep from '@/components/organisation/setup/OrgInfoStep';
import DomainStepFlow, {
  ExistingDomainSubStep,
  BuyDomainSubStep,
} from '@/components/organisation/setup/DomainStepFlow';
import PlanSelectionStep from '@/components/organisation/setup/PlanSelectionStep';

const SETUP_STEPS = [
  { label: 'Organisation Info' },
  { label: 'Domain Setup' },
  { label: 'Choose Plan' },
];

export default function SetupOrganizationScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack, safeReplace } = useSafeNavigation();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0); // 0: Org Info, 1: Domain Setup, 2: Choose Plan
  const [activeSubTab, setActiveSubTab] = useState('Company info');

  // ── Step 1 State ───────────────────────────────────────────
  const [legalName, setLegalName] = useState('');
  const [legalEntityName, setLegalEntityName] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');
  const [dateOfIncorporation, setDateOfIncorporation] = useState<Date | undefined>(undefined);
  const [sector, setSector] = useState('');
  const [natureOfBusiness, setNatureOfBusiness] = useState('');
  const [typeOfBusiness, setTypeOfBusiness] = useState('');
  const [employeePrefix, setEmployeePrefix] = useState('EMP');

  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');

  const [currency, setCurrency] = useState('');
  const [financialYear, setFinancialYear] = useState('2025-2026');

  // ── Step 2 Domain Setup State ──────────────────────────────
  const [domainMode, setDomainMode] = useState<'existing' | 'buy'>('existing');
  const [domainOption, setDomainOption] = useState<'free' | 'existing' | 'buy'>('existing');

  const [existingSubStep, setExistingSubStep] = useState<ExistingDomainSubStep>('preference');
  const [domainNameInput, setDomainNameInput] = useState('');
  const [domainError, setDomainError] = useState('');

  const [buySubStep, setBuySubStep] = useState<BuyDomainSubStep>('terms');
  const [buySearchInput, setBuySearchInput] = useState('Example.com');
  const [selectedBuyDomain, setSelectedBuyDomain] = useState('Example.com');

  // ── Step 3 Choose Plan State ───────────────────────────────
  const [planSubStep, setPlanSubStep] = useState<'pickPlan' | 'successScreen'>('pickPlan');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isLoadingCreateOrg, setIsLoadingCreateOrg] = useState<boolean>(false);

  // ── Dropdown Pagination & Accumulation States ─────────────
  const [countryPage, setCountryPage] = useState(1);
  const [countryTotalPages, setCountryTotalPages] = useState(1);
  const [statePage, setStatePage] = useState(1);
  const [stateTotalPages, setStateTotalPages] = useState(1);
  const [cityPage, setCityPage] = useState(1);
  const [cityTotalPages, setCityTotalPages] = useState(1);
  const [sectorPage, setSectorPage] = useState(1);
  const [sectorTotalPages, setSectorTotalPages] = useState(1);
  const [naturePage, setNaturePage] = useState(1);
  const [natureTotalPages, setNatureTotalPages] = useState(1);
  const [typePage, setTypePage] = useState(1);
  const [typeTotalPages, setTypeTotalPages] = useState(1);
  const [currencyPage, setCurrencyPage] = useState(1);
  const [currencyTotalPages, setCurrencyTotalPages] = useState(1);

  const [isLoadingMoreCountry, setIsLoadingMoreCountry] = useState(false);
  const [isLoadingMoreState, setIsLoadingMoreState] = useState(false);
  const [isLoadingMoreCity, setIsLoadingMoreCity] = useState(false);
  const [isLoadingMoreSector, setIsLoadingMoreSector] = useState(false);
  const [isLoadingMoreNature, setIsLoadingMoreNature] = useState(false);
  const [isLoadingMoreType, setIsLoadingMoreType] = useState(false);
  const [isLoadingMoreCurrency, setIsLoadingMoreCurrency] = useState(false);

  const [accumulatedCountries, setAccumulatedCountries] = useState<any[]>([]);
  const [accumulatedStates, setAccumulatedStates] = useState<any[]>([]);
  const [accumulatedCities, setAccumulatedCities] = useState<any[]>([]);
  const [accumulatedSectors, setAccumulatedSectors] = useState<any[]>([]);
  const [accumulatedNatures, setAccumulatedNatures] = useState<any[]>([]);
  const [accumulatedTypes, setAccumulatedTypes] = useState<any[]>([]);
  const [accumulatedCurrencies, setAccumulatedCurrencies] = useState<any[]>([]);

  const mergeItems = (prev: any[], newItems: any[]) => {
    const map = new Map();
    prev.forEach((item) => {
      const key = item.id || item.value || item.code;
      if (key) map.set(key, item);
    });
    newItems.forEach((item) => {
      const key = item.id || item.value || item.code;
      if (key) map.set(key, item);
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    const raw = store.country.dataGetList?.data || store.country.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedCountries((prev) => mergeItems(prev, raw));
  }, [store.country.dataGetList]);

  useEffect(() => {
    const raw = store.state.dataGetList?.data || store.state.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedStates((prev) => mergeItems(prev, raw));
  }, [store.state.dataGetList]);

  useEffect(() => {
    const raw = store.city.dataGetList?.data || store.city.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedCities((prev) => mergeItems(prev, raw));
  }, [store.city.dataGetList]);

  useEffect(() => {
    const raw = store.sector.dataGetList?.data || store.sector.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedSectors((prev) => mergeItems(prev, raw));
  }, [store.sector.dataGetList]);

  useEffect(() => {
    const raw = store.natureOfBusiness.dataGetList?.data || store.natureOfBusiness.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedNatures((prev) => mergeItems(prev, raw));
  }, [store.natureOfBusiness.dataGetList]);

  useEffect(() => {
    const raw = store.typeOfBusiness.dataGetList?.data || store.typeOfBusiness.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedTypes((prev) => mergeItems(prev, raw));
  }, [store.typeOfBusiness.dataGetList]);

  useEffect(() => {
    const raw = store.currency.dataGetList?.data || store.currency.dataGetList || [];
    if (Array.isArray(raw) && raw.length > 0) setAccumulatedCurrencies((prev) => mergeItems(prev, raw));
  }, [store.currency.dataGetList]);

  // 1. Fetch static dropdown lists on Mount for Step 1
  useEffect(() => {
    (async () => {
      const resSector: any = await dispatch({ type: 'SECTOR_GETLIST_API_REQUEST', payload: { url: 'sector', method: 'GET', query: { page: 1, limit: 20 } } });
      if (resSector?.meta?.totalPages !== undefined) setSectorTotalPages(resSector.meta.totalPages);

      const resNature: any = await dispatch({ type: 'NATURE_GETLIST_API_REQUEST', payload: { url: 'natureOfBusiness', method: 'GET', query: { page: 1, limit: 20 } } });
      if (resNature?.meta?.totalPages !== undefined) setNatureTotalPages(resNature.meta.totalPages);

      const resType: any = await dispatch({ type: 'TYPE_GETLIST_API_REQUEST', payload: { url: 'typeOfBusiness', method: 'GET', query: { page: 1, limit: 20 } } });
      if (resType?.meta?.totalPages !== undefined) setTypeTotalPages(resType.meta.totalPages);

      const resCountry: any = await dispatch({ type: 'COUNTRY_GETLIST_API_REQUEST', payload: { url: 'country', method: 'GET', query: { page: 1, limit: 20 } } });
      if (resCountry?.meta?.totalPages !== undefined) setCountryTotalPages(resCountry.meta.totalPages);

      const resCurrency: any = await dispatch({ type: 'CURRENCY_GETLIST_API_REQUEST', payload: { url: 'currency', method: 'GET', query: { page: 1, limit: 20 } } });
      if (resCurrency?.meta?.totalPages !== undefined) setCurrencyTotalPages(resCurrency.meta.totalPages);
    })();
  }, [dispatch]);

  // 2. Fetch States when Country changes
  useEffect(() => {
    if (country) {
      setAccumulatedStates([]);
      setStatePage(1);
      setStateTotalPages(1);
      (async () => {
        const res: any = await dispatch({ type: 'STATE_GETLIST_API_REQUEST', payload: { url: `state?countryId=${country}`, method: 'GET', query: { page: 1, limit: 20 } } });
        if (res?.meta?.totalPages !== undefined) setStateTotalPages(res.meta.totalPages);
      })();
    }
  }, [country, dispatch]);

  // 3. Fetch Cities when State changes
  useEffect(() => {
    if (state) {
      setAccumulatedCities([]);
      setCityPage(1);
      setCityTotalPages(1);
      (async () => {
        const res: any = await dispatch({ type: 'CITY_GETLIST_API_REQUEST', payload: { url: `city?stateId=${state}`, method: 'GET', query: { page: 1, limit: 20 } } });
        if (res?.meta?.totalPages !== undefined) setCityTotalPages(res.meta.totalPages);
      })();
    }
  }, [state, dispatch]);

  // 4. Fetch Plans List when Step 3 is active
  useEffect(() => {
    if (currentStep === 2) {
      dispatch({ type: 'GET_PLANS_LIST_API_REQUEST', payload: { url: 'plans', method: 'GET' } });
    }
  }, [currentStep, dispatch]);

  // ── Infinite Scroll Handlers for Dropdowns ──────────────────
  const handleLoadMoreCountry = async () => {
    if (isLoadingMoreCountry || countryPage >= countryTotalPages) return;
    setIsLoadingMoreCountry(true);
    const nextPage = countryPage + 1;
    const res: any = await dispatch({
      type: 'COUNTRY_GETLIST_API_REQUEST',
      payload: { url: 'country', method: 'GET', query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreCountry(false);
    if (res?.meta?.totalPages !== undefined) setCountryTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setCountryPage(nextPage);
  };

  const handleLoadMoreState = async () => {
    if (isLoadingMoreState || !country || statePage >= stateTotalPages) return;
    setIsLoadingMoreState(true);
    const nextPage = statePage + 1;
    const res: any = await dispatch({
      type: 'STATE_GETLIST_API_REQUEST',
      payload: { url: `state?countryId=${country}`, method: 'GET', query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreState(false);
    if (res?.meta?.totalPages !== undefined) setStateTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setStatePage(nextPage);
  };

  const handleLoadMoreCity = async () => {
    if (isLoadingMoreCity || !state || cityPage >= cityTotalPages) return;
    setIsLoadingMoreCity(true);
    const nextPage = cityPage + 1;
    const res: any = await dispatch({
      type: 'CITY_GETLIST_API_REQUEST',
      payload: { url: `city?stateId=${state}`, method: 'GET', query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreCity(false);
    if (res?.meta?.totalPages !== undefined) setCityTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setCityPage(nextPage);
  };

  const handleLoadMoreSector = async () => {
    if (isLoadingMoreSector || sectorPage >= sectorTotalPages) return;
    setIsLoadingMoreSector(true);
    const nextPage = sectorPage + 1;
    const res: any = await dispatch({
      type: 'SECTOR_GETLIST_API_REQUEST',
      payload: { url: 'sector', method: 'GET', query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreSector(false);
    if (res?.meta?.totalPages !== undefined) setSectorTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setSectorPage(nextPage);
  };

  const handleLoadMoreNature = async () => {
    if (isLoadingMoreNature || naturePage >= natureTotalPages) return;
    setIsLoadingMoreNature(true);
    const nextPage = naturePage + 1;
    const res: any = await dispatch({
      type: 'NATURE_GETLIST_API_REQUEST',
      payload: { url: 'natureOfBusiness', method: 'GET', query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreNature(false);
    if (res?.meta?.totalPages !== undefined) setNatureTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setNaturePage(nextPage);
  };

  const handleLoadMoreType = async () => {
    if (isLoadingMoreType || typePage >= typeTotalPages) return;
    setIsLoadingMoreType(true);
    const nextPage = typePage + 1;
    const res: any = await dispatch({
      type: 'TYPE_GETLIST_API_REQUEST',
      payload: { url: 'typeOfBusiness', method: 'GET', query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreType(false);
    if (res?.meta?.totalPages !== undefined) setTypeTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setTypePage(nextPage);
  };

  const handleLoadMoreCurrency = async () => {
    if (isLoadingMoreCurrency || currencyPage >= currencyTotalPages) return;
    setIsLoadingMoreCurrency(true);
    const nextPage = currencyPage + 1;
    const res: any = await dispatch({
      type: 'CURRENCY_GETLIST_API_REQUEST',
      payload: { url: 'currency', method: 'GET', query: { page: nextPage, limit: 20 } },
    });
    setIsLoadingMoreCurrency(false);
    if (res?.meta?.totalPages !== undefined) setCurrencyTotalPages(res.meta.totalPages);
    const items = res?.data || (Array.isArray(res) ? res : []);
    if (Array.isArray(items) && items.length > 0) setCurrencyPage(nextPage);
  };

  // Derive dropdown options dynamically from accumulated lists or Redux Store
  const rawSector = accumulatedSectors.length > 0 ? accumulatedSectors : (store.sector.dataGetList?.data || store.sector.dataGetList || []);
  const sectorOptions = Array.isArray(rawSector)
    ? rawSector.map((item: any) => ({
      value: item.id,
      label: item.sectorName || item.name || item.displayName || item.label || item.id,
    }))
    : [];

  const rawNature = accumulatedNatures.length > 0 ? accumulatedNatures : (store.natureOfBusiness.dataGetList?.data || store.natureOfBusiness.dataGetList || []);
  const natureOptions = Array.isArray(rawNature)
    ? rawNature.map((item: any) => ({
      value: item.id,
      label: item.natureOfBusiness || item.natureOfBusinessName || item.name || item.label || item.id,
    }))
    : [];

  const rawType = accumulatedTypes.length > 0 ? accumulatedTypes : (store.typeOfBusiness.dataGetList?.data || store.typeOfBusiness.dataGetList || []);
  const typeOptions = Array.isArray(rawType)
    ? rawType.map((item: any) => ({
      value: item.id,
      label: item.typeOfBusiness || item.typeOfBusinessName || item.name || item.label || item.id,
    }))
    : [];

  const rawCountry = accumulatedCountries.length > 0 ? accumulatedCountries : (store.country.dataGetList?.data || store.country.dataGetList || []);
  const countryOptions = Array.isArray(rawCountry)
    ? rawCountry.map((item: any) => ({
      value: item.value || item.id,
      label: item.countryName || item.name || item.label || item.id,
    }))
    : [];

  const rawState = accumulatedStates.length > 0 ? accumulatedStates : (store.state.dataGetList?.data || store.state.dataGetList || []);
  const stateOptions = Array.isArray(rawState)
    ? rawState.map((item: any) => ({
      value: item.value || item.id,
      label: item.stateName || item.name || item.label || item.id,
    }))
    : [];

  const rawCity = accumulatedCities.length > 0 ? accumulatedCities : (store.city.dataGetList?.data || store.city.dataGetList || []);
  const cityOptions = Array.isArray(rawCity)
    ? rawCity.map((item: any) => ({
      value: item.value || item.id,
      label: item.cityName || item.name || item.label || item.id,
    }))
    : [];

  const rawCurrency = accumulatedCurrencies.length > 0 ? accumulatedCurrencies : (store.currency.dataGetList?.data || store.currency.dataGetList || []);
  const currencyOptions = Array.isArray(rawCurrency)
    ? rawCurrency.map((item: any) => ({
      value: item.id,
      label: item.currencyName
        ? `${item.currencyName} (${item.currencyCode || ''})`
        : item.name
          ? `${item.name} (${item.code || ''})`
          : item.code || item.id,
    }))
    : [];

  const plansData = store.plan.plansData || [];

  // Auto-select first plan when plans list loads
  useEffect(() => {
    if (plansData.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plansData[0].id);
    }
  }, [plansData, selectedPlanId]);

  // Validation helpers for Step 1
  const isCompanyInfoValid =
    legalName.trim() !== '' &&
    legalEntityName.trim() !== '' &&
    identificationNumber.trim() !== '' &&
    dateOfIncorporation !== undefined &&
    sector !== '' &&
    natureOfBusiness !== '' &&
    typeOfBusiness !== '' &&
    employeePrefix.trim() !== '';

  const isLocationValid =
    country !== '' &&
    state !== '' &&
    city !== '' &&
    zipcode.trim() !== '' &&
    addressLine1.trim() !== '';

  const isFinanceValid = currency !== '' && financialYear.trim() !== '';

  // Step 1 SubTab Navigation
  const handleSubTabNext = () => {
    if (activeSubTab === 'Company info') {
      if (!isCompanyInfoValid) {
        showToast({ type: 'error', iconType: 'error', title: 'Please fill all required Company Info fields' });
        return;
      }
      setActiveSubTab('Location');
    } else if (activeSubTab === 'Location') {
      if (!isLocationValid) {
        showToast({ type: 'error', iconType: 'error', title: 'Please fill all required Location fields' });
        return;
      }
      setActiveSubTab('Finance');
    } else if (activeSubTab === 'Finance') {
      if (!isFinanceValid) {
        showToast({ type: 'error', iconType: 'error', title: 'Please select Currency and Financial Year' });
        return;
      }
      setCurrentStep(1); // Moves to Step 2: Domain Setup
    }
  };

  const handleSubTabBack = () => {
    if (activeSubTab === 'Finance') {
      setActiveSubTab('Location');
    } else if (activeSubTab === 'Location') {
      setActiveSubTab('Company info');
    } else {
      safeBack();
    }
  };

  const handleValidateDomain = () => {
    const trimmed = domainNameInput.trim();
    if (!trimmed) {
      setDomainError('Please enter a domain name.');
      return false;
    }
    if (trimmed.toLowerCase().includes('example.com') || !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(trimmed)) {
      setDomainError(`${trimmed} isn't a registered domain.`);
      return false;
    }
    setDomainError('');
    return true;
  };

  // Step 2 Existing Domain Navigation
  const handleExistingDomainNext = () => {
    if (existingSubStep === 'preference') {
      if (domainOption === 'buy') {
        setDomainMode('buy');
        setBuySubStep('terms');
      } else {
        setExistingSubStep('beforeBegin');
      }
    } else if (existingSubStep === 'beforeBegin') {
      setExistingSubStep('verifyInfo');
    } else if (existingSubStep === 'verifyInfo') {
      setExistingSubStep('enterDomain');
    } else if (existingSubStep === 'enterDomain') {
      if (handleValidateDomain()) {
        setExistingSubStep('pending');
      }
    } else if (existingSubStep === 'pending') {
      setCurrentStep(2); // Moves to Step 3: Choose Plan
    }
  };

  // Step 2 Buy Domain Navigation
  const handleBuyDomainNext = () => {
    if (buySubStep === 'terms') {
      setBuySubStep('search');
    } else if (buySubStep === 'search') {
      setBuySubStep('confirm');
    } else if (buySubStep === 'confirm') {
      setCurrentStep(2); // Moves to Step 3: Choose Plan
    }
  };

  // Step 3 API Handler: Create Organization via POST /organisationBasic
  const handleCreateOrganization = async (planId: string) => {
    if (isLoadingCreateOrg) return;
    setIsLoadingCreateOrg(true);

    const orgAuthId =
      store.auth.orgAuthId ||
      (await getItemAsync('orgAuthId')) ||
      store.auth.userId ||
      (await getItemAsync('authUserId')) ||
      '4f89efb6-4b43-4f3f-b9f0-0f64b76a1234';

    const formattedDate = dateOfIncorporation
      ? dateOfIncorporation.toISOString().split('T')[0]
      : '2025-01-15';

    const domainType =
      domainMode === 'buy' || domainOption === 'buy'
        ? 'BUY_NEW'
        : domainOption === 'existing'
          ? 'EXISTING'
          : 'NONE';

    const domainName =
      domainType === 'BUY_NEW'
        ? selectedBuyDomain || buySearchInput || null
        : domainType === 'EXISTING'
          ? domainNameInput.trim() || null
          : null;

    const payload = {
      orgAuth: orgAuthId,
      orgName: legalName.trim() || '',
      orgEntity: legalEntityName.trim() || '',
      identificationNumber: identificationNumber.trim() || '',
      dateOfIncorporation: formattedDate,
      sectorId: sector,
      natureOfBusinessId: natureOfBusiness,
      typeOfBusinessId: typeOfBusiness,
      addressLine1: addressLine1.trim() || '',
      addressLine2: addressLine2.trim() || '',
      cityId: city,
      stateId: state,
      country: country,
      zipcode: Number(zipcode) || 600001,
      currencyId: currency,
      financialYear: financialYear.trim() || '',
      employeePrefix: employeePrefix.trim() || '',
      planId: planId,
      domain: {
        domainType,
        domainName,
      },
    };

    const res: any = await dispatch({
      type: 'CREATE_ORG_API_REQUEST',
      payload: {
        url: '/organisationBasic',
        method: 'POST',
        body: payload,
      },
    });

    setIsLoadingCreateOrg(false);

    if (res || store.orgAdminModal.isSuccessCreateOrg || store.organisationBasic.isSuccessCreateOrgBasic) {
      const newOrgId =
        res?.data?.id ||
        res?.data?.orgAuthId ||
        res?.data?.orgId ||
        res?.id ||
        res?.orgAuthId ||
        res?.orgId ||
        '';
      if (newOrgId) {
        await setItemAsync('orgAuthId', newOrgId);
        (dispatch as any)({
          type: 'SET_AUTH_ORG_AUTH_ID',
          payload: { orgAuthId: newOrgId },
        });
      }
      setPlanSubStep('successScreen');
    } else {
      showToast({
        type: 'error',
        iconType: 'error',
        title: store.orgAdminModal.errorCreateOrg || store.organisationBasic.errorCreateOrgBasic || 'Failed to create organization. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={safeBack} style={styles.backBtn}>
          <ArrowBackIos width={20} height={20} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.light} />
        </TouchableOpacity>
        <Typography fontVariant="BL" variant="bold" color="colors.neutral.onSurface.light" style={styles.headerTitle}>
          Setup Organization
        </Typography>
      </View>

      <View style={styles.stepperWrapper}>
        <Stepper steps={SETUP_STEPS} currentStep={currentStep} />
      </View>

      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Organisation Info */}
        {currentStep === 0 && (
          <SectionCard style={styles.cardOverrides}>
            <OrgInfoStep
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              legalName={legalName}
              setLegalName={setLegalName}
              legalEntityName={legalEntityName}
              setLegalEntityName={setLegalEntityName}
              identificationNumber={identificationNumber}
              setIdentificationNumber={setIdentificationNumber}
              dateOfIncorporation={dateOfIncorporation}
              setDateOfIncorporation={setDateOfIncorporation}
              sector={sector}
              setSector={setSector}
              natureOfBusiness={natureOfBusiness}
              setNatureOfBusiness={setNatureOfBusiness}
              typeOfBusiness={typeOfBusiness}
              setTypeOfBusiness={setTypeOfBusiness}
              employeePrefix={employeePrefix}
              setEmployeePrefix={setEmployeePrefix}
              country={country}
              setCountry={setCountry}
              state={state}
              setState={setState}
              city={city}
              setCity={setCity}
              zipcode={zipcode}
              setZipcode={setZipcode}
              addressLine1={addressLine1}
              setAddressLine1={setAddressLine1}
              addressLine2={addressLine2}
              setAddressLine2={setAddressLine2}
              currency={currency}
              setCurrency={setCurrency}
              financialYear={financialYear}
              setFinancialYear={setFinancialYear}
              sectorOptions={sectorOptions}
              natureOptions={natureOptions}
              typeOptions={typeOptions}
              countryOptions={countryOptions}
              stateOptions={stateOptions}
              cityOptions={cityOptions}
              currencyOptions={currencyOptions}
              onEndReachedSector={handleLoadMoreSector}
              onEndReachedNature={handleLoadMoreNature}
              onEndReachedType={handleLoadMoreType}
              onEndReachedCountry={handleLoadMoreCountry}
              onEndReachedState={handleLoadMoreState}
              onEndReachedCity={handleLoadMoreCity}
              onEndReachedCurrency={handleLoadMoreCurrency}
              onNext={handleSubTabNext}
              onBack={handleSubTabBack}
            />
          </SectionCard>
        )}

        {/* Step 2: Domain Setup */}
        {currentStep === 1 && (
          <SectionCard style={styles.cardOverrides}>
            <DomainStepFlow
              domainMode={domainMode}
              setDomainMode={setDomainMode}
              domainOption={domainOption}
              setDomainOption={setDomainOption}
              existingSubStep={existingSubStep}
              setExistingSubStep={setExistingSubStep}
              domainNameInput={domainNameInput}
              setDomainNameInput={setDomainNameInput}
              domainError={domainError}
              setDomainError={setDomainError}
              buySubStep={buySubStep}
              setBuySubStep={setBuySubStep}
              buySearchInput={buySearchInput}
              setBuySearchInput={setBuySearchInput}
              selectedBuyDomain={selectedBuyDomain}
              onExistingDomainNext={handleExistingDomainNext}
              onBuyDomainNext={handleBuyDomainNext}
              onBack={() => {
                if (domainMode === 'buy') {
                  if (buySubStep === 'confirm') setBuySubStep('search');
                  else if (buySubStep === 'search') setBuySubStep('terms');
                  else { setDomainMode('existing'); setExistingSubStep('preference'); }
                } else {
                  if (existingSubStep === 'pending') setExistingSubStep('enterDomain');
                  else if (existingSubStep === 'enterDomain') setExistingSubStep('verifyInfo');
                  else if (existingSubStep === 'verifyInfo') setExistingSubStep('beforeBegin');
                  else if (existingSubStep === 'beforeBegin') setExistingSubStep('preference');
                  else { setCurrentStep(0); setActiveSubTab('Finance'); }
                }
              }}
            />
          </SectionCard>
        )}

        {/* Step 3: Choose Plan */}
        {currentStep === 2 && (
          <SectionCard style={styles.cardOverrides}>
            <PlanSelectionStep
              planSubStep={planSubStep}
              plansData={plansData}
              isLoadingGetPlans={store.plan.isLoadingGetPlans}
              selectedPlanId={selectedPlanId}
              setSelectedPlanId={setSelectedPlanId}
              isLoadingCreateOrg={isLoadingCreateOrg}
              onCreateOrganization={handleCreateOrganization}
              onFinish={() =>
                safeReplace('/(protected)/(organisation)/orgSetup', {
                  initialView: 'add_unit',
                  isOnboarding: 'true',
                })
              }
              onBack={() => setCurrentStep(1)}
            />
          </SectionCard>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.light,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s300,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    backBtn: {
      padding: theme.spacing.s100,
      marginRight: theme.spacing.s200,
    },
    headerTitle: {
      flex: 1,
    },
    stepperWrapper: {
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s400,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    cardOverrides: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius?.b200 || 8,
      padding: 20,
    },
  });
