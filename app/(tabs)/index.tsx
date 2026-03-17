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
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Hi, <Text style={{fontWeight: 'bold'}}>User</Text></Text>
          </View>

          <View style={styles.lineContainer}>
            <View style={[styles.lineContainerBox, styles.twoBoxes]}>
              <Text>Box 1</Text>
            </View>
            <View style={[styles.lineContainerBox, styles.twoBoxes]}>
              <Text>Shows Connected Device if used?</Text>
            </View>
          </View>

          <View style={styles.lineContainer}>
            <View style={styles.lineContainerBox}>
              <Text>Hello</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
   welcomeContainer: {
    width: "100%",
    justifyContent: 'center',
    textAlign: 'left',
    paddingVertical: 10,
    backgroundColor: 'lightblue',
  },
  welcomeText: {
    fontSize: 32,
  },
  lineContainer: {
    width: "100%",
    gap: 20,
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  lineContainerBox: {
    borderWidth: 1,
    borderRadius: 10,
    flex: 1,    
  },
  twoBoxes: {
    width: 150,
    height: 150,
  }
});