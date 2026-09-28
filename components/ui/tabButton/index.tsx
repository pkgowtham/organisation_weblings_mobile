import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { RegularText } from '../typography';
import { useTheme } from '@/context/CustomThemeContext';

interface TabButtonProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabDisplayNames?: Record<string, string>;
}

const TabButton: React.FC<TabButtonProps> = ({ 
    tabs, 
    activeTab, 
    onTabChange, 
    tabDisplayNames = {}
}) => {
    const { theme } = useTheme();
    const styles = themedStyles(theme);
    
    return (
        <View style={styles.container}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        activeTab === tab && styles.activeTab
                    ]}
                    onPress={() => onTabChange(tab)}
                    activeOpacity={0.7}
                >
                    {activeTab === tab ? (
                        <RegularText color='colors.brand.onSurface.light' style={styles.activeTabText}>
                            {tabDisplayNames[tab] || tab}
                        </RegularText>
                    ) : (
                        <RegularText color='colors.brand.onSurface.light' style={styles.tabText}>
                            {tabDisplayNames[tab] || tab}
                        </RegularText>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
};

const themedStyles = (theme: any) => {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.colors.brand.surface.lighter,
            flexDirection: 'row',
            paddingHorizontal: 2,
            paddingVertical: 6,
            borderRadius: 60
        },
        tab: {
            flex: 1,
            paddingVertical: 4,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            marginHorizontal: 4,
        },
        activeTab: {
            backgroundColor: theme.colors.neutral.surface.lighter,
            borderRadius: 60
        },
        tabText: {
            fontSize: 14,
        },
        activeTabText: {
            fontSize: 14,
            fontWeight: '500',
        },
    });
}

export default TabButton;