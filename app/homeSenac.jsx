import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function About() {
  const router = useRouter();

  return (
    <View style={styles.container}>
        <View style={styles.box1}>
           <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
        </View>
        <View style={styles.box2}></View>
        <View style={styles.box3}></View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#004586",
    alignItems: "center",
  },
  box1: {
   width: '100%',
    height: 100,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: 'purple',
  },
    box2: {
   width: '100%',
    height: 400,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: 'red',
  },
      box3: {
   width: '100%',
    height: 413,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: 'blue',
  },
  
});
