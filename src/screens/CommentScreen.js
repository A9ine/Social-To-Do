import React, { useState } from 'react';
import {Alert, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const CommentScreen = ({ route, navigation }) => {
    const postId  = route.params.postId;
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(route.params.comments); // Initialize with passed comments


  const handleSendComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Empty comment?", 'How about say "Good Job"?');
      return;
    }
  
    const username = await AsyncStorage.getItem('username');
    const profilePic = await AsyncStorage.getItem('profilePic'); // Retrieve the profile pic from AsyncStorage or your source
  
    // Optimistically update UI with the new comment
    const newCommentObj = {
      username: username,
      comment: newComment,
      profile_pic: profilePic // Include the profile picture in the new comment object
    };
    const updatedComments = [...comments, newCommentObj];
    setComments(updatedComments);
    setNewComment(''); // Reset comment input after sending
  
    try {
      const response = await axios.post('http://127.0.0.1:2323/commentOnPost', {
        post_id: postId,
        username: username,
        comment: newComment,
      });
  
      if (response.status !== 200) {
        // If backend call fails, revert the optimistic update
        setComments(comments);
        Alert.alert('Error', 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      // Revert the optimistic update in case of error
      setComments(comments);
      Alert.alert('Error', 'An error occurred while posting the comment');
    }
  };
  
  
  

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      {item.profile_pic ? (
        <Image
          source={{ uri: item.profile_pic }}
          style={styles.profileImage} 
        />
      ) : (
        <View style={styles.avatar}></View>
      )}
      <View>
        <Text style={styles.commentUsername}>{item.username}</Text>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item, index) => index.toString()}
        style={styles.commentsList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
        />
        <TouchableOpacity style={styles.button} onPress={handleSendComment}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFFF'

  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4C4C4',
    marginRight: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#a29bfe',
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 5,
  },
  commentText: {
    marginLeft: 5,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#8A2BE2',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
    marginRight: 10,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default CommentScreen;
