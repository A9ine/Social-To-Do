import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import debounce from 'lodash.debounce'; // Install lodash.debounce to handle debouncing
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddFriendScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const debouncedSearch = debounce(searchUsers, 300);
    debouncedSearch(searchText);

    return () => debouncedSearch.cancel();
  }, [searchText]);

  const searchUsers = async (text) => {
    if (text.length > 0) {
      try {
        const user_id = await AsyncStorage.getItem('user_id'); // Get the current user's ID
        // Make sure you pass the user_id as a query parameter in the GET request
        const response = await axios.get(`http://127.0.0.1:2323/searchUser`, {
          params: { query: text, user_id: user_id }
        });
        
        if (response.status === 200) {
          setSearchResults(response.data.users);
        }
      } catch (error) {
        console.error('Search error:', error);
        // Optionally handle the error by setting state or alerting the user
      }
    } else {
      setSearchResults([]);
    }
};


  const handleAddFriend = async (friendUsername) => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'Unable to identify user');
        return;
      }

      const response = await axios.post('http://127.0.0.1:2323/addFriend', {
        user1: username,
        user2: friendUsername
      });

      if (response.status === 200) {
        Alert.alert('Success', `${friendUsername} has been sent a friend invitation`);
        navigation.navigate('FriendsScreen')
        
      } else {
        Alert.alert('Error', 'Failed to add friend');
      }
    } catch (error) {
      console.error('Add friend error:', error);
      Alert.alert('Error', 'Failed to add friend due to a network error');
    }
  };
  

  const confirmAddFriend = (friendUsername) => {
    Alert.alert(
      'Add Friend',
      `Do you want to add ${friendUsername} as a friend?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => handleAddFriend(friendUsername) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search users"
        placeholderTextColor="#888" // Added placeholder text color
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItemContainer} onPress={() => confirmAddFriend(item.username)}>
            <Text style={styles.userItem}>{item.username}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f3e9ff', // Very light purple
  },
  input: {
    borderWidth: 1,
    borderColor: '#7a42f4', // Bold purple for border
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
    color: '#5e35b1', // Darker purple for text
  },
  userItemContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#eaddff', // Light purple background
    borderRadius: 8,
    shadowColor: '#7a42f4', // Purple shadow for depth
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userItem: {
    fontSize: 20,
    color: '#5e35b1', // Dark purple for item text
  },
});

export default AddFriendScreen;
