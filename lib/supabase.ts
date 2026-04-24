import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseURL = process.env.EXPO_PUBLIC_DATABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_DATABASE_ANON_KEY;

if (!supabaseURL || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
}

const isBrowser = typeof window !== "undefined";

const memoryStorage: Record<string, string> = {};

const ExpoStorage = {
    getItem: async (key: string) => {
        if (isBrowser) {
            return Promise.resolve(window.localStorage.getItem(key));
        }
        try {
            return await AsyncStorage.getItem(key);
        } catch {
            return memoryStorage[key] ?? null;
        }
    },

    setItem: async (key: string, value: string) => {
        if (isBrowser) {
            window.localStorage.setItem(key, value);
            return;
        }
        try{
            await AsyncStorage.setItem(key, value);
        } catch {
            memoryStorage[key] = value
        }
    },

    removeItem: async(key: string) => {
        if (isBrowser) {
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
        detectSessionInUrl: false,
    }
})