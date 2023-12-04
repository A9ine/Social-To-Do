import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = () => {
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          const response = await axios.get(`http://127.0.0.1:2323/getChats?username=${storedUsername}`);
          if (response.status === 200) {
            setChats(response.data.chats);
          }
        } else {
          console.error('No username found');
        }
      } catch (e) {
        console.error('Failed to fetch chats', e);
      }
    };

    fetchChats();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        {chats.map((chat, index) => (
          <View key={index} style={styles.chatItem}>
            <Text>{chat.message}</Text>
            {/* maybe display other chats */}
          </View>
        ))}
      </ScrollView>
      <Button title="Back to Home" onPress={() => navigation.navigate('HomeScreen')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  chatItem: {
    //style will be added later
  },
});

export default ChatScreen;
