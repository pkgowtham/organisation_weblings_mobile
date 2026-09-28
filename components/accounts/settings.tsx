import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import ScrollTabs from '@/components/ui/scrollTabs';
import TabButton from '@/components/ui/tabButton';
import ColorPicker from '@/components/ui/colorPicker';
import CustomButton from '@/components/ui/button';
import SectionCard from '@/components/ui/sectionCard';
import Input from '@/components/ui/textInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ──────────────────────────────────────────────────────────────
//  Settings — Theme + Org Settings
//
//  Uses ScrollTabs to switch between Theme and Org Settings.
//  Theme tab: colour picker, preview, dark mode toggle.
//  Org Settings tab: Employee code configuration with prefix,
//  numbering type, start value, and step increment.
// ──────────────────────────────────────────────────────────────

const SETTINGS_TABS = ['Theme', 'Org Settings'];

export default function Settings() {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  // Tab state
  const [activeTab, setActiveTab] = useState('Theme');

  // Theme tab state
  const [themeMode, setThemeMode] = useState<string>('Default');
  const [selectedColor, setSelectedColor] = useState('#0072C4');

  // Org Settings tab state
  const [prefix, setPrefix] = useState('EMP');
  const [startsFrom, setStartsFrom] = useState('1000');
  const [stepIncrement, setStepIncrement] = useState('1');

  const handleReset = () => {
    setSelectedColor('#0072C4');
    setThemeMode('Default');
  };

  const handleSaveTheme = () => {
    // In a real app, dispatch save theme API call
  };

  const handleSaveOrgSettings = () => {
    // In a real app, dispatch save org settings API call
  };

  const handleCancelOrgSettings = () => {
    setPrefix('EMP');
    setStartsFrom('1000');
    setStepIncrement('1');
  };

  // Generate example text from current values
  const exampleText = `( ${prefix}${startsFrom}, ${prefix}${parseInt(startsFrom) + parseInt(stepIncrement || '1')}, ${prefix}${parseInt(startsFrom) + parseInt(stepIncrement || '1') * 2} )`;

  // ── Theme Tab Content ─────────────────────────────────────────
  const renderThemeTab = () => (
    <>
      <SectionCard title="Theme">
        {/* Mode Toggle */}
        <View style={styles.modeSection}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.dark" style={styles.modeLabel}>
            UI Customisation
          </Typography>
          <TabButton
            tabs={['Default', 'Custom']}
            activeTab={themeMode}
            onTabChange={setThemeMode}
          />
        </View>

        {/* Colour Picker */}
        <View style={styles.colorSection}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.dark" style={styles.sectionLabel}>
            Theme
          </Typography>
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </View>

        {/* Preview Area */}
        <View style={styles.previewSection}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.dark" style={styles.sectionLabel}>
            Preview
          </Typography>
          <View style={styles.previewContainer}>
            {/* Mini sidebar */}
            <View style={[styles.previewSidebar, { backgroundColor: selectedColor }]}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.previewSidebarItem,
                    i === 1 && { backgroundColor: 'rgba(255,255,255,0.3)' }
                  ]}
                />
              ))}
            </View>
            {/* Mini content area */}
            <View style={styles.previewContent}>
              {/* Mini header */}
              <View style={[styles.previewHeader, { borderBottomColor: theme.colors.neutral.border.light }]}>
                <View style={[styles.previewHeaderDot, { backgroundColor: selectedColor }]} />
                <View style={styles.previewHeaderLines}>
                  <View style={[styles.previewLine, { width: '60%', backgroundColor: theme.colors.neutral.surface.medium }]} />
                  <View style={[styles.previewLine, { width: '40%', backgroundColor: theme.colors.neutral.surface.medium }]} />
                </View>
              </View>
              {/* Mini content blocks */}
              <View style={styles.previewBody}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.previewRow}>
                    <View style={[styles.previewBlock, { backgroundColor: theme.colors.neutral.surface.medium }]} />
                    <View style={styles.previewRowLines}>
                      <View style={[styles.previewLine, { width: '80%', backgroundColor: theme.colors.neutral.surface.medium }]} />
                      <View style={[styles.previewLine, { width: '50%', backgroundColor: theme.colors.neutral.border.light }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <CustomButton
            title="Reset"
            variant="outline"
            size="small"
            onPress={handleReset}
          />
          <CustomButton
            title="Save Theme"
            variant="primary"
            size="small"
            onPress={handleSaveTheme}
          />
        </View>
      </SectionCard>

      {/* Dark Mode Section */}
      <SectionCard title="Appearance">
        <View style={styles.appearanceRow}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.light">
            Dark Mode
          </Typography>
          <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.appearanceDesc}>
            Switch between light and dark theme. Currently: {isDark ? 'Dark' : 'Light'}
          </Typography>
        </View>
        <View style={styles.darkModeToggle}>
          <CustomButton
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            variant={isDark ? 'secondary' : 'outline'}
            size="small"
            onPress={toggleTheme}
          />
        </View>
      </SectionCard>
    </>
  );

  // ── Org Settings Tab Content ──────────────────────────────────
  const renderOrgSettingsTab = () => (
    <SectionCard title="Org settings">
      {/* Action Buttons in header */}
      <View style={styles.orgSettingsHeaderActions}>
        <CustomButton
          title="Cancel"
          variant="outline"
          size="xs"
          onPress={handleCancelOrgSettings}
        />
        <CustomButton
          title="Save changes"
          variant="primary"
          size="xs"
          onPress={handleSaveOrgSettings}
        />
      </View>

      {/* Employee Code Section */}
      <View style={styles.employeeCodeSection}>
        <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light" style={styles.employeeCodeTitle}>
          Employee code
        </Typography>

        <View style={styles.divider} />

        {/* Numbering Type */}
        <View style={styles.settingRow}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.light" style={styles.settingLabel}>
            Numbering Type
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.settingColon}>
            :
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.light" style={styles.settingValue}>
            Sequential numbering
          </Typography>
        </View>

        {/* Prefix */}
        <View style={styles.settingRow}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.light" style={styles.settingLabel}>
            Prefix
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.settingColon}>
            :
          </Typography>
          <View style={styles.settingInputWrapper}>
            <Input
              value={prefix}
              onChangeText={setPrefix}
              placeholder="EMP"
              containerStyle={styles.compactInput}
              wrapperStyle={styles.compactInputWrapper}
            />
          </View>
        </View>

        {/* Starts from */}
        <View style={styles.settingRow}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.light" style={styles.settingLabel}>
            Starts from
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.settingColon}>
            :
          </Typography>
          <View style={styles.settingInputWrapper}>
            <Input
              value={startsFrom}
              onChangeText={setStartsFrom}
              placeholder="1000"
              keyboardType="number-pad"
              containerStyle={styles.compactInput}
              wrapperStyle={styles.compactInputWrapper}
            />
          </View>
        </View>

        {/* Step increment */}
        <View style={styles.settingRow}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.light" style={styles.settingLabel}>
            Step increment
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.settingColon}>
            :
          </Typography>
          <View style={styles.settingInputWithHelper}>
            <View style={styles.settingInputWrapper}>
              <Input
                value={stepIncrement}
                onChangeText={setStepIncrement}
                placeholder="1"
                keyboardType="number-pad"
                containerStyle={styles.compactInput}
                wrapperStyle={styles.compactInputWrapper}
              />
            </View>
            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" style={styles.helperNote}>
              ( increment between each number )
            </Typography>
          </View>
        </View>

        {/* Example */}
        <View style={styles.settingRow}>
          <Typography fontVariant="BS" variant="medium" color="colors.neutral.onSurface.light" style={styles.settingLabel}>
            Example
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.settingColon}>
            :
          </Typography>
          <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" style={styles.settingValue}>
            {exampleText}
          </Typography>
        </View>
      </View>
    </SectionCard>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Typography fontVariant="BL" variant="semibold" color="colors.neutral.onSurface.light">
            Settings
          </Typography>
        </View>

        {/* ScrollTabs */}
        <ScrollTabs
          tabs={SETTINGS_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          containerStyle={styles.tabsContainer}
        />

        <View style={styles.tabDivider} />

        {/* Tab Content */}
        {activeTab === 'Theme' ? renderThemeTab() : renderOrgSettingsTab()}
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
    tabsContainer: {
      paddingHorizontal: 0,
    },
    tabDivider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
      marginBottom: theme.spacing.s400,
    },
    // ── Theme tab ─────────────────────────────────────────────
    modeSection: {
      marginBottom: theme.spacing.s500,
    },
    modeLabel: {
      marginBottom: theme.spacing.s300,
    },
    colorSection: {
      marginBottom: theme.spacing.s500,
    },
    sectionLabel: {
      marginBottom: theme.spacing.s300,
    },
    previewSection: {
      marginBottom: theme.spacing.s500,
    },
    previewContainer: {
      flexDirection: 'row',
      height: 180,
      borderRadius: theme.borderRadius.b200,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      overflow: 'hidden',
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    previewSidebar: {
      width: 60,
      paddingVertical: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s200,
      gap: theme.spacing.s200,
    },
    previewSidebarItem: {
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    previewContent: {
      flex: 1,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.s300,
      borderBottomWidth: 1,
    },
    previewHeaderDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.s200,
    },
    previewHeaderLines: {
      flex: 1,
      gap: 4,
    },
    previewBody: {
      padding: theme.spacing.s300,
      gap: theme.spacing.s300,
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
    },
    previewBlock: {
      width: 24,
      height: 24,
      borderRadius: theme.borderRadius.b100,
    },
    previewRowLines: {
      flex: 1,
      gap: 4,
    },
    previewLine: {
      height: 6,
      borderRadius: 3,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.s300,
    },
    appearanceRow: {
      marginBottom: theme.spacing.s300,
    },
    appearanceDesc: {
      marginTop: theme.spacing.s100,
    },
    darkModeToggle: {
      alignItems: 'flex-start',
    },
    // ── Org Settings tab ──────────────────────────────────────
    orgSettingsHeaderActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.s200,
      marginBottom: theme.spacing.s400,
    },
    employeeCodeSection: {
      marginTop: theme.spacing.s100,
    },
    employeeCodeTitle: {
      marginBottom: theme.spacing.s300,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
      marginBottom: theme.spacing.s400,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.s400,
      minHeight: 36,
    },
    settingLabel: {
      width: 120,
    },
    settingColon: {
      width: 20,
      textAlign: 'center',
    },
    settingValue: {
      flex: 1,
    },
    settingInputWrapper: {
      width: 80,
    },
    settingInputWithHelper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s200,
    },
    compactInput: {
      marginBottom: 0,
    },
    compactInputWrapper: {
      height: 36,
    },
    helperNote: {
      flex: 1,
    },
  });
