import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = ({ route, navigation }) => {
  const { pendingFriends } = route.params;

  const handleAcceptFriend = async (friendUsername) => {
    try {
      // Replace with your username retrieval method
      const username = await AsyncStorage.getItem('username');
      await axios.post('http://127.0.0.1:2323/acceptFriend', { user1: username, user2: friendUsername });
      Alert.alert('Success', 'Friend request accepted');
      navigation.goBack(); // Or refresh the list
    } catch (error) {
      console.error('Accept friend error:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleDenyFriend = async (friendUsername) => {
    try {
      // Replace with your username retrieval method
      const username = await AsyncStorage.getItem('username');
      await axios.post('http://127.0.0.1:2323/denyFriend', { user1: username, user2: friendUsername });
      Alert.alert('Success', 'Friend request denied');
      navigation.goBack(); // Or refresh the list
    } catch (error) {
      console.error('Deny friend error:', error);
      Alert.alert('Error', 'Failed to deny friend request');
    }
  };

  const renderPendingFriend = ({ item }) => (
    <View style={styles.userItemContainer}>
      <View style={styles.avatar}></View>
      <Text style={styles.userItem}>{item.friend_username}</Text>
      <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptFriend(item.friend_username)}>
        <Text style ={styles.buttonText}>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.denyButton} onPress={() => handleDenyFriend(item.friend_username)}>
        <Text style ={styles.buttonText} >Deny</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingFriends}
        keyExtractor={(item) => item.friend_id.toString()}
        renderItem={renderPendingFriend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  userItemContainer: {
    flexDirection: 'row',
    padding: 15,
    marginHorizontal: 10,
    backgroundColor: '#eaddff', // Light purple background
    borderRadius: 20,
    shadowOpacity: 0,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  userItem: {
    flex:1 , // Take available space
    fontSize: 18,
    color: '#5e35b1',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4C4C4',
    marginRight: 10,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f3e9ff',
  },
  acceptButton: {
    backgroundColor: '#a29bfe',
    padding: 5,
    borderRadius: 5,
    marginLeft: 40,
    height: '80%',
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
  },
  denyButton: {
    backgroundColor: '#C4C4C4',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
    height: '80%',
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
  },

  buttonText: {
    
  }
});

export default NotificationsScreen;
