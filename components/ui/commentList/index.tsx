import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/context/CustomThemeContext";
import CommentItem from "../commentItem";
import CommentInput from "../commentInput";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { Typography } from "@/components/ui/typography";
import Avatar from "@/components/ui/avatar";

export interface CommentListProps {
    taskId: string;
    comments: any[];
    onLoadMore?: () => void;
    hasMore?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ taskId, comments, onLoadMore, hasMore }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const dispatch = useMiddlewareDispatch();

    const [isReplyingId, setIsReplyingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Creates a new top-level comment
    const handleCreateComment = async (content: string, files: any[]) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("taskId", taskId);
            formData.append("content", content);

            files.forEach((file) => {
                formData.append("files", {
                    uri: file.uri,
                    type: file.mimeType || "application/octet-stream",
                    name: file.name,
                } as any);
            });

            await dispatch({
                type: "STREAMLINE_TASK_COMMENT_CREATE_API_REQUEST",
                payload: {
                    url: "comment",
                    method: "POST",
                    body: formData,
                    isMultipart: true,
                },
                clear: true,
            });

            // Re-fetch comments list after successful creation
            dispatch({
                type: "STREAMLINE_TASK_COMMENT_GETLIST_API_REQUEST",
                payload: {
                    url: "comment",
                    method: "GET",
                    query: { taskId, page: 1, limit: 15 },
                },
            });
        } catch (error) {
            console.log("Error creating comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Replies to an existing comment
    const handleReplyComment = async (parentId: string, content: string, files: any[]) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("taskId", taskId);
            formData.append("content", content);
            formData.append("parentId", parentId); // Assuming parentId is the field

            files.forEach((file) => {
                formData.append("files", {
                    uri: file.uri,
                    type: file.mimeType || "application/octet-stream",
                    name: file.name,
                } as any);
            });

            await dispatch({
                type: "STREAMLINE_TASK_COMMENT_REPLY_API_REQUEST",
                payload: {
                    url: "comment/reply",
                    method: "POST",
                    body: formData,
                    isMultipart: true,
                },
                clear: true,
            });

            // Re-fetch comments list after successful reply
            dispatch({
                type: "STREAMLINE_TASK_COMMENT_GETLIST_API_REQUEST",
                payload: {
                    url: "comment",
                    method: "GET",
                    query: { taskId, page: 1, limit: 15 },
                },
            });
        } catch (error) {
            console.log("Error replying to comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollWrapper}>
            <View style={styles.container}>

                {/* Main Comment Input */}
                <View style={styles.mainInputHeader}>
                    <Avatar name="Me" size={"md"} />
                    <View style={styles.mainInputWrapper}>
                        <CommentInput
                            taskId={taskId}
                            onSubmit={handleCreateComment}
                            placeholder="Add a comment, use @ to mention"
                            isSubmitting={isSubmitting}
                        />
                    </View>
                </View>

                {/* Comment Tree */}
                <View style={styles.commentsList}>
                    {comments && comments.length > 0 ? (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                taskId={taskId}
                                onReplySubmit={handleReplyComment}
                                isReplyingId={isReplyingId}
                                setIsReplyingId={setIsReplyingId}
                            />
                        ))
                    ) : (
                        <Typography fontVariant="BXS" color="colors.neutral.onSurface.disabled">
                            No comments yet.
                        </Typography>
                    )}
                </View>

                {hasMore && onLoadMore && (
                    <TouchableOpacity onPress={onLoadMore} style={{ marginTop: 12, alignItems: 'center', padding: 8 }}>
                        <Typography fontVariant="BS" variant="semibold" color="colors.brand.surface.medium">
                            Load more comments
                        </Typography>
                    </TouchableOpacity>
                )}

            </View>
        </ScrollView>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        scrollWrapper: {
            flex: 1,
            width: '100%',
        },
        container: {
            flex: 1,
            // Ensure minimum width so it doesn't squish when nested deeply
            minWidth: 300,
            paddingBottom: 24,
        },
        mainInputHeader: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 16,
        },
        mainInputWrapper: {
            flex: 1,
            marginLeft: 8,
        },
        commentsList: {
            flex: 1,
        }
    });

export default CommentList;
