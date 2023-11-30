import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SocialPost = ({ username, pictureUrl, text }) => {
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.avatar}></View>
        <Text style={styles.username}>{text}</Text>
      </View>
      <Image source={{ uri: pictureUrl }} style={styles.image} />
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
  image: {
    width: '100%',
    aspectRatio: 1, // Keep the aspect ratio of the image as 1:1
    resizeMode: 'cover',
  },
  text: {
    padding: 10,
  },
});

export default SocialPost;
