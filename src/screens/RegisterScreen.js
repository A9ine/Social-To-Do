import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet } from 'react-native';
import axios from 'axios';

const RegisterScreen = () => {
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
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center', // centers the form in the middle of the screen
    backgroundColor: '#fff', // white background color
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'blue',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default RegisterScreen;
