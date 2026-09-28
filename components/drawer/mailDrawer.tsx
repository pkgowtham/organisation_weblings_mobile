import { useTheme } from "@/context/CustomThemeContext";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Switch, TouchableOpacity, View, DeviceEventEmitter } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RegularText } from "../ui/typography";
import { Add, Archive, Delete, EmailOutline, Important, Info2, Send, TagIcon } from "@/svg_icons";
import AddTagModal from "../ui/addTagModal";
import { useStore } from "@/store";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useToast } from "@/context/ToastContext";
import BaseDrawer from "./baseDrawer";

const screenWidth = Dimensions.get("window").width;
const drawerWidth = screenWidth * 0.9;

interface MailDrawerProps {
    open: boolean;
    onClose: () => void;
    backgroundColor?: string;
    selectedLabel?: string;
    onLabelSelect: (label: string) => void;
}

const MailDrawer: React.FC<MailDrawerProps> = ({
    open,
    onClose,
    backgroundColor = "#fff",
    selectedLabel = "Inbox",
    onLabelSelect
}) => {
    const insets = useSafeAreaInsets();
    const translateX = useSharedValue(-drawerWidth);
    const { theme, isDark, toggleTheme } = useTheme();
    const styles = createStyles(theme, insets);

    const dispatch = useMiddlewareDispatch();
    const { store } = useStore();
    const { showToast } = useToast();

    const [addTagModal, setAddTagModal] = useState(false);

    useEffect(() => {
        translateX.value = open
            ? withTiming(0, { duration: 300 })
            : withTiming(-drawerWidth, { duration: 300 });
    }, [open]);

    const drawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    useEffect(() => {
        if (store.mailTag.isSuccessCreate) {
            showToast({
                type: 'success',
                iconType: 'checkmark',
                title: store.mailTag.dataCreate?.message
            })
            dispatch({
                type: 'MAIL_TAG_CREATE_API_CLEAR'
            })
        }
    }, [store.mailTag.isSuccessCreate])

    useEffect(() => {
        if (store.mailTag.isErrorCreate) {
            showToast({
                type: 'error',
                iconType: 'error',
                title: store.mailTag.errorCreate?.message || 'Mail tag creation unsuccessful'
            })
            dispatch({
                type: 'MAIL_TAG_CREATE_API_CLEAR'
            })
        }
    }, [store.mailTag.isErrorCreate])

    const addTag = (name: string, color: string) => {
        dispatch({
            type: "MAIL_TAG_CREATE_API_REQUEST",
            payload: {
                url: 'tag',
                method: 'POST',
                body: {
                    userId: "usertest",
                    name: name,
                    color: color
                }
            }
        })
    }

    const handleLabelPress = (label: string) => {
        onLabelSelect(label);
        onClose();
    }

    const mailItems = [
        {
            label: "Inbox",
            icon: <EmailOutline color={selectedLabel === "Inbox" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Inbox"),
        },
        {
            label: "Sent",
            icon: <Send color={selectedLabel === "Sent" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Sent"),
        },
        {
            label: "Trash",
            icon: <Delete color={selectedLabel === "Trash" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Trash"),
        },
    ];

    const otherItems = [
        {
            label: "Important",
            icon: <Info2 color={selectedLabel === "Important" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Important"),
        },
        {
            label: "Archives",
            icon: <Archive color={selectedLabel === "Archives" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Archives"),
        },
        {
            label: "Spam",
            icon: <Important color={selectedLabel === "Spam" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Spam"),
        },
    ];

    const tagItems = store.mailTag.dataGetList?.data?.map((tag: any) => ({
        label: tag.name,
        icon: <TagIcon color={tag.color} />,
        onPress: () => handleLabelPress(tag.name),
    })) || [];

    return (
        <BaseDrawer
            open={open}
            onClose={onClose}
            backgroundColor={backgroundColor}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                <View>
                    <RegularText
                        style={styles.headerText}
                        fontVariant="BL"
                        color="colors.brand.onSurface.light"
                    >
                        Mail
                    </RegularText>
                </View>

                <View style={styles.divider} />

                <View style={styles.utilButtons}>
                    {mailItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.onPress}
                            style={[
                                styles.utilButton,
                                selectedLabel === item.label && styles.activeButton
                            ]}
                        >
                            {item.icon}
                            <RegularText
                                fontVariant="BM"
                                color={selectedLabel === item.label ? "colors.brand.onSurface.light" : "colors.neutral.onSurface.light"}
                            >
                                {item.label}
                            </RegularText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.utilButtons}>
                    {otherItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.onPress}
                            style={[
                                styles.utilButton,
                                selectedLabel === item.label && styles.activeButton
                            ]}
                        >
                            {item.icon}
                            <RegularText
                                fontVariant="BM"
                                color={selectedLabel === item.label ? "colors.brand.onSurface.light" : "colors.neutral.onSurface.light"}
                            >
                                {item.label}
                            </RegularText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.tagHeader}>
                    <RegularText
                        style={styles.headerText}
                        fontVariant="BL"
                        color="colors.brand.onSurface.light"
                    >
                        Tag
                    </RegularText>
                    <TouchableOpacity onPress={() => setAddTagModal(true)}>
                        <Add
                            style={{ marginRight: 18 }}
                            width={28}
                            height={28}
                            viewBox="0 0 24 24"
                            color={theme.colors.neutral.surface.inverse}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.utilButtons}>
                    {tagItems.map((item: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.onPress}
                            style={[
                                styles.utilButton,
                                selectedLabel === item.label && styles.activeButton
                            ]}
                        >
                            {item.icon}
                            <RegularText
                                fontVariant="BM"
                                color={selectedLabel === item.label ? "colors.brand.onSurface.light" : "colors.neutral.onSurface.light"}
                            >
                                {item.label}
                            </RegularText>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.darkModeToggle}>
                    <RegularText fontVariant="BM" color="colors.neutral.onSurface.light">Turn on dark mode</RegularText>
                    <Switch
                        onValueChange={toggleTheme}
                        value={isDark}
                        trackColor={{ false: theme.colors.neutral.surface.dark, true: theme.colors.brand.surface.medium }}
                        thumbColor={isDark ? theme.colors.neutral.surface.inverse : theme.colors.neutral.surface.inverse}
                    />
                </View>

                <View style={styles.divider} />

                <TouchableOpacity
                    style={[styles.utilButton, { marginTop: 16 }]}
                    onPress={async () => {
                        await SecureStore.deleteItemAsync('authToken');
                        await SecureStore.deleteItemAsync('bulId');
                        dispatch({ type: "LOGOUT_CLEAR_REDUX_STORE" });
                        DeviceEventEmitter.emit('logout');
                    }}
                >
                    {/* Assuming you want to use the standard text color for logout since you haven't explicitly imported a LogOut icon */}
                    <RegularText fontVariant="BM" color="colors.neutral.onSurface.light">
                        Logout
                    </RegularText>
                </TouchableOpacity>
            </ScrollView>
            <AddTagModal
                visible={addTagModal}
                onClose={() => setAddTagModal(false)}
                save={addTag}
            />
        </BaseDrawer>
    );
};

const createStyles = (theme: any, insets: any) =>
    StyleSheet.create({
        drawer: {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: drawerWidth,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: theme.colors.neutral.surface.lighter,
            shadowColor: theme.colors.neutral.surface.inverse,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 2,
            zIndex: 10,
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.neutral.border.light,
            marginTop: 12
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 5,
        },
        tagHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
        },
        headerText: {
            marginLeft: 20,
            marginTop: 6
        },
        utilButtons: {
            paddingTop: 16,
        },
        utilButton: {
            height: 45,
            flexDirection: "row",
            alignItems: "center",
            gap: 18,
            marginHorizontal: 16,
            paddingHorizontal: 16,
            marginVertical: 8,
            backgroundColor: theme.colors.neutral.surface.lighter,
            borderRadius: 8,
            shadowColor: theme.colors.neutral.surface.inverse,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
        },
        activeButton: {
            backgroundColor: theme.colors.brand.surface.lighter,
        },
        darkModeToggle: {
            justifyContent: 'center',
            alignItems: 'flex-start',
            marginHorizontal: 16,
            marginVertical: 6,
            gap: 8
        }
    });

export default MailDrawer;