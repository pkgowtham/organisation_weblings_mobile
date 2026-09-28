import React, { ReactNode } from 'react';
import { StyleSheet, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Image } from 'expo-image';
import { useTheme } from '@/context/CustomThemeContext';
import SvgArrowBackIos from '@/svg_icons/ArrowBackIos';
import { router } from 'expo-router';

interface AuthScreenLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export default function AuthScreenLayout({
  children,
  showBackButton = false,
  onBackPress,
  containerStyle,
  contentContainerStyle,
}: AuthScreenLayoutProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          bottomOffset={62}
          contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {showBackButton ? (
            <View style={styles.headerIconContainer}>
              <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <SvgArrowBackIos color={theme.colors.neutral.onSurface.light} />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <Image
                  source={require('@/assets/images/weblings-logo.png')}
                  style={{ width: 60, height: 60 }}
                  contentFit="contain"
                />
                <Image
                  source={require('@/assets/images/weblings-text.png')}
                  style={{ width: 95, height: 39 }}
                  contentFit="contain"
                />
              </View>
            </View>
          ) : (
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/weblings-logo.png')}
                style={{ width: 60, height: 60 }}
                contentFit="contain"
              />
              <Image
                source={require('@/assets/images/weblings-text.png')}
                style={{ width: 95, height: 39 }}
                contentFit="contain"
              />
            </View>
          )}

          {children}
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
      paddingHorizontal: 16,
    },
    headerIconContainer: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
