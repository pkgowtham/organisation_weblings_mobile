import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import CustomButton from '@/components/ui/button';
import DataTable from '@/components/ui/dataTable';
import type { DataTableColumn, DataTableRow } from '@/components/ui/dataTable';
import Tag from '@/components/ui/tag';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Add } from '@/svg_icons';

// ──────────────────────────────────────────────────────────────
//  EmailList — Data table of email addresses
//
//  Displays a searchable, paginated table of email entries
//  with mock static data.
// ──────────────────────────────────────────────────────────────

const MOCK_EMAILS: DataTableRow[] = [
  {
    id: '1',
    sno: '1',
    email: 'reception@weblings.in',
    addedBy: 'Blue Meander',
    createdOn: '15 Jul 2025',
    forwardingEmail: 'Forward email to tag',
    status: 'Active',
  },
  {
    id: '2',
    sno: '2',
    email: 'hr.department@weblings.in',
    addedBy: 'Blue Meander',
    createdOn: '15 Jun 2025',
    forwardingEmail: 'Forward email to tag',
    status: 'Active',
  },
  {
    id: '3',
    sno: '3',
    email: 'admin@weblings.in',
    addedBy: 'Admin User',
    createdOn: '10 Jun 2025',
    forwardingEmail: 'Forward email to tag',
    status: 'Active',
  },
  {
    id: '4',
    sno: '4',
    email: 'support@weblings.in',
    addedBy: 'Blue Meander',
    createdOn: '01 May 2025',
    forwardingEmail: 'Forward email to tag',
    status: 'Inactive',
  },
  {
    id: '5',
    sno: '5',
    email: 'sales@weblings.in',
    addedBy: 'Admin User',
    createdOn: '20 Apr 2025',
    forwardingEmail: 'Forward email to tag',
    status: 'Active',
  },
];

export default function EmailList() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = MOCK_EMAILS.filter(email =>
    email.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.addedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: DataTableColumn[] = [
    { key: 'sno', label: 'S.no', width: 50 },
    { key: 'email', label: 'Email Address', width: 200 },
    { key: 'addedBy', label: 'Added By', width: 130 },
    { key: 'createdOn', label: 'Created On', width: 120 },
    { key: 'forwardingEmail', label: 'Forwarding Email', width: 170 },
    {
      key: 'status',
      label: 'Status',
      width: 100,
      renderCell: (row) => (
        <Tag
          label={row.status}
          color={row.status === 'Active' ? 'positive' : 'neutral'}
          variant="filled"
          labelFontVariant="BXS"
        />
      ),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Typography fontVariant="BL" variant="semibold" color="colors.neutral.onSurface.light">
            Email List
          </Typography>
          <CustomButton
            title="Add email address"
            variant="primary"
            size="xs"
            iconLeft={<Add width={16} height={16} viewBox="0 0 24 24" color={theme.colors.brand.onSurface.medium} />}
            onPress={() => {}}
          />
        </View>

        {/* Search */}
        <Input
          placeholder="Search email addresses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search width={18} height={18} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.dark} />}
          containerStyle={styles.searchContainer}
        />

        {/* Data Table */}
        <View style={styles.tableWrapper}>
          <DataTable
            columns={columns}
            data={filteredEmails}
            showView={true}
            showEdit={true}
            showDelete={true}
            totalRecords={filteredEmails.length}
            onView={(row) => {}}
            onEdit={(row) => {}}
            onDelete={(row) => {}}
          />
        </View>

        {filteredEmails.length === 0 && (
          <View style={styles.emptyState}>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.dark">
              No email addresses found
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
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.s300,
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
