import { Entypo, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout(){
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
                name="trails"
                options={{
                    title: "Trails",
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name='trail-sign' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="rides"
                options={{
                    title: "Rides",
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome5 name='bicycle' size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}