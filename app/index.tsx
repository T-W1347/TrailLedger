import { Redirect } from 'expo-router';
import { useContext } from 'react';
import { Text } from 'react-native';
import { AuthContext } from '../context/AuthContext';


export default function Index() {
    const context = useContext(AuthContext);

    if (!context) throw new Error("AuthProvider missing");

    const { session, loading } = context;

    if (loading) return <Text>Loading...</Text>;

    if (session) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)/login" />;
}