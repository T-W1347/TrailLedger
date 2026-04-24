import { Entypo, FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';


export default function TabLayout(){
    const context = useContext(AuthContext);

    if (!context?.loading && !context?.session) {
        return <Redirect href="/(auth)/login" />;
    }

    return(
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({color, size}) => (
                        <Entypo name='home' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(rides)"
                options={{
                    title: "Rides",
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome5 name='bicycle' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: "Events",
                    tabBarIcon: ({color, size}) => (
                        <MaterialIcons name='event' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="user"
                options={{
                    title: "Profile",
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome name='user' size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}