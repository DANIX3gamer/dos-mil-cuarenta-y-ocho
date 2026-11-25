import { Text, View, StyleSheet, Pressable } from "react-native";
import { styles } from "../styles";
import { router } from "expo-router";

export default function Gameover() {
  const onNewGame = () => {
    router.replace("/");
  }
  
  return (
    <View style={styles.container}>
      <Text>Game Over</Text>
      <Pressable style={styles.button} onPress={onNewGame}>
        <Text style={styles.buttonText}>Jugar de nuevo</Text>
      </Pressable>
    </View>
  );
}


