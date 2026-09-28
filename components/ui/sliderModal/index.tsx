import React from 'react';
import { Modal, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SemiBoldText } from '@/components/ui/typography';
import Close from '@/svg_icons/Close';
import { useTheme } from '@/context/CustomThemeContext';

interface SliderModalProps {
  visible: boolean;
  onClose: () => void;
  showHeader?: boolean;
  title?: string;
  children: React.ReactNode;
}

export default function SliderModal({ visible, onClose, showHeader = false, title, children }: SliderModalProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View style={[styles.container, { marginTop: insets.top + 100, backgroundColor: theme.colors.neutral.surface.light }]}>
          {showHeader && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
              <SemiBoldText fontVariant="TS">{title}</SemiBoldText>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <Close width={24} height={24} color={theme.colors.neutral.onSurface.light} />
              </Pressable>
            </View>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  }
});
