import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Canvas, Rect, Group, Text, useFont, RoundedRect } from '@shopify/react-native-skia';
import { useTheme } from '@/context/CustomThemeContext';
import { MediumText, SemiBoldText } from '../ui/typography';
import Avatar from '../ui/avatar';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckboxFilled } from '@/svg_icons';

type UserData = {
    id: string;
    name: string;
    color: string;
    data: { label: string; value: number }[];
    avatarInitials: string;
    dp?: string;
    absentDates?: { date: string, day: string, status: string }[];
};

type BarGraphProps = {
    users: UserData[];
    width?: number;
    height?: number;
    orientation?: 'horizontal' | 'vertical';
    showValues?: boolean;
    showAvatars?: boolean;
    barRadius?: number;
    animationDuration?: number;
    title?: string;
    subtitle?: string;
    onUserPress?: (user: UserData, average: number) => void;
    onUsersFilterChange?: (selectedUserIds: string[]) => void;
    initiallySelectedUsers?: string[];
    onShowMoreAbsences?: (user: UserData) => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SkiaBarGraph({
    users,
    width = SCREEN_WIDTH - 32,
    height = 350,
    orientation = 'horizontal',
    showValues = true,
    showAvatars = true,
    barRadius = 8,
    animationDuration = 800,
    title,
    subtitle,
    onUserPress,
    onUsersFilterChange,
    initiallySelectedUsers,
    onShowMoreAbsences,
}: BarGraphProps) {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    // Filter state - initially all users are selected
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(() => {
        if (initiallySelectedUsers && initiallySelectedUsers.length > 0) {
            return new Set(initiallySelectedUsers);
        }
        // Default: select all users
        return new Set(users.map(user => user.id));
    });

    const fontSize = 12;
    const font = useFont(require('@/assets/fonts/OpenSans-Regular.ttf'), fontSize);

    // Calculate average working hours for ALL users (not filtered)
    const userAverages = useMemo(() => {
        return users.map(user => {
            const average = user.data.reduce((sum, point) => sum + point.value, 0) / user.data.length;
            return {
                ...user,
                average: Math.round(average * 10) / 10,
                isSelected: selectedUserIds.has(user.id) // Add selection status
            };
        });
    }, [users, selectedUserIds]);

    // Find max value for scaling (only from selected users for proper scaling)
    const maxAverage = useMemo(() => {
        const selectedAverages = userAverages
            .filter(user => selectedUserIds.has(user.id))
            .map(user => user.average);
        return Math.max(...selectedAverages, 8);
    }, [userAverages, selectedUserIds]);

    // Handle checkbox toggle
    const handleCheckboxToggle = (userId: string) => {
        const newSelectedUserIds = new Set<string>(selectedUserIds);

        if (newSelectedUserIds.has(userId)) {
            newSelectedUserIds.delete(userId);
        } else {
            newSelectedUserIds.add(userId);
        }

        setSelectedUserIds(newSelectedUserIds);
        onUsersFilterChange?.(Array.from(newSelectedUserIds));
    };

    // Select all users
    const handleSelectAll = () => {
        const allUserIds = users.map(user => user.id);
        const newSelectedUserIds = new Set<string>(allUserIds);
        setSelectedUserIds(newSelectedUserIds);
        onUsersFilterChange?.(Array.from(newSelectedUserIds));
    };

    // Deselect all users
    const handleDeselectNone = () => {
        const newSelectedUserIds = new Set<string>();
        setSelectedUserIds(newSelectedUserIds);
        onUsersFilterChange?.(Array.from(newSelectedUserIds));
    };

    // Simple Checkbox Component
    const RenderCheckbox = ({ isSelected, onToggle }: { isSelected: boolean; onToggle: () => void }) => (
        <Pressable
            onPress={onToggle}
            style={[
                styles.checkbox,
                {
                    borderWidth: isSelected ? 0 : 2,
                    borderColor: !isSelected && theme.colors.neutral.border.light
                }
            ]}
        >
            {isSelected && (
                <CheckboxFilled color={isSelected ? theme.colors.brand.surface.medium : theme.colors.neutral.border.light} />
            )}
        </Pressable>
    );

    // Horizontal Bar Graph - Show ALL users with disabled styling for unchecked ones
    const renderHorizontalBars = () => {
        const availableWidth = width - 130;

        return (
            <View style={styles.horizontalContainer}>
                {userAverages.map((user, index) => {
                    const isSelected = selectedUserIds.has(user.id);
                    const barWidth = (user.average / maxAverage) * availableWidth;
                    const opacity = isSelected ? 1 : 0.4; // Reduced opacity for disabled users

                    return (
                        <Pressable
                            key={user.id}
                            onPress={() => {
                                if (isSelected) { // Only allow press on selected users
                                    setSelectedUser(user.id);
                                    onUserPress?.(user, user.average);
                                    setTimeout(() => setSelectedUser(null), 2000);
                                }
                            }}
                            style={styles.barRow}
                        >
                            {/* Checkbox for filtering */}
                            <View style={styles.checkboxContainer}>
                                <RenderCheckbox
                                    isSelected={isSelected}
                                    onToggle={() => handleCheckboxToggle(user.id)}
                                />
                            </View>

                            {/* User Avatar */}
                            {showAvatars && (
                                <View style={[styles.avatarContainer, { opacity }]}>
                                    <Avatar
                                        name={user.name}
                                        size='md'
                                        source={user.dp ? { uri: user.dp } : undefined}
                                    />
                                </View>
                            )}

                            {/* Bar Container */}
                            <View style={[styles.barWrapper, { opacity }]}>
                                {/* Top Row: Name and Value */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <MediumText fontVariant="BM" style={{ color: theme.colors.neutral.onSurface.dark }}>
                                        {user.name}
                                    </MediumText>
                                    {showValues && (
                                        <MediumText fontVariant="BM" style={{ color: theme.colors.neutral.onSurface.dark }}>
                                            {user.average} hours
                                        </MediumText>
                                    )}
                                </View>

                                {/* Bar */}
                                <View style={{ height: 6, width: availableWidth, marginBottom: 8, backgroundColor: theme.colors.neutral.surface.medium, borderRadius: 3, overflow: 'hidden' }}>
                                    <View style={{ height: 6, width: barWidth, backgroundColor: user.color, borderRadius: 3 }} />
                                </View>

                                {/* Absent Dates Badges */}
                                {user.absentDates && user.absentDates.length > 0 && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 0, marginBottom: 8 }}>
                                        {user.absentDates.slice(0, 3).map((item, idx) => {
                                            const d = new Date(item.date);
                                            const formatted = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
                                            return (
                                                <View key={idx} style={{ backgroundColor: theme.colors.negative.surface.light, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6, marginBottom: 4 }}>
                                                    <MediumText fontVariant="BS" style={{ color: theme.colors.negative.onSurface.light, fontSize: 10 }}>{formatted}</MediumText>
                                                </View>
                                            );
                                        })}
                                        {user.absentDates.length > 3 && (
                                            <Pressable onPress={() => onShowMoreAbsences?.(user)} style={{ paddingVertical: 2, paddingHorizontal: 4 }}>
                                                <MediumText fontVariant="BS" style={{ color: theme.colors.brand.onSurface.light, fontSize: 11 }}>Show more</MediumText>
                                            </Pressable>
                                        )}
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={[styles.container, { width, minHeight: height }]}>
            {/* Header */}
            {title || subtitle ? (
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        {title ? <SemiBoldText fontVariant='BM' style={styles.title}>{title}</SemiBoldText> : null}
                        {/* Quick filter actions */}
                        <View style={styles.filterActions}>
                            <Pressable onPress={handleSelectAll} style={styles.filterAction}>
                                <MediumText fontVariant="BS" style={styles.filterActionText}>
                                    All
                                </MediumText>
                            </Pressable>
                            <Pressable onPress={handleDeselectNone} style={styles.filterAction}>
                                <MediumText fontVariant="BS" style={styles.filterActionText}>
                                    None
                                </MediumText>
                            </Pressable>
                        </View>
                    </View>
                    {subtitle ? <MediumText fontVariant='BS' style={styles.subtitle}>{subtitle}</MediumText> : null}
                </View>
            ) : null}

            {/* Graph Content */}
            <View style={styles.graphContent}>
                {renderHorizontalBars()}
            </View>

            {/* Tooltip for selected user */}
            {selectedUser && (
                <View style={styles.tooltip}>
                    <SemiBoldText fontVariant="BS" style={styles.tooltipText}>
                        {users.find(u => u.id === selectedUser)?.name}
                    </SemiBoldText>
                    <MediumText fontVariant="BS" style={styles.tooltipSubtext}>
                        Avg: {userAverages.find(u => u.id === selectedUser)?.average}h
                    </MediumText>
                </View>
            )}
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            justifyContent: 'flex-start'
        },
        header: {
            width: '100%',
            paddingHorizontal: 16,
            marginBottom: 16,
        },
        headerTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        title: {
            color: theme.colors.neutral.onSurface.light,
            flex: 1,
        },
        subtitle: {
            color: theme.colors.neutral.onSurface.dark,
        },
        filterActions: {
            flexDirection: 'row',
            gap: 8,
        },
        filterAction: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginRight: 8,
            backgroundColor: theme.colors.neutral.surface.light,
            borderRadius: 6,
        },
        filterActionText: {
            color: theme.colors.neutral.onSurface.dark,
            fontSize: 12,
        },
        graphContent: {
            width: '100%',
        },
        // Horizontal Layout Styles
        horizontalContainer: {
            paddingHorizontal: 16,
        },
        barRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
        },
        checkboxContainer: {
            width: 24,
            alignItems: 'center',
            marginRight: 8,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 2,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarContainer: {
            width: 40,
            alignItems: 'center',
            marginRight: 12,
        },
        barWrapper: {
            flex: 1,
            position: 'relative',
        },
        // Tooltip
        tooltip: {
            position: 'absolute',
            top: 80,
            alignSelf: 'center',
            backgroundColor: theme.colors.neutral.surface.light,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            shadowColor: theme.colors.neutral.surface.inverse,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
            alignItems: 'center',
        },
        tooltipText: {
            color: theme.colors.neutral.onSurface.light,
            fontSize: 14,
        },
        tooltipSubtext: {
            color: theme.colors.neutral.onSurface.dark,
            fontSize: 12,
            marginTop: 2,
        },
    });