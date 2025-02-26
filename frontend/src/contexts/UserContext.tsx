'use client';

import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  userCode: number;
  setUserCode: (code: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userCode, setUserCode] = useState(0);

  return (
    <UserContext.Provider value={{ userCode, setUserCode }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para acessar o contexto facilmente
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
};
