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
      `${friendUsername} want to team up!!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => handleAddFriend(friendUsername) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.modal, {borderWidth: 1, borderColor: '#7a42f4', backgroundColor: '#f3e9ff'}]}
        placeholder="Search friends"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.userItemContainer}
            onPress={() => confirmAddFriend(item.username)}>
            <View style={styles.avatar}></View>
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

  modal: { 
    marginBottom: 20,
    marginHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 5,
    padding: 15,
  },
  userItemContainer: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: '#eaddff', // Light purple background
    borderRadius: 20,
    shadowOpacity: 0,
    shadowRadius: 5,
    elevation: 3,
  },
  userItem: {
    fontSize: 20,
    color: '#5e35b1', // Dark purple for item text
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4C4C4',
    marginRight: 10,
  },
});

export default AddFriendScreen;
