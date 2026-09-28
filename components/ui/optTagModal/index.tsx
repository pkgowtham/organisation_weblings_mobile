import React, { useState } from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { RegularText } from "../typography";

interface ActionItem {
  label: string;
  onPress: () => void;
  textColor?: string;
  icon?: React.ReactNode;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  actions: ActionItem[];
  position?: { x: number; y: number };
}

const OptTagModal: React.FC<Props> = ({ visible, onClose, actions, position }) => {
  const screenWidth = Dimensions.get('window').width;

  const calculatePosition = () => {
    if (!position) return { top: 16, right: 16 };

    const modalWidth = 200;
    const rightSpace = screenWidth - position.x;

    return {
      top: position.y,
      right: rightSpace < modalWidth ? 16 : screenWidth - position.x,
    };
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.tagContainer, calculatePosition()]}>
          {actions.map((action, index) => (
            <React.Fragment key={action?.label}>
              <TouchableOpacity
                onPress={() => {
                  action.onPress();
                  onClose();
                }}
                style={styles.tagButton}
              >
                <RegularText
                  size={16}
                  color={action?.textColor || "colors.negative.onSurface.light"}
                >
                  {action?.label}
                </RegularText>
                {action?.icon &&
                  action?.icon
                }
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default OptTagModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  tagContainer: {
    position: 'absolute',
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
});