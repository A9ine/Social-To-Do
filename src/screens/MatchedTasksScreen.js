import React, { useState, useEffect } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MatchTasksScreen = ({ route }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchTasks();
  }, []);

  const fetchMatchTasks = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const response = await axios.get('http://127.0.0.1:2323/matchTasks', {
        params: { username: username }
      });
      
      // Initialize an array to hold the sections
      const sections = [];
      let currentTask = null;
  
      let matchCount = 0; // Initialize a match counter
  response.data.forEach(task => {
    if (task['Your task']) {
      matchCount += 1; // Increment the counter for each "Your Task" found
      // Start a new section with "Your Task"
      currentTask = {
        title: 'Match ' + matchCount, // Use matchCount as part of the title
        data: [{ ...task['Your task'], isYourTask: true, title: 'Your Task' }],
      };
      sections.push(currentTask);
    } else {
      // Find the friend's name and their task
      const friendKey = Object.keys(task).find(key => key !== 'Your task');
      if (currentTask && friendKey) {
        // Add the friend's task to the current "Your task" section
        currentTask.data.push({ ...task[friendKey], isYourTask: false, title: friendKey });
      }
    }
  });

  setSections(sections);
    } catch (error) {
      console.error('Error fetching matched tasks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );
  

  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskHeader}>{item.title}</Text>
      <Text style={styles.description}>Description: {item.description}</Text>
      <Text style={styles.dueDate}>Due Date: {item["due date"]}</Text>
    </View>
  );
  
  

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Looks like you have to do all your tasks alone :(
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.task_id + index}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
        />

      )}
    </View>
  );
};
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    taskItem: {
      backgroundColor: '#f9f9f9',
      padding: 20,
      marginVertical: 8,
      borderRadius: 5,
    },
    taskTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 18,
      textAlign: 'center',
      color: 'grey',
    },
    sectionHeader: {
      fontWeight: 'bold',
      fontSize: 20,
      backgroundColor: '#eee',
      padding: 10,
    },
    taskHeader: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: 5, 
    },
    description: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    dueDate: {
      fontSize: 16,
      color: 'grey', 
    },
  });

  export default MatchTasksScreen;