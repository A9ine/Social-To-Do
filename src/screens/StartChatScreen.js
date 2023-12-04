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
        value={group_name}
        onChangeText={setGroupName}
      />
      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.friend_id.toString()}
        extraData={selectedFriends} // Add this line to ensure the FlatList updates when selectedFriends changes
      />
      <Button
        title="Start Chat"
        onPress={handleStartChat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedItem: {
    backgroundColor: '#e0e0e0', // Change the color to indicate selection
  },
  friendName: {
    color: 'black',
  },
  friendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default StartChatScreen;

