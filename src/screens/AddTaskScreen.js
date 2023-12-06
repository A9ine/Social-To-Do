import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTaskScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddTask = async () => {
    const username = await AsyncStorage.getItem('username');
    
    if (!username) {
      Alert.alert('Error', 'You must be logged in to add a task.');
      return;
    }
  
    if (!task || !dueDate) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }
  
    const dueDateString = dueDate.toISOString();
  
    try {
      const response = await axios.post('http://127.0.0.1:2323/addTask', {
        username: username.toLowerCase(),
        task: task,
        due_date: dueDateString
      });
  
      if (response.status === 200) {
        Alert.alert('Success', 'Task added successfully');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Add task error:', error);
      Alert.alert('Error', 'Failed to add the task');
    }
  };

  const onChangeDueDate = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShowDatePicker(true);
    setMode(currentMode);
  };

  const formatDateAndTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${date.toDateString()} ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };

  const onTaskChange = (text) => {
    if (text.split(/\s+/).length <= 50) { // Limit to 50 words
      setTask(text);
    }
  };
  const onSubjectChange = (text) => {
    if (text.split(/\s+/).length <= 50) { // Limit to 50 words
      setSubject(text);
    }
  };
  const onCategoryChange = (text) => {
    if (text.split(/\s+/).length <= 10) { // Limit to 10
      setCategory(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.modal, {height: 150}]}> 
        <Text style={styles.title}>Task</Text>
        <TextInput
          style={[styles.input, { fontSize: 14, paddingTop: 8, paddingBottom: 8 }]} 
          value={task}
          onChangeText={onTaskChange}
          multiline 
          numberOfLines={4}
          placeholder="Enter task description"
        />
      </View>

      <View style={[styles.modal, {height: 80}]}>
        <Text style={styles.title}>Due Date </Text>
        <Text style={styles.input}>{formatDateAndTime(dueDate)}</Text>
      </View>
      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.smallButton} onPress={() => showMode('date')}>
          <Text style={styles.buttonText}>Set Date</Text>
          {showDatePicker && mode === 'date' && (
          <DateTimePicker
            testID="dateTimePicker"
            value={dueDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onChangeDueDate}
          />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={() => showMode('time')}>
          <Text style={styles.buttonText}>Set Time</Text>
          {showDatePicker && mode === 'time' && (
          <DateTimePicker
            testID="dateTimePicker"
            value={dueDate}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onChangeDueDate}
          />
        ) }
        </TouchableOpacity>
      </View>
      <View style={[styles.modal, {height: 75, marginTop: 20}]}> 
        <Text style={styles.title}>Add category</Text>
        <TextInput
          style= {styles.input}
          value={category}
          onChangeText={onCategoryChange}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddTask}>
          <Text style={styles.addTextButton}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingTop: 40,
    backgroundColor: '#F9EFFF',
  },
  title: {
    fontSize: 15,
    paddingBottom: 5,
  },
  input: {
    fontSize: 20,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addTextButton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20
  },
  smallButton: {
    backgroundColor: '#a29bfe',
    padding: 15,
    borderRadius: 20,
    width: '40%',
    alignItems: 'center',
  },

  buttonContainer: {
    alignItems: 'center',
    width: '100%',
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
  }
});

export default AddTaskScreen;
