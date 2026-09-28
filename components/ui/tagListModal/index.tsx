import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Pressable,
} from 'react-native';
import { BoldText, RegularText } from '../typography';
import { Tag } from '@/svg_icons';
import { useTheme } from '@/context/CustomThemeContext';

interface TagList {
  tagId: string;
  name: string;
  color: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  tagList: TagList[];
  onTagPress?: (name: string, color: string) => void;
  title?: string;
}

const { height } = Dimensions.get('window');

const TagListModal: React.FC<Props> = ({
  visible,
  title = 'Select to mark tag',
  onClose,
  tagList,
  onTagPress
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal content */}
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <BoldText size={18} color='colors.neutral.onSurface.light'>{title}</BoldText>
            <BoldText size={18} color='colors.neutral.onSurface.light'>({tagList?.length})</BoldText>
          </View>

          <FlatList
            data={tagList}
            keyExtractor={(item) => item.tagId}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => onTagPress?.(item.name, item.color)} style={styles.tagListRow}>
                <Tag
                  style={styles.avatar}
                  color={item.color}
                />
                <RegularText size={16} color='colors.neutral.onSurface.light'>{item.name}</RegularText>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: 12,
      width: '90%',
      maxHeight: height * 0.7 - 100,
      padding: 16,
      flexShrink: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    tagListRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 18,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
  });

export default TagListModal;
