import { router } from "expo-router";
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from '../../lib/supabase';


export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleRegister = async () => {
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPassword,
        });

        if (error) {
            Alert.alert("Signup Error", error.message);
            return;
        }

        const user = data.user;

        if (user) {
            const { error: profileError } = await supabase
                .from("profiles")
                .insert({ id: user.id });
            
            if (profileError) {
                console.log("Profile creation error:", profileError);
            }
        }

        Alert.alert("Success", "Account created!");
        router.push("/(auth)/login");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start tracking your rides</Text>

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

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text style={styles.link} onPress={() => router.push("/(auth)/login")}>
                    Login
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