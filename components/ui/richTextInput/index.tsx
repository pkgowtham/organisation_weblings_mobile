// index.tsx
import React, { forwardRef, useRef, useState, useCallback, useImperativeHandle } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { RegularText } from "../typography";
import {
    Bold, FormatAlignCenter, FormatAlignJustify, FormatAlignLeft, FormatAlignRight,
    FormatListBulleted, FormatListNumbered, IndentLeft, IndentRight,
    Italic, Redo, Spacing, Strikethrough, Underline, Undo
} from "@/svg_icons";
import LexicalEditorDom from "../lexicalEditor/LexicalEditor.dom";

export interface RichTextEditorProps {
    label?: string;
    helperText?: string;
    error?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    optional?: boolean;
    placeholder?: string;
    value?: string;
    onChangeText?: (value: string) => void;
    onFormatPress?: (format: string) => void;
    style?: any;
    minHeight?: number;
}

export interface RichTextEditorRef {
    setContentHTML: (html: string) => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
    (
        {
            label,
            helperText,
            error = false,
            disabled,
            placeholder,
            readOnly,
            optional = false,
            value = "",
            onChangeText,
            onFormatPress,
            style,
            minHeight = 150
        },
        ref
    ) => {
        const { theme } = useTheme();
        const styles = createStyles(theme, minHeight);
        const [focused, setFocused] = useState(false);
        const [actionTrigger, setActionTrigger] = useState<{ action: string; timestamp: number }>();
        const [internalValue, setInternalValue] = useState(value);

        // Expose a way for parent to update content
        useImperativeHandle(ref, () => ({
            setContentHTML: (html: string) => {
                setInternalValue(html);
                // Note: The DOM component uses initialHTML, so forcing an update requires 
                // re-rendering or a more complex sync mechanism. For simplicity, we just 
                // trust that if it's changing drastically, a re-mount might happen or the 
                // user is typing. If needed, we can expand actionTrigger to handle SET_HTML.
            }
        }));

        const handleToolbarAction = (action: string) => {
            if (disabled || readOnly) return;

            setActionTrigger({ action, timestamp: Date.now() });

            if (onFormatPress) {
                onFormatPress(action);
            }
        };

        const handleChange = (html: string) => {
            if (onChangeText) {
                onChangeText(html);
            }
        };

        const themeColors = {
            background: theme.colors.neutral.surface.lighter,
            text: theme.colors.neutral.onSurface.light,
            placeholder: theme.colors.neutral.onSurface.medium,
            border: theme.colors.neutral.border.light,
            primary: theme.colors.brand.surface.light
        };

        return (
            <View style={[styles.container, style]}>
                {label && (
                    <RegularText fontVariant="LS" color="colors.neutral.onSurface.light" style={styles.label}>
                        {label}
                        {optional && (
                            <RegularText fontVariant="BXS" color="#8D8D8D" style={styles.optional}>
                                {" "}
                                (Optional)
                            </RegularText>
                        )}
                    </RegularText>
                )}

                <View
                    style={[
                        styles.editorWrapper,
                        {
                            borderColor: error
                                ? theme.colors.negative.border.medium
                                : focused
                                    ? theme.colors.brand.surface.light
                                    : theme.colors.neutral.border.light,
                        },
                        disabled && {
                            backgroundColor: theme.colors.neutral.surface.disabled,
                            borderColor: theme.colors.neutral.border.disabled,
                        },
                    ]}
                >
                    {/* Rich Text Toolbar */}
                    {!readOnly && (
                        <View style={styles.toolbarContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('undo')}>
                                    <Undo color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('redo')}>
                                    <Redo color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('bold')}>
                                    <Bold color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('italic')}>
                                    <Italic color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('underline')}>
                                    <Underline color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('strikethrough')}>
                                    <Strikethrough color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('left')}>
                                    <FormatAlignLeft color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('center')}>
                                    <FormatAlignCenter color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('right')}>
                                    <FormatAlignRight color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolbarIcon} onPress={() => handleToolbarAction('justify')}>
                                    <FormatAlignJustify color={theme.colors.neutral.onSurface.medium} />
                                </TouchableOpacity>

                                {/* No explicit list commands exposed to dispatchCommand easily without more complex setup, but leaving buttons connected for now */}
                            </ScrollView>
                        </View>
                    )}

                    {/* Rich Text Editor - WebView DOM Component */}
                    <View style={styles.editorContainer}>
                        <LexicalEditorDom
                            initialHTML={internalValue}
                            placeholder={placeholder}
                            onChangeHTML={handleChange}
                            readOnly={disabled || readOnly}
                            minHeight={minHeight}
                            themeColors={themeColors}
                            actionTrigger={actionTrigger}
                        />
                    </View>
                </View>

                {/* Helper Text */}
                {helperText && (
                    <RegularText
                        fontVariant="BXS"
                        color={error ? "colors.negative.onSurface.light" : "colors.neutral.onSurface.medium"}
                        style={styles.helperText}
                    >
                        {helperText}
                    </RegularText>
                )}
            </View>
        );
    }
);

const createStyles = (theme: any, minHeight: number) =>
    StyleSheet.create({
        container: {
            width: "100%",
            flexDirection: "column",
            marginBottom: 24,
        },
        label: {
            marginBottom: 6,
        },
        optional: {
            color: theme.colors.neutral.onSurface.dark,
        },
        editorWrapper: {
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: theme.colors.neutral.surface.lighter,
            overflow: 'hidden',
        },
        toolbarContainer: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.neutral.border.light,
            backgroundColor: 'transparent',
            minHeight: 44,
        },
        toolbarContent: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center'
        },
        toolbarIcon: {
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 4
        },
        divider: {
            width: 1,
            height: 24,
            backgroundColor: theme.colors.neutral.border.light,
            marginHorizontal: 8,
        },
        editorContainer: {
            flex: 1,
            minHeight: minHeight,
        },
        helperText: {
            marginTop: 4,
        },
    });

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;