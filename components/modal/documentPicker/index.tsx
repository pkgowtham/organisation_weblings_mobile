import React, { useEffect, useRef } from 'react';
import { StyleSheet, Modal, TouchableOpacity, Animated, Easing } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SemiBoldText } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';

interface DocumentPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (documents: any[]) => void;
    multiple?: boolean;
}

type FileResult = DocumentPicker.DocumentPickerAsset | DocumentPicker.DocumentPickerSuccessResult;

const DocumentPickerModal: React.FC<DocumentPickerModalProps> = ({ visible, onClose, onSelect, multiple }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(300)).current;

    const { theme } = useTheme();
    const styles = createStyles(theme)

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 300,
                    duration: 250,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const pickDocument = async () => {
        onClose();

        setTimeout(async () => {
            try {
                const result = await DocumentPicker.getDocumentAsync({
                    type: '*/*',
                    multiple,
                    copyToCacheDirectory: true,
                });

                if (multiple) {
                    if (!result.canceled && result.assets) {
                        onSelect(result.assets);
                    }
                } else {
                    if (result.type === "success") {
                        onSelect([result]);
                    }
                }
            } catch (e) {
                console.warn("Document picker error:", e);
            }
        }, 300);
    };

    const pickFromCloud = async () => {
        onClose();

        setTimeout(async () => {
            try {
                const result = await DocumentPicker.getDocumentAsync({
                    type: '*/*',
                    multiple,
                    copyToCacheDirectory: true,
                });

                if (multiple) {
                    if (!result.canceled && result.assets) {
                        onSelect(result.assets);
                    }
                } else {
                    if (result.type === "success") {
                        onSelect([result]);
                    }
                }
            } catch (e) {
                console.warn("Cloud picker error:", e);
            }
        }, 300);
    };


    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View
                style={[
                    styles.overlay,
                    { opacity: fadeAnim }
                ]}
            >
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.modal,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <TouchableOpacity style={styles.option} onPress={pickDocument}>
                        <SemiBoldText size={16} color='colors.neutral.onSurface.light'>Choose from Device</SemiBoldText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.option} onPress={pickFromCloud}>
                        <SemiBoldText size={16} color='colors.neutral.onSurface.light'>Choose from Cloud</SemiBoldText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.option, styles.cancel]} onPress={onClose}>
                        <SemiBoldText size={16} color='colors.negative.onSurface.light'>Cancel</SemiBoldText>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modal: {
        backgroundColor: theme.colors.neutral.surface.lighter,
        paddingVertical: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.neutral.border.light
    },
    option: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cancel: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral.border.light,
        marginTop: 10,
    },
});

export default DocumentPickerModal;