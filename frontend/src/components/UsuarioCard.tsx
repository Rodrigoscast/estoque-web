import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon } from "lucide-react";

interface UsuarioCardProps {
  cod_user: number;
  nome: string;
  email: string;
}

export default function UsuarioCard({ cod_user, nome, email }: UsuarioCardProps) {
  const router = useRouter();

  return (
    <Card
      className="flex items-center gap-4 p-6 cursor-pointer hover:shadow-lg transition"
      onClick={() => router.push(`/usuarios/${cod_user}`)}
    >
      <UserIcon className="w-10 h-10 text-gray-500 p-0 m-2 w-1/5" />
      <CardContent className="flex flex-col p-0 pl-2 w-full">
        <span className="font-semibold">{nome}</span>
        <span className="text-gray-500 text-sm">{email}</span>
      </CardContent>
    </Card>
  );
}
