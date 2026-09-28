import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import Dropdown from '@/components/ui/dropdown';
import CustomButton from '@/components/ui/button';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { ArrowBackIos } from '@/svg_icons';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useActiveBul } from '@/hooks/useActiveBul';

const DURATIONS = [
  { label: '1 Month', value: '1' },
  { label: '3 Months', value: '3' },
  { label: '6 Months', value: '6' },
  { label: '1 Year', value: '12' },
];

export default function CreateProjectScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack } = useSafeNavigation();

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul();

  const [projectName, setProjectName] = useState('');
  const [client, setClient] = useState('');
  const [duration, setDuration] = useState('');
  const [billing, setBilling] = useState('');
  const [manager, setManager] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientOptions, setClientOptions] = useState<{ label: string; value: string }[]>([]);
  const [billingTypeOptions, setBillingTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [managerOptions, setManagerOptions] = useState<{ label: string; value: string }[]>([]);

  // 1. Fetch Clients
  useEffect(() => {
    if (activeBulId) {
      dispatch({
        type: 'CLIENT_GETLIST_API_REQUEST',
        payload: { url: '/client', method: 'GET', query: { limit: 50, page: 1, bulId: activeBulId } },
      }).then((res: any) => {
        const raw = res?.data?.content || res?.data?.data || res?.data || res;
        if (Array.isArray(raw)) {
          setClientOptions(
            raw.map((item: any) => ({
              label: item.clientName || item.name || item.companyName || 'Unnamed Client',
              value: item.id || item._id,
            }))
          );
        }
      });
    }
  }, [dispatch, activeBulId]);

  // 2. Fetch Billing Types
  useEffect(() => {
    if (activeBulId) {
      dispatch({
        type: 'BILLING_TYPE_GETLIST_API_REQUEST',
        payload: { url: '/billingType', method: 'GET', query: { bulId: activeBulId } },
      }).then((res: any) => {
        const data = res?.data?.content || res?.data?.data || res?.data || res;
        if (Array.isArray(data)) {
          setBillingTypeOptions(
            data.map((item: any) => ({
              label: item.name || item.billingTypeName || item.label || 'Fixed Price',
              value: item.id || item._id,
            }))
          );
        }
      });
    }
  }, [dispatch, activeBulId]);

  // 3. Fetch Product Managers / Employees
  useEffect(() => {
    if (activeBulId) {
      dispatch({
        type: 'EMPLOYEE_LIST_GETLIST_API_REQUEST',
        payload: { url: '/employee', method: 'GET', query: { limit: 50, page: 1, bulId: activeBulId } },
      }).then((res: any) => {
        const raw = res?.data?.content || res?.data?.data || res?.data || res;
        if (Array.isArray(raw)) {
          setManagerOptions(
            raw.map((item: any) => ({
              label:
                item.displayName ||
                item.name ||
                `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
                item.email ||
                'Manager',
              value: item.id || item._id,
            }))
          );
        }
      });
    }
  }, [dispatch, activeBulId]);

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    setIsSubmitting(true);
    const formDataPayload = new FormData();
    formDataPayload.append('projectName', projectName.trim());

    if (client) formDataPayload.append('clientId', client);
    if (duration) formDataPayload.append('duration', duration);
    if (billing) formDataPayload.append('billingTypeId', billing);
    if (manager) formDataPayload.append('projectManagerId', manager);
    if (activeBulId) formDataPayload.append('bulId', activeBulId);

    dispatch({
      type: 'PROJECT_CREATE_API_REQUEST',
      payload: {
        url: '/project',
        method: 'POST',
        body: formDataPayload,
        isMultipart: true,
      },
    }).then((res: any) => {
      setIsSubmitting(false);
      // Re-fetch project list
      dispatch({
        type: 'PROJECT_GETLIST_API_REQUEST',
        payload: {
          url: '/project',
          method: 'GET',
          query: { bulId: activeBulId, locationId: activeBulId, limit: 50, page: 1 },
        },
      });
      safeBack();
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={safeBack} style={styles.backButton}>
            <ArrowBackIos color={theme.colors.neutral.onSurface.light} height={24} width={24} />
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.pageTitle}>
              Create Project
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Input
              label="Project name"
              placeholder="Enter Project Name"
              value={projectName}
              onChangeText={setProjectName}
            />
          </View>

          <View style={styles.formGroup}>
            <Dropdown
              label="Client"
              placeholder="Select Client"
              options={clientOptions}
              selectedValue={client}
              onValueChange={setClient}
            />
          </View>

          <View style={styles.formGroup}>
            <Dropdown
              label="Duration"
              placeholder="Select Duration"
              options={DURATIONS}
              selectedValue={duration}
              onValueChange={setDuration}
            />
          </View>

          <View style={styles.formGroup}>
            <Dropdown
              label="Billing type"
              placeholder="Select Billing type"
              options={billingTypeOptions}
              selectedValue={billing}
              onValueChange={setBilling}
            />
          </View>

          <View style={styles.formGroup}>
            <Dropdown
              label="Product Mangers"
              placeholder="Select Product Manager"
              options={managerOptions}
              selectedValue={manager}
              onValueChange={setManager}
            />
          </View>

          <View style={styles.footer}>
            <CustomButton
              title="Cancel"
              variant="outline"
              size="medium"
              onPress={safeBack}
              disabled={isSubmitting}
            />
            <CustomButton
              title={isSubmitting ? 'Creating...' : '+ Create Project'}
              variant="primary"
              size="medium"
              onPress={handleCreateProject}
              disabled={isSubmitting || !projectName.trim()}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.neutral.surface.lighter,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.s400,
    paddingBottom: theme.spacing.s600,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s500,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s200,
  },
  pageTitle: {
    paddingLeft: theme.spacing.s100,
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: theme.colors.neutral.surface.lighter,
  },
  formGroup: {
    marginBottom: theme.spacing.s400,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: theme.spacing.s300,
    marginTop: theme.spacing.s200,
  },
});
