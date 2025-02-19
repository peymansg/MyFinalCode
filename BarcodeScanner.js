import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { Camera } from "react-native-camera-kit";

const BarcodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(null); // Permission state is initialized as null
  const [scanned, setScanned] = useState(false);
  const [scannedBarcodes, setScannedBarcodes] = useState([]); // Store scanned barcodes
  const cameraRef = useRef(null);

  useEffect(() => {
    const getRequestCameraPermission = async () => {
      if (Platform.OS === "android") {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setHasPermission(true);
            console.log("Camera permission granted");
          } else {
            setHasPermission(false); // Permission denied
            console.log("Camera permission denied");
          }
        } catch (err) {
          console.warn(err);
          setHasPermission(false); // Error in permission request
        }
      } else if (Platform.OS === "ios") {
        try {
          const status = await Camera.requestCameraPermission();
          if (status === "authorized") {
            setHasPermission(true);
            console.log("Camera permission granted");
          } else {
            setHasPermission(false);
            console.log("Camera permission denied");
          }
        } catch (err) {
          console.warn(err);
          setHasPermission(false); // Error in permission request
        }
      }
    };

    getRequestCameraPermission();
  }, []);

  const handleBarcodeScanned = (event) => {
    console.log("Scanned Event:", event);

    if (!event || scanned) return;
    setScanned(true);

    const scannedData = event.codeStringValue || event.data || "Unknown Data";
    const scannedType = event.codeFormat || "Unknown Type";

    if (scannedData.includes("localhost") || scannedData.includes("8081")) {
      alert("Invalid barcode scanned! Please scan a real barcode.");
      setScanned(false);
      return;
    }

    setScannedBarcodes((prevBarcodes) => {
      const newHistory = [scannedData, ...prevBarcodes];
      if (newHistory.length > 5) newHistory.pop();
      return newHistory;
    });

    alert(
      `Bar code with type ${scannedType} and data ${scannedData} has been scanned!`
    );
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return (
      <Text>
        No access to camera. Please enable the permission in settings.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        scanBarcode={true} // Enable barcode scanning
        onReadCode={(event) => handleBarcodeScanned(event.nativeEvent)} // Use onReadCode
      />

      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}

      <Text style={styles.historyTitle}>Scan History:</Text>
      {scannedBarcodes.length === 0 ? (
        <Text>No barcodes scanned yet.</Text>
      ) : (
        <FlatList
          data={scannedBarcodes}
          renderItem={({ item, index }) => (
            <View style={styles.historyItem}>
              <Text>{`${index + 1}. ${item}`}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    padding: 16,
  },
  camera: {
    flex: 1,
    aspectRatio: 1,
  },
  historyTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  historyItem: {
    padding: 10,
    marginTop: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default BarcodeScanner;
