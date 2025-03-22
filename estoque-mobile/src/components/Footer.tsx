import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from "@react-navigation/native";

const Footer = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("Projetos"); // Aba inicial

  const cliqueiAba = (tab) => {
    setSelectedTab(tab); // Atualiza a aba selecionada
    navigation.navigate(tab); // Navega para a tela correspondente
  };

  return (
    <View style={styles.footer}>
      {/* Botão para Projetos */}
      <TouchableOpacity
        onPress={() => cliqueiAba("Projetos")}
        style={[
          styles.iconContainer,
          selectedTab === "Projetos" && styles.selectedTab, // Aplica o estilo se for a aba ativa
        ]}
      >
        <Ionicons name="construct" size={28} color="black" />
      </TouchableOpacity>

      {/* Botão para Configurações */}
      <TouchableOpacity
        onPress={() => cliqueiAba("Produzindo")}
        style={[
          styles.iconContainer,
          selectedTab === "Produzindo" && styles.selectedTab, // Aplica o estilo se for a aba ativa
        ]}
      >
        <MaterialIcons name="settings" size={28} color="black" />
      </TouchableOpacity>

      {/* Botão para Perfil */}
      <TouchableOpacity
        onPress={() => cliqueiAba("Retirada")}
        style={[
          styles.iconContainer,
          selectedTab === "Retirada" && styles.selectedTab, // Aplica o estilo se for a aba ativa
        ]}
      >
        <MaterialCommunityIcons name="robot-industrial" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  iconContainer: {
    padding: 10,
    borderRadius: 8, // Bordas arredondadas
  },
  selectedTab: {
    backgroundColor: "#ddd", // Cor de fundo para aba ativa
  },
});

export default Footer;
