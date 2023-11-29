import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
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
  }, []);

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
  },
  taskItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  taskText: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default TaskScreen;
