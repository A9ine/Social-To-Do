import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { storage } from '../core/firebase'; // Import your Firebase storage
import { ref, uploadBytes } from 'firebase/storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const MakePostScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState();

  const fetchTasks = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        const response = await axios.get('http://127.0.0.1:2323/getIncompletedTasks', {
          params: { username }
        });
        if (response.status === 200) {
          setTasks(response.data.tasks);
        } else {
          Alert.alert('Error', 'Failed to fetch tasks');
        }
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
      Alert.alert('Error', 'Failed to fetch tasks due to a network error');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleImagePicked = (result) => {
    if (!result.cancelled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleTakePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Camera permission is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleImagePicked(result);
  };

  const handleBrowseFiles = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Media Library permission is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleImagePicked(result);
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
  

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select an image first!');
      return;
    }
  
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
  
      const imageRef = ref(storage, `images/${generateUUID()}.jpg`);
      await uploadBytes(imageRef, blob);
  
      Alert.alert('Success', 'Image uploaded successfully');
    } catch (e) {
      console.error('Upload error:', e);
      Alert.alert('Error', 'Upload failed');
    }
  };
  

  return (
    <View style={styles.container}>
      {imageUri ? (
        <>
          {tasks.length > 0 && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTask}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) => setSelectedTask(itemValue)}
              >
                {tasks.map((task) => (
                  <Picker.Item key={task.task_id} label={task.task_description} value={task.task_id} />
                ))}
              </Picker>
            </View>
          )}
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.button} onPress={uploadImage}>
            <Text style={styles.buttonText}>Upload Post</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleTakePicture}>
            <Text style={styles.buttonText}>Take Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleBrowseFiles}>
            <Text style={styles.buttonText}>Browse Files</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F3F7', // Light background color
  },
  pickerContainer: {
    height: 50,
    width: '80%',
    marginBottom: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8A2BE2', // Purple border
    borderRadius: 4,
  },
  picker: {
    width: '100%',
  },
  imagePreview: {
    width: 300,
    height: 300,
    marginBottom: 20,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#8A2BE2', // Purple border for image preview
  },
  button: {
    backgroundColor: '#8A2BE2', // Purple color for the button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MakePostScreen;