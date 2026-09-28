import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

const CACHE_PREFIX = 'cache_';
const DEFAULT_EXPIRY = 30 * 60 * 1000; // 30 minutes

export const cacheManager = {
  set: async (key: string, data: any, expiry: number = DEFAULT_EXPIRY) => {
    try {
      const cacheItem: CacheItem = {
        data,
        timestamp: Date.now(),
        expiry,
      };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      console.error('Error saving to cache:', error);
      return false;
    }
  },

  get: async (key: string): Promise<{ data: any; isFresh: boolean; timestamp: number } | null> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem = JSON.parse(cached);
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.expiry;

      if (isExpired) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return {
        data: cacheItem.data,
        isFresh: Date.now() - cacheItem.timestamp < 5000,
        timestamp: cacheItem.timestamp
      };
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  },

  has: async (key: string): Promise<boolean> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return false;

      const cacheItem: CacheItem = JSON.parse(cached);
      return Date.now() - cacheItem.timestamp <= cacheItem.expiry;
    } catch {
      return false;
    }
  },

  remove: async (key: string) => {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  },
};