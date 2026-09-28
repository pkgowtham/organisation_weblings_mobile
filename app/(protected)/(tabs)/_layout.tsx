import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/context/CustomThemeContext';
import { BusinessHub, ChatBubbleOutline, EmailOutline, Goal, Person, RouteAltLeftStreamlineTabler } from '@/svg_icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';
import MailDrawer from '@/components/drawer/mailDrawer';
import EOfficeDrawer from '@/components/drawer/eOfficeDrawer';
import AccountsDrawer from '@/components/drawer/accountsDrawer';
import { DrawerProvider, useDrawer } from '@/context/DrawerContext';
import WheelMenu from '@/components/ui/wheelMenu';

function TabLayoutContent() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { activeDrawer, closeDrawer, selectedLabel, setSelectedLabel, selectedEOfficeLabel, setSelectedEOfficeLabel, selectedAccountsLabel, setSelectedAccountsLabel } = useDrawer();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.brand.onSurface.light,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height: insets.bottom + 65,
            backgroundColor: theme.colors.neutral.surface.lighter,
            borderTopWidth: 0,
            shadowColor: theme.colors.neutral.surface.inverse,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 12,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontFamily: 'OpenSansMedium'
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Business Hub',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                backgroundColor: focused ? theme.colors.brand.border.light : "transparent",
                paddingVertical: 4,
                paddingHorizontal: 16,
                borderRadius: 16
              }}>
                <BusinessHub color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: 'Accounts',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                backgroundColor: focused ? theme.colors.brand.border.light : "transparent",
                paddingVertical: 4,
                paddingHorizontal: 16,
                borderRadius: 16
              }}>
                <Person color={color} />
              </View>
            ),
          }}
        />
        {/* <Tabs.Screen
          name="placeholder"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarButton: () => (
              <View style={{ flex: 1, minWidth: 60 }} pointerEvents="none" />
            )
          }}
        /> */}
        <Tabs.Screen
          name="billing"
          options={{
            title: 'Billing',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                backgroundColor: focused ? theme.colors.brand.border.light : "transparent",
                paddingVertical: 4,
                paddingHorizontal: 16,
                borderRadius: 16
              }}>
                <RouteAltLeftStreamlineTabler color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="support"
          options={{
            title: 'Support',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                backgroundColor: focused ? theme.colors.brand.border.light : "transparent",
                paddingVertical: 4,
                paddingHorizontal: 16,
                borderRadius: 16
              }}>
                <Goal color={color} />
              </View>
            ),
          }}
        />
      </Tabs>

      {/* <WheelMenu /> */}

      {/* Render appropriate drawer based on active type */}
      {/* <MailDrawer
        open={activeDrawer === 'mail'}
        onClose={closeDrawer}
        backgroundColor={theme.colors.neutral.surface.lighter}
        selectedLabel={selectedLabel}
        onLabelSelect={setSelectedLabel}
      />

      <EOfficeDrawer
        open={activeDrawer === 'eoffice'}
        onClose={closeDrawer}
        backgroundColor={theme.colors.neutral.surface.lighter}
        selectedLabel={selectedEOfficeLabel}
        onLabelSelect={setSelectedEOfficeLabel}
      /> */}

      <AccountsDrawer
        open={activeDrawer === 'accounts'}
        onClose={closeDrawer}
        backgroundColor={theme.colors.neutral.surface.lighter}
        selectedLabel={selectedAccountsLabel}
        onLabelSelect={setSelectedAccountsLabel}
      />
    </>
  );
}

export default function TabLayout() {
  return (
    <DrawerProvider>
      <TabLayoutContent />
    </DrawerProvider>
  );
}