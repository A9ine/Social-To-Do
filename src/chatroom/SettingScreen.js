import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingScreen = () => {
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendVerification = async () => {
    if (!newEmail) {
      Alert.alert('Error', 'Please enter your new email');
      return;
    }

    try {
      const username = await AsyncStorage.getItem('username');
      const response = await axios.post('http://127.0.0.1:2323/getVerificationChangeEmail', { username: username, new_email: newEmail });
      if (response.status === 200) {
        Alert.alert('Success', 'Verification code sent to your email');
      } else {
        Alert.alert('Error', 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Failed to send verification code');
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || !verificationCode) {
      Alert.alert('Error', 'Please fill in all fields for email update');
      return;
    }

    try {
      const username = await AsyncStorage.getItem('username');
      const response = await axios.post('http://127.0.0.1:2323/updateEmail', {
        username: username,
        new_email: newEmail,
        verification_code: verificationCode
      });

    if (response.status === 200) {
      Alert.alert('Success', response.data.message);
    } else {
      Alert.alert('Error', `Update failed with status: ${response.status}`);
    }
      } catch (error) {
        console.error('update email error:', error);
        Alert.alert('Error', 'Failed to update email');
      }
    };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields for password change');
      return;
    }

    try {
      const username = await AsyncStorage.getItem('username');
      axios.post('http://127.0.0.1:2323/updatePassword', { username: username, old_password: currentPassword, new_password:newPassword })
      Alert.alert('Success', 'Your password has been updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Change Email</Text>
      <TextInput 
        style={styles.input} 
        value={newEmail} 
        onChangeText={setNewEmail}
        placeholder="Enter new email"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendVerification}>
        <Text style={styles.buttonText}>Send Verification Code</Text>
      </TouchableOpacity>
      <TextInput 
        style={styles.input} 
        value={verificationCode} 
        onChangeText={setVerificationCode}
        placeholder="Enter verification code"
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
        <Text style={styles.buttonText}>Update Email</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Change Password</Text>
      <TextInput 
        style={styles.input} 
        value={currentPassword} 
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
        secureTextEntry
      />
      <TextInput 
        style={styles.input} 
        value={newPassword} 
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});

export default SettingScreen;
