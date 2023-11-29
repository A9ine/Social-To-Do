import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import TextInput from '../components/TextInput';
import Header from '../components/Header';
import Button from '../components/Button';
import axios from 'axios';
import Background from '../components/Background';
import { Text } from 'react-native-paper';
import Logo from '../components/Logo';

// Add navigation prop to your component
const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:2323/register', {
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: username,
        password: password,
      });
  
      // Check for a successful response (status code 200)
      if (response.status === 200) {
        Alert.alert('Success', 'Registration successful!');
        // Navigate back to the previous screen
        navigation.goBack();
      } else {
        // If the server responds with a status other than 200, it's treated as an error
        const errorText = response.data && response.data.error ? response.data.error : 'Registration failed with status: ' + response.status;
        Alert.alert('Error', errorText);
      }
    } catch (error) {
      // Error handling for network issues or server configuration problems
      let errorMessage = 'Registration failed due to a network error.';
      if (error.response && error.response.data && error.response.data.error) {
        // Extract the error message from the server's response
        errorMessage = error.response.data.error;
      }
      console.error('Registration error:', error);
      Alert.alert('Error', errorMessage);
    }
  };
  
  return (
    <Background>
      <Logo/>
      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleRegister}>
        Register
      </Button>
    </Background>
  );
};

export default RegisterScreen;
