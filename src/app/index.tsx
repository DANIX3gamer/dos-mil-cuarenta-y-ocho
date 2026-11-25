import { Text, View, StyleSheet,Pressable, Image } from "react-native";
import { useWindowDimensions } from "react-native";
import { styles }from "../styles";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.container}>
      <Image 
  source={require("../../assets/2048-game.jpg")} 
  style={{ width: width, height: width, resizeMode: "contain" }} 
/>
      <Text>dos-mil-cuarenta-y-ocho</Text>
      <Pressable 
        style={styles.button}
        onPress={() => router.replace("/game")}>
        <Text style={styles.buttonText}>Press me</Text>
      </Pressable>
      <Text style = {styles.buttonText}>Cesar Daniel Jaimes</Text>
      <Text style = {styles.buttonText}>Calderon</Text>
      <Text style = {styles.buttonText}>Leonardo Pedroza Diaz</Text>
      <Text style = {styles.buttonText}>Gerardo Lopez Lagunez</Text>
    </View>
  );
}
