import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

const CarrinhoScreen = () => {
  const [itens, setItens] = useState([]);
  const navigation = useNavigation();
  const [userCode, setUserCode] = useState(null); // Inicializa como null para evitar requisição prematura

  useEffect(() => {
    async function fetchUserAndCarrinho() {
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

        // Buscar o carrinho do usuário
        const carrinhoResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/carrinho_app/itens/${codUser}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const carrinhoData = await carrinhoResponse.json();
        setItens(carrinhoData || []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
      }
    }

    fetchUserAndCarrinho();
  }, []);

    const iniciarProducao = async () => {
        try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) {
            console.error("Nenhum token encontrado!");
            return;
        }
    
        if (itens.length === 0) {
            console.warn("Nenhum item no carrinho para processar.");
            return;
        }

        const dataPegou = new Date();
        const dataFormatada = new Date(dataPegou.getTime() - dataPegou.getTimezoneOffset() * 60000)
            .toISOString();
    
        const payload = {
            data_pegou: dataFormatada,
            cod_user: userCode,
            itens: itens.map(item => ({
                cod_projeto: item.cod_projeto,
                cod_peca: item.cod_peca,
                quantidade: item.quantidade
            }))
        };
    
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/pegou_peca`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
    
        const responseData = await response.json();
    
        if (!response.ok) {
            throw new Error(responseData.error || "Erro ao iniciar a produção.");
        }
    
        // Após sucesso, deletar os registros do carrinhoApp
        const deleteResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/carrinho_app/pegou_carrinho/${userCode}`, {
            method: "DELETE",
            headers: {
            "Authorization": `Bearer ${token}`,
            },
        });
    
        if (!deleteResponse.ok) {
            throw new Error("Erro ao limpar o carrinho.");
        }
    
        // Atualizar o estado para refletir que os itens foram removidos
        setItens([]);

        navigation.navigate("Produzindo")
    
        } catch (error) {
        console.error("Erro ao iniciar a produção:", error.message);
        }
    };
  

  return (
    <View style={styles.container}>
      {itens.length === 0 ? (
        <Text style={styles.emptyText}>O carrinho está vazio</Text>
      ) : (
        <View>
            <FlatList
                style={styles.rowItens}
                data={itens}
                keyExtractor={(item) => `${item.cod_peca}-${item.cod_projeto}`}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemText}>Peça: {item.nome_peca}</Text>
                        <Text style={styles.itemText}>Projeto: {item.nome_projeto}</Text>                    
                        <Text style={styles.itemText}>Quantidade: {item.quantidade}</Text>
                    </View>
                )}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={iniciarProducao}>
                    <Text style={styles.buttonText}>Iniciar Produção</Text>
                </TouchableOpacity>
            </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  item: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginVertical: 8,
  },
  itemText: {
    fontSize: 16,
  },
  buttonContainer: {
    height: 60,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  button: {
    backgroundColor: "#18b4df",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  rowItens: {
    marginBottom: 60,
  }
});

export default CarrinhoScreen;
