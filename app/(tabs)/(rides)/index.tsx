import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import RidesScreen from "./ridesList"; // rename your current rides UI
import Trails from "./trails";

const Tab = createMaterialTopTabNavigator();

export default function RidesTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1f2937",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarIndicatorStyle: { backgroundColor: "#111827" },
        tabBarLabelStyle: { fontWeight: "600", fontSize: 14 },
        tabBarStyle: { backgroundColor: "#fff" },
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="Rides" component={RidesScreen} />
      <Tab.Screen name="Trails" component={Trails} />
    </Tab.Navigator>
  );
}