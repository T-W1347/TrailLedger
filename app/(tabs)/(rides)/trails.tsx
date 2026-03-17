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
      <Text>Just trails</Text>
        <Link href="/">Go to Rides</Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});