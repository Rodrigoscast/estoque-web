import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store"; 
import { useNavigation, useRoute } from "@react-navigation/native";

export default function SelecionarPecasRetirada() {
    const navigation = useNavigation();
    const route = useRoute();
    const { cod_projeto } = route.params;
    const [pecas, setPecas] = useState([]);
    const [selecionadas, setSelecionadas] = useState({});

    useEffect(() => {
        async function fetchMateriaisProducao() {
            try {
                const token = await SecureStore.getItemAsync("accessToken");
                if (!token) {
                    console.error("Nenhum token encontrado!");
                    return;
                }

                const [materiaisResponse, itensComerciaisResponse] = await Promise.all([
                    fetch(`${process.env.EXPO_PUBLIC_API_URL}/pegou_peca/materiais-em-producao/${cod_projeto}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    }),
                    fetch(`${process.env.EXPO_PUBLIC_API_URL}/pegou_peca/itens-comerciais/${cod_projeto}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    })
                ]);
                
                if (!materiaisResponse.ok || !itensComerciaisResponse.ok) {
                    console.error("Erro ao buscar dados");
                    return;
                }

                const [materiais, itensComerciais] = await Promise.all([
                    materiaisResponse.json(),
                    itensComerciaisResponse.json()
                ]);

                const materiaisFiltrados = materiais.filter(peca => peca.produzido === 1);

                const itensComerciaisFormatados = itensComerciais.map(item => ({
                    cod_peca: item.cod_peca,
                    nome: item.nome,
                    quantidade: item.quantidade || 0,
                    estoque: item.estoque || 0,
                    comercial: 1
                }));

                setPecas([...materiaisFiltrados, ...itensComerciaisFormatados]);
            } catch (error) {
                console.error("Erro ao buscar materiais e itens comerciais:", error);
            }
        }
        
        const unsubscribe = navigation.addListener('focus', fetchMateriaisProducao);
        return unsubscribe;
    }, [cod_projeto, navigation]);

    function toggleSelecionada(cod_peca) {
        setSelecionadas(prev => ({
            ...prev,
            [cod_peca]: !prev[cod_peca]
        }));
    }

    function handleAvancar() {
        const pecasSelecionadas = Object.keys(selecionadas)
            .filter(cod => selecionadas[cod])
            .map(cod => {
                const peca = pecas.find(p => p.cod_peca.toString() === cod);
                return {
                    cod_peca: peca.cod_peca,
                    nome: peca.nome,
                    quantidade_disponivel: peca.quantidade,
                    estoque: peca.estoque
                };
            });
    
        if (pecasSelecionadas.length === 0) {
            alert("Selecione pelo menos uma peça.");
            return;
        }
    
        navigation.navigate("Confirmar Retirada de Peças", { cod_projeto, pecasSelecionadas });
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={pecas}
                keyExtractor={(item) => item.cod_peca.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.pecaCard, 
                            item.comercial === 1 && styles.comercial,
                            selecionadas[item.cod_peca] && styles.selecionada                    
                        ]}
                        onPress={() => toggleSelecionada(item.cod_peca)}
                    >
                        <Text style={styles.pecaNome}>{item.nome}</Text>
                        <Text>Disponível: {item.quantidade}</Text>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity style={styles.botao} onPress={handleAvancar}>
                <Text style={styles.botaoTexto}>Avançar</Text>
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
    comercial: {
        backgroundColor: "#c8e6c9",
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
});
