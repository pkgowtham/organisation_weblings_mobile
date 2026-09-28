import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '@/context/CustomThemeContext';
import { Typography } from '@/components/ui/typography';
import Input from '@/components/ui/textInput';
import TextField from '@/components/ui/textField';
import { Dropdown } from '@/components/ui/dropdown';
import CustomButton from '@/components/ui/button';
import { useStore } from '@/store';
import { useMiddlewareDispatch } from '@/store/apiMiddleware';
import { useToast } from '@/context/ToastContext';
import AttachmentPickerModal from '@/components/ui/attachmentPickerModal';
import Tag from '@/components/ui/tag';
import { getItemAsync } from '@/utils/secureStorage';
import { UploadTrayIcon } from './SupportIcons';
import {
  ALLOWED_EXTENSIONS,
  NAME_REGEX,
  EMAIL_REGEX,
  PHONE_REGEX,
} from '@/utils/validation';

const PRIORITIES = [
  { label: 'Low', value: 'LOW', color: '#0284C7' },
  { label: 'Medium', value: 'MEDIUM', color: '#A855F7' },
  { label: 'High', value: 'HIGH', color: '#F97316' },
  { label: 'Critical', value: 'CRITICAL', color: '#EF4444' },
] as const;

const CONTACT_METHODS = [
  { label: 'Email', value: 'EMAIL' },
  { label: 'Phone', value: 'PHONE' },
] as const;

export interface AttachmentItem {
  name: string;
  uri: string;
  size?: number;
  type?: string;
}

