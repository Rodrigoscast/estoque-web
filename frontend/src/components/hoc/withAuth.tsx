"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const renovarToken = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.warn("Falha ao renovar token, resposta não OK");
      return null;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data.token;
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return null;
  }
};

const withAuth = (WrappedComponent: any) => {
  return (props: any) => {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        let token = localStorage.getItem("token");
        
        if (!token) {
          const newToken = await renovarToken();
          if (!newToken) {
            router.push("/");
            return;
          }
          token = newToken;
        }

        setVerified(true);
      };

      checkAuth();
    }, [router]);

    if (!verified) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;