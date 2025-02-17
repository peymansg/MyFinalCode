import { StyleSheet, Text, View } from "react-native";
import WeatherComponent from "./WeatherComponent";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WifiComponent from "./WifiComponent";
import BarcodeScanner from "./BarcodeScanner";
import BluetoothComponent from "./BluetoothComponent";
import WeatherHistoryComponent from "./WeatherHistoryComponent";

const Tab = createBottomTabNavigator();
const WeatherStack = createNativeStackNavigator();

function WeatherStackScreen() {
  return (
    <WeatherStack.Navigator>
      <WeatherStack.Screen
        name="WeatherComponent"
        component={WeatherComponent}
      />
      <WeatherStack.Screen
        name="WeatherHistoryComponent"
        component={WeatherHistoryComponent}
      />
    </WeatherStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Weather" component={WeatherStackScreen} />
        <Tab.Screen name="Bluetooth" component={BluetoothComponent} />
        <Tab.Screen name="Wifi" component={WifiComponent} />
        <Tab.Screen name="BarCodeScanner" component={BarcodeScanner} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
