import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import DataTable, { DataTableColumn, DataTableRow } from '@/components/ui/dataTable';
import Tag from '@/components/ui/tag';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search } from '@/svg_icons';

const MOCK_TRANSACTIONS: DataTableRow[] = [
  {
    id: '1',
    date: '22 Oct 2025',
    transactionId: '#TXN001',
    from: 'Admin User',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
    tag: 'Credit Card',
    to: 'Weblings Admin',
  },
  {
    id: '2',
    date: '15 Oct 2025',
    transactionId: '#TXN002',
    from: 'Admin User',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
    tag: 'Credit Card',
    to: 'Weblings Admin',
  },
  {
    id: '3',
    date: '01 Sep 2025',
    transactionId: '#TXN003',
    from: 'Admin User',
    price: '$150.00',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
    tag: 'Credit Card',
    to: 'Weblings Admin',
  },
  {
    id: '4',
    date: '10 Aug 2025',
    transactionId: '#TXN004',
    from: 'Development user',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
    tag: 'Credit Card',
    to: 'Weblings Admin',
  },
  {
    id: '5',
    date: '01 Jul 2025',
    transactionId: '#TXN005',
    from: 'Admin User',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
    tag: 'Direct Payment',
    to: 'Weblings Admin',
  },
  {
    id: '6',
    date: '15 Feb 2025',
    transactionId: '#TXN006',
    from: 'Admin User',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
    tag: 'Direct Payment',
    to: 'Weblings Admin',
  },
  {
    id: '7',
    date: '11 Dec 2024',
    transactionId: '#TXN007',
    from: 'Admin User',
    price: '$71.10',
    status: 'Paid',
    paymentMethod: 'Direct Payment',
    tag: 'Direct Payment',
    to: 'Weblings Admin',
  },
];

export default function Transactions() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = MOCK_TRANSACTIONS.filter(
    (item) =>
      item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: DataTableColumn[] = [
    { key: 'date', label: 'Date', width: 100 },
    { key: 'transactionId', label: 'Transaction ID', width: 120 },
    { key: 'from', label: 'From', width: 130 },
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
    { key: 'paymentMethod', label: 'Payment Method', width: 130 },
    {
      key: 'tag',
      label: 'Tag',
      width: 120,
      renderCell: (row) => (
        <Tag
          label={row.tag}
          color="info"
          variant="bordered"
          labelFontVariant="BXS"
        />
      ),
    },
    { key: 'to', label: 'To', width: 130 },
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
            Transactions
          </Typography>
          <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.subtitle}>
            Transaction Details & Statement with Tags
          </Typography>
        </View>

        {/* Search */}
        <Input
          placeholder="Search transaction ID, from..."
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
              No transactions found
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
