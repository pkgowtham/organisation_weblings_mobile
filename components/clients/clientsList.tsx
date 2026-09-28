import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import CustomButton from '@/components/ui/button';
import DataTable, { DataTableColumn, DataTableRow } from '@/components/ui/dataTable';
import { useTheme } from '@/context/CustomThemeContext';
import { Search } from '@/svg_icons';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import Dialog from '@/components/ui/dialog';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import { useActiveBul } from '@/hooks/useActiveBul';

interface ClientsListProps {
  buId?: string;
  locationId?: string;
  bulId?: string;
}

export default function ClientsList({ buId, locationId, bulId }: ClientsListProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [search, setSearch] = useState('');
  const { safePush } = useSafeNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();
  const { activeBulId } = useActiveBul({ buId, locationId, bulId });

  // Fetch client list from API
  const fetchClients = useCallback(() => {
    const query: any = { limit: 50, page: 1 };
    if (activeBulId) {
      query.bulId = activeBulId;
      query.locationId = activeBulId;
    }
    if (buId) {
      query.buId = buId;
    }

    dispatch({
      type: 'CLIENT_GETLIST_API_REQUEST',
      payload: {
        url: '/client',
        method: 'GET',
        query,
      },
    });
  }, [dispatch, activeBulId, buId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const rawClients = store.client?.clientList || [];
  const isLoading = store.client?.isLoadingGetList;

  const columns: DataTableColumn[] = [
    { key: 'client', label: 'Client', flex: 1.5 },
    { key: 'clientCode', label: 'Client Code', flex: 1.2 },
    { key: 'billingType', label: 'Billing Type', flex: 1.3 },
    { key: 'clientManager', label: 'Client Manager', flex: 1.5 },
    { key: 'status', label: 'Status', flex: 1 },
  ];

  const formattedData: DataTableRow[] = rawClients.map((item: any, index: number) => ({
    ...item,
    id: item.id || item._id || String(index + 1),
    sno: index + 1,
    client: item.clientName || item.name || item.client || 'Unnamed Client',
    clientCode: item.clientCode || item.code || '-',
    billingType:
      item.billingType?.name ||
      (typeof item.billingType === 'string' ? item.billingType : '-'),
    clientManager:
      item.clientManager?.name ||
      item.clientManager?.displayName ||
      (typeof item.clientManager === 'string' ? item.clientManager : '-'),
    status:
      item.status ||
      (item.isActive !== undefined ? (item.isActive ? 'Active' : 'Inactive') : 'Active'),
    email: item.email || item.emailAddress || '-',
    phone: item.phone || item.mobile || item.phoneNumber || '-',
  }));

  const filteredData = formattedData.filter((item) =>
    String(item.client).toLowerCase().includes(search.toLowerCase()) ||
    String(item.clientCode).toLowerCase().includes(search.toLowerCase()) ||
    String(item.billingType).toLowerCase().includes(search.toLowerCase()) ||
    String(item.clientManager).toLowerCase().includes(search.toLowerCase()) ||
    String(item.status).toLowerCase().includes(search.toLowerCase()) ||
    String(item.email).toLowerCase().includes(search.toLowerCase())
  );

  const [deleteTarget, setDeleteTarget] = useState<DataTableRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleAddClient = () => {
    safePush('/(protected)/(clients)/addClient');
  };

  const handleViewClient = (row: DataTableRow) => {
    safePush(`/(protected)/(clients)/${row.id}`);
  };

  const handleDeleteClient = (row: DataTableRow) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res: any = await dispatch({
        type: 'CLIENT_DESTROY_API_REQUEST',
        payload: {
          url: '/client',
          method: 'DELETE',
          query: { id: deleteTarget.id },
        },
      });
      setIsDeleting(false);
      setDeleteTarget(null);
      if (res && res.success !== false) {
        showToast({
          type: 'success',
          iconType: 'success',
          title: 'Client deleted successfully',
        });
        fetchClients();
      } else {
        showToast({
          type: 'error',
          iconType: 'error',
          title: res?.message || 'Failed to delete client',
        });
      }
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteTarget(null);
      showToast({
        type: 'error',
        iconType: 'error',
        title: err?.message || 'Failed to delete client',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light">
              Clients
            </Typography>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
              list of clients
            </Typography>
          </View>
          <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
            <View style={[styles.searchWrapper, isMobile && styles.searchWrapperMobile]}>
              <Input
                placeholder="Search for clients"
                value={search}
                onChangeText={setSearch}
                leftIcon={<Search color={theme.colors.neutral.onSurface.light} />}
                containerStyle={styles.inputContainer}
              />
            </View>
            <CustomButton
              title="+ Add client"
              variant="outlineActive"
              size="small"
              onPress={handleAddClient}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
          </View>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            showView={true}
            showEdit={true}
            showDelete={true}
            onView={handleViewClient}
            onEdit={handleViewClient}
            onDelete={handleDeleteClient}
            totalRecords={filteredData.length}
          />
        )}
      </View>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={!!deleteTarget}
        variant="negative"
        title="Delete the Client?"
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        onCancel={() => !isDeleting && setDeleteTarget(null)}
        onDismiss={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      >
        <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
          This will permanently remove "{deleteTarget?.clientName || 'this client'}". Are you sure you want to proceed?
        </Typography>
      </Dialog>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.s400,
    },
    card: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.s400,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      flexWrap: 'wrap',
      gap: theme.spacing.s300,
    },
    titleContainer: {
      minWidth: 140,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s300,
      flexWrap: 'wrap',
    },
    headerActionsMobile: {
      width: '100%',
      justifyContent: 'space-between',
    },
    searchWrapper: {
      width: 240,
    },
    searchWrapperMobile: {
      flex: 1,
      minWidth: 140,
      width: undefined,
    },
    inputContainer: {
      marginBottom: 0,
    },
    loaderContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
