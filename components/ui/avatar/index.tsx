import React from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ImageSourcePropType,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SemiBoldText } from '../typography';
import { useTheme } from '@/context/CustomThemeContext';
import { Image } from 'expo-image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarVariant = 'circular' | 'rounded' | 'square';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  badge?: boolean | string | number;
  badgeColor?: string;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  icon?: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  onEditPress?: () => void;
  editIcon?: keyof typeof Ionicons.glyphMap;
  editIconColor?: string;
  editIconBackgroundColor?: string;
  editIconPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showEditButton?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  variant = 'circular',
  badge,
  badgeColor = '#FF3B30',
  badgePosition = 'top-right',
  icon,
  backgroundColor,
  textColor = '#FFFFFF',
  style,
  imageStyle,
  textStyle,
  onPress,
  onEditPress,
  editIcon = 'create-outline',
  editIconColor = '#FFFFFF',
  editIconBackgroundColor = '#007AFF',
  editIconPosition = 'bottom-right',
  showEditButton = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const avatarBackgroundColor = backgroundColor ?? theme.colors.brand.surface.lighter;
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const getInitials = () => {
    if (!name) return '';
    const names = name.trim().split(' ').filter(n => n && n.length > 0);
    if (names.length === 0) return '';
    if (names.length === 1) {
      return (names[0]?.[0] || '').toUpperCase();
    }
    return ((names[0]?.[0] || '') + (names[1]?.[0] || '')).toUpperCase();
  };

  const getPositionStyle = (position: string) => {
    const positionMap = {
      'top-right': { top: 0, right: 0 },
      'top-left': { top: 0, left: 0 },
      'bottom-right': { bottom: 0, right: 0 },
      'bottom-left': { bottom: 0, left: 0 },
    };
    return positionMap[position as keyof typeof positionMap];
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  const getEditButtonSize = () => {
    return sizeMap[size] / 3;
  };

  return (
    <Wrapper
      style={[styles.wrapper, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.container,
        {
          width: sizeMap[size],
          height: sizeMap[size],
          borderRadius: variant === 'circular'
            ? sizeMap[size] / 2
            : variant === 'rounded'
              ? sizeMap[size] / 4
              : 0,
          backgroundColor: avatarBackgroundColor,
        },
      ]}>
        {source && typeof source === 'object' && 'uri' in source && source.uri ? (
          <Image
            source={source}
            style={[
              styles.image,
              {
                borderRadius: variant === 'circular'
                  ? sizeMap[size] / 2
                  : variant === 'rounded'
                    ? sizeMap[size] / 4
                    : 0,
              },
              imageStyle,
            ]}
          />
        ) : icon ? (
          <Ionicons
            name={icon}
            size={sizeMap[size] / 2}
            color={textColor}
          />
        ) : (
          <SemiBoldText gradient style={[
            {
              fontSize: sizeMap[size] / 2.5,
            },
            textStyle,
          ]}>
            {getInitials()}
          </SemiBoldText>
        )}
      </View>

      {badge && (
        <View style={[
          styles.badge,
          getPositionStyle(badgePosition),
          typeof badge === 'string' || typeof badge === 'number'
            ? styles.badgeWithContent
            : styles.dotBadge,
          { backgroundColor: badgeColor },
        ]}>
          {typeof badge === 'string' || typeof badge === 'number' ? (
            <SemiBoldText color='colors.neutral.surface.lighter' style={styles.badgeText}>{badge}</SemiBoldText>
          ) : null}
        </View>
      )}

      {showEditButton && (
        <TouchableOpacity
          onPress={onEditPress}
          style={[
            styles.editButton,
            getPositionStyle(editIconPosition),
            {
              width: getEditButtonSize(),
              height: getEditButtonSize(),
              borderRadius: getEditButtonSize() / 2,
              backgroundColor: editIconBackgroundColor,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={editIcon}
            size={getEditButtonSize() / 1.8}
            color={editIconColor}
          />
        </TouchableOpacity>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  badgeWithContent: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 12,
  },
  editButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default Avatar;