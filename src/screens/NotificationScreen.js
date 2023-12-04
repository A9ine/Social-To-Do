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
    <View style={styles.friendRequest}>
      <Text style={styles.friendName}>{item.friend_username}</Text>
      <TouchableOpacity style={styles.acceptButton} onPress={() => handleAcceptFriend(item.friend_username)}>
        <Text>Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.denyButton} onPress={() => handleDenyFriend(item.friend_username)}>
        <Text>Deny</Text>
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
  container: {
    flex: 1,
    padding: 10,
  },
  friendRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  friendName: {
    flex: 1,
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  denyButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
});

export default NotificationsScreen;
