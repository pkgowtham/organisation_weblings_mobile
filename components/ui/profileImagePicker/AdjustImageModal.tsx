import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';
import { Close, ZoomIn, ZoomOut } from '@/svg_icons';
import CustomButton from '@/components/ui/button';
import { Image } from 'expo-image';

interface AdjustImageModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string | null;
  onSave: () => void;
}

const AdjustImageModal: React.FC<AdjustImageModalProps> = ({
  visible,
  onClose,
  imageUri,
  onSave,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const scale = useRef(new Animated.Value(1)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const [currentScale, setCurrentScale] = useState(1);

  const handleZoomIn = () => {
    let newScale = currentScale + 0.2;
    if (newScale > 3) newScale = 3;
    setCurrentScale(newScale);
    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
  };

  const handleZoomOut = () => {
    let newScale = currentScale - 0.2;
    if (newScale < 1) newScale = 1;
    setCurrentScale(newScale);
    Animated.spring(scale, {
      toValue: newScale,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(1);
      setCurrentScale(1);
      pan.setValue({ x: 0, y: 0 });
      pan.flattenOffset();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.dark">
                  Change profile
                </Typography>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Close color={theme.colors.neutral.onSurface.dark} />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Content */}
              <View style={styles.body}>
                <Typography fontVariant="BM" variant="medium" color="colors.neutral.onSurface.dark" style={styles.subtitle}>
                  Adjust the Image
                </Typography>

                <View style={styles.imageContainer}>
                  {imageUri && (
                    <Animated.View
                      {...panResponder.panHandlers}
                      style={[
                        styles.animatedImageWrapper,
                        {
                          transform: [
                            { translateX: pan.x },
                            { translateY: pan.y },
                            { scale: scale }
                          ]
                        }
                      ]}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        contentFit="cover"
                      />
                    </Animated.View>
                  )}
                  {/* Overlay for circle crop preview */}
                  <View style={styles.circleCutoutOverlay} pointerEvents="none">
                    <View style={styles.circleCutout} />
                  </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                  <TouchableOpacity style={styles.iconBtn} onPress={handleZoomOut}>
                    <ZoomOut color={theme.colors.neutral.onSurface.dark} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={handleZoomIn}>
                    <ZoomIn color={theme.colors.neutral.onSurface.dark} />
                  </TouchableOpacity>
                </View>

                {/* Save Button */}
                <View style={styles.saveContainer}>
                  <CustomButton
                    title="Save changes"
                    variant="primary"
                    onPress={onSave}
                    size="large"
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      width: '90%',
      maxWidth: 450,
      shadowColor: theme.colors.neutral.surface.inverse,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.s400,
    },
    closeBtn: {
      padding: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
    },
    body: {
      padding: theme.spacing.s400,
    },
    subtitle: {
      marginBottom: theme.spacing.s300,
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1.5,
      backgroundColor: theme.colors.neutral.surface.medium,
      borderRadius: theme.borderRadius.b200,
      overflow: 'hidden',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    animatedImageWrapper: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    circleCutoutOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    circleCutout: {
      width: 180,
      height: 180,
      borderRadius: 90,
      borderWidth: 2,
      borderColor: theme.colors.brand.border.light,
      backgroundColor: 'transparent',
      // To create the mask effect, we can use a box-shadow that fills the rest of the view,
      // but the overlay is already giving some darkness.
      // In React Native, true masking requires MaskedView, but this visual approximation works for now.
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingVertical: theme.spacing.s300,
      gap: theme.spacing.s300,
    },
    iconBtn: {
      padding: 4,
    },
    saveContainer: {
      marginTop: theme.spacing.s200,
      width: '100%',
    },
  });

export default AdjustImageModal;
