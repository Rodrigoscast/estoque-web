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
});