// InserirQuantidadeScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store"; 
import { useNavigation, useRoute } from "@react-navigation/native";

export default function InserirQuantidadeScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { cod_projeto, pecasSelecionadas } = route.params;
    const [quantidades, setQuantidades] = useState({});
    const [userCode, setUserCode] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchUser() {
          try {
            const token = await SecureStore.getItemAsync("accessToken");
            if (!token) {
              console.error("Nenhum token encontrado!");
            }
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/usuarios/me`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
            });
    
            const responseText = await response.text();
            const data = JSON.parse(responseText);

            if (!response.ok) throw new Error(data.error || "Erro desconhecido");
            setUserCode(data.cod_user);
          } catch (error: any) {
            console.error("Erro ao buscar usuário:", error.message);
            // logout()
          }
        }
        fetchUser();
      }, []);

      async function handleConfirmar() {
        if (loading) return;
        setLoading(true);

        try {
            const token = await SecureStore.getItemAsync("accessToken");
            const dataPegou = new Date();
            const dataFormatada = new Date(dataPegou.getTime() - dataPegou.getTimezoneOffset() * 60000)
                .toISOString();

            const retiradas = pecasSelecionadas.map(peca => {
                const quantidade = Number(quantidades[peca.cod_peca] || 0);
                return {
                    cod_projeto,
                    cod_peca: Number(peca.cod_peca),
                    cod_user: Number(userCode),
                    quantidade,
                    data_pegou: dataFormatada,
                };
            }).filter(retirada => retirada.quantidade > 0);

            if (retiradas.length === 0) {
                Alert.alert("Erro", "Insira a quantidade para pelo menos uma peça.");
                return;
            }

            await Promise.all(retiradas.map(async (retirada) => {
                await fetch(`${process.env.EXPO_PUBLIC_API_URL}/pegou_peca`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
                    },
                    body: JSON.stringify(retirada),
                });
            }));

            Alert.alert("Sucesso", "Peças retiradas com sucesso!");
            navigation.replace("Projetos");
        } catch (error) {
            console.error("Erro ao retirar peça:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
    <FlatList
        data={pecasSelecionadas}
        keyExtractor={(item) => item.cod_peca.toString()}
        renderItem={({ item }) => (
            <View style={styles.pecaCard}>
                <Text>{item.nome}</Text>
                <Text>Disponível: {item.quantidade_disponivel}</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="Quantidade"
                    onChangeText={(text) => {
                        const valor = Number(text) || 0;

                        if (valor > item.estoque) {
                            Alert.alert(
                                "Quantidade indisponível",
                                `Estoque atual dessa peça: ${item.estoque}`
                            );
                        } else {
                            setQuantidades({ ...quantidades, [item.cod_peca]: valor.toString() });
                        }
                    }}
                    value={quantidades[item.cod_peca] || ""}
                />
            </View>
        )}
    />

    <TouchableOpacity
        style={[styles.botao, loading && styles.botaoDesabilitado]}
        onPress={handleConfirmar}
        disabled={loading} // Desativa o botão enquanto carrega
    >
        <Text style={styles.botaoTexto}>{loading ? "Aguarde..." : "Confirmar"}</Text>
    </TouchableOpacity>
</View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    pecaCard: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selecionada: {
        backgroundColor: "#cce5ff",
    },
    pecaNome: {
        fontSize: 16,
        fontWeight: "bold",
    },
    botao: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    botaoTexto: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    botaoDesabilitado: {
        backgroundColor: "#ccc", // Cor mais clara para indicar desativado
    }
});
