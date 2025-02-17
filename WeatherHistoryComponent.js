import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WeatherHistoryComponent = () => {
  const [history, setHistory] = useState([]); // State for weather history

  // Load history from AsyncStorage when component mounts
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem("weatherHistory");
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory)); // Load the history into state
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather History</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()} // Unique key for each item
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text>Location: {item.zipCode}</Text>
            <Text>Temperature: {item.temperature}°F</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default WeatherHistoryComponent;
