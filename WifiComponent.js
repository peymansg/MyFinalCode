import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import WifiManager from "react-native-wifi-reborn";
import * as Location from "expo-location";

const WifiComponent = () => {
  const [wifiList, setWifiList] = useState([]);
  const [connectedWifi, setConnectedWifi] = useState(null);
  const [selectedSSID, setSelectedSSID] = useState("");
  const [password, setPassword] = useState("");

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to scan Wi-Fi."
        );
        return false;
      }

      if (
        Platform.OS === "android" &&
        Constants.platform.android.version >= 29
      ) {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();

        if (backgroundStatus !== "granted") {
          Alert.alert(
            "Background Location Required",
            "Please enable background location for Wi-Fi scanning."
          );
          return false;
        }
      }

      if (Platform.OS === "android") {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const allGranted = Object.values(granted).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            "Permission Denied",
            "Wi-Fi scanning requires location permissions."
          );
          return false;
        }
      }

      console.log("All necessary permissions granted");
      return true;
    } catch (error) {
      console.error("Permission request error:", error);
      return false;
    }
  };

  const scanWifiNetworks = async () => {
    if (!(await requestPermissions())) return;

    try {
      const wifiNetworks = await WifiManager.loadWifiList();
      setWifiList(wifiNetworks);
    } catch (error) {
      console.error("Error scanning Wi-Fi networks:", error);
      Alert.alert("Error", "Could not scan Wi-Fi networks. Try again.");
    }
  };

  const connectToWifi = async () => {
    if (!selectedSSID || !password) {
      Alert.alert("Error", "Please enter both SSID and password.");
      return;
    }

    try {
      const isWep = false;
      const isHidden = false;
      await WifiManager.connectToProtectedSSID(
        selectedSSID,
        password,
        isWep,
        isHidden
      );
      const currentWifi = await WifiManager.getCurrentWifiSSID();
      setConnectedWifi(currentWifi);
      Alert.alert("Success", `Connected to ${currentWifi}`);
    } catch (error) {
      console.error("Error connecting to Wi-Fi:", error);
      Alert.alert("Connection Failed", "Could not connect to Wi-Fi.");
    }
  };

  useEffect(() => {
    scanWifiNetworks();
    connectToWifi();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Wi-Fi Networks</Text>
      <Button title="Rescan Wi-Fi" onPress={scanWifiNetworks} />

      <FlatList
        data={wifiList}
        keyExtractor={(item, index) => `${item.SSID}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.networkItem}>
            <Text>{item.SSID}</Text>
            <Button title="Select" onPress={() => setSelectedSSID(item.SSID)} />
          </View>
        )}
      />

      {selectedSSID ? (
        <View style={styles.connectionContainer}>
          <Text>Selected Network: {selectedSSID}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Connect" onPress={connectToWifi} />
        </View>
      ) : null}

      {connectedWifi && (
        <View style={styles.connectedInfo}>
          <Text style={styles.connectedText}>
            Connected to: {connectedWifi}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  networkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  connectionContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginTop: 10,
    borderRadius: 5,
  },
  connectedInfo: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#d4edda",
    borderRadius: 8,
  },
  connectedText: {
    fontWeight: "bold",
    color: "green",
  },
});

export default WifiComponent;
