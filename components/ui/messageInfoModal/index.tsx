import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Avatar from '@/components/ui/avatar';
import { Close } from '@/svg_icons';

interface ContactInfo {
  id: string;
  name: string;
  avatar: string;
  timestamp: string;
}

interface MessageInfoModalProps {
  visible: boolean;
  onClose: () => void;
  messageText: string;
  timestamp: string;
  readBy: ContactInfo[];
  deliveredTo: ContactInfo[];
}

const MessageInfoModal: React.FC<MessageInfoModalProps> = ({
  visible,
  onClose,
  messageText,
  timestamp,
  readBy,
  deliveredTo,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const sheetTranslateY = React.useRef(new Animated.Value(600)).current;
  const [modalVisible, setModalVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'read' | 'delivered'>('read');

  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setActiveTab('read');
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

  if (!modalVisible) return null;

  const renderContactList = (contacts: ContactInfo[]) => (
    <ScrollView style={styles.contactList} showsVerticalScrollIndicator={false}>
      {contacts.map((contact) => (
        <View key={contact.id} style={styles.contactRow}>
          <Avatar source={{ uri: contact.avatar }} name={contact.name} size="md" />
          <View style={styles.contactInfo}>
            <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
              {contact.name}
            </Typography>
            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
              {contact.timestamp}
            </Typography>
          </View>
        </View>
      ))}
    </ScrollView>
  );

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
                    Message Info
                  </Typography>
                  <TouchableOpacity onPress={onClose}>
                    <Close width={22} height={22} viewBox="0 0 24 24" color={theme.colors.neutral.onSurface.dark} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Message preview */}
              <View style={styles.messagePreview}>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" numberOfLines={3}>
                  {messageText}
                </Typography>
                <Typography fontVariant="BXS" color="colors.neutral.onSurface.disabled" style={{ marginTop: theme.spacing.s100 }}>
                  Sent • {timestamp}
                </Typography>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'read' && styles.activeTab]}
                  onPress={() => setActiveTab('read')}
                >
                  <Typography
                    fontVariant="BS"
                    variant={activeTab === 'read' ? 'semibold' : 'regular'}
                    color={activeTab === 'read' ? 'colors.brand.onSurface.medium' : 'colors.neutral.onSurface.light'}
                  >
                    Read by ({readBy.length})
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'delivered' && styles.activeTab]}
                  onPress={() => setActiveTab('delivered')}
                >
                  <Typography
                    fontVariant="BS"
                    variant={activeTab === 'delivered' ? 'semibold' : 'regular'}
                    color={activeTab === 'delivered' ? 'colors.brand.onSurface.medium' : 'colors.neutral.onSurface.light'}
                  >
                    Delivered to ({deliveredTo.length})
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Contact list */}
              {activeTab === 'read' ? renderContactList(readBy) : renderContactList(deliveredTo)}
              
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
    },
    messagePreview: {
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s300,
      backgroundColor: theme.colors.neutral.surface.light,
      marginHorizontal: theme.spacing.s400,
      borderRadius: theme.borderRadius.b200,
      marginBottom: theme.spacing.s300,
    },
    tabContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
      marginBottom: theme.spacing.s200,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.s300,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.brand.surface.medium,
    },
    contactList: {
      maxHeight: 350,
      paddingHorizontal: theme.spacing.s400,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.s300,
    },
    contactInfo: {
      flex: 1,
      marginLeft: theme.spacing.s300,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });

export default MessageInfoModal;
