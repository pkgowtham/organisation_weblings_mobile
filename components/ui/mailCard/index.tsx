import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import Avatar from '@/components/ui/avatar';
import { RegularText, SemiBoldText } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Checkbox, CheckboxFilled, Delete, FileMove, AttachFile } from '@/svg_icons';
import { extractName } from '@/util/util';
import { getRelativeTime } from '@/util/dateUtil';

interface MailCardProps {
    id: string;
    from: string;
    subject: string;
    body: string;
    date: string;
    trash?: boolean;
    hasAttachment?: boolean;
    selected?: boolean;
    selectionActive?: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
}

const MailCard: React.FC<MailCardProps> = ({
    from,
    subject,
    body,
    date,
    trash = false,
    hasAttachment,
    selected = false,
    selectionActive = false,
    onPress,
    onLongPress,
    onDelete,
    onArchive,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme, selected);

    // Function to strip HTML tags and get plain text for preview
    const stripHtmlForPreview = (html: string): string => {
        if (!html) return '';

        // Remove HTML tags and convert common entities
        const plainText = html
            .replace(/<br\s*\/?>/gi, ' ') // Convert line breaks to spaces
            .replace(/<p[^>]*>/gi, ' ') // Convert paragraphs to spaces
            .replace(/<[^>]*>/g, '') // Remove all other HTML tags
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .trim()
            .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
            .replace(/&amp;/g, '&') // Replace &amp;
            .replace(/&lt;/g, '<') // Replace &lt;
            .replace(/&gt;/g, '>') // Replace &gt;
            .replace(/&quot;/g, '"') // Replace &quot;
            .replace(/&#39;/g, "'"); // Replace &#39;

        return plainText;
    };

    const renderRightActions = (progress: any, dragX: any) => {
        const style = useAnimatedStyle(() => {
            const translateX = interpolate(
                dragX.value,
                [-60, 0],
                [0, 60],
                'clamp'
            );
            return { transform: [{ translateX }] };
        });

        return (
            <Animated.View style={style}>
                <TouchableOpacity style={styles.delete} onPress={onDelete}>
                    <Delete width={28} height={28} color={theme.colors.neutral.onSurface.inverse} />
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const renderLeftActions = (progress: any, dragX: any) => {
        const style = useAnimatedStyle(() => {
            const translateX = interpolate(
                dragX.value,
                [0, 60],
                [-60, 0],
                'clamp'
            );
            return { transform: [{ translateX }] };
        });
        if (!trash) {
            return (
                <Animated.View style={style}>
                    <TouchableOpacity style={styles.archive} onPress={onArchive}>
                        <FileMove width={28} height={28} color={theme.colors.neutral.onSurface.inverse} />
                    </TouchableOpacity>
                </Animated.View>
            );
        } else {
            return undefined
        }
    };

    return (
        <ReanimatedSwipeable
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
        >
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={onPress}
                onLongPress={onLongPress}
            >
                {selected && <View style={styles.selectedCard} />}
                {selectionActive &&
                    (selected ?
                        <CheckboxFilled style={{ marginLeft: 12 }} width={18} height={18} viewBox='0 0 24 24' color={theme.colors.brand.surface.medium} />
                        :
                        <Checkbox style={{ marginLeft: 12 }} width={18} height={18} viewBox='0 0 24 24' color={theme.colors.neutral.border.light} />
                    )
                }
                <View style={styles.textDivider}>
                    <View style={styles.textContainer}>
                        <Avatar style={styles.avatar} name={extractName(from)} size="md" />
                        <View style={{ width: '85%' }}>
                            <SemiBoldText fontVariant="LM" color={theme.colors.neutral.onSurface.medium}>
                                {extractName(from)}
                            </SemiBoldText>
                            <SemiBoldText numberOfLines={2} ellipsizeMode='tail' fontVariant="LS" color={theme.colors.neutral.onSurface.light}>
                                {subject}
                            </SemiBoldText>
                        </View>
                    </View>
                    <RegularText
                        style={styles.descriptionText}
                        fontVariant="BS"
                        color={theme.colors.neutral.onSurface.medium}
                        numberOfLines={1}
                        ellipsizeMode='tail'
                    >
                        {stripHtmlForPreview(body)}
                    </RegularText>
                </View>

                {/* Meta info */}
                <View style={styles.meta}>
                    <RegularText fontVariant="LXS" color={theme.colors.neutral.onSurface.light}>
                        {getRelativeTime(date)}
                    </RegularText>
                    {hasAttachment && (
                        <AttachFile
                            color={theme.colors.neutral.onSurface.medium}
                            width={18}
                            height={18}
                            viewBox="0 0 24 24"
                        />
                    )}
                </View>
            </TouchableOpacity>
        </ReanimatedSwipeable>
    );
};

const createStyles = (theme: any, selected: boolean) =>
    StyleSheet.create({
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: selected
                ? theme.colors.brand.surface.lighter
                : theme.colors.neutral.surface.lighter,
            borderRadius: theme.borderRadius.b300,
            marginVertical: 6,
            marginHorizontal: 10,
            shadowColor: theme.colors.neutral.surface.inverse,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 1,
        },
        selectedCard: {
            width: 14,
            height: '100%',
            backgroundColor: theme.colors.brand.surface.medium,
            zIndex: 2,
            borderTopLeftRadius: theme.borderRadius.b300,
            borderBottomLeftRadius: theme.borderRadius.b300
        },
        textDivider: {
            flex: 1,
            marginHorizontal: 24,
            marginVertical: 16
        },
        textContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        avatar: {
            borderWidth: 1,
            borderColor: theme.colors.neutral.border.light,
            borderRadius: 64,
        },
        descriptionText: {
            marginTop: 12,
            marginLeft: 6,
        },
        meta: {
            alignItems: 'flex-end',
            gap: 4,
            position: 'absolute',
            top: 16,
            right: 18,
        },
        delete: {
            backgroundColor: theme.colors.negative.surface.medium,
            justifyContent: 'center',
            alignItems: 'center',
            width: 60,
            borderTopLeftRadius: theme.borderRadius.b500,
            borderBottomLeftRadius: theme.borderRadius.b500,
            marginVertical: 6,
            height: '90%'
        },
        archive: {
            backgroundColor: theme.colors.brand.surface.medium,
            justifyContent: 'center',
            alignItems: 'center',
            width: 60,
            borderTopRightRadius: theme.borderRadius.b500,
            borderBottomRightRadius: theme.borderRadius.b500,
            marginVertical: 6,
            height: '90%'
        },
    });

export default MailCard;