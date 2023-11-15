import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from "./src/screens/LoginScreen.js"

export default function App() {
  return (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <LoginScreen/>
  </View>

  );
}