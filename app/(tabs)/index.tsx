import { ImageBackground, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const headerImage = require('../../assets/images/trailLedger-header-background.jpeg');

export default function Index() {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <ImageBackground style={styles.headerImage} source={headerImage}>
            <Text style={styles.headerText}>TrailLedger</Text>
          </ImageBackground>
        </View>
        <ScrollView>
        <Text>Edit app/index.tsx to edit this screen.</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  headerImage: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});