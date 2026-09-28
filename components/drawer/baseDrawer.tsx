import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get("window").width;
const drawerWidth = screenWidth * 0.9;

interface BaseDrawerProps {
  open: boolean;
  onClose: () => void;
  backgroundColor?: string;
  children: React.ReactNode;
}

const BaseDrawer: React.FC<BaseDrawerProps> = ({
  open,
  onClose,
  backgroundColor = "#fff",
  children
}) => {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(-drawerWidth);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  useEffect(() => {
    if (open) {
      translateX.value = withTiming(0, { duration: 300 });
    } else {
      translateX.value = withTiming(-drawerWidth, { duration: 300 });
    }
  }, [open]);

  const styles = StyleSheet.create({
    drawer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: drawerWidth,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      backgroundColor,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
      zIndex: 10,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.3)",
      zIndex: 5,
    },
  });

  return (
    <>
      {open && (
        <Pressable 
          style={styles.backdrop} 
          onPress={onClose} 
        />
      )}
      <Animated.View style={[styles.drawer, animatedStyle]}>
        {children}
      </Animated.View>
    </>
  );
};

export default BaseDrawer;