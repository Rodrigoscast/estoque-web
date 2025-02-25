'use client';

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
  labels: string[];
  data: number[];
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

export default function PieChart({ labels, data }: PieChartProps) {
  // Usar o hook para obter a largura da janela e forçar re-render
  const windowSize = useWindowSize();

  const backgroundColors = generateColors(labels.length);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Peças retiradas por usuário',
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // permite o redimensionamento sem manter a proporção fixa
    plugins: {
      legend: {
        position: 'right' as const,
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
    // Use um container responsivo
    <div className="w-full" style={{ maxWidth: '400px', height: 'auto', aspectRatio: '1' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}
