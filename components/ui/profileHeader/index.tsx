import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import CustomButton from '@/components/ui/button';
import { EmailOutline } from '@/svg_icons';
import { Image } from 'expo-image';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useStore } from '@/store';
import { getItemAsync } from '@/utils/secureStorage';

export default function ProfileHeader() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const dispatch = useMiddlewareDispatch();
  const { store } = useStore();

  const hasDispatched = useRef(false);
  const hasBasicDispatched = useRef(false);
  const hasJobDispatched = useRef(false);

  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchId = async () => {
      const userDataStr = await getItemAsync("userData");
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setEmployeeId(userData.id);
        } catch (e) {
          console.error("Error parsing userData", e);
        }
      }
    };
    fetchId();
  }, []);

  useEffect(() => {
    if (!hasDispatched.current && employeeId) {
      dispatch({
        type: "PROFILE_GET_API_REQUEST",
        payload: { url: "employeeProfile", method: "GET", params: employeeId },
      });
      hasDispatched.current = true;
    }
  }, [employeeId]);

  useEffect(() => {
    if (!hasBasicDispatched.current && employeeId) {
      dispatch({
        type: "EMPLOYEE_BASIC_GET_API_REQUEST",
        payload: { url: "employeeBasic", method: "GET", params: employeeId },
      });
      hasBasicDispatched.current = true;
    }
  }, [employeeId]);

  useEffect(() => {
    if (!hasJobDispatched.current && employeeId) {
      dispatch({
        type: "EMPLOYEE_JOB_GET_API_REQUEST",
        payload: { url: "employeeJob", method: "GET", params: employeeId },
      });
      hasJobDispatched.current = true;
    }
  }, [employeeId]);

  const placeholderImage = 'https://i.pravatar.cc/300?u=eleanor';
  const profileImage = store?.employee.dataBasicGet?.employeeAuth?.dP || placeholderImage;
  const displayName = store?.profile.dataGet?.data?.employeeAuthId?.displayName || 'Not Entered';
  const email = store?.profile.dataGet?.data?.email || 'Not Entered';
  const mobile = store?.profile.dataGet?.data?.personalMobile || 'Not Entered';
  const jobTitle = store?.employee.dataBasicGet?.employeeAuth?.roleId?.name || 'Not Entered';
  const department = store?.employee.dataJobGet?.deptId?.name || 'Not Entered';
  const businessUnit = store?.employee.dataJobGet?.buId?.name || 'Not Entered';
  const reportingTo = store?.employee.dataJobGet?.reportingManager?.displayName || 'Not Entered';
  const location = store?.employee.dataJobGet?.bulId?.name || 'Not Entered';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.topSection}>
          <Image
            source={{ uri: profileImage }}
            style={styles.squareImage}
          />
          <View style={styles.infoSection}>
            <Typography fontVariant="TM" variant="semibold" color="colors.neutral.onSurface.light">
              {displayName}
            </Typography>
            <Typography fontVariant="BS" color="colors.negative.onSurface.light" style={styles.statusText}>
              Incomplete Profile
            </Typography>
            <CustomButton
              title="Action"
              variant="primary"
              size="small"
              onPress={() => { }}
              buttonStyle={styles.actionBtn}
              textStyle={{ marginRight: 8 }}
            />
          </View>
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.light" style={styles.iconPlaceholder}>
              📍
            </Typography>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
              {location}
            </Typography>
          </View>
          <View style={styles.contactItem}>
            <EmailOutline width={20} height={20} color={theme.colors.neutral.onSurface.medium} />
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={{ marginLeft: 8 }}>
              {email}
            </Typography>
          </View>
        </View>

        <View style={styles.contactRowSingle}>
          <View style={styles.contactItem}>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.light" style={styles.iconPlaceholder}>
              📞
            </Typography>
            <Typography fontVariant="BS" color="colors.neutral.onSurface.medium">
              {mobile}
            </Typography>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                Job Title
              </Typography>
              <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                {jobTitle}
              </Typography>
            </View>
            <View style={styles.gridItem}>
              <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                Department
              </Typography>
              <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                {department}
              </Typography>
            </View>
          </View>
          <View style={[styles.gridRow, { marginTop: theme.spacing.s400 }]}>
            <View style={styles.gridItem}>
              <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                Business Unit
              </Typography>
              <Typography fontVariant="BS" variant="semibold" color="colors.neutral.onSurface.light">
                {businessUnit}
              </Typography>
            </View>
            <View style={styles.gridItem}>
              <Typography fontVariant="BXS" color="colors.neutral.onSurface.dark">
                Reporting To
              </Typography>
              <Typography fontVariant="BS" variant="semibold" color="colors.brand.onSurface.light">
                {reportingTo}
              </Typography>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.s500,
      paddingTop: theme.spacing.s400,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    card: {
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius.b300,
      borderWidth: 1,
      borderColor: theme.colors.neutral.border.light,
      padding: theme.spacing.s400,
    },
    topSection: {
      flexDirection: 'row',
      marginBottom: theme.spacing.s400,
    },
    squareImage: {
      width: 100,
      height: 100,
      borderRadius: theme.borderRadius.b200,
      marginRight: theme.spacing.s400,
      backgroundColor: theme.colors.neutral.surface.light,
      borderWidth: 4,
      borderColor: theme.colors.neutral.border.light
    },
    infoSection: {
      flex: 1,
      justifyContent: 'center',
    },
    statusText: {
      marginBottom: theme.spacing.s200,
    },
    actionBtn: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.s400,
      height: 36,
      borderRadius: theme.borderRadius.b150,
    },
    contactRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.s300,
    },
    contactRowSingle: {
      flexDirection: 'row',
      marginBottom: theme.spacing.s400,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconPlaceholder: {
      marginRight: 8,
      fontSize: 16,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.neutral.border.light,
      marginVertical: theme.spacing.s400,
    },
    detailsGrid: {
      // no background or extra padding since it's inside the card
    },
    gridRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    gridItem: {
      flex: 1,
      gap: theme.spacing.s100,
    },
  });
