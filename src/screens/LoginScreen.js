import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import axios from 'axios';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { theme } from '../core/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
export default function Login({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        if (username) {
          // If there is a username stored, navigate to the HomeScreen
          navigation.navigate('HomeScreen');
        }
        // You might also want to check if a valid session token exists instead of just a username
      } catch (e) {
        console.error('Failed to fetch credentials', e);
      }
    };

    checkLogin();
  }, []);

  const storeCredentials = async (username, userId, first_name) => {
    try {
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('user_id', userId.toString());
      await AsyncStorage.setItem('first_name', first_name.toString());
    } catch (e) {
      console.error('Storing credentials failed', e);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:2323/login', {
        username_or_email: email.value,
        password: password.value,
      });

      if (response.data.authenticated) {
        Alert.alert('Success', 'Login successful!');
        await storeCredentials(response.data.username, response.data.user_id, response.data.first_name);
        navigation.navigate('HomeScreen');
      } else {
        Alert.alert('Error', 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed due to a network error');
    }
  };

  return (
    <Background>
      <Logo />
      <Header>Welcome back.</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen')}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={handleLogin}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
