import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import SelectDropdown from 'react-native-select-dropdown'

const AddTaskScreen = ({ route, navigation }) => {
  const [task, setTask] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isUpdate = !!route.params?.task;
  const[catagories, setCatagories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:2323/getTaskCategories');
      if (response.status === 200) {
        setCatagories(response.data);
      } else {
        Alert.alert('Error', 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
      Alert.alert('Error', 'Failed to fetch categories due to a network error');
    }
  };
  

  useEffect(() => {
    if (route.params?.task) {
      // If there is a task passed in the route parameters, set the fields
      const { task_description, due_date, category } = route.params.task;
      setTask(task_description);
      setDueDate(new Date(due_date));
      setCategory(category);
    }
  }, [route.params?.task]);
  
  const handleAddTask = async () => {
    const username = await AsyncStorage.getItem('username');
    
    if (!username) {
      Alert.alert('Error', 'You must be logged in to add or update a task.');
      return;
    }
  
    if (!task || !dueDate) {
      Alert.alert('Error', 'Please fill all the fields.');
      return;
    }
  
    const dueDateString = dueDate.toISOString();
  
    // Determine whether to add a new task or update an existing one
    const isUpdate = !!route.params?.task;
  
    try {
      let response;
  
      if (isUpdate) {
        // Update task
        const updateData = {
          task_id: route.params.task.task_id,
          new_description: task,
          new_due_date: dueDateString
        };
        response = await axios.put('http://127.0.0.1:2323/editTask', updateData);
      } else {
        // Add new task
        const newData = {
          username: username.toLowerCase(),
          task: task,
          due_date: dueDateString,
          task_category: category
        };
        response = await axios.post('http://127.0.0.1:2323/addTask', newData);
      }
  
      if (response.status === 200) {
        const successMessage = isUpdate ? 'Task updated successfully' : 'Task added successfully';
        Alert.alert('Success', successMessage);
        if (isUpdate) {
          route.params?.onTaskUpdate?.(); // Call the callback to trigger refresh
        }
        navigation.goBack();
      }
    } catch (error) {
      console.error('Task operation error:', error);
      Alert.alert('Error', `Failed to ${isUpdate ? 'update' : 'add'} the task`);
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
          style={[styles.input, { paddingTop: 8, paddingBottom: 8 }]} 
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
      <View style={[styles.modal, { height: 50, marginTop: 20 }]}>
        <Text style={styles.title}>Category</Text>
        <SelectDropdown
          data={catagories}
          onSelect={(selectedItem, index) => {
            setCategory(selectedItem.category_id);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem.category_name; 
          }}
          rowTextForSelection={(item, index) => {
            return item.category_name; 
          }}
          buttonStyle={styles.options}
          buttonTextStyle={styles.title}
          defaultValueByIndex={0} 
          defaultButtonText='Options'
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddTask}>
          <Text style={styles.addTextButton}>
              {isUpdate ? 'Save!' : 'Add Task'}
          </Text>
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
  },
  options: {
    backgroundColor: 'white', 
    bottom: 24, 
    left: 190, 
    borderRadius: 20,
    width: 130,
    height: 30
  }
  
});

export default AddTaskScreen;