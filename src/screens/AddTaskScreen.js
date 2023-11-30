import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTaskScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('');
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subject:</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Enter subject"
      />

      <Text style={styles.label}>Task Description:</Text>
      <TextInput
        style={styles.textArea}
        value={task}
        onChangeText={onTaskChange}
        multiline
        numberOfLines={4}
        placeholder="Enter task description (up to 50 words)"
      />

      <View style={styles.dateTimeRow}>
        <Text style={styles.label}>Due Date: </Text>
        <Text style={styles.dateText}>{formatDateAndTime(dueDate)}</Text>
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

      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.smallButton} onPress={() => showMode('date')}>
          <Text style={styles.buttonText}>Set Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={() => showMode('time')}>
          <Text style={styles.buttonText}>Set Time</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddTask}>
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#F3F3F7',
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  smallButton: {
    backgroundColor: '#a29bfe',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    width: '30%',
    alignItems: 'center',
  },

  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    height: 100, // Increased height for the text area
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
});

export default AddTaskScreen;
