import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useRoute } from '@react-navigation/native';

const TaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const route = useRoute(); // Use the useRoute hook to access the route parameters
  const [usernameParam, setUsernameParam] = useState(route.params?.username);
  const [firstName, setFirstName] =  useState('');
  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  };
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTasks = tasks.filter(task => 
    task.task_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [dueDate, setDueDate] = useState(new Date());
  const [tasksUpdated, setTasksUpdated] = useState(false);

  const formatDateAndTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${date.toDateString()} ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };
  const fetchData = async () => {
    try {
      const usernameToUse = usernameParam || await AsyncStorage.getItem('username');
      const storedFirstName = await AsyncStorage.getItem('first_name');
      setFirstName(storedFirstName);

      if (usernameToUse) {
        const response = await axios.get('http://127.0.0.1:2323/getIncompletedTasks', {
          params: { username: usernameToUse }
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

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [usernameParam])
  );

  useEffect(() => {
    if (tasksUpdated) {
      fetchData();
      setTasksUpdated(false);
    }
  }, [tasksUpdated]);

  const renderTask = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('AddTaskScreen', { task: item, onTaskUpdate: () => setTasksUpdated(true) })}>
    <View style={styles.modal}>
      <Text style={styles.taskText}>{item.task_description}</Text>
      <View style={styles.taskInfo}>
        <Image
              style={styles.navIcon}
              source={require('../assets/time.png')} 
        />
        <Text>{formatDateAndTime(new Date(item.due_date))}</Text>
      </View>
    </View>
    </TouchableOpacity>

  );
  const renderContent = () => {
    if (filteredTasks.length === 0) {
      return (
        <View style={styles.emptyTasksContainer}>
          <Text style={[styles.emptyTasksText , {fontSize: 30}]}>🥺👉👈</Text>
          <Text style={[styles.emptyTasksText, {fontWeight: 'bold', color: '#6c5ce7'}]}>Nothing to do?</Text>
          <Text style={styles.emptyTasksText}>Check back after your first task!</Text>
        </View>
      );
    } else {
      return (
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.task_id.toString()}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {firstName && <Text style={styles.helloText}>Hello {firstName}</Text>}
      <Text style={styles.dateText}>{formatDate()}</Text>
      <View style={styles.modal}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <Text style={styles.upcoming}>Upcoming</Text>
      {renderContent()}
      {!usernameParam && ( // Only show the Add New Task button if a username was not passed in
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddTaskScreen')}>
          <Text style={styles.addTextButton}>Add New Task</Text>
        </TouchableOpacity>
      </View>
      )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9EFFF', 
  },
  helloText: {
    fontSize: 25,
    fontWeight: 'bold',
    paddingTop: 10,
    marginHorizontal: 15,
    marginBottom: 5
  },
  dateText: {
    fontSize: 15,
    marginHorizontal: 15,
    paddingBottom: 15,
  },
  upcoming: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  emptyTasksContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyTasksText: {
    fontSize: 20,
    textAlign: 'center',
    padding: 2,
  },
  taskText: {
    fontSize: 18,
    fontWeight: 'bold',
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

  titleText: {
    fontSize: 22,
    color: '#6c5ce7', // Dark purple for titles
    textAlign: 'center',
    marginVertical: 10,
  },

  modal: { 
    marginBottom: 20,
    marginHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 15,
  },
  navIcon: {
    width: 20, 
    height: 20, 
    marginRight: 5, 

  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  buttonContainer: {
    position: 'absolute',  
    bottom: 0,         
    left: 0,            
    right: 0,            
    alignItems: 'center',
    width: '100%',
    padding: 10,
    backgroundColor: 'white', 

  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  addTextButton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20
  },
});

export default TaskScreen;