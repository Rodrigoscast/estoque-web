export async function customFetch(url, options = {}) {
    try {
        let token = localStorage.getItem('token');

        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const expiresIn = decoded.exp * 1000 - Date.now();

            if (expiresIn < 10 * 60 * 1000) { 
                console.log("⏳ Token expirando, tentando renovar...");
                
                const newToken = await renovarToken();
                if (newToken) {
                    console.log("✅ Token renovado com sucesso!");
                    token = newToken;
                    localStorage.setItem('token', newToken);
                } else {
                    console.warn("❌ Falha ao renovar token, tentando requisição assim mesmo...");
                }
            }
        }

        options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };

        options.credentials = 'include'; // Garante o envio de cookies

        const response = await fetch(url, options);

        if (response.status === 401) {
            console.warn("🔴 Token inválido ou expirado. Tentando renovar...");
            
            const newToken = await renovarToken();
            if (newToken) {
                console.log("✅ Token renovado com sucesso, tentando novamente...");
                localStorage.setItem('token', newToken);

                // Tentar a requisição novamente com o novo token
                options.headers.Authorization = `Bearer ${newToken}`;
                return fetch(url, options);
            } else {
                console.error("⛔ Falha ao renovar token, deslogando...");
                localStorage.removeItem('token');
                window.location.href = "/";
                return new Response(null, { status: 401, statusText: "Token inválido" });
            }
        }

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        console.error("Erro no customFetch:", error);
        return new Response(null, { status: 500, statusText: "Erro interno" });
    }
}

async function renovarToken() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include', // Permite o envio do cookie
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.warn("Falha ao renovar token, resposta não OK");
            return null;
        }

        const data = await response.json();
        return data.token; // Retorna o token para ser salvo

    } catch (error) {
        console.error("Erro ao renovar token:", error);
        return null;
    }
}
