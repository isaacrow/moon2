Install the package.

npx expo install expo-ios-visual-blur
2. Install the necessary CocoaPods dependencies.

cd ios && pod install
3. If you are using a bare React Native workflow, you need to prebuild the iOS project.

npx expo prebuild --platform ios
5. Run your application on an iOS simulator or device.

npx expo run:ios
6. Import BlurView and the BlurViewDirection enum from the package. The BlurView component acts as a container that applies the blur effect to any content placed inside it.

import React from "react";
import { BlurView, BlurViewDirection } from "expo-ios-visual-blur";
import { Image, View, Text, StyleSheet } from "react-native";
export default function App() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1754638069174-7aa06c176b61" }}
        style={styles.backgroundImage}
      />
      <BlurView
        direction={BlurViewDirection.BlurredBottomClearTop}
        maxBlurRadius={25}
        startOffset={0.2}
        style={styles.blurContainer}
      >
        <Text style={styles.title}>Blurred Content</Text>
        <Text style={styles.subtitle}>
          This text appears inside the blur view.
        </Text>
      </BlurView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden", // Ensures the blur respects the border radius
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  }
});
7. You can then configure the blur effect with these props:

maxBlurRadius: A number that sets the maximum blur intensity. The default is 20.
direction: Determines the gradient’s flow. Use BlurViewDirection.BlurredTopClearBottom for a blur that fades from top to bottom or BlurViewDirection.BlurredBottomClearTop for the reverse.
startOffset: A number between 0 and 1 that controls the vertical starting point of the blur gradient.
style: Applies standard React Native styles to the container.