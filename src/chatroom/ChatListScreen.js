import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const ChatListScreen = () => {
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(null);

  const handlePress = (id) => {
    setSelectedId(id); // Set the selected ID
    navigation.navigate('ChatScreen', { groupId: id });
  };


  useFocusEffect(
    React.useCallback(() => {
      const fetchChats = async () => {
        const storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) {
          console.error('No username found');
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
      };
      fetchChats();
    }, [])
  );

  const renderChatItem = ({ item }) => {
    const isSelected = item.group_id === selectedId;

    return (
      <TouchableOpacity
        onPress={() => handlePress(item.group_id)}
        style={[styles.chatItem, isSelected && styles.selectedChatItem]}
      >
        <Text style={styles.chatName}>{item.group_name}</Text>
        {/* ... other chat details */}
      </TouchableOpacity>
    );
  };



  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item, index) => 'chat-' + index}
        extraData={selectedId} // Pass selectedId to ensure re-rendering when it changes
      />
      <Button title="Start a new chat" onPress={() => navigation.navigate('StartChatScreen')} />
      <Button title="Back to Home" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  chatItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  selectedChatItem: {
    backgroundColor: '#e1e1e1', // Change background color for selected item
  },
});

export default ChatListScreen;
