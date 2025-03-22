import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  nome: string;
  labels: string[];
  data: number[];
  tempo?: boolean; // Define se os dados devem ser formatados como tempo
}

function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function generateColors(num: number): string[] {
  return Array.from({ length: num }, () => getRandomColor());
}

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

// Função para formatar tempo em dias, horas, minutos e segundos
const formatarTempo = (segundos: number) => {
  const dias = Math.floor(segundos / 86400);
  const horas = Math.floor((segundos % 86400) / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segundosRestantes = Math.floor(segundos % 60);

  let resultado = [];

  if (dias > 0) resultado.push(`${dias}d`);
  if (horas > 0 || dias > 0) resultado.push(`${horas}h`);
  if (minutos > 0 || horas > 0 || dias > 0) resultado.push(`${minutos}m`);
  if (segundosRestantes > 0 || resultado.length === 0) resultado.push(`${segundosRestantes}s`);

  return resultado.join(" ");
};

export default function PieChart({ labels, data, nome, tempo = false }: PieChartProps) {
  const windowSize = useWindowSize();
  const backgroundColors = generateColors(labels.length);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${nome}`,
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const valor = tooltipItem.raw;
            return tempo ? `${nome}: ${formatarTempo(valor)}` : `${nome}: ${valor}`; // Só formata se tempo = true
          },
        },
      },
    },
    layout: {
      padding: {
        top: 0,
        bottom: 0,
      },
    },
  };

  return (
    <div className="w-full" style={{ maxWidth: '400px', height: 'auto', aspectRatio: '1' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}
