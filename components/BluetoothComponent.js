import React, { useState, useEffect } from "react";

import {
  ScrollView,
  Modal,
  View,
  Text,
  Button,
  PermissionsAndroid,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { BleManager, State } from "react-native-ble-plx";
import AndroidOpenSettings from "react-native-android-open-settings";

const BluetoothComponent = () => {
  const [status, setStatus] = useState("Bluetooth Module not initialized");
  const [scanning, setScanning] = useState(false);
  const [manager, setManager] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isBluetoothModalVisible, setIsBluetoothModalVisible] = useState(false);
  const [isServicesModalVisible, setIsServicesModalVisible] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [servicesAndCharacteristics, setServicesAndCharacteristics] = useState(
    []
  );

  useEffect(() => {
    const bleManager = new BleManager();
    setManager(bleManager);

    return () => {
      bleManager.destroy();
    };
  }, []);

  async function checkBluetoothState() {
    if (!manager) return false;
    const state = await manager.state();
    if (state !== State.PoweredOn) {
      console.log("Bluetooth is not enabled");
      setStatus("Bluetooth is not enabled");
      setIsBluetoothModalVisible(true);
      return false;
    }
    setBluetoothEnabled(true);
    setIsBluetoothModalVisible(false);
    return true;
  }

  async function requestBluetoothPermissions() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      if (
        granted["android.permission.BLUETOOTH_SCAN"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.ACCESS_FINE_LOCATION"] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("Bluetooth permissions granted");
        return true;
      } else {
        console.log("Bluetooth permissions denied");
        setStatus("Bluetooth permissions denied");
        return false;
      }
    } catch (err) {
      console.warn(err);
      setStatus("Error requesting permissions");
      return false;
    }
  }

  async function startScan() {
    if (!manager) return;
    const bluetoothReady = await checkBluetoothState();
    const permissionsReady = await requestBluetoothPermissions();
    if (!bluetoothReady || !permissionsReady) return;

    setStatus("Scanning for devices...");
    setScanning(true);
    setDevices([]); // clear previous devices

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Scan error:", error);
        setStatus("Scan error: " + error.message);
        setScanning(false);
        return;
      }
      if (device && device.id) {
        setDevices((prevDevices) => {
          if (prevDevices.some((d) => d.id === device.id)) {
            return prevDevices;
          } else {
            return [...prevDevices, device];
          }
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
      setStatus("Scan complete");
    }, 10000);
  }

  async function connectToDevice(deviceId) {
    if (!manager) return;
    try {
      setStatus("Connecting to device...");
      const isBluetoothEnabled = await checkBluetoothState();
      const arePermissionsGranted = await requestBluetoothPermissions();

      if (!isBluetoothEnabled || !arePermissionsGranted) {
        setStatus("Bluetooth is disabled or permissions not granted.");
        return;
      }

      const device = await manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      const services = await device.services();
      const characteristics = await Promise.all(
        services.map(async (service) => {
          const characteristics = await service.characteristics();
          return { service: service.uuid, characteristics };
        })
      );

      setServicesAndCharacteristics(characteristics);
      setConnectedDevice(device);
      setStatus(`Connected to ${device.name || device.id}`);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Connection error: " + error.message);
    }
  }

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item.id)}
    >
      <Text style={styles.deviceName}>
        {item.name ? item.name : "Unnamed device"}
      </Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );
  const closeBluetoothModal = () => {
    setIsBluetoothModalVisible(false);
  };
  const closeServicesModal = async () => {
    setIsServicesModalVisible(false);
    const bluetoothReady = await checkBluetoothState();
    if (bluetoothReady) {
    }
  };

  const renderServicesAndCharacteristics = () => {
    return servicesAndCharacteristics.map((item, index) => (
      <View key={index} style={styles.serviceItem}>
        <Text style={styles.serviceName}>Service: {item.service}</Text>
        <FlatList
          data={item.characteristics}
          keyExtractor={(char) => char.uuid}
          renderItem={({ item }) => (
            <Text style={styles.characteristicName}>
              Characteristic: {item.uuid}
            </Text>
          )}
        />
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{status}</Text>
      <Button title="Start Scanning" onPress={startScan} disabled={scanning} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
        style={styles.deviceList}
      />

      <Modal
        transparent={true}
        visible={isBluetoothModalVisible}
        animationType="slide"
        onRequestClose={closeBluetoothModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bluetooth is Disabled</Text>
            <Text style={styles.modalText}>
              Please enable Bluetooth to continue.
            </Text>
            <View style={styles.buttonEnable}>
              <Text style={styles.infoText}></Text>
              <View style={styles.buttonsEnablePadding}>
                <Button
                  title="Enable Bluetooth"
                  onPress={async () => {
                    try {
                      if (Platform.OS === "android") {
                        AndroidOpenSettings.bluetoothSettings(); // Opens Bluetooth settings
                      } else if (Platform.OS === "ios") {
                        await Linking.openURL("App-Prefs:Bluetooth"); // Opens Bluetooth settings on iOS
                      } else {
                        Alert.alert(
                          "Unsupported",
                          "This feature is not supported on your platform."
                        );
                      }
                      closeBluetoothModal();
                    } catch (error) {
                      console.error("Error opening Bluetooth settings:", error);
                      Alert.alert(
                        "Error",
                        "Failed to open Bluetooth settings."
                      );
                    }
                  }}
                />
              </View>
              <View style={styles.buttonsEnablePadding}>
                <Button title="Cancel" onPress={closeBluetoothModal} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        visible={isServicesModalVisible}
        animationType="slide"
        onRequestClose={closeServicesModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Services and Characteristics</Text>
            <ScrollView>{renderServicesAndCharacteristics()}</ScrollView>
            <Button
              title="Close"
              onPress={() => setIsServicesModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  status: { marginBottom: 10, fontSize: 16, fontWeight: "bold" },
  deviceList: { marginTop: 20 },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  deviceName: { fontSize: 16 },
  deviceId: { fontSize: 12, color: "#555" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  serviceItem: { marginBottom: 15 },
  serviceName: { fontSize: 16, fontWeight: "bold" },
  characteristicName: { fontSize: 14, color: "#555" },
  buttonEnable: { flexDirection: "row" },
  buttonsEnablePadding: { padding: 5, margin: 5 },
});

export default BluetoothComponent;
