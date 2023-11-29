import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTaskScreen = ({ navigation }) => {
  const [task, setTask] = useState('');
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
  
    // Format due date and time to a string that your API expects
    // Example: "2023-03-15T14:30:00" (YYYY-MM-DDTHH:mm:ss format)
    const dueDateString = dueDate.toISOString();
  
    // Post the task to the backend
    try {
      const response = await axios.post('http://127.0.0.1:2323/addTask', {
        username: username.toLowerCase(),
        task: task,
        due_date: dueDateString
      });
  
      if (response.status === 200) {
        Alert.alert('Success', 'Task added successfully');
        navigation.goBack(); // Go back to the previous screen
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


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Task Description:</Text>
      <TextInput
        style={styles.input}
        value={task}
        onChangeText={setTask}
        placeholder="Enter task description"
      />
      <Text style={styles.label}>Due Date:</Text>
      <View style={styles.datePickerContainer}>
        <Text style={styles.dateText}>{formatDateAndTime(dueDate)}</Text>
        <Button title="Set Date" onPress={() => showMode('date')} />
        <Button title="Set Time" onPress={() => showMode('time')} />
      </View>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={dueDate}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChangeDueDate}
        />
      )}
      <Button title="Add Task" onPress={handleAddTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
  },
});

export default AddTaskScreen;
