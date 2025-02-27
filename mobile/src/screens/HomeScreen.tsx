import { View, Text, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>Bem-vindo ao App!</Text>
      <Button title="Ir para Detalhes" onPress={() => navigation.navigate("Detalhes")} />
    </View>
  );
}
