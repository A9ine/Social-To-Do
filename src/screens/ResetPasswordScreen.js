import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { theme } from '../core/theme';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';


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
    <Background>
      <Logo/>
      <TextInput
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#a9a9a9"
      />
      <TouchableOpacity 
        onPress={sendVerificationEmail}
        disabled={countdown > 0}
      >
        <Button mode="contained">
          {countdown > 0 ? `Wait ${countdown}s` : 'Send Verification Email'}
        </Button>
      </TouchableOpacity>
      <TextInput
        value={verificationCode}
        onChangeText={handleVerificationCodeChange}
        placeholder="Verification Code"
        placeholderTextColor="#a9a9a9"
      />
      <TextInput
        value={newPassword}
        onChangeText={handleNewPasswordChange}
        placeholder="New Password"
        secureTextEntry
        placeholderTextColor="#a9a9a9"
      />
      <TouchableOpacity 
        onPress={changeUserPassword}
      >
        <Button mode="contained">Change Password</Button>
      </TouchableOpacity>
    </Background>
  );
}

export default ResetPasswordScreen;
