import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Typography, RegularText } from '@/components/ui/typography';
import CustomButton from '@/components/ui/button';
import { useTheme } from '@/context/CustomThemeContext';
import { CheckIcon, GreenCheckCircleIcon } from './SetupIcons';

interface PlanSelectionStepProps {
  planSubStep: 'pickPlan' | 'successScreen';
  plansData: any[];
  isLoadingGetPlans: boolean;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  isLoadingCreateOrg: boolean;
  onCreateOrganization: (planId: string) => void;
  onFinish: () => void;
  onBack: () => void;
}

export default function PlanSelectionStep({
  planSubStep,
  plansData,
  isLoadingGetPlans,
  selectedPlanId,
  setSelectedPlanId,
  isLoadingCreateOrg,
  onCreateOrganization,
  onFinish,
  onBack,
}: PlanSelectionStepProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // 1. Pick Plan
  const renderPickPlan = () => (
    <View style={styles.domainStepContainer}>
      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Pick a Plan for you
      </Typography>

      {isLoadingGetPlans ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.brand.surface.medium} />
        </View>
      ) : (
        <View style={styles.planCardsRow}>
          {plansData.length > 0 ? (
            plansData.map((item: any, index: number) => {
              const isSelected = selectedPlanId === item.id;
              const priceText =
                Number(item.price) === 0
                  ? 'Free'
                  : `$${item.price} / ${item.billingCycle ? item.billingCycle.toLowerCase() : 'year'}`;

              return (
                <TouchableOpacity
                  key={item.id || index}
                  style={[
                    styles.planCard,
                    !item.isActive && styles.disabledPlanCard,
                    isSelected && { borderColor: theme.colors.brand.border.medium || '#008FF5', borderWidth: 2 },
                  ]}
                  disabled={!item.isActive || isLoadingCreateOrg}
                  onPress={() => setSelectedPlanId(item.id)}
                  activeOpacity={0.8}
                >
                  <Typography fontVariant="BM" variant="bold" color={item.isActive ? 'colors.neutral.onSurface.light' : 'colors.neutral.onSurface.disabled'}>
                    {item.displayName || item.name}
                  </Typography>

                  <Typography fontVariant="TM" variant="bold" color={item.isActive ? 'colors.neutral.onSurface.light' : 'colors.neutral.onSurface.disabled'} style={{ marginVertical: 12 }}>
                    {priceText}
                  </Typography>

                  {item.isActive ? (
                    <CustomButton
                      title="Choose plan"
                      variant={isSelected ? 'primary' : 'outline'}
                      size="small"
                      loading={isLoadingCreateOrg && isSelected}
                      disabled={isLoadingCreateOrg}
                      onPress={() => onCreateOrganization(item.id)}
                      buttonStyle={{ width: '100%' }}
                    />
                  ) : (
                    <View style={styles.unavailableBtnPlaceholder}>
                      <RegularText fontVariant="BS" color="colors.neutral.onSurface.disabled">
                        Currently Unavailable
                      </RegularText>
                    </View>
                  )}

                  <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center', marginTop: 6, marginBottom: 16 }}>
                    {item.description || '*No credit card required'}
                  </RegularText>

                  <Typography fontVariant="BS" variant="bold" color={item.isActive ? 'colors.neutral.onSurface.light' : 'colors.neutral.onSurface.disabled'} style={{ marginBottom: 8 }}>
                    Benefits
                  </Typography>

                  {(item.benefits || ['Basic Feature Access', 'Email Support', 'Single Business Unit']).map((benefit: string, bIdx: number) => (
                    <View key={bIdx} style={styles.benefitRow}>
                      <CheckIcon color={item.isActive ? '#10B981' : '#8D8D8D'} size={16} />
                      <RegularText fontVariant="BXS" color={item.isActive ? 'colors.neutral.onSurface.light' : 'colors.neutral.onSurface.disabled'}>
                        {benefit}
                      </RegularText>
                    </View>
                  ))}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.planCard}>
              <Typography fontVariant="BM" variant="bold" color="colors.neutral.onSurface.light">
                Essential Plan
              </Typography>
              <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={{ marginVertical: 12 }}>
                Free
              </Typography>
              <CustomButton
                title="Choose plan"
                variant="primary"
                size="small"
                loading={isLoadingCreateOrg}
                disabled={isLoadingCreateOrg}
                onPress={() => onCreateOrganization('free-plan')}
                buttonStyle={{ width: '100%' }}
              />
              <RegularText fontVariant="BXS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center', marginTop: 6, marginBottom: 16 }}>
                *No credit card required
              </RegularText>
            </View>
          )}
        </View>
      )}
    </View>
  );

  // 2. Success Screen
  const renderSuccessScreen = () => (
    <View style={styles.domainStepContainer}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <GreenCheckCircleIcon size={80} />
      </View>

      <Typography fontVariant="TM" variant="bold" color="colors.neutral.onSurface.light" style={styles.centerTitle}>
        Organization has been set successfully
      </Typography>

      <RegularText fontVariant="BS" color="colors.neutral.onSurface.dark" style={{ textAlign: 'center', marginTop: 12, marginBottom: 36 }}>
        Your account will be available for use within 42 hours
      </RegularText>

      <CustomButton
        title="Finish"
        variant="primary"
        size="small"
        onPress={onFinish}
        buttonStyle={{ minWidth: 140 }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {planSubStep === 'pickPlan' && renderPickPlan()}
      {planSubStep === 'successScreen' && renderSuccessScreen()}

      {planSubStep !== 'successScreen' && (
        <View style={styles.actionRow}>
          <CustomButton
            title="Back"
            variant="outline"
            size="small"
            onPress={onBack}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    domainStepContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    centerTitle: {
      textAlign: 'center',
      marginBottom: 8,
    },
    planCardsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      justifyContent: 'center',
      width: '100%',
      marginTop: 16,
    },
    planCard: {
      width: 250,
      backgroundColor: theme.colors.neutral.surface.light,
      borderRadius: theme.borderRadius?.b200 || 8,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.neutral.surface.light,
    },
    disabledPlanCard: {
      opacity: 0.6,
    },
    unavailableBtnPlaceholder: {
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.neutral.surface.lighter,
      borderRadius: theme.borderRadius?.b100 || 4,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: 16,
    },
  });
