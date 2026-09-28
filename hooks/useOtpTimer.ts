import { useState, useEffect, useCallback } from 'react';

interface UseOtpTimerOptions {
  initialSeconds?: number;
  autoStart?: boolean;
}

/**
 * Custom hook to handle OTP countdown timers (default 60 seconds)
 */
export function useOtpTimer({
  initialSeconds = 60,
  autoStart = true,
}: UseOtpTimerOptions = {}) {
  const [timer, setTimer] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    if (!isActive || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timer]);

  const resetTimer = useCallback((seconds: number = initialSeconds) => {
    setTimer(seconds);
    setIsActive(true);
  }, [initialSeconds]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const formattedTimer = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  return {
    timer,
    formattedTimer,
    isTimerActive: timer > 0,
    resetTimer,
    stopTimer,
  };
}
