import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Avatar from '@/components/ui/avatar';
import { useTheme } from '@/context/CustomThemeContext';
import { RegularText } from '../typography';

interface Contact {
    id: string;
    name: string;
    avatar?: string;
    badge?: number | string | boolean;
}

interface RecentContactsProps {
    contacts: Contact[];
    onContactPress?: (contact: Contact) => void;
    onAddPress?: () => void;
}

const RecentContacts: React.FC<RecentContactsProps> = ({
    contacts,
    onContactPress,
    onAddPress
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <RegularText style={styles.heading} fontVariant='BM' color='colors.neutral.surface.inverse'>
                Recent Contacts
            </RegularText>
            <FlatList
                horizontal
                contentContainerStyle ={{ paddingLeft: 16 }}
                data={[...contacts, { id: 'add', name: 'Add' }]}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) =>
                    item.id === 'add' ? (
                        <Avatar
                            icon="add-circle-outline"
                            size="lg"
                            textColor={theme.colors.brand.surface.medium}
                            backgroundColor={theme.colors.brand.surface.lighter}
                            onPress={onAddPress}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarContainer}>
                            <Avatar
                                name={item.name}
                                source={item.avatar ? { uri: item.avatar } : undefined}
                                size="lg"
                                badge={item.badge}
                                badgeColor={theme.colors.brand.surface.medium}
                                onPress={() => onContactPress?.(item)}
                                style={styles.avatar}
                            />
                            {item.badge &&
                                <View style={styles.notificationDot} />
                            }
                        </View>
                    )
                }
            />
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.colors.neutral.border.light,
            paddingVertical: 8,
            marginBottom: 4
        },
        heading: {
            paddingLeft: 16,
            marginBottom: 12
        },
        avatarContainer: {
            alignItems: 'center'
        },
        avatar: {
            marginHorizontal: 6,
        },
        notificationDot: {
            height: 8,
            width: 8,
            borderRadius: 4,
            marginTop: 5,
            backgroundColor: theme.colors.brand.surface.medium
        }
    });

export default RecentContacts;
