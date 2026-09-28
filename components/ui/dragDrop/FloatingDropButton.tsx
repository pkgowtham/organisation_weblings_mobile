import React from "react";
import { View, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { Typography } from "../typography";
import { CloseIcon } from "./icons";
import { FloatingPayload } from "./types";

export default function FloatingDropButton<T = any>({
  floatingPayload,
  floatingPos,
  panHandlers,
  themeColors,
  onClose,
}: {
  floatingPayload: FloatingPayload<T>;
  floatingPos: Animated.ValueXY;
  panHandlers: any;
  themeColors: any;
  onClose: () => void;
}) {
  return (
    <Animated.View
      {...panHandlers}
      style={[
        styles.floatingStackContainer,
        { transform: floatingPos.getTranslateTransform() },
      ]}
    >
      {floatingPayload.taskIds.length > 1 &&
        Array.from({
          length: Math.min(floatingPayload.taskIds.length - 1, 3),
        })
          .map((_, i) => (
            <View
              key={i}
              style={[
                styles.floatingStackLayer,
                {
                  top: (i + 1) * 4,
                  left: (i + 1) * -4,
                  borderWidth: 1,
                  borderColor: themeColors.neutral.border.dark,
                },
              ]}
            />
          ))
          .reverse()}

      <View
        style={[
          styles.floatingStackMain,
          {
            backgroundColor: themeColors.brand.surface.medium,
            borderColor: themeColors.neutral.surface.lighter,
          },
        ]}
      >
        <Typography fontVariant="LM" variant="bold" color="#ffffff">
          {floatingPayload.taskIds.length}
        </Typography>
      </View>

      {/* We need to use pointerEvents="box-none" on parent so it doesn't block touches, but panHandlers already captures. 
          To make the close button work inside a panResponder, we must stop event propagation or handle it externally. 
          Actually, we can just render the close button as a TouchableOpacity. PanResponder's onStartShouldSetPanResponder must return false for the close button. 
      */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onClose}
        style={styles.floatingCloseBadge}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <CloseIcon size={12} color="#ffffff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingStackContainer: {
    position: "absolute",
    zIndex: 9999,
  },
  floatingStackMain: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingStackLayer: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  floatingCloseBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#d32f2f",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ffffff",
    zIndex: 10,
  },
});
