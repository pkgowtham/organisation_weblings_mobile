import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type UserData = {
  token: string;
  userId: string;
  firstName: string;
  lastName: string;
  year: string;
  role?: string;
  dp?: string;
  avatar?: string;
  socialHandles?: {
    instagram?: string;
    tiktok?: string;
    snapchat?: string;
  };
};

type AuthContextType = {
  user: UserData | null;
  loading: boolean;
  login: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const userData = {
            token,
            userId: await AsyncStorage.getItem('userId') || '',
            firstName: await AsyncStorage.getItem('firstName') || '',
            lastName: await AsyncStorage.getItem('lastName') || '',
            year: await AsyncStorage.getItem('year') || '',
            role: await AsyncStorage.getItem('role') || undefined,
            dp: await AsyncStorage.getItem('dp') || undefined,
            avatar: await AsyncStorage.getItem('avatar') || undefined,
            socialHandles: {
              instagram: await AsyncStorage.getItem('instagram') || undefined,
              tiktok: await AsyncStorage.getItem('tiktok') || undefined,
              snapchat: await AsyncStorage.getItem('snapchat') || undefined,
            }
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (responseData: any) => {
    try {
      const userData = {
        token: responseData.token,
        userId: responseData.user.details._id,
        firstName: responseData.user.details.firstName,
        lastName: responseData.user.details.lastName,
        year: responseData.user.details.year,
        role: responseData.user.role,
        dp: responseData.user.details.dp,
        avatar: responseData.user.details.avatar,
        socialHandles: responseData.user.details.socialHandles
      };

      // Save all data to AsyncStorage
      await AsyncStorage.multiSet([
        ['authToken', responseData.token],
        ['userId', responseData.user.details._id],
        ['firstName', responseData.user.details.firstName],
        ['lastName', responseData.user.details.lastName],
        ['year', responseData.user.details.year],
        ['role', responseData.user.role],
        ['dp', responseData.user.details.dp],
        ['avatar', responseData.user.details.avatar],
        ['instagram', responseData.user.details.socialHandles.instagram || ''],
        ['tiktok', responseData.user.details.socialHandles.tiktok || ''],
        ['snapchat', responseData.user.details.socialHandles.snapchat || '']
      ]);

      setUser(userData);
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Failed to save user data', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'authToken',
        'userId',
        'firstName',
        'lastName',
        'year',
        'role',
        'dp',
        'avatar',
        'instagram',
        'tiktok',
        'snapchat'
      ]);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);