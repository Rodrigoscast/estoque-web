import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    top: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
    },
    mid: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    bot: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
    },
    label: {
        alignSelf: "flex-start",
        fontSize: 12,
        color: "#555",
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        width: "100%",
        marginBottom: 10,
    },
    input: {
        flex: 1,
        height: 40,
    },
    icon: {
        marginLeft: 5,
    },
    button: {
        backgroundColor: "#8a6ef0",
        paddingVertical: 10,
        width: "100%",
        alignItems: "center",
        borderRadius: 8,
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    signupText: {
        marginTop: 10,
        fontSize: 12,
        color: "#777",
    },
    signupLink: {
        color: "#8a6ef0",
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo escuro semi-transparente
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    inputMail: {
        width: "100%", // 🔥 Garante que ocupe toda a largura disponível
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontSize: 16,
        color: "#333", // 🔥 Garante que o texto seja visível
        backgroundColor: "#fff", // 🔥 Evita que o fundo fique invisível
        margin: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonMail: {
        backgroundColor: "#007bff",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonTextMail: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelText: {
        marginTop: 10,
        color: "red",
        fontSize: 16,
        fontWeight: "bold",
    },
    botoesBot: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
    },
});