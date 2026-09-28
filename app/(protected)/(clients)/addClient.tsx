import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import TextField from '@/components/ui/textField';
import { Dropdown } from '@/components/ui/dropdown';
import CustomButton from '@/components/ui/button';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { ArrowBackIos } from '@/svg_icons';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import { useActiveBul } from '@/hooks/useActiveBul';

export default function AddClientScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = createStyles(theme, insets);
  const { safeBack } = useSafeNavigation();
  const { showToast } = useToast();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul();

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientCode: '',
    billingCurrency: '',
    billingType: '',
    clientManager: '',
    description: '',
    addressLine1: '',
    addressLine2: '',
    countryId: '',
    stateId: '',
    cityId: '',
    gstNo: '',
    email: '',
    phone: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown Options State
  const [billingCurrencyOptions, setBillingCurrencyOptions] = useState<{ label: string; value: string }[]>([]);
  const [billingTypeOptions, setBillingTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [managerOptions, setManagerOptions] = useState<{ label: string; value: string }[]>([]);
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string; phoneCode: string }[]>([]);
  const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);
  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([]);

  // 1. Fetch Currencies
  useEffect(() => {
    dispatch({
      type: 'CURRENCY_GETLIST_API_REQUEST',
      payload: { url: '/currency', method: 'GET', query: { page: 1, limit: 50 } },
    }).then((res: any) => {
      const list = res?.data?.content || res?.data?.data || res?.data || res;
      if (Array.isArray(list)) {
        setBillingCurrencyOptions(
          list.map((c: any) => ({
            value: c.id || c._id,
            label: `${c.currencyName || c.name || 'USD'} (${c.currencySymbol || c.symbol || c.currencyCode || '$'})`,
          }))
        );
      }
    });
  }, [dispatch]);

  // 2. Fetch Billing Types
  useEffect(() => {
    dispatch({
      type: 'BILLING_TYPE_GETLIST_API_REQUEST',
      payload: { url: '/billingType', method: 'GET', query: { page: 1, limit: 50 } },
    }).then((res: any) => {
      const list = res?.data?.content || res?.data?.data || res?.data || res;
      if (Array.isArray(list)) {
        setBillingTypeOptions(
          list.map((b: any) => ({
            value: b.id || b._id,
            label: b.name || b.billingTypeName || b.billingType || 'Fixed Price',
          }))
        );
      }
    });
  }, [dispatch]);

  // 3. Fetch Client Managers / Employees
  useEffect(() => {
    dispatch({
      type: 'EMPLOYEE_LIST_GETLIST_API_REQUEST',
      payload: {
        url: '/employee',
        method: 'GET',
        query: { bulId: activeBulId, page: 1, limit: 50 },
      },
    }).then((res: any) => {
      const list = res?.data?.content || res?.data?.data || res?.data || res;
      if (Array.isArray(list)) {
        setManagerOptions(
          list.map((m: any) => ({
            value: m.id || m._id,
            label: m.displayName || m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || 'Manager',
          }))
        );
      }
    });
  }, [dispatch, activeBulId]);

  // 4. Fetch Countries
  useEffect(() => {
    dispatch({
      type: 'COUNTRY_GETLIST_API_REQUEST',
      payload: { url: '/country', method: 'GET', query: { page: 1, limit: 50 } },
    }).then((res: any) => {
      const list = res?.data?.content || res?.data?.data || res?.data || res;
      if (Array.isArray(list)) {
        setCountryOptions(
          list.map((c: any) => ({
            value: c.id || c._id,
            label: c.countryName || c.name || 'Country',
            phoneCode: c.phoneCode || c.countryCode || '91',
          }))
        );
      }
    });
  }, [dispatch]);

  // 5. Fetch States when Country changes
  useEffect(() => {
    if (formData.countryId) {
      dispatch({
        type: 'STATE_GETLIST_API_REQUEST',
        payload: {
          url: '/state',
          method: 'GET',
          query: { countryId: formData.countryId, page: 1, limit: 50 },
        },
      }).then((res: any) => {
        const list = res?.data?.content || res?.data?.data || res?.data || res;
        if (Array.isArray(list)) {
          setStateOptions(
            list.map((s: any) => ({
              value: s.id || s._id,
              label: s.stateName || s.name || s.label || 'State',
            }))
          );
        } else {
          setStateOptions([]);
        }
      });
    } else {
      setStateOptions([]);
      setCityOptions([]);
    }
  }, [formData.countryId, dispatch]);

  // 6. Fetch Cities when State changes
  useEffect(() => {
    if (formData.stateId) {
      dispatch({
        type: 'CITY_GETLIST_API_REQUEST',
        payload: {
          url: '/city',
          method: 'GET',
          query: { stateId: formData.stateId, page: 1, limit: 50 },
        },
      }).then((res: any) => {
        const list = res?.data?.content || res?.data?.data || res?.data || res;
        if (Array.isArray(list)) {
          setCityOptions(
            list.map((c: any) => ({
              value: c.id || c._id,
              label: c.cityName || c.name || c.label || 'City',
            }))
          );
        } else {
          setCityOptions([]);
        }
      });
    } else {
      setCityOptions([]);
    }
  }, [formData.stateId, dispatch]);

  // Selected Country Phone Code
  const selectedCountry = useMemo(() => {
    return countryOptions.find((c) => c.value === formData.countryId);
  }, [countryOptions, formData.countryId]);

  const phoneCode = selectedCountry?.phoneCode || '91';

  // Form Field Validation Errors
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formData.phone.replace(/\s/g, '');

    if (touched.clientName) {
      if (!formData.clientName.trim()) {
        errs.clientName = 'Client Name is required';
      } else if (formData.clientName.trim().length < 3) {
        errs.clientName = 'Client Name must be at least 3 characters';
      }
    }

    if (touched.clientCode && !formData.clientCode.trim()) {
      errs.clientCode = 'Client Code is required';
    }

    if (touched.billingCurrency && !formData.billingCurrency) {
      errs.billingCurrency = 'Billing currency is required';
    }

    if (touched.billingType && !formData.billingType) {
      errs.billingType = 'Billing type is required';
    }

    if (touched.clientManager && !formData.clientManager) {
      errs.clientManager = 'Client manager is required';
    }

    if (touched.description && formData.description.length > 300) {
      errs.description = 'Description must not exceed 300 characters';
    }

    if (touched.addressLine1 && !formData.addressLine1.trim()) {
      errs.addressLine1 = 'Address Line 1 is required';
    }

    if (touched.countryId && !formData.countryId) {
      errs.countryId = 'Country is required';
    }

    if (touched.stateId && !formData.stateId) {
      errs.stateId = 'State is required';
    }

    if (touched.cityId && !formData.cityId) {
      errs.cityId = 'City is required';
    }

    if (touched.email) {
      if (!formData.email.trim()) {
        errs.email = 'Email is required';
      } else if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }

    if (touched.phone) {
      if (!formData.phone.trim()) {
        errs.phone = 'Contact number is required';
      } else if (!/^\d{7,15}$/.test(phoneDigits)) {
        errs.phone = 'Please enter a valid contact number (7-15 digits)';
      }
    }

    return errs;
  }, [formData, touched]);

  // Overall Form Validity check
  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = formData.phone.replace(/\s/g, '');
    const phoneRegex = /^\d{7,15}$/;

    return (
      formData.clientName.trim().length >= 3 &&
      Boolean(formData.clientCode.trim()) &&
      Boolean(formData.billingCurrency) &&
      Boolean(formData.billingType) &&
      Boolean(formData.clientManager) &&
      Boolean(formData.addressLine1.trim()) &&
      Boolean(formData.countryId) &&
      Boolean(formData.stateId) &&
      Boolean(formData.cityId) &&
      emailRegex.test(formData.email.trim()) &&
      phoneRegex.test(phoneDigits) &&
      formData.description.length <= 300
    );
  }, [formData]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Cascading resets
      if (field === 'countryId') {
        updated.stateId = '';
        updated.cityId = '';
      } else if (field === 'stateId') {
        updated.cityId = '';
      }
      return updated;
    });
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = async () => {
    // Touch all fields to trigger validation display
    setTouched({
      clientName: true,
      clientCode: true,
      billingCurrency: true,
      billingType: true,
      clientManager: true,
      description: true,
      addressLine1: true,
      countryId: true,
      stateId: true,
      cityId: true,
      email: true,
      phone: true,
    });

    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      clientName: formData.clientName.trim(),
      clientCode: formData.clientCode.trim(),
      phone: formData.phone.trim() ? `+${phoneCode} ${formData.phone.trim()}` : '',
      email: formData.email.trim(),
      gstNo: formData.gstNo.trim() || null,
      description: formData.description.trim(),
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim(),
      countryId: formData.countryId,
      stateId: formData.stateId,
      cityId: formData.cityId,
      clientManager: formData.clientManager,
      billingCurrency: formData.billingCurrency,
      billingType: formData.billingType,
      bulId: activeBulId,
    };

    const res: any = await dispatch({
      type: 'CLIENT_CREATE_API_REQUEST',
      payload: {
        url: '/client',
        method: 'POST',
        body: payload,
      },
    });

    setIsSubmitting(false);

    if (res || store.client.isSuccessCreate) {
      showToast({
        type: 'success',
        iconType: 'success',
        title: 'Client created successfully',
      });
      // Re-fetch client list to refresh table
      if (activeBulId) {
        dispatch({
          type: 'CLIENT_GETLIST_API_REQUEST',
          payload: {
            url: '/client',
            method: 'GET',
            query: { bulId: activeBulId, locationId: activeBulId, limit: 50, page: 1 },
          },
        });
      }
      dispatch({ type: 'CLIENT_CREATE_API_CLEAR' });
      safeBack();
    } else {
      showToast({
        type: 'error',
        iconType: 'error',
        title: 'Failed to create client. Please check your inputs.',
      });
    }
  };

  const isLoadingCreate = isSubmitting || store.client.isLoadingCreate;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={safeBack} style={styles.backButton}>
              <ArrowBackIos color={theme.colors.neutral.onSurface.light} height={24} width={24} />
              <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.pageTitle}>
                Add client
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Client Name */}
            <Input
              label="Client Name *"
              placeholder="Enter Client Name"
              value={formData.clientName}
              onChangeText={(val) => handleFieldChange('clientName', val)}
              onBlur={() => handleBlur('clientName')}
              error={Boolean(errors.clientName)}
              helperText={errors.clientName}
            />

            {/* Client Code */}
            <Input
              label="Client Code *"
              placeholder="Enter Client Code"
              value={formData.clientCode}
              onChangeText={(val) => handleFieldChange('clientCode', val)}
              onBlur={() => handleBlur('clientCode')}
              error={Boolean(errors.clientCode)}
              helperText={errors.clientCode}
            />

            {/* Billing Currency */}
            <Dropdown
              label="Billing currency *"
              options={billingCurrencyOptions}
              selectedValue={formData.billingCurrency}
              onValueChange={(val) => {
                handleFieldChange('billingCurrency', val as string);
                handleBlur('billingCurrency');
              }}
              placeholder="Select Billing currency"
              error={Boolean(errors.billingCurrency)}
              helperText={errors.billingCurrency}
            />

            {/* Billing Type */}
            <Dropdown
              label="Billing type *"
              options={billingTypeOptions}
              selectedValue={formData.billingType}
              onValueChange={(val) => {
                handleFieldChange('billingType', val as string);
                handleBlur('billingType');
              }}
              placeholder="Select Billing type"
              error={Boolean(errors.billingType)}
              helperText={errors.billingType}
            />

            {/* Client Manager */}
            <Dropdown
              label="Client manager *"
              options={managerOptions}
              selectedValue={formData.clientManager}
              onValueChange={(val) => {
                handleFieldChange('clientManager', val as string);
                handleBlur('clientManager');
              }}
              placeholder="Select Client manager"
              error={Boolean(errors.clientManager)}
              helperText={errors.clientManager}
            />

            {/* Description */}
            <TextField
              label="Description"
              placeholder="Client description"
              value={formData.description}
              onChangeText={(val) => handleFieldChange('description', val)}
              onBlur={() => handleBlur('description')}
              error={Boolean(errors.description)}
              helperText={errors.description}
              maxLength={300}
              showCount={true}
              expandable={true}
              minHeight={88}
            />

            {/* Section: Client Contact */}
            <View style={styles.sectionDivider}>
              <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light">
                Client contact
              </Typography>
            </View>

            {/* Address Line 1 */}
            <Input
              label="Address Line 1 *"
              placeholder="Enter Address Line 1"
              value={formData.addressLine1}
              onChangeText={(val) => handleFieldChange('addressLine1', val)}
              onBlur={() => handleBlur('addressLine1')}
              error={Boolean(errors.addressLine1)}
              helperText={errors.addressLine1}
            />

            {/* Address Line 2 */}
            <Input
              label="Address Line 2"
              placeholder="Enter Address Line 2"
              value={formData.addressLine2}
              onChangeText={(val) => handleFieldChange('addressLine2', val)}
            />

            {/* Country */}
            <Dropdown
              label="Country *"
              options={countryOptions}
              selectedValue={formData.countryId}
              onValueChange={(val) => {
                handleFieldChange('countryId', val as string);
                handleBlur('countryId');
              }}
              placeholder="Select Country"
              error={Boolean(errors.countryId)}
              helperText={errors.countryId}
            />

            {/* State */}
            <Dropdown
              label="State *"
              options={stateOptions}
              selectedValue={formData.stateId}
              onValueChange={(val) => {
                handleFieldChange('stateId', val as string);
                handleBlur('stateId');
              }}
              placeholder={formData.countryId ? 'Select State' : 'Select Country first'}
              disabled={!formData.countryId || stateOptions.length === 0}
              error={Boolean(errors.stateId)}
              helperText={errors.stateId}
            />

            {/* City */}
            <Dropdown
              label="City *"
              options={cityOptions}
              selectedValue={formData.cityId}
              onValueChange={(val) => {
                handleFieldChange('cityId', val as string);
                handleBlur('cityId');
              }}
              placeholder={formData.stateId ? 'Select City' : 'Select State first'}
              disabled={!formData.stateId || cityOptions.length === 0}
              error={Boolean(errors.cityId)}
              helperText={errors.cityId}
            />

            {/* GST Number */}
            <Input
              label="GST number ( optional )"
              placeholder="Enter GST number"
              value={formData.gstNo}
              onChangeText={(val) => handleFieldChange('gstNo', val)}
            />

            {/* Email */}
            <Input
              label="Email *"
              placeholder="Enter Email"
              value={formData.email}
              onChangeText={(val) => handleFieldChange('email', val)}
              onBlur={() => handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              error={Boolean(errors.email)}
              helperText={errors.email}
            />

            {/* Contact Phone */}
            <Input
              label="Contact *"
              placeholder="Enter Contact"
              leftText={formData.countryId ? `+${phoneCode}` : '+91'}
              value={formData.phone}
              onChangeText={(val) => handleFieldChange('phone', val)}
              onBlur={() => handleBlur('phone')}
              keyboardType="phone-pad"
              error={Boolean(errors.phone)}
              helperText={errors.phone}
            />
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <CustomButton
            title="Cancel"
            variant="outline"
            size="medium"
            disabled={isLoadingCreate}
            onPress={safeBack}
            buttonStyle={styles.footerBtn}
          />
          <CustomButton
            title="Submit"
            variant="primary"
            size="medium"
            loading={isLoadingCreate}
            disabled={!isFormValid || isLoadingCreate}
            onPress={handleSave}
            buttonStyle={styles.footerBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, insets: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    flex1: {
      flex: 1,
    },
    header: {
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s300,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.s400,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pageTitle: {
      paddingLeft: theme.spacing.s200,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.s400,
      paddingBottom: theme.spacing.s800,
    },
    formContainer: {
      width: '100%',
    },
    sectionDivider: {
      marginTop: theme.spacing.s400,
      marginBottom: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s400,
      paddingTop: theme.spacing.s300,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
      backgroundColor: theme.colors.neutral.surface.lighter,
      gap: theme.spacing.s300,
    },
    footerBtn: {
      minWidth: 100,
    },
  });
