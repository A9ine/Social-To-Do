import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SocialPost from '../components/SocialPost';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  
  const [pendingFriends, setPendingFriends] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      getUsernameAndFetchPosts();
      fetchPendingFriends();
    }, [])
  );

  useEffect(() => {
    const getProfilePicture = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        if (!username) {
          console.error('No username found in AsyncStorage');
          return; 
        }
  
        const response = await axios.get(`http://127.0.0.1:2323/getProfilePicture`, {
          params: { username }
        });
  
        if (response.status === 200 && response.data) {
          const profilePicUrl = response.data;
  
          if (profilePicUrl !== null) {
            await AsyncStorage.setItem('profilePic', profilePicUrl);
          }
        } else {
          return
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };
  
    getProfilePicture();
  }, []); 
  
  


  const getUsernameAndFetchPosts = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
        const response = await axios.get(`http://127.0.0.1:2323/retrievePosts?username=${storedUsername}`);
        if (response.status === 200) {
          setPosts(response.data.posts);
          console.log(response.data.posts.comments);
        }
      } else {
        console.error('No username found');
      }
    } catch (e) {
      console.error('Failed to load username or fetch posts', e);
      Alert.alert('Error', 'Failed to load username or fetch posts');
    }
  };

  const fetchPendingFriends = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        const response = await axios.get(`http://127.0.0.1:2323/getPendingFriends`, {
          params: { username }
        });
        console.log(response.data); // Log the response data
        if (response.status === 200 && response.data.pending_friends) {
          setPendingFriends(response.data.pending_friends);
        } else {
          setPendingFriends([]); 
        }
      } else {
        console.error('No username found');
      }
    } catch (e) {
      console.error('Failed to fetch pending friends', e);
      Alert.alert('Error', 'Failed to fetch pending friends');
      setPendingFriends([]); 
    }
  };

  

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPendingFriends();
      await getUsernameAndFetchPosts();
    } catch (error) {
      console.error('Refresh action failed', error);
    }
    setRefreshing(false);
  }, []);
  

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Error', 'Sign out failed');
      console.error('Sign out error:', e);
    }
  };

  const handleMakePost = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (!storedUsername) {
        Alert.alert('Error', 'Username not found');
        return;
      }
  
      const response = await axios.get('http://127.0.0.1:2323/getIncompletedTasks', {
        params: { username: storedUsername }
      });
  
      if (response.status === 200 && response.data.tasks.length > 0) {
        navigation.navigate('MakePostScreen', { tasks: response.data.tasks });
      } else {
        Alert.alert('No Tasks', 'There are no incomplete tasks to post. Please add a task');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch tasks or navigate to post screen.');
      console.error('Error navigating to make post screen:', e);
    }
  };

  
  const navigateToSettings = () => {
    navigation.navigate('SettingScreen'); //navigating to SettingScreen
  }


  const navigateToChat = () => {
    navigation.navigate('ChatListScreen'); 
  }

  const navigateToNotifications = () => {
    navigation.navigate('NotificationsScreen', { pendingFriends });
  };

  const handleTask = async () => {
    try {
        navigation.navigate('TaskScreen');
    } catch (e) {
        Alert.alert('Error', 'Failed tonavigate to task screen.');
        console.error('Error navigating to make post screen:', e);
      }
  };

  const handleCommentPost = (postId, comments) => {
    navigation.navigate('CommentScreen', { postId: postId, comments: comments });
  };
  
  const handleFriends = async () => {
    try {
        navigation.navigate('FriendsScreen');
    } catch (e) {
        Alert.alert('Error', 'Failed tonavigate to friend screen.');
        console.error('Error navigating to make friend screen:', e);
      }
  };

  const handleLikePost = async (postId, isLiked) => {
    const username = await AsyncStorage.getItem('username');
  
    // Optimistically update the UI
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.post_id === postId
          ? {
              ...post,
              liked_by_user: !isLiked,
              like_count: isLiked ? post.like_count - 1 : post.like_count + 1, // Increment or decrement like count
            }
          : post
      )
    );
  
    try {
      // Determine the endpoint based on whether the post is currently liked
      const endpoint = isLiked ? '/unlikePost' : '/likePost';
      const response = await axios.post(`http://127.0.0.1:2323${endpoint}`, {
        post_id: postId,
        username: username,
      });
  
      // If the operation failed, revert the change
      if (response.status !== 200) {
        setPosts(currentPosts =>
          currentPosts.map(post =>
            post.post_id === postId ? { ...post, liked_by_user: isLiked } : post
          )
        );
      }
    } catch (error) {
      console.error('Like/unlike post error:', error);
      Alert.alert('Error', 'An error occurred while updating the like status');
  
      // Revert the change if there was an error
      setPosts(currentPosts =>
        currentPosts.map(post =>
          post.post_id === postId ? { ...post, liked_by_user: isLiked } : post
        )
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topNavBar}>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={navigateToNotifications}>
            {/* Conditional rendering for notification sign */}
            {pendingFriends.length > 0 && (
              <View style={styles.notificationSign}></View>
            )}
            <Image
              style={styles.navIcon}
              source={require('../assets/notification.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToSettings}>
            <Image
              style={styles.navIcon}
              source={require('../assets/settings.png')}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.navTitle}>Home</Text>
        <TouchableOpacity onPress={navigateToChat}>
          <Image
            style={styles.navIcon}
            source={require('../assets/chat.png')} 
          />
        </TouchableOpacity>
      </View>
      {/* Posts Container */}
      <ScrollView style={styles.postsContainer} refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }>
        {posts.map((post, index) => (
          <SocialPost
            key={post.post_id || index}
            username={username}
            pictureUrl={post.picture}
            text={post.content}
            liked={post.liked_by_user}
            like_count={post.like_count}
            comments={post.comments}
            onLikePress={() => handleLikePost(post.post_id, post.liked_by_user)}
            onCommentPress={() => handleCommentPost(post.post_id, post.comments)}
            location = {post.location}
            profilePic = {post.profile_pic}
            time = {post.created_at}
          />
        ))}
      </ScrollView>
  
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
          <Image
            style={styles.navIcon}
            source={require('../assets/home.png')} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMakePost}>
          <Image
            style={styles.navIcon}
            source={require('../assets/createPost.png')} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTask}>
          <Image
            style={styles.taskNavIcon}
            source={require('../assets/tasks.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFriends}>
          <Image
            style={styles.navIcon}
            source={require('../assets/friends.png')} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut}>
          <Image
            style={styles.navIcon}
            source={require('../assets/signOut.png')}
          />
        </TouchableOpacity>
      </View>
  
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F7',
    position: 'relative',
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 30,
  },
  navTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  navIcon: {
    width: 25,
    height: 25,
    marginRight: 10, // Add margin to the right of each icon
  },
  taskNavIcon: {
    width: 50, 
    height: 50, 
    resizeMode: 'contain',
    bottom: 25,
  },
  bottomNavBar: {
    flexDirection: 'row', // Ensures horizontal layout
    justifyContent: 'space-around', // Evenly spaces the icons
    backgroundColor: '#FFFFFF',
    paddingVertical: 0,
    paddingTop: 8,
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  postsContainer: {
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
  },
  button: {
    backgroundColor: '#8A2BE2', // Purple color for the button
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signOutButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#8A2BE2',
    padding: 8,
    borderRadius: 5,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },

  chatButton: {
    position: 'absolute',
    top: -750,
    right: 140,
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notificationSign: {
    width: 10,
    height: 10,
    borderRadius: 25,
    backgroundColor: '#ff2f2f',
    top: 9,
    left: 13,
    zIndex: 1,
  },
  iconGroup: {
    flexDirection: 'row', // This will lay out the icons horizontally
    alignItems: 'center', // Aligns icons vertically in the middle
  },
});

export default HomeScreen;
