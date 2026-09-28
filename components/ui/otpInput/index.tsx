import { useTheme } from '@/context/CustomThemeContext';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  StyleProp,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  focusColor?: string;
  defaultValue?: string;
  selectionColor?: string;
  isInvalid?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  autoFocus = true,
  editable = true,
  inputStyle,
  containerStyle,
  focusColor = '#0f3cc9',
  selectionColor = '#0f3cc9',
  defaultValue = '',
  isInvalid = false,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<TextInput[]>([]);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    if (defaultValue) {
      const defaultOtp = defaultValue.split('').slice(0, length);
      const newOtp = [...otp];
      defaultOtp.forEach((value, index) => {
        newOtp[index] = value;
      });
      setOtp(newOtp);
    }
  }, [defaultValue]);

  const focusNext = (index: number, value: string) => {
    if (index < length - 1 && value) {
      inputs.current[index + 1]?.focus();
    }
    if (index === length - 1) {
      Keyboard.dismiss();
      const otpCode = otp.join('');
      if (otpCode.length === length) {
        onComplete(otpCode);
      }
    }
  };

  const focusPrevious = (index: number, key: string) => {
    if (key === 'Backspace' && index > 0 && !otp[index]) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.substring(text.length - 1);
    setOtp(newOtp);

    const otpCode = newOtp.join('');
    if (otpCode.length === length) {
      onComplete(otpCode);
    }

    if (text) {
      focusNext(index, text);
    }
  };

  const handleKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    focusPrevious(index, e.nativeEvent.key);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {Array(length)
        .fill('')
        .map((_, index) => (
          <TextInput
            key={index}
            style={[
              styles.input,
              inputStyle,
              otp[index] ? styles.filledInput : null,
              isInvalid ? styles.invalidInput : null,
              {
                borderColor: isInvalid
                  ? theme.colors.negative.surface.medium
                  : (otp[index] ? focusColor : theme.colors.neutral.border.light),
                backgroundColor: isInvalid
                  ? theme.colors.negative.surface.lighter
                  : theme.colors.neutral.surface.lighter
              },
            ]}
            keyboardType="number-pad"
            maxLength={1}
            ref={(ref) => {
              if (ref && !inputs.current.includes(ref)) {
                inputs.current[index] = ref;
              }
            }}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(index, e)}
            value={otp[index]}
            editable={editable}
            selectTextOnFocus
            selectionColor={selectionColor}
            autoFocus={autoFocus && index === 0}
          />
        ))}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  input: {
    width: 50,
    height: 50,
    margin: 5,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 20,
    borderWidth: 1,
    borderColor: theme.colors.neutral.border.light,
    color: theme.colors.neutral.onSurface.light
  },
  filledInput: {
    borderWidth: 1,
  },
  invalidInput: {
    borderColor: theme.colors.negative.border.medium,
    backgroundColor: theme.colors.negative.surface.lighter,
  }
});

export default OtpInput;