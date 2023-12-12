import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setRefreshing(true);
    const storedUsername = await AsyncStorage.getItem('username');
    if (!storedUsername) {
      console.error('No username found');
      setRefreshing(false);
      return;
    }
    try {
      const response = await axios.get(`http://127.0.0.1:2323/getUserChats?username=${storedUsername}`);
      if (response.status === 200) {
        setChats(response.data.groups);
      }
    } catch (e) {
      console.error('Failed to fetch chats', e);
    }
    setRefreshing(false);
  };

  const handlePress = (id) => {
    setSelectedId(id);
    navigation.navigate('ChatScreen', { groupId: id });
  };

  const renderChatItem = ({ item }) => {
    const isSelected = item.group_id === selectedId;

    return (
      <TouchableOpacity
        onPress={() => handlePress(item.group_id)}
        style={[styles.chatItem, isSelected && styles.selectedChatItem]}
      >
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.group_name}</Text>
          <Text style={styles.chatSnippet}>{item.last_message}</Text>
        </View>
        <Text style={styles.chatTimestamp}>{item.last_message_time}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item, index) => 'chat-' + index}
        extraData={selectedId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
          />
        }
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StartChatScreen')}>
          <Text style={styles.buttonText}>Start a New Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F3F3F7',
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
    paddingVertical: 10,
  },
  selectedChatItem: {
    backgroundColor: '#EDE7F6',
  },
  chatName: {
    fontSize: 20,
    color: '#6c5ce7',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Adjusted for individual button widths
    marginTop: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#8A2BE2', // Purple color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25, // More rounded corners
    elevation: 2,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowColor: '#000',
    shadowOffset: { height: 1, width: 0 },
    marginHorizontal: 5, // Space between buttons
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center', // Ensure text is centered
    },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    paddingHorizontal: 10, // Added padding to container for spacing from screen edges
  },
  button: {
    flex: 1, // Each button will take equal space
    backgroundColor: '#8A2BE2',
    paddingVertical: 10,
    paddingHorizontal: 10, // Adjust padding to maintain button shape
    borderRadius: 25,
    elevation: 2,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowColor: '#000',
    shadowOffset: { height: 1, width: 0 },
    marginHorizontal: 5, // Maintain space between buttons
  },
});

export default ChatListScreen;
