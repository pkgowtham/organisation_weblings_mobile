import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import DataTable, { DataTableColumn, DataTableRow } from '@/components/ui/dataTable';
import Tag from '@/components/ui/tag';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from '@/svg_icons';

const MOCK_PAYMENT_HISTORY: DataTableRow[] = [
  {
    id: '1',
    date: '15 Oct 2025',
    invoiceNumber: '#INV001',
    plan: 'Annual',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
  },
  {
    id: '2',
    date: '11 Aug 2025',
    invoiceNumber: '#INV002',
    plan: 'Annual',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
  },
  {
    id: '3',
    date: '05 Jul 2025',
    invoiceNumber: '#INV003',
    plan: 'Annual',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
  },
  {
    id: '4',
    date: '15 May 2025',
    invoiceNumber: '#INV004',
    plan: 'Development',
    price: '$150.00',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
  },
  {
    id: '5',
    date: '01 Mar 2025',
    invoiceNumber: '#INV005',
    plan: 'Annual',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
  },
  {
    id: '6',
    date: '15 Jan 2025',
    invoiceNumber: '#INV006',
    plan: 'Annual',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
  },
  {
    id: '7',
    date: '01 Nov 2024',
    invoiceNumber: '#INV007',
    plan: 'Annual',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
  },
];

export default function PaymentHistory() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = MOCK_PAYMENT_HISTORY.filter(
    (item) =>
      item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: DataTableColumn[] = [
    { key: 'date', label: 'Date', width: 110 },
    { key: 'invoiceNumber', label: 'Invoice Number', width: 130 },
    { key: 'plan', label: 'Plan', width: 100 },
    { key: 'price', label: 'Price', width: 90 },
    {
      key: 'status',
      label: 'Status',
      width: 90,
      renderCell: (row) => (
        <Tag
          label={row.status}
          color={row.status === 'Paid' ? 'positive' : 'warning'}
          variant="filled"
          labelFontVariant="BXS"
        />
      ),
    },
    { key: 'paymentMethod', label: 'Payment Method', width: 140 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title & Subtitle */}
        <View style={styles.headerArea}>
          <Typography fontVariant="BL" variant="semibold" color="colors.neutral.onSurface.light">
            Payment History
          </Typography>
          <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.subtitle}>
            View payment history for downloading invoice, view summary or view details
          </Typography>
        </View>

        {/* Search */}
        <Input
          placeholder="Search invoice number, plan..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search width={18} height={18} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.dark} />}
          containerStyle={styles.searchContainer}
        />

        {/* Data Table */}
        <View style={styles.tableWrapper}>
          <DataTable
            columns={columns}
            data={filteredData}
            showView={true}
            showEdit={false}
            showDelete={false}
            totalRecords={filteredData.length}
            onView={(row) => {}}
          />
        </View>

        {filteredData.length === 0 && (
          <View style={styles.emptyState}>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
              No payment history records found
            </Typography>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
    headerArea: {
      marginBottom: theme.spacing.s300,
    },
    subtitle: {
      marginTop: theme.spacing.s100,
    },
    searchContainer: {
      marginBottom: theme.spacing.s400,
    },
    tableWrapper: {
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      borderRadius: theme.borderRadius.b300,
      overflow: 'hidden',
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.s800,
    },
  });
