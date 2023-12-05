import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const SocialPost = ({ username, pictureUrl, text, liked, comments, onLikePress, onCommentPress, like_count }) => {
  const likeIcon = liked ? require('../assets/liked_like_icon.jpg') : require('../assets/unliked_like_icon.png');
  const commentIcon = require('../assets/comment.png');

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatar}></View>
        <Text style={styles.username}>{text}</Text> 
      </View>
      <Image source={{ uri: pictureUrl }} style={styles.image} />
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={onLikePress}>
          <Image source={likeIcon} style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCommentPress}>
          <Image source={commentIcon} style={styles.actionIcon} />
        </TouchableOpacity>
        <Text style={styles.likes}>
            {like_count === 1 ? '1 like' : `${like_count} likes`}
        </Text>
      </View>
      {comments.map((comment, index) => (
        <View key={index} style={styles.commentContainer}>
          <Text style={styles.commentUsername}>{comment.username}</Text>
          <Text style={styles.commentText}>{comment.comment}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... other styles remain unchanged
  commentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  commentText: {
    fontSize: 14,
    marginLeft: 5, // Add margin if needed
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C4C4C4',
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: '100%',
    aspectRatio: 1, // Keep the aspect ratio of the image as 1:1
    resizeMode: 'cover',
  },
  text: {
    padding: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  actionIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  likes: {
    fontWeight: 'bold',
    marginVertical: 5,
  },
  comment: {
    fontSize: 14,
    marginVertical: 2,
  },
  commentUsername: {
    fontWeight: 'bold',
  },
});

export default SocialPost;
