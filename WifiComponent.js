import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
} from "react-native";
import WifiManager from "react-native-wifi-reborn";

const WifiComponent = () => {
  const [wifiList, setWifiList] = useState([]);
  const [connectedWifi, setConnectedWifi] = useState(null);

  const scanWifiNetworks = async () => {
    try {
      // Request location permission (required for Android)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message:
            "This app needs location permission to scan for Wi-Fi networks.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const wifiNetworks = await WifiManager.loadWifiList();
        setWifiList(wifiNetworks);
      } else {
        console.log("Location permission denied");
      }
    } catch (error) {
      console.error("Error scanning Wi-Fi networks:", error);
    }
  };

  const connectToWifi = async (ssid, password) => {
    try {
      await WifiManager.connectToSSID(ssid, password);
      const currentWifi = await WifiManager.getCurrentWifiSSID();
      setConnectedWifi(currentWifi);
    } catch (error) {
      console.error("Error connecting to Wi-Fi:", error);
    }
  };

  useEffect(() => {
    scanWifiNetworks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Wi-Fi Networks</Text>
      <FlatList
        data={wifiList}
        keyExtractor={(item) => item.SSID}
        renderItem={({ item }) => (
          <View style={styles.networkItem}>
            <Text>{item.SSID}</Text>
            <Button
              title="Connect"
              onPress={() => connectToWifi(item.SSID, "your_password_here")}
            />
          </View>
        )}
      />
      {connectedWifi && (
        <View style={styles.connectedInfo}>
          <Text>Connected to: {connectedWifi}</Text>
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
    marginBottom: 8,
  },
  connectedInfo: {
    marginTop: 16,
  },
});

export default WifiComponent;
