import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const WeatherHistoryComponent = () => {
  const navigation = useNavigation();
  const [history, setHistory] = useState([]); // State for weather history

  // Load history from AsyncStorage when component mounts
  useEffect(() => {
    console.log("History items with keys:");
    const loadHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem("weatherHistory");
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory)) {
            setHistory(parsedHistory); // Load the history into state
          } else {
            console.error("History data is not an array.");
          }
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
        keyExtractor={(item, index) =>
          `${item.zipCode}-${item.temperature}-${item.timestamp || index}`
        } // Add a timestamp or another unique field
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text>Location: {item.zipCode}</Text>
            <Text>Temperature: {item.temperature}°F</Text>
          </View>
        )}
      />
      <Button
        title="Back to Weather"
        onPress={
          () => navigation.navigate("WeatherComponent") // Navigate to history screen
        }
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
