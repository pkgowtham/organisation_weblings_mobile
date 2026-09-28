import { useRouter } from 'expo-router';
import { useRef, useCallback } from 'react';

type NavigationParams = {
  pathname: any;
  params?: Record<string, any>;
};

export function useSafeNavigation() {
  const router = useRouter();
  const isNavigating = useRef(false);

  const safeNavigate = useCallback(<T extends NavigationParams>(navigationFn: () => void) => {
    if (isNavigating.current) return;
    
    isNavigating.current = true;
    navigationFn();
    
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, []);

  const safePush = useCallback((path: any, params?: Record<string, any>) => {
    safeNavigate(() => {
      router.push({ pathname: path, params });
    });
  }, [router, safeNavigate]);

  const safeReplace = useCallback((path: any, params?: Record<string, any>) => {
    safeNavigate(() => {
      router.replace({ pathname: path, params });
    });
  }, [router, safeNavigate]);

  const safeBack = useCallback(() => {
    safeNavigate(() => {
      router.back();
    });
  }, [router, safeNavigate]);

  return { 
    safePush,
    safeReplace,
    safeBack,
    isNavigating: isNavigating.current 
  };
}