import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// Import axios or any other networking library if needed

const SettingScreen = () => {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdate = async () => {
    if (!newEmail || !currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Implement the logic to verify the current password and update email and password
    try {
      //axios.post('your-api-endpoint', { newEmail, currentPassword, newPassword })
      Alert.alert('Success', 'Your details have been updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update details');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>New Email:</Text>
      <TextInput 
        style={styles.input} 
        value={newEmail} 
        onChangeText={setNewEmail}
        placeholder="Enter new email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Current Password:</Text>
      <TextInput 
        style={styles.input} 
        value={currentPassword} 
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
        secureTextEntry
      />

      <Text style={styles.label}>New Password:</Text>
      <TextInput 
        style={styles.input} 
        value={newPassword} 
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Update Details</Text>
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
  label: {
    alignSelf: 'flex-start',
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
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SettingScreen;
