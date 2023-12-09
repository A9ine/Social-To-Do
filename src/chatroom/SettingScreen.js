import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../core/firebase'; // Import your Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';


const SettingScreen = () => {
  const [newEmail, setNewEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicUri, setProfilePicUri] = useState('');
  
  const fetchProfilePicture = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        const response = await axios.get(`http://127.0.0.1:2323/getProfilePicture?username=${username}`);
        if (response.status === 200 && response.data) {
          setProfilePicUri(response.data); // Set the profile picture URI
        }
      }
    } catch (error) {
      console.error('Fetch profile picture error:', error);
      Alert.alert('Error', 'Failed to fetch profile picture');
    }
};


  useEffect(() => {
    fetchProfilePicture();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfilePicture();
    }, [])
  );

  const handleUpdateProfilePicture = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to access gallery is required!');
      return;
    }
  
    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
    });
  
    // Continue only if the user did not cancel the picker
    if (!result.cancelled) {
      setProfilePicUri(result.assets[0].uri); // Update the state
      uploadProfilePicture(result.assets[0].uri); // Call upload function with the URI
    }
  };
  
  // Function to upload the profile picture to Firebase and update the database
  const uploadProfilePicture = async (uri) => {
    try {
      if (!uri) {
        Alert.alert('No Image', 'Please select an image first!');
        return;
      }
  
      const response = await fetch(uri);
      const blob = await response.blob();
      const uuid = generateUUID();
      const imageRef = ref(storage, `images/${uuid}.jpg`);
  
      // Upload image to Firebase Storage
      await uploadBytes(imageRef, blob);
  
      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);
  
      // Update the profile picture in the database
      const username = await AsyncStorage.getItem('username');
      const updateResponse = await axios.put('http://127.0.0.1:2323/updateProfilePic', {
        username: username,
        profile_pic_url: downloadURL,
      });
  
      if (updateResponse.status === 200) {
        await AsyncStorage.setItem('profilePic', downloadURL);
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Upload failed');
    }
  };
  

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

  const generateUUID = () => {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
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
      <View style={styles.profilePicContainer}>
        {profilePicUri ? (
          <Image source={{ uri: profilePicUri }} style={styles.profilePic} />
        ) : (
          <View style={styles.profilePicPlaceholder}>
          </View>
        )}
        <TouchableOpacity onPress={handleUpdateProfilePicture}>
          <Text style={styles.changeProfilePicText}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>
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
    width: '55%',
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
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeProfilePicText: {
    color: '#8A2BE2',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});

export default SettingScreen;
