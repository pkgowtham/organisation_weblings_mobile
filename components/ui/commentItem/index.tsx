import React, { useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import { Typography } from "@/components/ui/typography";
import Avatar from "@/components/ui/avatar";
import LexicalEditorDom from "../lexicalEditor/LexicalEditor.dom";
import CommentInput from "../commentInput";
import { Reply, AttachFile, Image as ImageIcon, ReplyArrowRight } from "@/svg_icons";
import { Image } from "expo-image";

export interface CommentProps {
    comment: any;
    taskId: string;
    level?: number;
    onReplySubmit: (parentId: string, content: string, files: any[]) => void;
    isReplyingId?: string | null;
    setIsReplyingId: (id: string | null) => void;
}

const formatCommentTime = (dateString: string) => {
    if (!dateString) return "";

    // Normalize date string to fix backend returning a mix of local time and UTC-formatted local time
    const normalizedDate = dateString.replace('T', ' ').replace('Z', '');
    const date = new Date(normalizedDate);
    const now = new Date();

    let diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) diffMs = 0; // Fallback for future dates

    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
};

const CommentItem: React.FC<CommentProps> = ({
    comment,
    taskId,
    level = 0,
    onReplySubmit,
    isReplyingId,
    setIsReplyingId,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme, level);

    const isReplying = isReplyingId === comment.id;

    const handleReplyClick = () => {
        setIsReplyingId(comment.id);
    };

    const handleCancelReply = () => {
        setIsReplyingId(null);
    };

    const handleReplySubmit = (content: string, files: any[]) => {
        onReplySubmit(comment.id, content, files);
        setIsReplyingId(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.commentHeader}>
                <Avatar
                    source={comment.author?.dP ? { uri: comment.author.dP } : undefined}
                    name={comment.author?.displayName || "User"}
                    size={"md"}
                />
                <View style={styles.headerText}>
                    <Typography fontVariant="BS" color="colors.neutral.onSurface.dark" variant="bold">
                        {comment.author?.displayName || "Unknown"}
                    </Typography>
                    <Typography fontVariant="BXS" color="colors.neutral.onSurface.disabled" style={{ marginLeft: 6 }}>
                        • {formatCommentTime(comment.createdAt)}
                    </Typography>
                </View>
            </View>

            <View style={styles.contentContainer}>
                {comment.content ? (
                    <View pointerEvents="none" style={{ minHeight: 40, width: '100%' }}>
                        <LexicalEditorDom
                            initialHTML={comment.content}
                            readOnly={true}
                            minHeight={40}
                            themeColors={{
                                background: 'transparent',
                                text: theme.colors.neutral.onSurface.dark,
                                placeholder: 'transparent',
                                border: 'transparent',
                                primary: theme.colors.brand.surface.light
                            }}
                        />
                    </View>
                ) : null}

                {comment.attachments && comment.attachments.length > 0 && (
                    <View style={styles.attachmentsContainer}>
                        {comment.attachments.map((file: any) => {
                            const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].some(ext => file.filename?.toLowerCase().endsWith(ext));
                            return (
                                <View key={file.id} style={styles.attachmentThumbnail}>
                                    {isImage ? (
                                        <>
                                            <View style={{ position: 'absolute' }}>
                                                <ImageIcon width={24} height={24} color={theme.colors.neutral.onSurface.disabled} />
                                            </View>
                                            <Image
                                                source={{ uri: file.fileUrl || file.uri }}
                                                style={{ width: 100, height: 100, borderRadius: theme.borderRadius.sm }}
                                                contentFit="cover"
                                            />
                                        </>
                                    ) : (
                                        <View style={{ justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                                            <AttachFile width={24} height={24} color={theme.colors.neutral.onSurface.medium} />
                                            <Typography fontVariant="BXS" variant="bold" color="colors.brand.surface.medium" style={{ marginTop: 2, textTransform: 'uppercase', fontSize: 10 }}>
                                                {file.filename?.split('.').pop()}
                                            </Typography>
                                            <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark" numberOfLines={1} style={{ marginTop: 2, textAlign: 'center', fontSize: 10 }}>
                                                {file.filename}
                                            </Typography>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={handleReplyClick} style={styles.replyButton}>
                        <ReplyArrowRight color={theme.colors.neutral.onSurface.medium} width={24} height={24} />
                        <Typography fontVariant="BXS" color="colors.brand.surface.medium" variant="semibold">
                            Reply
                        </Typography>
                    </TouchableOpacity>
                </View>

                {isReplying && (
                    <View style={styles.replyBox}>
                        <CommentInput
                            taskId={taskId}
                            parentId={comment.id}
                            onCancel={handleCancelReply}
                            onSubmit={handleReplySubmit}
                            placeholder="Write a reply..."
                        />
                    </View>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                        {comment.replies.map((reply: any) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                taskId={taskId}
                                level={level + 1}
                                onReplySubmit={onReplySubmit}
                                isReplyingId={isReplyingId}
                                setIsReplyingId={setIsReplyingId}
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

const createStyles = (theme: any, level: number) =>
    StyleSheet.create({
        container: {
            marginVertical: 6,
            // Add left margin for nested comments
            marginLeft: level === 0 ? 0 : 20,
            borderLeftWidth: level === 0 ? 0 : 1,
            borderLeftColor: level === 0 ? 'transparent' : theme.colors.neutral.border.light,
            paddingLeft: level === 0 ? 0 : 12,
        },
        commentHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        headerText: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 8,
        },
        contentContainer: {
            marginLeft: 40, // align with text next to avatar
        },
        attachmentsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 6,
        },
        attachmentThumbnail: {
            width: 100,
            height: 100,
            borderRadius: theme.borderRadius.sm,
            backgroundColor: theme.colors.neutral.surface.medium,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
            marginBottom: 8,
        },
        actionsContainer: {
            flexDirection: 'row',
            marginTop: 4,
        },
        replyButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        replyBox: {
            marginTop: 8,
            marginBottom: 8,
        },
        repliesContainer: {
            marginTop: 8,
        }
    });

export default CommentItem;
