import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Image } from 'react-native';
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

  const formatDateWithoutTimezone = (dateString) => {
    const date = new Date(dateString);
    // Format the date as you wish
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true, // you can set this to false if you want 24-hour format
      timeZone: 'UTC' // This will force it to not consider timezone offsets
    });
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageItem}>
      {item.profile_pic ? (
        <Image
          source={{ uri: item.profile_pic }}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.avatar}></View> // Display a placeholder if no profile picture
      )}
      <View style={styles.messageContent}>
        <Text style={styles.messageText}>{item.username}: {item.message}</Text>
        <Text style={styles.messageDate}>{formatDateWithoutTimezone(item.sent_at)}</Text>
      </View>
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
    backgroundColor: '#F3F3F7', // Consistent background color
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // White background for input area
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF', // Light border for separation
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D3D3D3', // Light grey border
    backgroundColor: '#FFFFFF', // White background for input field
    padding: 10,
    marginRight: 10,
    borderRadius: 20, // Rounded corners
  },
  messageItem: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
    maxWidth: '70%',
    alignSelf: 'flex-start',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  messageContent: {
    flex: 1, // Take up remaining space
  },
  messageText: {
    fontSize: 16,
    color: '#000', // Black color for text
  },
  messageDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5, // Space between message and date
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4C4C4',
    marginRight: 10,
  },
});

export default ChatScreen;
