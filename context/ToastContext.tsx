import Toast from '@/components/ui/toast';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ToastType = 'neutral' | 'success' | 'info' | 'warning' | 'error' | 'report';
type IconType = 'checkmark' | 'success' | 'info' | 'warning' | 'error' | 'none';

interface ToastState {
  visible: boolean;
  type: ToastType;
  iconType: IconType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastState, 'visible'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: 'neutral',
    iconType: 'none',
    title: '',
    message: '',
  });

  const timerRef = React.useRef<NodeJS.Timeout | null | number>(null);

  const showToast = ({ type, iconType, title, message }: Omit<ToastState, 'visible'>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const safeStringify = (val: any): string => {
      if (!val) return "";
      if (typeof val === "string") return val;
      if (typeof val === "object") {
        if (val.message && typeof val.message === "string") return val.message;
        if (val.error && typeof val.error === "string") return val.error;
        try {
          return JSON.stringify(val);
        } catch {
          return String(val);
        }
      }
      return String(val);
    };

    setToast({
      visible: true,
      type,
      iconType,
      title: safeStringify(title),
      message: message ? safeStringify(message) : undefined,
    });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      timerRef.current = null;
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <View style={styles.container}>
        {children}
      </View>

      <SafeAreaView style={styles.toastOverlay} pointerEvents="box-none">
        {toast.visible && (
          <Toast
            variant={toast.type}
            iconType={toast.iconType}
            title={toast.title}
            message={toast.message}
            onClose={() => {
              if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
              }
              setToast({ ...toast, visible: false });
            }}
          />
        )}
      </SafeAreaView>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastOverlay: {
    position: 'absolute',
    marginTop: 20,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};