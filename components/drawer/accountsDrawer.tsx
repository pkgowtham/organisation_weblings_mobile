import { useTheme } from "@/context/CustomThemeContext";
import React, { useEffect, useRef } from "react";
import { Dimensions, ScrollView, StyleSheet, Switch, TouchableOpacity, View, DeviceEventEmitter } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RegularText } from "../ui/typography";
import { Person, EmailOutline, TagIcon, Document } from "@/svg_icons";
import BaseDrawer from "./baseDrawer";
import { deleteItemAsync, getItemAsync } from "@/utils/secureStorage";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import Avatar from "@/components/ui/avatar";
import { usePathname } from "expo-router";
import { ArrowForwardIos } from "@/svg_icons";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";

const screenWidth = Dimensions.get("window").width;
const drawerWidth = screenWidth * 0.9;

interface AccountsDrawerProps {
    open: boolean;
    onClose: () => void;
    backgroundColor?: string;
    selectedLabel?: string;
    onLabelSelect: (label: string) => void;
}

const AccountsDrawer: React.FC<AccountsDrawerProps> = ({
    open,
    onClose,
    backgroundColor = "#fff",
    selectedLabel = "Org Details",
    onLabelSelect
}) => {
    const insets = useSafeAreaInsets();
    const { theme, isDark, toggleTheme } = useTheme();
    const dispatch = useMiddlewareDispatch();
    const { store } = useStore();
    const styles = createStyles(theme, insets);
    const pathname = usePathname();
    const { safePush } = useSafeNavigation();

    const profileData = store.profile.profileData;
    const isLoadingGetProfile = store.profile.isLoadingGetProfile;
    const isSuccessGetProfile = store.profile.isSuccessGetProfile;
    const isErrorGetProfile = store.profile.isErrorGetProfile;

    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!open) {
            hasFetchedRef.current = false;
            return;
        }
        if (
            open &&
            !profileData &&
            !isLoadingGetProfile &&
            !isSuccessGetProfile &&
            !isErrorGetProfile &&
            !hasFetchedRef.current
        ) {
            hasFetchedRef.current = true;
            (async () => {
                const id =
                    store.auth.userId ||
                    (await getItemAsync("authUserId")) ||
                    "";
                if (id) {
                    dispatch({
                        type: "GET_PROFILE_API_REQUEST",
                        payload: {
                            url: `orguser/getProfile?id=${id}`,
                            method: "GET",
                        },
                    });
                }
            })();
        }
    }, [open, profileData, isLoadingGetProfile, isSuccessGetProfile, isErrorGetProfile, store.auth.userId, dispatch]);

    const displayName =
        profileData?.displayName ||
        ([profileData?.firstName, profileData?.lastName].filter(Boolean).join(" ")) ||
        "User";

    const displayEmail =
        profileData?.primaryEmail ||
        store.auth?.email ||
        "";

    const avatarSource = profileData?.dP?.fileUrl
        ? { uri: profileData.dP.fileUrl }
        : undefined;

    const handleLabelPress = (label: string) => {
        onLabelSelect(label);
        onClose();
    }

    const accountItems = [
        {
            label: "Org Details",
            icon: <Person color={selectedLabel === "Org Details" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Org Details"),
        },
        {
            label: "Org setup",
            icon: <Document color={selectedLabel === "Org setup" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => {
                handleLabelPress("Org setup");
                safePush("/(protected)/(organisation)/orgSetup");
            },
        },
        {
            label: "Email List",
            icon: <EmailOutline color={selectedLabel === "Email List" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Email List"),
        },
        {
            label: "Settings",
            icon: <TagIcon color={selectedLabel === "Settings" ? theme.colors.brand.surface.medium : theme.colors.neutral.onSurface.medium} />,
            onPress: () => handleLabelPress("Settings"),
        },
    ];

    const handleLogout = async () => {
        await deleteItemAsync('authToken');
        await deleteItemAsync('authUserId');
        await deleteItemAsync('authEmail');
        await deleteItemAsync('orgAuthId');
        await deleteItemAsync('bulId');
        dispatch({ type: "LOGOUT_CLEAR_REDUX_STORE" });
        DeviceEventEmitter.emit('logout');
        onClose();
    };

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
                <TouchableOpacity
                    style={styles.profileContainer}
                    onPress={() => {
                        onClose();
                        safePush('/(protected)/(profile)/profile');
                    }}
                >
                    <Avatar size="lg" source={avatarSource} name={displayName} />
                    <View style={styles.profileInfo}>
                        <RegularText fontVariant="BM" variant="bold" color="colors.neutral.onSurface.dark" numberOfLines={1}>
                            {displayName}
                        </RegularText>
                        {displayEmail ? (
                            <RegularText fontVariant="BS" color="colors.neutral.onSurface.medium" numberOfLines={1}>
                                {displayEmail}
                            </RegularText>
                        ) : null}
                    </View>
                    <ArrowForwardIos color={theme.colors.neutral.onSurface.dark} width={16} height={16} />
                </TouchableOpacity>

                {pathname.includes('/accounts') && (
                    <>
                        <View>
                            <RegularText
                                style={styles.headerText}
                                fontVariant="BL"
                                color="colors.brand.onSurface.light"
                            >
                                Accounts
                            </RegularText>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.utilButtons}>
                            {accountItems.map((item, index) => (
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
                    </>
                )}

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
                    onPress={handleLogout}
                >
                    <RegularText fontVariant="BM" color="colors.negative.onSurface.light">
                        Logout
                    </RegularText>
                </TouchableOpacity>

            </ScrollView>
        </BaseDrawer>
    );
};

const createStyles = (theme: any, insets: any) =>
    StyleSheet.create({
        profileContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 16,
            backgroundColor: theme.colors.neutral.surface.light,
            borderRadius: 8,
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 8,
        },
        profileInfo: {
            flex: 1,
            justifyContent: 'center',
            gap: 2,
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.neutral.border.light,
            marginTop: 12
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

export default AccountsDrawer;
