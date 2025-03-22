import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import AntDesign from '@expo/vector-icons/AntDesign';

const Header = ({ title }) => {
  const navigation = useNavigation();
  const route = useRoute(); // Pega a rota atual
  const [cartCount, setCartCount] = useState(0);
  const [userCode, setUserCode] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function fetchUserAndCart() {
        try {
          const token = await SecureStore.getItemAsync("accessToken");
          if (!token) {
            console.error("Nenhum token encontrado!");
            return;
          }
  
          // Buscar usuário
          const userResponse = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/usuarios/me`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          if (!userResponse.ok) {
            const errorData = await userResponse.json();
            throw new Error(errorData.error || "Erro desconhecido");
          }
  
          const userData = await userResponse.json();
          setUserCode(userData.cod_user);
  
          // Se obteve o código do usuário, buscar o carrinho
          if (userData.cod_user) {
            const cartResponse = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/carrinho_app/quantidade/${userData.cod_user}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
  
            if (!cartResponse.ok) {
              throw new Error("Erro ao buscar quantidade do carrinho");
            }
  
            const cartData = await cartResponse.json();
            setCartCount(cartData.totalItens || 0);
          }
        } catch (error) {
          console.error("Erro ao buscar usuário/carrinho:", error.message);
        }
      }
  
      fetchUserAndCart();
    }, [route]) // Executa sempre que a rota mudar
  );

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    navigation.replace("Login");
  };

  return (
    <View style={styles.header}>
      {/* Se NÃO estiver na Home, exibe botão de voltar */}
      {route.name !== "Produzindo" && route.name !== "Retirada" ? (
        route.name === "Projetos" ? (
          <TouchableOpacity onPress={() => navigation.navigate("Carrinho")}>
            <View style={styles.carrinhoContainer}>
              <View style={styles.carrinho}>
                <AntDesign name="shoppingcart" size={28} color="white" />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        )
      ) : 
        <View style={{ width: 24 }} /> // Para alinhar corretamente
      }

      <Text style={styles.title}>{title}</Text>

      {/* Se estiver na Home, exibe botão de logout */}
      {route.name === "Projetos" || route.name === "Produzindo" || route.name === "Retirada" ? (
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
  carrinhoContainer: {
    position: "relative",
  },
  carrinho: {
    display: "flex",
    backgroundColor: "rgba(24, 180, 223, 0.57)",
    width: 40, // ou o tamanho desejado
    height: 40, // ou o tamanho desejado
    borderRadius: 60, // para garantir que fique redondo
    justifyContent: "center", // centraliza o conteúdo
    alignItems: "center", // centraliza o conteúdo
  },
  badge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default Header;