import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

const ProduzindoScreen = () => {
  const [grupos, setGrupos] = useState([]);
  const navigation = useNavigation();
  const [userCode, setUserCode] = useState(null); 

  useEffect(() => {
    async function fetchProduzindo() {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) {
          console.error("Nenhum token encontrado!");
          return;
        }
  
        // Buscar o código do usuário
        const userResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/usuarios/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        const userData = await userResponse.json();
        if (!userResponse.ok) throw new Error(userData.error || "Erro desconhecido");
  
        const codUser = userData.cod_user;
        setUserCode(codUser);
  
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/pegou_peca/listas-em-producao/${codUser}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },  
        });
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao buscar peças em produção");
  
        // Agrupar os itens pelo cod_carrinho
        const gruposFormatados = data.reduce((acc, item) => {
          const carrinhoId = item.cod_carrinho;
          if (!acc[carrinhoId]) {
            acc[carrinhoId] = {
              cod_carrinho: carrinhoId,
              nome_grupo: `Carrinho ${carrinhoId}`,
              pecas: [],
            };
          }
          acc[carrinhoId].pecas.push({
            id: item.cod_peca,
            nome_peca: item.nome_peca,
            quantidade: item.quantidade,
          });
          return acc;
        }, {});
  
        setGrupos(Object.values(gruposFormatados));
      } catch (error) {
        console.error("Erro ao buscar peças em produção:", error.message);
      }
    }
  
    fetchProduzindo();
  }, []);

  const finalizarGrupo = async (codCarrinho) => {
    try {

      const dataPegou = new Date();
      const dataFormatada = new Date(dataPegou.getTime() - dataPegou.getTimezoneOffset() * 60000)
          .toISOString();

      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        console.error("Nenhum token encontrado!");
        return;
      }
  
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/pegou_peca/atualizar-data-final/${codCarrinho}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data_final: dataFormatada,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao finalizar produção.");
      }
  
      setGrupos(grupos.filter(grupo => grupo.cod_carrinho !== codCarrinho));

      Alert.alert("Peças Produzidas com Sucesso!")

    } catch (error) {
      console.error("Erro ao finalizar produção:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {grupos.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma peça em produção</Text>
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(grupo) => grupo.cod_carrinho.toString()}
          renderItem={({ item }) => (
            <View style={styles.grupoContainer}>
              {item.pecas.map((peca) => (
                <Text key={peca.id} style={styles.itemText}>
                  {peca.nome_peca} - Quantidade: {peca.quantidade}
                </Text>
              ))}
              <TouchableOpacity style={styles.button} onPress={() => finalizarGrupo(item.cod_carrinho)}>
                <Text style={styles.buttonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
  },
  grupoContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  grupoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 3,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProduzindoScreen;