import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/context/CustomThemeContext";
import { ArrowBackIos } from "@/svg_icons";
import { useSafeNavigation } from "@/hooks/useSafeNavigation";
import CustomButton from "@/components/ui/button";
import Input from "@/components/ui/textInput";
import ProfileImagePicker from "@/components/ui/profileImagePicker";
import { useMiddlewareDispatch } from "@/store/apiMiddleware";
import { useStore } from "@/store";
import { useToast } from "@/context/ToastContext";
import { getItemAsync, setItemAsync } from "@/utils/secureStorage";

import ChangePasswordEmailModal from "./modals/ChangePasswordEmailModal";
import ChangePasswordOtpModal from "./modals/ChangePasswordOtpModal";
import ChangePasswordResetModal from "./modals/ChangePasswordResetModal";
import EnableMfaEmailModal from "./modals/EnableMfaEmailModal";
import EnableMfaOtpModal from "./modals/EnableMfaOtpModal";

import { isValidOptionalEmail, isValidOptionalMobile } from "@/utils/validation";
import { useOtpTimer } from "@/hooks/useOtpTimer";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { safeBack } = useSafeNavigation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLargeScreen = width > 768;

  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();
  const { showToast } = useToast();

  const [userId, setUserId] = useState<string>("");
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    secondaryEmail: "",
    secondaryMobile: "",
  });

  const [initialData, setInitialData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    secondaryEmail: "",
    secondaryMobile: "",
  });

  const [touched, setTouched] = useState({
    firstName: false,
    displayName: false,
    secondaryEmail: false,
    secondaryMobile: false,
  });

  // Change Password Flow State (0: Closed, 1: Email, 2: OTP, 3: Reset)
  const [changePassStep, setChangePassStep] = useState<number>(0);
  const [passOtp, setPassOtp] = useState<string>("");
  const { timer: passOtpTimer, resetTimer: resetPassOtpTimer } = useOtpTimer({ initialSeconds: 60 });

  // Enable/Disable MFA Flow State (0: Closed, 1: Email, 2: OTP)
  const [mfaStep, setMfaStep] = useState<number>(0);
  const [targetMfaEnabled, setTargetMfaEnabled] = useState<boolean>(true);
  const [mfaOtp, setMfaOtp] = useState<string>("");
  const { timer: mfaOtpTimer, resetTimer: resetMfaOtpTimer } = useOtpTimer({ initialSeconds: 60 });

  const profileData = store.profile.profileData;
  const isLoadingGet = store.profile.isLoadingGetProfile;
  const isLoadingUpdate = store.profile.isLoadingUpdateProfile;
  const isLoadingForgotPassword = store.auth.isLoadingForgotPassword;
  const isLoadingVerifyPassOtp = store.auth.isLoadingVerifyForgotPasswordOtp;
  const isLoadingResetPass = store.auth.isLoadingResetPassword;
  const isLoadingUpdateMfa = store.auth.isLoadingUpdateMfa;
  const isLoadingVerifyMfaOtp = (store.auth as any).isLoadingVerifyMfaOtp || false;

  const primaryEmail = profileData?.primaryEmail || store.auth.email || "";

  // 1. Resolve User ID & Fetch Profile
  useEffect(() => {
    (async () => {
      const id =
        store.auth.userId ||
        (await getItemAsync("authUserId")) ||
        "";
      setUserId(id);
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
  }, []);

  // 2. Sync Profile Data to Form State
  useEffect(() => {
    if (profileData) {
      const data = {
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        displayName: profileData.displayName || "",
        secondaryEmail: profileData.secondaryEmail || "",
        secondaryMobile: profileData.secondaryMobile || "",
      };
      setFormData(data);
      setInitialData(data);
      if (profileData.dP?.fileUrl) {
        setProfileImageUri(profileData.dP.fileUrl);
      }
    }
  }, [profileData]);

  // Form Validation Rules
  const errors = {
    firstName:
      touched.firstName && !formData.firstName.trim()
        ? "First Name is required"
        : "",
    displayName:
      touched.displayName && !formData.displayName.trim()
        ? "Display Name is required"
        : "",
    secondaryEmail:
      touched.secondaryEmail && !isValidOptionalEmail(formData.secondaryEmail)
        ? "Please enter a valid email address"
        : "",
    secondaryMobile:
      touched.secondaryMobile && !isValidOptionalMobile(formData.secondaryMobile)
        ? "Please enter a valid 10-digit mobile number"
        : "",
  };

  const hasErrors =
    !formData.firstName.trim() ||
    !formData.displayName.trim() ||
    !isValidOptionalEmail(formData.secondaryEmail) ||
    !isValidOptionalMobile(formData.secondaryMobile);

  const isImageChanged =
    profileImageUri !== null && profileImageUri !== profileData?.dP?.fileUrl;

  const isFormChanged =
    isImageChanged ||
    formData.firstName.trim() !== initialData.firstName ||
    formData.lastName.trim() !== initialData.lastName ||
    formData.displayName.trim() !== initialData.displayName ||
    formData.secondaryEmail.trim() !== initialData.secondaryEmail ||
    formData.secondaryMobile.trim() !== initialData.secondaryMobile;

  const isSaveEnabled = isFormChanged && !hasErrors && !isLoadingUpdate;

  // 5. Update Profile Handler
  const handleSave = async () => {
    if (!isSaveEnabled || !userId) return;

    const formDataObj = new FormData();

    if (formData.firstName.trim()) {
      formDataObj.append("firstName", formData.firstName.trim());
    }
    if (formData.lastName.trim()) {
      formDataObj.append("lastName", formData.lastName.trim());
    }
    if (formData.displayName.trim()) {
      formDataObj.append("displayName", formData.displayName.trim());
    }
    if (formData.secondaryEmail.trim()) {
      formDataObj.append("secondaryEmail", formData.secondaryEmail.trim());
    }
    if (formData.secondaryMobile.trim()) {
      formDataObj.append("secondaryMobile", formData.secondaryMobile.trim());
    }
    if (isImageChanged && profileImageUri) {
      const filename = profileImageUri.split("/").pop() || "profile_picture.png";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/png`;
      formDataObj.append("dP", {
        uri: profileImageUri,
        name: filename,
        type,
      } as any);
    }

    const result: any = await dispatch({
      type: "UPDATE_PROFILE_API_REQUEST",
      payload: {
        url: `orguser/updateProfile?id=${userId}`,
        method: "PUT",
        body: formDataObj,
        isMultipart: true,
      },
    });

    if (result || store.profile.isSuccessUpdateProfile) {
      showToast({
        iconType: "success",
        type: "success",
        title: "Profile updated successfully",
      });
      // Refetch profile data
      dispatch({
        type: "GET_PROFILE_API_REQUEST",
        payload: {
          url: `orguser/getProfile?id=${userId}`,
          method: "GET",
        },
      });
    } else if (store.profile.isErrorUpdateProfile) {
      showToast({
        iconType: "error",
        type: "error",
        title: store.profile.errorUpdateProfile || "Failed to update profile",
      });
    }
  };

  const handleDiscard = () => {
    setFormData(initialData);
    setProfileImageUri(profileData?.dP?.fileUrl || null);
    setTouched({
      firstName: false,
      displayName: false,
      secondaryEmail: false,
      secondaryMobile: false,
    });
  };

  // 6. Change Password Flow Handlers
  const handlePassStep1SendOtp = async () => {
    if (isLoadingForgotPassword) return;
    await dispatch({
      type: "FORGOT_PASSWORD_API_REQUEST",
      payload: {
        url: "orguser/forgotPassword",
        method: "POST",
        body: { email: primaryEmail },
      },
    });
    resetPassOtpTimer();
    setChangePassStep(2);
    showToast({
      iconType: "success",
      type: "success",
      title: "OTP sent to email",
    });
  };

  const handlePassStep2VerifyOtp = async () => {
    if (passOtp.length < 6 || isLoadingVerifyPassOtp) return;
    const res: any = await dispatch({
      type: "VERIFY_FORGOT_PASSWORD_OTP_API_REQUEST",
      payload: {
        url: "orguser/verifyForgotPasswordOtp",
        method: "POST",
        body: { email: primaryEmail, code: passOtp },
      },
    });
    setChangePassStep(3);
  };

  const handlePassStep3ResetPassword = async (newPassword: string) => {
    if (isLoadingResetPass) return;
    const res: any = await dispatch({
      type: "RESET_PASSWORD_API_REQUEST",
      payload: {
        url: "orguser/resetPassword",
        method: "POST",
        body: { email: primaryEmail, newPassword },
      },
    });
    setChangePassStep(0);
    setPassOtp("");
    showToast({
      iconType: "success",
      type: "success",
      title: "Password updated successfully",
    });
  };

  // 7. Enable / Turn Off MFA Flow Handlers
  const handleOpenEnableMfa = () => {
    setTargetMfaEnabled(true);
    setMfaStep(1);
  };

  const handleOpenTurnOffMfa = () => {
    setTargetMfaEnabled(false);
    setMfaStep(1);
  };

  const handleMfaStep1SendOtp = async () => {
    if (isLoadingUpdateMfa) return;
    await dispatch({
      type: "UPDATE_MFA_API_REQUEST",
      payload: {
        url: "orguser/updateMfa",
        method: "POST",
        body: { userId, mfaEnabled: false, type: "profileMfa" },
      },
    });
    resetMfaOtpTimer();
    setMfaStep(2);
    showToast({
      iconType: "success",
      type: "success",
      title: "MFA verification OTP sent to email",
    });
  };

  const handleMfaStep2VerifyOtp = async () => {
    if (mfaOtp.length < 6 || isLoadingVerifyMfaOtp) return;
    await dispatch({
      type: "VERIFY_MFA_OTP_API_REQUEST",
      payload: {
        url: "orguser/verifyMfaOtp",
        method: "POST",
        body: { userId, code: mfaOtp, mfaEnabled: targetMfaEnabled },
      },
    });
    setMfaStep(0);
    setMfaOtp("");
    showToast({
      iconType: "success",
      type: "success",
      title: targetMfaEnabled ? "MFA Enabled successfully" : "MFA Disabled successfully",
    });
    // Refetch profile
    if (userId) {
      dispatch({
        type: "GET_PROFILE_API_REQUEST",
        payload: {
          url: `orguser/getProfile?id=${userId}`,
          method: "GET",
        },
      });
    }
  };

  const isMfaEnabled = profileData?.mfaEnabled === true;

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={safeBack} style={styles.backButton}>
                <ArrowBackIos
                  color={theme.colors.neutral.onSurface.light}
                  height={24}
                  width={24}
                />
                <Typography
                  fontVariant="TM"
                  variant="bold"
                  color="colors.neutral.onSurface.light"
                  style={styles.pageTitle}
                >
                  Profile
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Loading Indicator for Profile Fetch */}
            {isLoadingGet ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
              </View>
            ) : (
              <>
                {/* Profile Details Section */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Typography
                      fontVariant="BL"
                      variant="bold"
                      color="colors.neutral.onSurface.light"
                    >
                      Profile Details
                    </Typography>
                    <View style={styles.actionsBarTop}>
                      <CustomButton
                        title="Discard"
                        variant="dull"
                        size="small"
                        disabled={!isFormChanged || isLoadingUpdate}
                        onPress={handleDiscard}
                      />
                      <CustomButton
                        title="Save Changes"
                        variant="primary"
                        size="small"
                        disabled={!isSaveEnabled}
                        loading={isLoadingUpdate}
                        onPress={handleSave}
                      />
                    </View>
                  </View>

                  <View style={styles.sectionBody}>
                    {/* Image Picker */}
                    <View style={styles.imagePickerWrapper}>
                      <ProfileImagePicker
                        currentImageUri={profileImageUri}
                        onImageUpdate={setProfileImageUri}
                        name={(`${formData.firstName} ${formData.lastName}`).trim() || formData.displayName || "User"}
                      />
                      <View style={{ marginTop: 8 }}>
                        <Typography
                          fontVariant="LM"
                          variant="bold"
                          color="colors.neutral.onSurface.light"
                        >
                          {formData.displayName || formData.firstName || "User"}
                        </Typography>
                        <Typography
                          fontVariant="BS"
                          color="colors.neutral.onSurface.dark"
                        >
                          {profileData?.previlege || profileData?.role?.name || "Member"}
                        </Typography>
                      </View>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                      <View style={[styles.row, !isLargeScreen && styles.rowMobile]}>
                        <View style={styles.inputWrapper}>
                          <Input
                            label="First name"
                            placeholder="First name"
                            value={formData.firstName}
                            onChangeText={(text) => {
                              setFormData((prev) => ({ ...prev, firstName: text }));
                              if (!touched.firstName)
                                setTouched((prev) => ({ ...prev, firstName: true }));
                            }}
                            onBlur={() =>
                              setTouched((prev) => ({ ...prev, firstName: true }))
                            }
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                          />
                        </View>
                        <View style={styles.inputWrapper}>
                          <Input
                            label="Last name"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChangeText={(text) =>
                              setFormData((prev) => ({ ...prev, lastName: text }))
                            }
                          />
                        </View>
                      </View>

                      <View style={[styles.row, !isLargeScreen && styles.rowMobile]}>
                        <View style={styles.inputWrapper}>
                          <Input
                            label="Display name"
                            placeholder="Display name"
                            value={formData.displayName}
                            onChangeText={(text) => {
                              setFormData((prev) => ({ ...prev, displayName: text }));
                              if (!touched.displayName)
                                setTouched((prev) => ({ ...prev, displayName: true }));
                            }}
                            onBlur={() =>
                              setTouched((prev) => ({ ...prev, displayName: true }))
                            }
                            error={!!errors.displayName}
                            helperText={errors.displayName}
                          />
                        </View>
                        {isLargeScreen && <View style={styles.inputWrapper} />}
                      </View>

                      <View style={[styles.row, !isLargeScreen && styles.rowMobile]}>
                        <View style={styles.inputWrapper}>
                          <Input
                            label="Primary Email"
                            placeholder="Primary Email"
                            value={primaryEmail}
                            readOnly
                            editable={false}
                            keyboardType="email-address"
                            rightText={profileData?.primaryMailVerified ? "Verified" : undefined}
                            rightTextColor={theme.colors.positive.onSurface.light}
                          />
                        </View>
                        <View style={styles.inputWrapper}>
                          <Input
                            label="Secondary Email"
                            placeholder="Add a secondary Email"
                            value={formData.secondaryEmail}
                            onChangeText={(text) => {
                              setFormData((prev) => ({
                                ...prev,
                                secondaryEmail: text,
                              }));
                              if (!touched.secondaryEmail)
                                setTouched((prev) => ({
                                  ...prev,
                                  secondaryEmail: true,
                                }));
                            }}
                            onBlur={() =>
                              setTouched((prev) => ({ ...prev, secondaryEmail: true }))
                            }
                            error={!!errors.secondaryEmail}
                            helperText={errors.secondaryEmail}
                            keyboardType="email-address"
                          />
                        </View>
                      </View>

                      <View style={[styles.row, !isLargeScreen && styles.rowMobile]}>
                        <View style={styles.inputWrapper}>
                          <Input
                            label="Primary Contact Number"
                            placeholder="Primary Contact Number"
                            value={profileData?.primaryMobile || ""}
                            readOnly
                            editable={false}
                            keyboardType="phone-pad"
                            rightText={profileData?.primaryMobileVerified ? "Verified" : undefined}
                            rightTextColor={theme.colors.positive.onSurface.light}
                          />
                        </View>
                        <View style={styles.inputWrapper}>
                          <Input
                            label="Secondary Contact Number"
                            placeholder="Secondary Contact Number"
                            value={formData.secondaryMobile}
                            onChangeText={(text) => {
                              setFormData((prev) => ({
                                ...prev,
                                secondaryMobile: text,
                              }));
                              if (!touched.secondaryMobile)
                                setTouched((prev) => ({
                                  ...prev,
                                  secondaryMobile: true,
                                }));
                            }}
                            onBlur={() =>
                              setTouched((prev) => ({
                                ...prev,
                                secondaryMobile: true,
                              }))
                            }
                            error={!!errors.secondaryMobile}
                            helperText={errors.secondaryMobile}
                            keyboardType="phone-pad"
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Password Section */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Typography
                      fontVariant="BL"
                      variant="bold"
                      color="colors.neutral.onSurface.light"
                    >
                      Password
                    </Typography>
                  </View>
                  <View style={styles.sectionBody}>
                    <TouchableOpacity onPress={() => setChangePassStep(1)}>
                      <Typography
                        fontVariant="BM"
                        variant="bold"
                        color="colors.brand.onSurface.light"
                      >
                        Change Password
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* MFA Section */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Typography
                      fontVariant="BL"
                      variant="bold"
                      color="colors.neutral.onSurface.light"
                    >
                      MFA ( Multi factor Authentication )
                    </Typography>
                  </View>
                  <View style={styles.sectionBody}>
                    {isMfaEnabled ? (
                      <View style={styles.mfaRow}>
                        <Typography
                          fontVariant="BM"
                          color="colors.neutral.onSurface.light"
                        >
                          MFA is Enabled
                        </Typography>
                        <TouchableOpacity onPress={handleOpenTurnOffMfa}>
                          <Typography
                            fontVariant="BM"
                            variant="bold"
                            color="colors.brand.onSurface.light"
                          >
                            Turn off MFA
                          </Typography>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={handleOpenEnableMfa}>
                        <Typography
                          fontVariant="BM"
                          variant="bold"
                          color="colors.brand.onSurface.light"
                        >
                          Enable MFA
                        </Typography>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Change Password Modals */}
          <ChangePasswordEmailModal
            open={changePassStep === 1}
            email={primaryEmail}
            isLoading={isLoadingForgotPassword}
            onSendOtp={handlePassStep1SendOtp}
            onClose={() => setChangePassStep(0)}
          />

          <ChangePasswordOtpModal
            open={changePassStep === 2}
            email={primaryEmail}
            otp={passOtp}
            timer={passOtpTimer}
            isLoading={isLoadingVerifyPassOtp}
            onOtpChange={setPassOtp}
            onResendOtp={handlePassStep1SendOtp}
            onVerify={handlePassStep2VerifyOtp}
            onClose={() => setChangePassStep(0)}
          />

          <ChangePasswordResetModal
            open={changePassStep === 3}
            isLoading={isLoadingResetPass}
            onResetPassword={handlePassStep3ResetPassword}
            onClose={() => setChangePassStep(0)}
          />

          {/* Enable / Turn Off MFA Modals */}
          <EnableMfaEmailModal
            open={mfaStep === 1}
            title={targetMfaEnabled ? "Enable MFA" : "Turn Off MFA"}
            email={primaryEmail}
            isLoading={isLoadingUpdateMfa}
            onSendOtp={handleMfaStep1SendOtp}
            onClose={() => setMfaStep(0)}
          />

          <EnableMfaOtpModal
            open={mfaStep === 2}
            title={targetMfaEnabled ? "Enable MFA" : "Turn Off MFA"}
            email={primaryEmail}
            otp={mfaOtp}
            timer={mfaOtpTimer}
            isLoading={isLoadingVerifyMfaOtp}
            onOtpChange={setMfaOtp}
            onResendOtp={handleMfaStep1SendOtp}
            onVerify={handleMfaStep2VerifyOtp}
            onClose={() => setMfaStep(0)}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    container: {
      flex: 1,
      maxWidth: 1200,
      width: "100%",
      alignSelf: "center",
    },
    loaderContainer: {
      paddingVertical: 60,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.s500,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.s200,
    },
    pageTitle: {
      paddingLeft: theme.spacing.s100,
    },
    actionsBarTop: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: theme.spacing.s300,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.s400,
      gap: theme.spacing.s400,
      paddingBottom: theme.spacing.s800,
    },
    sectionContainer: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      overflow: "hidden",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: theme.spacing.s400,
      paddingVertical: theme.spacing.s300,
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral.border.light,
    },
    sectionBody: {
      padding: theme.spacing.s600,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    imagePickerWrapper: {
      marginBottom: theme.spacing.s600,
    },
    formContainer: {
      width: "100%",
    },
    row: {
      flexDirection: "row",
      gap: theme.spacing.s500,
    },
    rowMobile: {
      flexDirection: "column",
      gap: 0,
    },
    inputWrapper: {
      flex: 1,
    },
    mfaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
  });
