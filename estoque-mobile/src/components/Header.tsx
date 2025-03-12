import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store"; 

const Header = ({ title }) => {
  const navigation = useNavigation();
  const route = useRoute(); // Pega a rota atual

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    navigation.replace("Login");
  };

  return (
    <View style={styles.header}>
      {/* Se NÃO estiver na Home, exibe botão de voltar */}
      {route.name !== "Projetos" ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} /> // Para alinhar corretamente
      )}

      <Text style={styles.title}>{title}</Text>

      {/* Se estiver na Home, exibe botão de logout */}
      {route.name === "Projetos" ? (
        <TouchableOpacity onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="red" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} /> // Para alinhar corretamente
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    elevation: 3, // Sombra no Android
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Header;
