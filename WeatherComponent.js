import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Correct import

const API_KEY = "fece2603ce354b8d12d0281fd8f2460b";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const WeatherComponent = () => {
  const navigation = useNavigation();
  const [zipCode, setZipCode] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const updateHistory = async (newEntry) => {
    try {
      // Get existing history from AsyncStorage
      const savedHistory = await AsyncStorage.getItem("weatherHistory");
      let updatedHistory = savedHistory ? JSON.parse(savedHistory) : [];

      // Add new entry and limit history to last 5 entries
      updatedHistory = [newEntry, ...updatedHistory].slice(0, 5);

      // Save updated history to AsyncStorage
      await AsyncStorage.setItem(
        "weatherHistory",
        JSON.stringify(updatedHistory)
      );
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  };

  const fetchWeather = async () => {
    try {
      // Fetch current weather
      const currentResponse = await axios.get(
        `${BASE_URL}/weather?zip=${zipCode},us&units=imperial&appid=${API_KEY}`
      );
      console.log("Current Weather Response:", currentResponse.data);

      setCurrentWeather(currentResponse.data);

      // Save the weather entry to history
      const newEntry = {
        zipCode: currentResponse.data.name,
        temperature: currentResponse.data.main.temp,
      };
      updateHistory(newEntry); // Save to AsyncStorage

      // Fetch 5-day forecast
      const forecastResponse = await axios.get(
        `${BASE_URL}/forecast?zip=${zipCode},us&units=imperial&appid=${API_KEY}`
      );
      console.log(
        "Raw Forecast Response:",
        JSON.stringify(forecastResponse.data, null, 2)
      );
      if (forecastResponse.data && forecastResponse.data.list) {
        // Fixed logging
        setForecast(forecastResponse.data.list.slice(0, 5) || []); // Get first 5 entries
      } else {
        setForecast([]); // Fallback in case data is missing
      }
      setError("");
    } catch (err) {
      setError("Invalid zip code or API error. Please try again.");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter zip code"
        value={zipCode}
        onChangeText={setZipCode}
        keyboardType="numeric"
      />
      <Button title="Get Weather" onPress={fetchWeather} />
      <View style={customStyles.buttonSpacing} />
      <Button
        title="Get Weather History"
        onPress={
          () => navigation.navigate("WeatherHistoryComponent") // Navigate to history screen
        }
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {currentWeather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.title}>Current Weather</Text>
          <Text>Location: {currentWeather.name}</Text>
          <Text>Temperature: {currentWeather.main.temp}°F</Text>
          <Text>Condition: {currentWeather.weather[0].description}</Text>
        </View>
      )}

      {forecast && forecast.length > 0 ? (
        <View style={styles.forecastContainer}>
          <Text style={styles.title}>5-Day Forecast</Text>
          <FlatList
            data={forecast} // Ensure it's always an array
            keyExtractor={(item, index) => `${item.dt}-${index}`} // Ensure unique keys
            renderItem={({ item }) => (
              <View style={styles.forecastItem}>
                <Text>
                  Date: {new Date(item.dt * 1000).toLocaleDateString()}
                </Text>
                <Text>Temperature: {item.main.temp}°F</Text>
                <Text>Condition: {item.weather[0].description}</Text>
              </View>
            )}
          />
        </View>
      ) : (
        <Text>Loading forecast data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  weatherContainer: {
    marginTop: 20,
  },
  forecastContainer: {
    marginTop: 20,
  },
  forecastItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

const customStyles = StyleSheet.create({
  buttonSpacing: {
    marginBottom: 20, // Adjust this value as needed
  },
});

export default WeatherComponent;
