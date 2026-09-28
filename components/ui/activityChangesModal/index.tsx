import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Divider from '@/components/ui/divider';
import { Close } from '@/svg_icons';
import LexicalEditorDom from '@/components/ui/lexicalEditor/LexicalEditor.dom';
import Tag from '@/components/ui/tag';

export interface ActivityChangesModalProps {
  visible: boolean;
  onClose: () => void;
  log: any | null;
}

const ActivityChangesModal: React.FC<ActivityChangesModalProps> = ({
  visible,
  onClose,
  log,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(600);
    }
  }, [visible]);

  if (!log) return null;

  const isCreate = log.activityType === "CREATE" || (log.activityType === "UPDATE" && !log.oldValue);
  const isUpdate = log.activityType === "UPDATE" && !!log.oldValue;

  const renderValue = (val: any) => {
    if (val === null || val === undefined) return <Typography fontVariant="BS" color="colors.neutral.onSurface.disabled">None</Typography>;
    if (typeof val === 'string') {
      if (val.includes('<') && val.includes('>')) {
        return (
          <View style={{ minHeight: 60, paddingVertical: 4 }}>
            <LexicalEditorDom
              initialHTML={val}
              readOnly={true}
              minHeight={60}
              dom={{ matchParent: true, scrollEnabled: false }}
              style={{ borderWidth: 0 }}
              themeColors={{
                background: 'transparent',
                text: theme.colors.neutral.onSurface.light,
                placeholder: theme.colors.neutral.onSurface.medium,
                border: 'transparent',
                primary: theme.colors.brand.surface.light
              }}
            />
          </View>
        );
      }
      return <Typography fontVariant="BS" color="colors.neutral.onSurface.light">{val}</Typography>;
    }

    // For nested objects like comments or lists
    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        if (val.length === 0) return <Typography fontVariant="BS" color="colors.neutral.onSurface.disabled">Empty</Typography>;
        return (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {val.map((v, i) => {
              if (typeof v === 'object' && v.colorCode) {
                return (
                  <Tag
                    key={i}
                    label={v.displayName || v.name || ''}
                    variant="filled"
                    color="brand"
                    tagStyle={{ backgroundColor: v.colorCode }}
                    labelStyle={{ color: "#FFFFFF" }}
                    labelFontVariant="BXS"
                  />
                );
              }
              return (
                <Typography key={i} fontVariant="BS" color="colors.neutral.onSurface.light">
                  {typeof v === 'object' ? (v.displayName || v.name || JSON.stringify(v)) : String(v)}
                </Typography>
              );
            })}
          </View>
        );
      }
      if (val.colorCode) {
        return (
          <View style={{ marginTop: 4, alignSelf: 'flex-start' }}>
            <Tag
              label={val.displayName || val.name || val.content || ''}
              variant="filled"
              color="brand"
              tagStyle={{ backgroundColor: val.colorCode }}
              labelStyle={{ color: "#FFFFFF" }}
              labelFontVariant="BXS"
            />
          </View>
        );
      }
      if (val.content && typeof val.content === 'string') {
        return renderValue(val.content);
      }
      if (val.name && typeof val.name === 'string') {
        return renderValue(val.name);
      }
      if (val.displayName && typeof val.displayName === 'string') {
        return renderValue(val.displayName);
      }
      return <Typography fontVariant="BS" color="colors.neutral.onSurface.light">{JSON.stringify(val)}</Typography>;
    }
    return <Typography fontVariant="BS" color="colors.neutral.onSurface.light">{String(val)}</Typography>;
  };

  const getChangedKeys = () => {
    if (isCreate) {
      if (!log.newValue) return [];
      return Object.keys(log.newValue).filter(k => k !== 'id' && log.newValue[k] !== null);
    }
    if (isUpdate) {
      const keys = new Set<string>();
      if (log.oldValue) Object.keys(log.oldValue).forEach(k => keys.add(k));
      if (log.newValue) Object.keys(log.newValue).forEach(k => keys.add(k));
      return Array.from(keys).filter(k => k !== 'id' && JSON.stringify(log.oldValue?.[k]) !== JSON.stringify(log.newValue?.[k]));
    }
    return [];
  };

  const keys = getChangedKeys();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View style={[
          styles.sheetContainer,
          {
            backgroundColor: theme.colors.neutral.surface.lighter,
            paddingBottom: insets.bottom || 24,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.header}>
            <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
              {isUpdate ? "View Changes" : "Created Details"}
            </Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Close width={24} height={24} color={theme.colors.neutral.onSurface.dark} />
            </TouchableOpacity>
          </View>
          <Divider />

          <ScrollView style={styles.content} contentContainerStyle={{ padding: 16 }}>
            {keys.length === 0 ? (
              <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={{ textAlign: 'center', marginVertical: 32 }}>
                No significant changes found.
              </Typography>
            ) : (
              keys.map((key) => (
                <View key={key} style={styles.fieldSection}>
                  <Typography fontVariant="BS" variant="bold" color="colors.neutral.onSurface.dark" style={styles.fieldTitle}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>

                  {isUpdate ? (
                    <View style={styles.compareContainer}>
                      <View style={[styles.valueBox, { backgroundColor: theme.colors.negative.surface.lighter }]}>
                        <Typography fontVariant="BXS" variant="semibold" color="colors.negative.surface.medium" style={styles.labelOld}>Old Value</Typography>
                        {renderValue(log.oldValue?.[key])}
                      </View>

                      <View style={styles.arrowIcon}>
                        <Typography fontVariant="TM" color="colors.neutral.onSurface.disabled">↓</Typography>
                      </View>

                      <View style={[styles.valueBox, { backgroundColor: theme.colors.positive.surface.lighter }]}>
                        <Typography fontVariant="BXS" variant="semibold" color="colors.positive.surface.medium" style={styles.labelNew}>New Value</Typography>
                        {renderValue(log.newValue?.[key])}
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.valueBox, { backgroundColor: theme.colors.neutral.surface.lighter }]}>
                      {renderValue(log.newValue?.[key])}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.overlay.background,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flexShrink: 1,
  },
  fieldSection: {
    marginBottom: 24,
  },
  fieldTitle: {
    marginBottom: 12,
  },
  compareContainer: {
    gap: 8,
  },
  valueBox: {
    padding: 12,
    borderRadius: 8,
  },
  labelOld: {
    marginBottom: 8,
  },
  labelNew: {
    marginBottom: 8,
  },
  arrowIcon: {
    alignItems: 'center',
    marginVertical: -4,
    zIndex: 2,
  }
});

export default ActivityChangesModal;
