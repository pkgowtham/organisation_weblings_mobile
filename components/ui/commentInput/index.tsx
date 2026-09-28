import React, { useRef, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "@/components/ui/typography";
import Button from "@/components/ui/button";
import {
    Bold, FormatAlignCenter, FormatAlignJustify, FormatAlignLeft,
    FormatAlignRight, FormatListBulleted, FormatListNumbered,
    Italic, Underline, Strikethrough, AttachFile, Undo, Redo
} from "@/svg_icons";
import * as DocumentPicker from "expo-document-picker";
import LexicalEditorDom from "../lexicalEditor/LexicalEditor.dom";

export interface CommentInputProps {
    taskId: string;
    parentId?: string; // If it's a reply
    onCancel?: () => void;
    onSubmit: (content: string, files: any[]) => void;
    placeholder?: string;
    isSubmitting?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({
    taskId,
    parentId,
    onCancel,
    onSubmit,
    placeholder = "Add a comment...",
    isSubmitting = false,
}) => {
    const { theme } = useTheme();
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<any[]>([]);
    const [actionTrigger, setActionTrigger] = useState<{ action: string; timestamp: number }>();

    const styles = createStyles(theme);

    const handleToolbarAction = (action: string) => {
        setActionTrigger({ action, timestamp: Date.now() });
    };

    const handleChange = useCallback((html: string) => {
        setContent(html);
    }, []);

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                multiple: true,
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets) {
                setFiles(prev => [...prev, ...result.assets]);
            }
        } catch (err) {
            console.log("Error picking document:", err);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const submitComment = () => {
        if (!content || content.trim() === "") return;
        onSubmit(content, files);
        // Reset after submit is handled by parent unmounting, 
        // or we can manually clear if it's the main comment box.
        setContent("");
        setFiles([]);
        // Sending clear via initialHTML is possible, but currently we reset via parent state usually
    };

    const themeColors = {
        background: theme.colors.neutral.surface.lighter,
        text: theme.colors.neutral.onSurface.light,
        placeholder: theme.colors.neutral.onSurface.medium,
        border: theme.colors.neutral.border.light,
        primary: theme.colors.brand.surface.light
    };

    return (
        <View style={styles.container}>
            <View style={styles.editorWrapper}>
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

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.toolbarIcon} onPress={handlePickFile}>
                            <AttachFile color={theme.colors.neutral.onSurface.medium} />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View style={styles.editorContainer}>
                    <LexicalEditorDom
                        initialHTML={content}
                        placeholder={placeholder}
                        onChangeHTML={handleChange}
                        minHeight={80}
                        themeColors={themeColors}
                        actionTrigger={actionTrigger}
                    />
                </View>

                {files.length > 0 && (
                    <View style={styles.filesContainer}>
                        {files.map((file, index) => (
                            <View key={index} style={styles.filePill}>
                                <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" numberOfLines={1} style={{ flexShrink: 1 }}>
                                    {file.name}
                                </Typography>
                                <TouchableOpacity onPress={() => handleRemoveFile(index)} style={{ marginLeft: 8 }}>
                                    <Typography fontVariant="BXS" color="colors.negative.onSurface.light">X</Typography>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.footerContainer}>
                    {onCancel && (
                        <Button
                            title="Cancel"
                            variant="text"
                            size="small"
                            onPress={onCancel}
                            buttonStyle={styles.cancelBtn}
                        />
                    )}
                    <Button
                        title={parentId ? "Reply" : "Comment"}
                        variant="primary"
                        size="small"
                        onPress={submitComment}
                        loading={isSubmitting}
                        disabled={content.trim() === ""}
                    />
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            width: "100%",
            marginVertical: 8,
        },
        editorWrapper: {
            borderWidth: 1,
            borderColor: theme.colors.brand.surface.medium,
            borderRadius: 8,
            backgroundColor: theme.colors.neutral.surface.lighter,
            overflow: 'hidden',
        },
        toolbarContainer: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.neutral.border.light,
            backgroundColor: 'transparent',
            minHeight: 40,
        },
        toolbarContent: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
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
            height: 20,
            backgroundColor: theme.colors.neutral.border.light,
            marginHorizontal: 8,
        },
        editorContainer: {
            minHeight: 80,
            width: '100%'
        },
        filesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 8,
            borderTopWidth: 1,
            borderTopColor: theme.colors.neutral.border.light,
        },
        filePill: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.neutral.surface.light,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 16,
            marginRight: 8,
            marginBottom: 8,
        },
        footerContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: 8,
            borderTopWidth: 1,
            borderTopColor: theme.colors.neutral.border.light,
        },
        cancelBtn: {
            marginRight: 8,
        }
    });

export default CommentInput;
