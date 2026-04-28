import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseURL = process.env.EXPO_PUBLIC_DATABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_DATABASE_ANON_KEY;

if (!supabaseURL || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
}

const isWeb = Platform.OS === "web";

const memoryStorage: Record<string, string> = {};

const ExpoStorage = {
    getItem: async (key: string) => {
        if (isWeb) {
            if (typeof window === "undefined") return null;  // ← guard
            return Promise.resolve(window.localStorage.getItem(key));
        }
        try {
            return await AsyncStorage.getItem(key);
        } catch {
            return memoryStorage[key] ?? null;
        }
    },

    setItem: async (key: string, value: string) => {
        if (isWeb) {
            if (typeof window === "undefined") return;       // ← guard
            window.localStorage.setItem(key, value);
            return;
        }
        try {
            await AsyncStorage.setItem(key, value);
        } catch {
            memoryStorage[key] = value;
        }
    },

    removeItem: async (key: string) => {
        if (isWeb) {
            if (typeof window === "undefined") return;       // ← guard
            window.localStorage.removeItem(key);
            return;
        }
        try {
            await AsyncStorage.removeItem(key);
        } catch {
            delete memoryStorage[key];
        }
    }
};

export const supabase = createClient(supabaseURL, supabaseAnonKey, {
    auth: {
        storage: ExpoStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: isWeb,  // ← should be true on web for OAuth flows
    }
});