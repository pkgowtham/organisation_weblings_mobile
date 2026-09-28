import React, { useState, useRef } from 'react';
import { View, Animated, TouchableOpacity, StyleSheet, Easing, Text, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Person, Info2, Goal, Document } from '@/svg_icons';
import { useTheme } from '@/context/CustomThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../typography';

const { width, height } = Dimensions.get('window');

export default function WheelMenu() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    if (isOpen) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => setIsOpen(false));
    }
  };

  const RADIUS = 110;

  // Calculate angles for 4 items: distributed between left and right in an arc
  const getTransform = (index: number) => {
    const angles = [
      Math.PI * (5 / 6), // ~150 deg (leftmost)
      Math.PI * (11 / 18), // ~110 deg
      Math.PI * (7 / 18), // ~70 deg
      Math.PI * (1 / 6), // ~30 deg (rightmost)
    ];

    const angle = angles[index];
    const translateX = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, RADIUS * Math.cos(angle)],
    });
    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -RADIUS * Math.sin(angle)],
    });

    const scale = animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity: animation,
    };
  };

  const menuItems = [
    { id: 'about', icon: <Info2 color={theme.colors.brand.onSurface.light} width={24} height={24} />, label: 'About' },
    { id: 'details', icon: <Person color={theme.colors.brand.onSurface.light} width={24} height={24} />, label: 'Profile' },
    { id: 'job', icon: <Goal color={theme.colors.brand.onSurface.light} width={24} height={24} />, label: 'Job' },
    { id: 'documents', icon: <Document color={theme.colors.brand.onSurface.light} width={24} height={24} />, label: 'Documents' },
  ];

  return (
    <>
      {isOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={[styles.overlay, { height: height, width: width }]} />
        </TouchableWithoutFeedback>
      )}

      <View style={[styles.container, { bottom: insets.bottom + 25 }]} pointerEvents="box-none">
        {menuItems.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.menuItemContainer,
              getTransform(index),
              { backgroundColor: theme.colors.neutral.surface.lighter },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push(`/(protected)/profile/${item.id}` as any);
                closeMenu();
              }}
            >
              {item.icon}
              <Typography fontVariant="LXS" size={9} variant="medium" color="colors.brand.onSurface.light" style={[styles.menuItemText]}>{item.label}</Typography>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleMenu}
          style={[
            styles.mainButton,
            { backgroundColor: theme.colors.brand.surface.medium }
          ]}
        >
          <Person color={theme.colors.neutral.surface.lighter} width={32} height={32} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  container: {
    position: 'absolute',
    left: width / 2 - 30, // Center horizontally (width of button is 60)
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  menuItemContainer: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  menuItem: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    marginTop: 2,
  },
});
