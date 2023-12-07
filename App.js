import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/authentication/LoginScreen';
import RegisterScreen from './src/authentication/RegisterScreen';
import ResetPasswordScreen from './src/authentication/ResetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import MakePostScreen from './src/screens/MakePostScreen';
import TaskScreen from './src/screens/TaskScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import SettingScreen from './src/chatroom/SettingScreen'; 
import AddFriendScreen from './src/friends/AddFriendScreen';
import FriendsScreen from './src/friends/FriendsScreen';
import ChatListScreen from './src/chatroom/ChatListScreen';
import NotificationsScreen from './src/friends/NotificationScreen';
import StartChatScreen from './src/chatroom/StartChatScreen';
import ChatScreen from './src/chatroom/ChatScreen';
import CommentScreen from './src/screens/CommentScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: '' }} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ title: '' }}/>
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: '', headerLeft:() => null }} />
        <Stack.Screen name="MakePostScreen" component={MakePostScreen} />
        <Stack.Screen name="TaskScreen" component={TaskScreen} options={{ title: '' }}/>
        <Stack.Screen name="AddTaskScreen" component={AddTaskScreen} options={{ title: 'Add Task' }} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} options={{ title: '' }} />
        <Stack.Screen name="AddFriendScreen" component={AddFriendScreen} />
        <Stack.Screen name="FriendsScreen" component={FriendsScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen}/>
        <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
        <Stack.Screen name="StartChatScreen" component={StartChatScreen}/>
        <Stack.Screen name="ChatScreen" component={ChatScreen}/>
        <Stack.Screen name='CommentScreen' component={CommentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
