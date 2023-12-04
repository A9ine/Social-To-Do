import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const route = useRoute();
  const { groupId } = route.params;

  useFocusEffect(
    useCallback(() => {
      let intervalId;
  
      const fetchChatDetails = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:2323/getChat?group_id=${groupId}`);
          if (response.status === 200) {
            setMessages(response.data.messages);
          }
        } catch (error) {
          console.error('Failed to fetch chat messages', error);
        }
      };
  
      const startPolling = () => {
        // Fetch immediately on focus
        fetchChatDetails();
        // Start polling
        intervalId = setInterval(fetchChatDetails, 1000);
      };
  
      startPolling();
  
      // Clear the interval when the screen goes out of focus
      return () => clearInterval(intervalId);
    }, [groupId])
  );
  
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        const username = await AsyncStorage.getItem('username');
        const response = await axios.post('http://127.0.0.1:2323/sendChat', {
          group_id: groupId,
          message: newMessage,
          username: username
          // include other necessary fields like userId or authToken depending on your API
        });
        
        if (response.status === 200) {
          setNewMessage(''); // Clear the input field
          // Ideally, you would want to fetch the messages again to show the new message
          // Alternatively, if your backend sends the full message back, you can append it to the chat
        }
      } catch (error) {
        console.error('Failed to send message', error);
      }
    }
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageItem}>
      <Text style={styles.messageText}>{item.usernames}: {item.message}</Text>
      <Text style={styles.messageDate}>{item.sent_at}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => 'message-' + index}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type your message here..."
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  messageItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: 'gray',
  },
});

export default ChatScreen;
