import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { theme } from '../core/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  buttonContainer: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#4B0082',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: theme.colors.primary,
    marginTop: 15,
    fontSize: 16,
  },
});

function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((currentCountdown) => currentCountdown - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleEmailChange = (email) => setEmail(email);
  const handleNewPasswordChange = (password) => setNewPassword(password);
  const handleVerificationCodeChange = (code) => setVerificationCode(code);

  const sendVerificationEmail = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:2323/getVerification', { email });
      Alert.alert("Check your email", response.data.message);
      setCountdown(60); // Start countdown from 60 seconds
    } catch (error) {
      console.error('Error:', error);
      Alert.alert("Error", error.response?.data.error || 'Error sending verification email');
    }
  };

  const changeUserPassword = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:2323/changePassword', {
        email, 
        new_password: newPassword, 
        verification_code: verificationCode
      });
      
      if (response.data.success) {
        Alert.alert("Success", "Password updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Error", response.data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert("Error", error.response?.data.error || 'Error changing password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#a9a9a9"
      />
      <TouchableOpacity 
        style={styles.buttonContainer} 
        onPress={sendVerificationEmail}
        disabled={countdown > 0}
      >
        <Text style={styles.buttonText}>
          {countdown > 0 ? `Wait ${countdown}s` : 'Send Verification Email'}
        </Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={verificationCode}
        onChangeText={handleVerificationCodeChange}
        placeholder="Verification Code"
        placeholderTextColor="#a9a9a9"
      />
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={handleNewPasswordChange}
        placeholder="New Password"
        secureTextEntry
        placeholderTextColor="#a9a9a9"
      />
      <TouchableOpacity 
        style={styles.buttonContainer} 
        onPress={changeUserPassword}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ResetPasswordScreen;
