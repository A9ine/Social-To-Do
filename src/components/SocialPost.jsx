import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const SocialPost = ({ username, pictureUrl, text, liked, comments, onLikePress, onCommentPress, like_count, location }) => {
  const likeIcon = liked ? require('../assets/liked_like_icon.jpg') : require('../assets/unliked_like_icon.png');
  const likeIconStyle = liked ? styles.likedIcon : styles.actionIcon;
  const commentIcon = require('../assets/comment.png');

  const renderViewMoreComments = () => {
    if (comments.length > 3) {
      return (
        <TouchableOpacity onPress={onCommentPress} style={styles.viewMoreComments}>
          <Text style={styles.viewMoreText}>View all comments</Text>
        </TouchableOpacity>
      );
    }
  };

  const renderLocation = () => {
    if (location) {
      return (
        <Text style={styles.location}>
          {location}
        </Text>
      );
    }
    return null;
  };


  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatar}></View>
        <View style={styles.userInfoContainer}>
    <Text style={styles.username}>{text}</Text>
    {renderLocation()}
  </View>
      </View>
      <Image source={{ uri: pictureUrl }} style={styles.image} />
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={onLikePress}> 
          <Image source={likeIcon} style={likeIconStyle} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCommentPress}>
          <Image source={commentIcon} style={styles.actionIcon} />
        </TouchableOpacity>
        <Text style={styles.likes}>
          {like_count === 1 ? '1 like' : `${like_count} likes`}
        </Text>
      </View>
      {renderViewMoreComments()}
      {comments.slice(0, 3).map((comment, index) => (
        <View key={index} style={styles.commentContainer}>
          <Text style={styles.commentUsername}>{comment.username}:</Text>
          <Text style={styles.commentText}>{comment.comment}</Text>
        </View>
      ))}
    </View>
  );
};


const styles = StyleSheet.create({

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

  location: {
    fontSize: 13,
    marginLeft: 20,
    right: 20
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
    marginTop: 10,
    paddingLeft: 10,
    alignItems: 'center',
  },
  actionIcon: {
    width: 25,
    height: 25,
    marginHorizontal: 4,
  },

  likedIcon: {
    width: 28,
    height: 28,
    marginHorizontal: 4
  },

  likes: {
    fontWeight: 'bold',
    marginVertical: 4,
  },

  commentUsername: {
    fontWeight: 'bold',
  },

  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingVertical: 2,
  },
  commentText: {
    fontSize: 14,
    marginLeft: 5, // Add margin if needed
  },
  viewMoreComments: {
    marginTop: 10,
    paddingLeft: 15,
    alignItems: 'flex-start',
  },
  viewMoreText: {
    color: '#8E8E8E', 
    fontSize: 14,
  },
});

export default SocialPost;
