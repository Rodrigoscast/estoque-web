
export async function customFetch(url, options = {}) {
    let token = localStorage.getItem('token');

    if (token) {
        const decoded = JSON.parse(atob(token.split('.')[1])); // Decodifica o token JWT
        const expiresIn = decoded.exp * 1000 - Date.now(); // Tempo restante para expirar

        if (expiresIn < 5 * 60 * 1000) { // Se faltar menos de 5 minutos
            const newToken = await renovarToken();
            if (newToken) {
                token = newToken;
                localStorage.setItem('token', newToken);
            } else {
                window.location.href = "/login"; // Redireciona para login se falhar
            }
        }
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    options.credentials = 'include'; // Envia cookies

    const response = await fetch(url, options);
    if (response.status === 401) window.location.href = "/login";
    return response;
}

async function renovarToken() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include', // Permite o envio do cookie
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error("Erro ao renovar token");

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error("Erro ao renovar token:", error);
        return null;
    }
}