import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import MakePostScreen from './src/screens/MakePostScreen';
import TaskScreen from './src/screens/TaskScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import SettingScreen from './src/screens/SettingScreen'; 
import AddFriendScreen from './src/screens/AddFriendScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import NotificationsScreen from './src/screens/NotificationScreen';
import StartChatScreen from './src/screens/StartChatScreen';
import ChatScreen from './src/screens/ChatScreen';
import CommentScreen from './src/screens/CommentScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="MakePostScreen" component={MakePostScreen} />
        <Stack.Screen name="TaskScreen" component={TaskScreen} />
        <Stack.Screen name="AddTaskScreen" component={AddTaskScreen} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
        <Stack.Screen name="AddFriendScreen" component={AddFriendScreen} />
        <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
        <Stack.Screen name="StartChatScreen" component={StartChatScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name='CommentScreen' component={CommentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
