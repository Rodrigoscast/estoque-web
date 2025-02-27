'use client';

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut, User, LayoutDashboard, Cog, Users, FileArchive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";


export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Carregando...");
  const { userCode, setUserCode } = useUser();
  const pathname = usePathname();
  const userMenuRef = useRef(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(process.env.NEXT_PUBLIC_NGROK_BYPASS === 'true' && { 'ngrok-skip-browser-warning': 'true' })
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro desconhecido");

        setUserName(data.nome.split(" ")[0]);
        setUserCode(data.cod_user);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error.message);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Projetos", icon: LayoutDashboard, path: "/projetos" },
    { name: "Peças", icon: Cog, path: "/pecas" },
    { name: "Usuários", icon: Users, path: "/usuarios" },
    { name: "Relatórios", icon: FileArchive, path: "/relatorios" }
  ];

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center w-full">
        <h1 className="text-xl font-bold">
          <div className="flex items-center justify-center">
            <img src="/favicon.png" alt="Logo" className="w-10 mx-auto" />
            <img src="/conforme-aco.png" alt="Logo" className="w-40 mx-auto" />
          </div>
        </h1>
        <div className="relative user-menu" ref={userMenuRef}>
          <button
            className="flex items-center gap-2 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <User size={24} />
            <span className="hidden md:inline">{userName}</span>
          </button>
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded p-2"
              >
                <p className="px-4 py-2 text-gray-700 text-sm border-b">{userName}</p>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
                  onClick={logout}
                >
                  <LogOut size={18} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Menu Lateral */}
        <motion.aside
          initial={{ width: menuOpen ? 256 : 80 }} // Define a largura inicial corretamente
          animate={{ width: menuOpen ? 256 : 80 }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gray-900 text-white p-4 shadow-lg z-50 flex flex-col"
        >
          <button
            className={`mb-6 text-white flex ${menuOpen ? 'justify-end' : 'justify-center'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} />
          </button>
          <nav className="space-y-4 flex flex-col">
            {menuItems.map(({ name, icon: Icon, path }) => (
              <a 
                key={name} 
                href={path} 
                className={`flex items-center px-4 py-2 rounded gap-5 ${pathname === path ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              >
                <Icon size={24} className="shrink-0" />
                {menuOpen && <span className="whitespace-nowrap">{name}</span>}
              </a>
            ))}
          </nav>
        </motion.aside>

        {/* Conteúdo Dinâmico */}
        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
