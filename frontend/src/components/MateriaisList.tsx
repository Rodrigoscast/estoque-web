'use client';

interface Material {
  id: number;
  nome: string;
  quantidade: number;
}

interface MateriaisListProps {
  materiais: Material[];
}

export default function MateriaisList({ materiais }: MateriaisListProps) {
  return (
    <div className="max-h-80 overflow-y-auto w-full">
      <ul className="space-y-3">
        {materiais.map((material) => (
          <li
            key={material.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <span className="font-medium">{material.nome}</span>
            <span className="text-gray-600">{material.quantidade}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
