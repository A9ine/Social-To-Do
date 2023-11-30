import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const TaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchTasks = async () => {
        try {
          const username = await AsyncStorage.getItem('username');
          if (username) {
            const response = await axios.get('http://127.0.0.1:2323/getIncompletedTasks', {
              params: { username }
            });
            if (response.status === 200) {
              setTasks(response.data.tasks);
            } else {
              Alert.alert('Error', 'Failed to fetch tasks');
            }
          } else {
            Alert.alert('Error', 'Username not found');
          }
        } catch (error) {
          console.error('Fetch tasks error:', error);
          Alert.alert('Error', 'Failed to fetch tasks due to a network error');
        }
      };

      fetchTasks();
    }, [])
  );
  const renderTask = ({ item }) => {
    return (
      <View style={styles.taskItem}>
        <Text style={styles.taskText}>{item.task_description}</Text>
        <Text>Due: {item.due_date}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.task_id.toString()}
      />
     <Button onPress={() => navigation.navigate('AddTaskScreen')}>
        Add New Task
    </Button>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f3f3f9', // Light grey background for contrast with purple elements
  },
  taskItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#a29bfe', // Light purple for subtle separation of tasks
    backgroundColor: '#f8f8ff', // Very light purple for task items
  },
  taskText: {
    fontSize: 18,
    marginBottom: 5,
    color: '#6c5ce7', // Darker purple for task text for readability
  },
  button: {
    backgroundColor: '#6c5ce7', // Dark purple for the button
    color: '#ffffff', // White text for contrast on button
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    margin: 10,
  },
  buttonText: {
    color: '#ffffff', // White text on button
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 22,
    color: '#6c5ce7', // Dark purple for titles
    textAlign: 'center',
    marginVertical: 10,
  },
  dueDateText: {
    fontSize: 14,
    color: '#a29bfe', // Light purple for less important information like due dates
  },
});


export default TaskScreen;
