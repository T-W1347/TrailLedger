import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";


export default function Third() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Rides and trails</Text>
      <Link href="/trails">Go to Trails</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});