export default function SupportTicketForm() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { showToast } = useToast();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { store } = useStore();
  const dispatch = useMiddlewareDispatch();

  // Form State
  const [formData, setFormData] = useState({
    supportType: '',
    supportTypeId: '',
    relatedModule: '',
    relatedModuleId: '',
    subject: '',
    description: '',
    priority: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    preferredContactMethod: 'EMAIL' as 'EMAIL' | 'PHONE',
    name: '',
    email: '',
    phoneNumber: '',
  });

  const [touched, setTouched] = useState({
    supportType: false,
    relatedModule: false,
    subject: false,
    description: false,
    name: false,
    email: false,
    phoneNumber: false,
    file: false,
  });

  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill user contact info from Profile or Auth
  useEffect(() => {
    const profile = store.profile?.profileData;
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        email: prev.email || profile.primaryEmail || store.auth?.email || '',
        phoneNumber: prev.phoneNumber || (profile.primaryMobile ? profile.primaryMobile.replace(/\D/g, '').slice(-10) : ''),
      }));
    }
  }, [store.profile?.profileData, store.auth?.email]);

  // Fetch Dropdown Options on Mount
  useEffect(() => {
    dispatch({
      type: 'SUPPORT_TYPES_GETLIST_API_REQUEST',
      payload: { url: '/supportTypes', method: 'GET' },
    });
    dispatch({
      type: 'RELATED_MODULE_GETLIST_API_REQUEST',
      payload: { url: '/relatedModule', method: 'GET' },
    });
  }, [dispatch]);

  // Dropdown Options
  const supportTypeOptions = useMemo(() => {
    return (store.support?.supportTypes || []).map((item: any) => {
      const label = item.name || item.title || item.supportTypeName || item.label || item.value || String(item);
      const val = item.id || item._id || item.value || String(item);
      return { value: val, label };
    });
  }, [store.support?.supportTypes]);

  const relatedModuleOptions = useMemo(() => {
    return (store.support?.relatedModules || []).map((item: any) => {
      const label = item.name || item.title || item.relatedModuleName || item.label || item.value || String(item);
      const val = item.id || item._id || item.value || String(item);
      return { value: val, label };
    });
  }, [store.support?.relatedModules]);

  // Validation
  const errors = useMemo(() => {
    let fileError = '';
    if (attachments.length > 0) {
      for (const file of attachments) {
        if (file.size && file.size > 3 * 1024 * 1024) {
          fileError = `File "${file.name}" exceeds maximum size of 3MB.`;
          break;
        }
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          fileError = `File "${file.name}" has an invalid format.`;
          break;
        }
      }
    }

    return {
      supportType: formData.supportType.trim() === '' ? 'Support Type is required' : '',
      relatedModule: formData.relatedModule.trim() === '' ? 'Related Module is required' : '',
      subject:
        formData.subject.trim() === ''
          ? 'Subject is required'
          : formData.subject.trim().length > 150
            ? 'Subject cannot exceed 150 characters.'
            : '',
      description:
        formData.description.trim() === ''
          ? 'Description is required'
          : formData.description.trim().length > 500
            ? 'Description cannot exceed 500 characters.'
            : '',
      name:
        formData.name.trim() === ''
          ? 'Name is required'
          : !NAME_REGEX.test(formData.name.trim())
            ? 'Name must contain only letters and spaces (up to 150 characters).'
            : '',
      email:
        formData.email.trim() === ''
          ? 'Email is required'
          : !EMAIL_REGEX.test(formData.email.trim())
            ? 'Please enter a valid email address.'
            : '',
      phoneNumber:
        formData.phoneNumber.trim() === ''
          ? 'Phone number is required'
          : !PHONE_REGEX.test(formData.phoneNumber.trim())
            ? 'Phone number must be a valid 10-digit number.'
            : '',
      file: fileError,
    };
  }, [formData, attachments]);

  const isFormValid = useMemo(() => {
    return (
      formData.supportType.trim() !== '' &&
      formData.relatedModule.trim() !== '' &&
      formData.subject.trim() !== '' &&
      formData.subject.trim().length <= 150 &&
      formData.description.trim() !== '' &&
      formData.description.trim().length <= 500 &&
      formData.name.trim() !== '' &&
      NAME_REGEX.test(formData.name.trim()) &&
      formData.email.trim() !== '' &&
      EMAIL_REGEX.test(formData.email.trim()) &&
      formData.phoneNumber.trim() !== '' &&
      PHONE_REGEX.test(formData.phoneNumber.trim()) &&
      !errors.file
    );
  }, [formData, errors]);

  const handleResetForm = () => {
    setFormData({
      supportType: '',
      supportTypeId: '',
      relatedModule: '',
      relatedModuleId: '',
      subject: '',
      description: '',
      priority: 'LOW',
      preferredContactMethod: 'EMAIL',
      name: '',
      email: '',
      phoneNumber: '',
    });
    setTouched({
      supportType: false,
      relatedModule: false,
      subject: false,
      description: false,
      name: false,
      email: false,
      phoneNumber: false,
      file: false,
    });
    setAttachments([]);
  };

  const handleAddAttachment = (file: { name: string; uri: string; size?: number; type?: string }) => {
    setAttachments((prev) => [...prev, file]);
    setTouched((prev) => ({ ...prev, file: true }));
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle Success Action (matches web implementation)
  useEffect(() => {
    if (store.support?.isSuccessCreate) {
      showToast({
        type: 'success',
        iconType: 'success',
        title: 'Support ticket submitted successfully',
      });
      handleResetForm();
      dispatch({ type: 'SUPPORT_TICKET_CREATE_API_CLEAR' });
    }
  }, [store.support?.isSuccessCreate, dispatch]);

  const handleSubmit = async () => {
    setTouched({
      supportType: true,
      relatedModule: true,
      subject: true,
      description: true,
      name: true,
      email: true,
      phoneNumber: true,
      file: true,
    });

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const profile = store.profile?.profileData;
      const orgId =
        store.auth?.orgAuthId ||
        (await getItemAsync('orgAuthId')) ||
        (await getItemAsync('orgId')) ||
        profile?.orgAuthId ||
        profile?.orgAuth ||
        profile?.orgId ||
        profile?.organisationId ||
        profile?.organizationId ||
        profile?.org?.id ||
        profile?.organisation?.id ||
        '';

      const payloadFormData = new FormData();
      payloadFormData.append('supportType', formData.supportTypeId || formData.supportType);
      payloadFormData.append('relatedModule', formData.relatedModuleId || formData.relatedModule);
      payloadFormData.append('subject', formData.subject.trim());
      payloadFormData.append('description', formData.description.trim());
      payloadFormData.append('priority', formData.priority);
      payloadFormData.append('preferredContactMethod', formData.preferredContactMethod);
      payloadFormData.append('name', formData.name.trim());
      payloadFormData.append('email', formData.email.trim());
      payloadFormData.append('phoneNumber', formData.phoneNumber.trim());

      if (orgId) {
        payloadFormData.append('orgId', orgId);
      }

      if (attachments && attachments.length > 0) {
        attachments.forEach((att) => {
          payloadFormData.append('files', {
            uri: att.uri,
            name: att.name || 'file',
            type: att.type || 'application/octet-stream',
          } as any);
        });
      }

      const res = await dispatch({
        type: 'SUPPORT_TICKET_CREATE_API_REQUEST',
        payload: {
          url: '/supportTicket',
          method: 'POST',
          body: payloadFormData,
          isMultipart: true,
        },
      });

      if (!res && !store.support?.isSuccessCreate) {
        showToast({
          type: 'error',
          iconType: 'error',
          title: 'Failed to submit support ticket. Please try again.',
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        iconType: 'error',
        title: err?.message || 'Failed to submit support ticket. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || store.support?.isLoadingCreate;

  return (
    <View style={styles.formCard}>
      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={{ marginBottom: theme.spacing.s400 }}>
        Support Details
      </Typography>

      {/* Row 1: Support Type & Related Module */}
      <View style={[styles.rowFields, !isDesktop && styles.columnMobile]}>
        <View style={styles.flexCol}>
          <Dropdown
            label="Support Type *"
            placeholder="Select support type"
            options={supportTypeOptions}
            selectedValue={formData.supportTypeId}
            onValueChange={(val) => {
              const opt = supportTypeOptions.find((o: any) => o.value === val);
              setFormData((prev) => ({
                ...prev,
                supportTypeId: val as string,
                supportType: opt ? opt.label : (val as string),
              }));
              setTouched((prev) => ({ ...prev, supportType: true }));
            }}
          />
          {touched.supportType && errors.supportType ? (
            <Typography fontVariant="BXS" color="colors.negative.surface.medium" style={styles.errorText}>
              {errors.supportType}
            </Typography>
          ) : null}
        </View>

        <View style={styles.flexCol}>
          <Dropdown
            label="Related Module *"
            placeholder="Select related module"
            options={relatedModuleOptions}
            selectedValue={formData.relatedModuleId}
            onValueChange={(val) => {
              const opt = relatedModuleOptions.find((o: any) => o.value === val);
              setFormData((prev) => ({
                ...prev,
                relatedModuleId: val as string,
                relatedModule: opt ? opt.label : (val as string),
              }));
              setTouched((prev) => ({ ...prev, relatedModule: true }));
            }}
          />
          {touched.relatedModule && errors.relatedModule ? (
            <Typography fontVariant="BXS" color="colors.negative.surface.medium" style={styles.errorText}>
              {errors.relatedModule}
            </Typography>
          ) : null}
        </View>
      </View>

      {/* Row 2: Subject */}
      <View style={styles.fieldItem}>
        <Input
          label="Subject *"
          placeholder="Brief summary of your issue"
          value={formData.subject}
          onChangeText={(val) => setFormData((prev) => ({ ...prev, subject: val }))}
          onBlur={() => setTouched((prev) => ({ ...prev, subject: true }))}
          maxLength={150}
          error={touched.subject && Boolean(errors.subject)}
          helperText={touched.subject ? errors.subject : ''}
        />
        <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium" style={styles.charCount}>
          {formData.subject.length}/150
        </Typography>
      </View>

      {/* Row 3: Description */}
      <View style={styles.fieldItem}>
        <TextField
          label="Description *"
          placeholder="Provide detailed information about the issue or question..."
          value={formData.description}
          onChangeText={(val) => setFormData((prev) => ({ ...prev, description: val }))}
          onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
          multiline
          numberOfLines={4}
          maxLength={500}
          error={touched.description && Boolean(errors.description)}
          helperText={touched.description ? errors.description : ''}
        />
        <Typography fontVariant="BXS" color="colors.neutral.onSurface.medium" style={styles.charCount}>
          {formData.description.length}/500
        </Typography>
      </View>

      {/* Row 4: Priority & Preferred Contact */}
      <View style={[styles.rowFields, !isDesktop && styles.columnMobile]}>
        {/* Priority Selection */}
        <View style={styles.flexCol}>
          <Typography fontVariant="LS" variant="medium" color="colors.neutral.onSurface.light" style={styles.label}>
            Priority
          </Typography>
          <View style={styles.priorityGroup}>
            {PRIORITIES.map((p) => {
              const isSelected = formData.priority === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityBtn,
                    isSelected && styles.priorityBtnSelected,
                    isSelected && { borderColor: p.color },
                  ]}
                  onPress={() => setFormData((prev) => ({ ...prev, priority: p.value }))}
                  activeOpacity={0.8}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                  <Typography
                    fontVariant="BS"
                    variant={isSelected ? 'bold' : 'regular'}
                    color={isSelected ? 'colors.neutral.onSurface.light' : 'colors.neutral.onSurface.dark'}
                  >
                    {p.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferred Contact Method */}
        <View style={styles.flexCol}>
          <Typography fontVariant="LS" variant="medium" color="colors.neutral.onSurface.light" style={styles.label}>
            Preferred contact method
          </Typography>
          <View style={styles.contactMethodGroup}>
            {CONTACT_METHODS.map((m) => {
              const isSelected = formData.preferredContactMethod === m.value;
              return (
                <TouchableOpacity
                  key={m.value}
                  style={[
                    styles.contactMethodBtn,
                    isSelected && styles.contactMethodBtnSelected,
                  ]}
                  onPress={() => setFormData((prev) => ({ ...prev, preferredContactMethod: m.value }))}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Typography
                    fontVariant="BS"
                    variant={isSelected ? 'bold' : 'regular'}
                    color={isSelected ? 'colors.brand.surface.medium' : 'colors.neutral.onSurface.dark'}
                  >
                    {m.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Row 5: Attachment Dropzone */}
      <View style={styles.fieldItem}>
        <Typography fontVariant="LS" variant="medium" color="colors.neutral.onSurface.light" style={styles.label}>
          Attachment (Optional)
        </Typography>

        <TouchableOpacity
          style={styles.dashedDropzone}
          onPress={() => setPickerModalVisible(true)}
          activeOpacity={0.7}
        >
          <UploadTrayIcon color={theme.colors.neutral.onSurface.dark} size={28} />
          <Typography fontVariant="BS" color="colors.neutral.onSurface.medium" style={{ marginTop: 8 }}>
            Click to browse files (Max 3MB per file)
          </Typography>

          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((file, idx) => (
                <Tag
                  key={idx}
                  label={`${file.name}${file.size ? ` (${(file.size / 1024 / 1024).toFixed(2)} MB)` : ''}`}
                  color="brand"
                  variant="bordered"
                  iconRight="close"
                  onPressRight={() => handleRemoveAttachment(idx)}
                  tagStyle={{ margin: 4 }}
                />
              ))}
            </View>
          )}
        </TouchableOpacity>

        {touched.file && errors.file ? (
          <Typography fontVariant="BXS" color="colors.negative.surface.medium" style={{ marginTop: 4 }}>
            {errors.file}
          </Typography>
        ) : null}
      </View>

      {/* Row 6: Contact Information */}
      <View style={styles.contactSection}>
        <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={{ marginBottom: theme.spacing.s300 }}>
          Contact Information
        </Typography>

        <View style={[styles.rowFields, !isDesktop && styles.columnMobile]}>
          {/* Name */}
          <View style={styles.flexCol}>
            <Input
              label="Name *"
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={(val) => setFormData((prev) => ({ ...prev, name: val }))}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name ? errors.name : ''}
            />
          </View>

          {/* Email */}
          <View style={styles.flexCol}>
            <Input
              label="Email *"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(val) => setFormData((prev) => ({ ...prev, email: val }))}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              keyboardType="email-address"
              autoCapitalize="none"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email ? errors.email : ''}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.flexCol}>
            <Input
              label="Phone Number *"
              placeholder="Enter 10-digit number"
              value={formData.phoneNumber}
              onChangeText={(val) => setFormData((prev) => ({ ...prev, phoneNumber: val.replace(/\D/g, '') }))}
              onBlur={() => setTouched((prev) => ({ ...prev, phoneNumber: true }))}
              keyboardType="phone-pad"
              maxLength={10}
              error={touched.phoneNumber && Boolean(errors.phoneNumber)}
              helperText={touched.phoneNumber ? errors.phoneNumber : ''}
            />
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.formDivider} />

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <CustomButton
          title="Cancel"
          variant="outline"
          size="medium"
          disabled={isLoading}
          onPress={handleResetForm}
          buttonStyle={styles.actionBtn}
        />
        <CustomButton
          title="Submit Inquiry"
          variant="primary"
          size="medium"
          loading={isLoading}
          disabled={!isFormValid || isLoading}
          onPress={handleSubmit}
          buttonStyle={styles.actionBtn}
        />
      </View>

      {/* Attachment Picker Modal */}
      <AttachmentPickerModal
        visible={pickerModalVisible}
        onClose={() => setPickerModalVisible(false)}
        onSelectImage={(assets) => {
          assets.forEach((asset) => {
            handleAddAttachment({
              name: asset.fileName || asset.uri.split('/').pop() || 'image.jpg',
              uri: asset.uri,
              size: asset.fileSize,
              type: asset.mimeType || 'image/jpeg',
            });
          });
        }}
        onSelectDocument={(assets) => {
          assets.forEach((doc) => {
            handleAddAttachment({
              name: doc.name || doc.uri.split('/').pop() || 'document',
              uri: doc.uri,
              size: doc.size,
              type: doc.mimeType || 'application/octet-stream',
            });
          });
        }}
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    formCard: {
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius?.b200 || 8,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.neutral.surface.light,
      marginBottom: 24,
    },
    rowFields: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    columnMobile: {
      flexDirection: 'column',
    },
    flexCol: {
      flex: 1,
    },
    fieldItem: {
      marginBottom: 16,
    },
    label: {
      marginBottom: 8,
    },
    charCount: {
      textAlign: 'right',
      marginTop: 4,
    },
    errorText: {
      marginTop: 4,
    },
    priorityGroup: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    priorityBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius?.b100 || 4,
      borderWidth: 1,
      borderColor: theme.colors.neutral.surface.light,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    priorityBtnSelected: {
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    contactMethodGroup: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    contactMethodBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius?.b100 || 4,
      borderWidth: 1,
      borderColor: theme.colors.neutral.surface.light,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    contactMethodBtnSelected: {
      borderColor: theme.colors.brand.surface.medium,
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    radioOuter: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: theme.colors.neutral.onSurface.dark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: theme.colors.brand.surface.medium,
    },
    radioInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.brand.surface.medium,
    },
    dashedDropzone: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius?.b200 || 8,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.neutral.surface.lighter,
    },
    attachmentsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
      width: '100%',
    },
    contactSection: {
      marginTop: 8,
      marginBottom: 16,
    },
    formDivider: {
      height: 1,
      backgroundColor: theme.colors.neutral.surface.light,
      marginVertical: 16,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    actionBtn: {
      minWidth: 120,
    },
  });
