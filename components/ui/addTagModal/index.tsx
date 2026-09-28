import React, { useState } from "react";
import { Modal, View, StyleSheet, TouchableOpacity } from "react-native";
import CustomButton from "@/components/ui/button";
import {
    RegularText,
    SemiBoldText,
} from "@/components/ui/typography";
import { Close } from "@/svg_icons";
import { useTheme } from "@/context/CustomThemeContext";
import Input from "../textInput";

interface AddTagModalProps {
    visible: boolean;
    onClose: () => void;
    save: (name: string, color: string) => void;
}

const AddTagModal: React.FC<AddTagModalProps> = ({
    visible,
    onClose,
    save,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    // Add state for selected color
    const [selectedColor, setSelectedColor] = useState<string>('#ef4444');
    const [tagName, setTagName] = useState<string>('');

    // Define available colors
    const tagColors = [
        theme.colors.negative.surface.medium,
        theme.colors.positive.surface.medium,
        theme.colors.brand.surface.medium,
        theme.colors.warning.surface.medium,
        theme.colors.negative.surface.light,
        theme.colors.positive.surface.light,
        theme.colors.info.surface.medium,
    ];

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.content}>
                        <SemiBoldText fontVariant="LM" color="colors.brand.onSurface.light">Add Tag</SemiBoldText>
                        <TouchableOpacity onPress={() => { onClose() }}>
                            <Close color={theme.colors.neutral.onSurface.dark} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View>
                        <Input
                            label="Tag Name"
                            placeholder="Enter tag name"
                            value={tagName}
                            onChangeText={setTagName}
                        />
                    </View>

                    <View style={styles.colorSection}>
                        <RegularText fontVariant="LS" color="colors.neutral.onSurface.light" style={styles.colorLabel}>
                            Tag Color
                        </RegularText>
                        <View style={styles.colorPalette}>
                            {tagColors.map((color) => {
                                const isSelected = selectedColor === color;

                                return (
                                    <TouchableOpacity
                                        key={color}
                                        onPress={() => setSelectedColor(color)}
                                        activeOpacity={0.7}
                                        style={styles.colorWrapper}
                                    >
                                        <View
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color },
                                            ]}
                                        />
                                        {isSelected && (
                                            <View
                                                style={[
                                                    styles.colorRing,
                                                    { borderColor: color },
                                                ]}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                    </View>

                    <View style={styles.button}>
                        <CustomButton
                            variant="disabled"
                            size="small"
                            title="Cancel"
                            onPress={() => { onClose() }}
                            buttonStyle={styles.saveButton} />
                        <CustomButton
                            title="Save"
                            size="small"
                            variant="primary"
                            onPress={() => {
                                save(tagName, selectedColor);
                                onClose();
                            }}
                            buttonStyle={styles.saveButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "#00000070",
            justifyContent: "center",
            paddingHorizontal: 16,
        },
        modal: {
            backgroundColor: theme.colors.neutral.surface.lighter,
            borderRadius: theme.borderRadius.b300,
            padding: 20,
            maxHeight: "90%",
        },
        content: {
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        saveButton: {
            marginTop: 20,
            width: "30%",
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.neutral.border.light,
            marginVertical: 14
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        colorSection: {
            marginTop: 20,
            marginBottom: 10,
        },
        colorLabel: {
            marginBottom: 12,
        },
        colorPalette: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },

        colorWrapper: {
            width: 36,
            height: 36,
            justifyContent: 'center',
            alignItems: 'center',
        },

        colorOption: {
            width: 32,
            height: 32,
            borderRadius: 20,
        },

        colorRing: {
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 26,
            borderWidth: 2,
        },

    });

export default AddTagModal;