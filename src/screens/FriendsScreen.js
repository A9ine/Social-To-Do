import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const FriendsScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);

  const fetchFriends = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        const response = await axios.get('http://127.0.0.1:2323/getFriends', {
          params: { username }
        });
        if (response.status === 200) {
          setFriends(response.data.friends);
        } else {
          Alert.alert('Error', 'Failed to fetch friends');
        }
      }
    } catch (error) {
      console.error('Fetch friends error:', error);
      Alert.alert('Error', 'Failed to fetch friends due to a network error');
    }
  };

  // useFocusEffect runs the callback when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFriends();
      // When the screen is unfocused, you can return a cleanup function to cancel any outgoing requests
      return () => setFriends([]); // Optional cleanup to reset the friends list
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.friend_id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.friendItem}>{item.friend_username}</Text>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddFriendScreen')}
      >
        <Text style={styles.addButtonText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  friendItem: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addButton: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FriendsScreen;
