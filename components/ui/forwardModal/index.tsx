import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Avatar from '@/components/ui/avatar';
import CustomButton from '@/components/ui/button';
import { Search, Close } from '@/svg_icons';

const FORWARD_CONTACTS = [
  { id: '1', name: 'Shaw Murray', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Brian Jones', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: '3', name: 'Alice Green', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '4', name: 'Michael Lee', avatar: 'https://i.pravatar.cc/150?img=14' },
  { id: '5', name: 'Sarah Wilson', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '6', name: 'David Kim', avatar: 'https://i.pravatar.cc/150?img=15' },
  { id: '7', name: 'Emily Brown', avatar: 'https://i.pravatar.cc/150?img=10' },
  { id: '8', name: 'James Taylor', avatar: 'https://i.pravatar.cc/150?img=33' },
];

interface ForwardModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  onForward: (contactIds: string[]) => void;
}

const ForwardModal: React.FC<ForwardModalProps> = ({
  visible,
  message,
  onClose,
  onForward,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const sheetTranslateY = React.useRef(new Animated.Value(600)).current;
  const [modalVisible, setModalVisible] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setSelectedIds([]);
      setSearchQuery('');
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(sheetTranslateY, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 600, duration: 200, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible]);

  const filteredContacts = FORWARD_CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleForward = () => {
    onForward(selectedIds);
    onClose();
  };

  if (!modalVisible) return null;

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.handle} />
                <View style={styles.headerRow}>
                  <Typography fontVariant="BM" variant="semibold" color="colors.neutral.onSurface.light" style={{ flex: 1 }}>
                    Forward to
                  </Typography>
                  <TouchableOpacity onPress={onClose}>
                    <Close width={22} height={22} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.dark} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Message preview */}
              <View style={styles.messagePreview}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" numberOfLines={2}>
                  {message}
                </Typography>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <Search width={18} height={18} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.dark} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search contacts..."
                  placeholderTextColor={theme.colors.neutral.onSurface.disabled}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Contact list */}
              <ScrollView style={styles.contactList} showsVerticalScrollIndicator={false}>
                {filteredContacts.map((contact) => {
                  const isSelected = selectedIds.includes(contact.id);
                  return (
                    <TouchableOpacity
                      key={contact.id}
                      style={styles.contactRow}
                      onPress={() => toggleSelect(contact.id)}
                      activeOpacity={0.7}
                    >
                      <Avatar
                        source={{ uri: contact.avatar }}
                        name={contact.name}
                        size="md"
                      />
                      <Typography
                        fontVariant="BS"
                        variant="semibold"
                        color="colors.neutral.onSurface.light"
                        style={styles.contactName}
                      >
                        {contact.name}
                      </Typography>
                      <View style={[
                        styles.checkbox,
                        isSelected && {
                          backgroundColor: theme.colors.brand.surface.medium,
                          borderColor: theme.colors.brand.surface.medium,
                        },
                      ]}>
                        {isSelected && (
                          <Typography fontVariant="BXS" color="colors.neutral.onSurface.inverse" style={{ lineHeight: 18 }}>
                            ✓
                          </Typography>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Forward button */}
              <View style={styles.forwardButtonSection}>
                <CustomButton
                  variant="primary"
                  title={`Forward${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`}
                  size="md"
                  onPress={handleForward}
                  disabled={selectedIds.length === 0}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.neutral.overlay.light,
    },
    sheet: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderTopLeftRadius: theme.borderRadius.b400,
      borderTopRightRadius: theme.borderRadius.b400,
      maxHeight: '75%',
    },
    header: {
      paddingTop: theme.spacing.s300,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.neutral.border.medium,
      alignSelf: 'center',
      marginBottom: theme.spacing.s300,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s400,
      paddingBottom: theme.spacing.s300,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    messagePreview: {
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s300,
      backgroundColor: theme.colors.neutral.surface.light,
      marginHorizontal: theme.spacing.s400,
      marginTop: theme.spacing.s300,
      borderRadius: theme.borderRadius.b200,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius.b200,
      marginHorizontal: theme.spacing.s400,
      marginTop: theme.spacing.s300,
      paddingHorizontal: theme.spacing.s300,
      paddingVertical: theme.spacing.s200,
    },
    searchInput: {
      flex: 1,
      marginLeft: theme.spacing.s200,
      fontSize: theme.fontSize.BS.size,
      fontFamily: 'OpenSansRegular',
      color: theme.colors.neutral.onSurface.light,
      paddingVertical: 0,
    },
    contactList: {
      marginTop: theme.spacing.s200,
      maxHeight: 300,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s300,
    },
    contactName: {
      flex: 1,
      marginLeft: theme.spacing.s300,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.borderRadius.b100,
      borderWidth: 2,
      borderColor: theme.colors.neutral.border.medium,
      justifyContent: 'center',
      alignItems: 'center',
    },
    forwardButtonSection: {
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s400,
      borderTopWidth: 1,
      borderTopColor: theme.colors.neutral.border.light,
    },
  });

export default ForwardModal;
