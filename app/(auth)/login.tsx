import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from '../../lib/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        console.log("LOGIN DATA:", data);
        console.log("LOGIN ERROR:", error);

        if (error) {
            Alert.alert('Login Error', error.message);
            return;
        }
    }

    return (
        <View style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue</Text>

            {/* Inputs */}
            <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                onChangeText={setPassword}
                style={styles.input}
            />

            {/* Button */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.footerText}>
                Don't have an account?{" "}
                <Text style={styles.link} onPress={() => router.push("/(auth)/register")}>
                    Sign up
                </Text>
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    button: {
        backgroundColor: "#111827",
        padding: 15,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
    },
    footerText: {
        marginTop: 20,
        textAlign: "center",
        color: "#666",
    },
    link: {
        color: "#111827",
        fontWeight: "600",
    },
});