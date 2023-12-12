import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StartChatScreen = ({ navigation }) => {
  const [group_name, setGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState(new Set());

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        if (!username) {
          Alert.alert('Error', 'Username not found');
          return;
        }
        const response = await axios.get(`http://127.0.0.1:2323/getFriends`, { params: { username } });
        if (response.status === 200) {
          setFriends(response.data.friends);
        } else {
          Alert.alert('Error', 'Failed to fetch friends');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch friends');
        console.error('fetchFriends error:', error);
      }
    };

    fetchFriends();
  }, []);

  const handleSelectFriend = (friendUsername) => {
    const newSelectedFriends = new Set(selectedFriends);
    if (newSelectedFriends.has(friendUsername)) {
      newSelectedFriends.delete(friendUsername);
    } else {
      newSelectedFriends.add(friendUsername);
    }
    setSelectedFriends(newSelectedFriends);
  };

  const handleStartChat = async () => {
    if (!group_name.trim() || selectedFriends.size === 0) {
      Alert.alert('Error', 'Please provide a group name and select at least one friend');
      return;
    }

    const username = await AsyncStorage.getItem('username');
    try {
      const response = await axios.post('http://127.0.0.1:2323/startChat', {
        group_name,
        created_by: username,
        members: Array.from(selectedFriends)
      });
      
      if (response.status === 200) {
        Alert.alert('Success', 'Group chat started successfully');
        navigation.goBack(); // Or navigate to the chat screen
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const renderFriend = ({ item }) => {
    const isSelected = selectedFriends.has(item.friend_username);
    return (
      <TouchableOpacity
        onPress={() => handleSelectFriend(item.friend_username)}
        style={[styles.friendItem, isSelected && styles.selectedItem]}
      >
        <Text style={styles.friendName}>
          {item.friend_username}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        placeholderTextColor="#666" // Placeholder text color
        value={group_name}
        onChangeText={setGroupName}
      />
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.friend_id.toString()}
        extraData={selectedFriends}
      />
      <TouchableOpacity style={styles.button} onPress={handleStartChat}>
        <Text style={styles.buttonText}>Start Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20, // Increased padding for better spacing
    backgroundColor: '#F3F3F7', // Consistent background color
  },
  input: {
    borderWidth: 1,
    borderColor: '#6c5ce7', // Purple border color
    padding: 15, // Increased padding for a larger input area
    marginBottom: 20, // Increased margin for more space between elements
    borderRadius: 8, // Rounded corners
    fontSize: 16, // Larger font size
    color: '#333', // Darker font color
  },
  friendItem: {
    padding: 15, // Increased padding for a larger touch area
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    backgroundColor: '#FFF', // White background for each item
    borderRadius: 8, // Rounded corners
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#EDE7F6', // Light purple to indicate selection
  },
  friendName: {
    color: '#333', // Darker font color
    fontSize: 16, // Larger font size
  },
  button: {
    backgroundColor: '#8A2BE2', // Purple button
    padding: 15, // Increased padding for a larger button
    borderRadius: 25, // Rounded corners
    alignItems: 'center', // Center text horizontally
    marginTop: 20, // Space above the button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: 'white', // White text color
    fontWeight: 'bold', // Bold text
    fontSize: 18, // Larger font size
  },
});

export default StartChatScreen;