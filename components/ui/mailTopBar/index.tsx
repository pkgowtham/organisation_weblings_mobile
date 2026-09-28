import Avatar from '@/components/ui/avatar';
import { RegularText, SemiBoldText } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { Add, Archive, ArrowBackIos, Close, Delete, East, Menu, PushPin, RestoreFromTrash, Search, StarOutlined } from '@/svg_icons';
import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MailTopBarProps {
    MainText?: string;
    selectionActive?: boolean;
    selectedCount?: number;
    totalCount?: number;
    trash?: boolean;
    onClearSelection?: () => void;
    onDeleteSelected?: () => void;
    onPinSelected?: () => void;
    onRetrieveSelected?: () => void;
    onArchiveSelected?: () => void;
    onMenuPress?: () => void;
}

const MailTopBar: React.FC<MailTopBarProps> = ({
    MainText = "Inbox",
    selectionActive = false,
    selectedCount = 0,
    totalCount = 0,
    trash,
    onClearSelection,
    onDeleteSelected,
    onRetrieveSelected,
    onArchiveSelected,
    onPinSelected,
    onMenuPress,
}) => {
    const [activeSearch, setActiveSearch] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>("")
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const styles = createStyles(theme);

    const onSearchPress = () => {
        setActiveSearch(true);
    }

    const onCloseSearch = () => {
        setActiveSearch(false);
        setSearchValue("")
    }

    const handleSearchChange = (text: string) => {
        setSearchValue(text);
    }

    return (
        <>
            {selectionActive ?
                <View style={styles.selectedContainer} >
                    <View style={styles.selectedTopBar}>
                        <TouchableOpacity onPress={onClearSelection}>
                            <ArrowBackIos width={20} height={20} viewBox='0 0 24 24' color={theme.colors.neutral.surface.inverse} />
                        </TouchableOpacity>
                        <View />
                        <View />
                        <SemiBoldText color={theme.colors.neutral.surface.inverse} fontVariant="TS">
                            {selectedCount} / {totalCount}
                        </SemiBoldText>

                        <View style={styles.iconRow}>
                            {trash ?
                                <TouchableOpacity onPress={onRetrieveSelected}>
                                    <RestoreFromTrash width={20} height={20} viewBox='0 0 24 24' color={theme.colors.brand.surface.inverse} />
                                </TouchableOpacity>
                                :
                                <View />
                            }
                            <TouchableOpacity onPress={onPinSelected}>
                                <StarOutlined width={20} height={20} viewBox='0 0 24 24' color={theme.colors.neutral.surface.inverse} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onArchiveSelected}>
                                <Archive width={20} height={20} viewBox='0 0 24 24' color={theme.colors.brand.surface.medium} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onDeleteSelected}>
                                <Delete width={20} height={20} viewBox='0 0 24 24' color={theme.colors.negative.surface.medium} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View >
                :
                <View style={styles.container}>
                    <View style={styles.topBar}>
                        <View style={styles.iconRow}>
                            <TouchableOpacity onPress={onMenuPress}>
                                <Menu color={theme.colors.neutral.surface.inverse} />
                            </TouchableOpacity>
                            {!activeSearch &&
                                <TouchableOpacity onPress={onSearchPress}>
                                    <Search color={theme.colors.neutral.surface.inverse} />
                                </TouchableOpacity>
                            }
                        </View>
                        {activeSearch ?
                            <View style={styles.searchInputContainer}>
                                <Search width={20} height={20} viewBox='0 0 24 24' color={theme.colors.neutral.surface.inverse} />
                                <TextInput
                                    placeholder='Search Mail'
                                    style={styles.searchInput}
                                    value={searchValue}
                                    placeholderTextColor={theme.colors.neutral.onSurface.light}
                                    onChangeText={handleSearchChange}
                                    autoFocus
                                />
                                {searchValue ?
                                    <TouchableOpacity onPress={onCloseSearch}>
                                        <East width={20} height={20} viewBox='0 0 24 24' color={theme.colors.neutral.surface.inverse} />
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity onPress={onCloseSearch}>
                                        <Close width={20} height={20} viewBox='0 0 24 24' color={theme.colors.neutral.surface.inverse} />
                                    </TouchableOpacity>
                                }
                            </View>
                            :
                            <RegularText color={theme.colors.brand.surface.medium} fontVariant="BL">
                                {MainText}
                            </RegularText>
                        }
                        <View style={styles.iconRow}>
                            <View />
                            <Avatar size="sm" name="S" />
                        </View>
                    </View>
                </View>
            }
        </>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.neutral.surface.lighter,
            margin: 14,
        },
        selectedContainer: {
            backgroundColor: theme.colors.neutral.surface.lighter,
            marginVertical: 14,
        },
        topBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            backgroundColor: theme.colors.neutral.surface.lighter,
            height: 56,
            width: '100%',
            borderRadius: theme.borderRadius.b700,
            shadowColor: theme.colors.neutral.surface.inverse,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
        },
        selectedTopBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            backgroundColor: theme.colors.neutral.surface.lighter,
            height: 56,
            width: '100%',
            shadowColor: theme.colors.neutral.surface.inverse,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
        },
        searchInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            borderBottomWidth: 1,
            borderColor: theme.colors.neutral.border.light,
            width: '60%',
            height: 32
        },
        searchInput: {
            paddingBottom: 6,
            width: '90%',
            fontFamily: 'OpenSansMedium',
            color: theme.colors.neutral.onSurface.light
        },
        iconRow: {
            flexDirection: 'row',
            gap: 16,
        },
    });

export default MailTopBar;
