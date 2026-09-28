import { SemiBoldText } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { ArrowBackIos, Menu, MoreVert } from '@/svg_icons';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopBarProps {
    heading?: string;
    onBackPress?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
    heading = "Header",
    onBackPress,
}) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const styles = createStyles(theme);


    return (
        <>
            <View style={styles.container} >
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={onBackPress}>
                        <ArrowBackIos width={24} height={24} viewBox='0 0 24 24' color={theme.colors.neutral.surface.inverse} />
                    </TouchableOpacity>
                    <SemiBoldText color={theme.colors.neutral.surface.inverse} fontVariant="TS">
                        {heading}
                    </SemiBoldText>

                    <View style={styles.iconRow}>
                        <View />
                    </View>
                </View>
            </View >
        </>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.neutral.surface.lighter,
            marginVertical: 14,
        },
        topBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            backgroundColor: theme.colors.neutral.surface.lighter,
            height: 62,
            width: '100%',
            shadowColor: theme.colors.neutral.surface.inverse,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
        },
        iconRow: {
            flexDirection: 'row',
            gap: 16,
        },
    });

export default TopBar;
