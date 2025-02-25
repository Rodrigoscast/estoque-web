// components/BarChart.tsx
'use client';

import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: number[];
  labels: string[]; // Espera datas no formato "YYYY-MM-DD"
  daysPerPage?: number;
}

function getFormattedLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const dayOfWeek = days[date.getDay()];
  
  // Formata o dia e mês
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return `${dayOfWeek} - ${day}/${month}`;
}

export default function BarChart({ data, labels, daysPerPage = 7 }: BarChartProps) {
  const totalDays = data.length;
  // Exibe os últimos 'daysPerPage' dias inicialmente
  const initialStart = Math.max(totalDays - daysPerPage, 0);
  const [startIndex, setStartIndex] = useState(initialStart);

  const endIndex = startIndex + daysPerPage;
  const filteredData = data.slice(startIndex, endIndex);
  const filteredLabels = labels
    .slice(startIndex, endIndex)
    .map(label => getFormattedLabel(label));

  const chartData = {
    labels: filteredLabels,
    datasets: [
      {
        label: 'Peças nesse dia',
        data: filteredData,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handlePrevious = () => {
    setStartIndex(prev => Math.max(prev - daysPerPage, 0));
  };

  const handleNext = () => {
    setStartIndex(prev => Math.min(prev + daysPerPage, totalDays - daysPerPage));
  };

  return (
    <div className="w-full">
      <Bar data={chartData} options={options} />
      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={handlePrevious}
          disabled={startIndex === 0}
          className={`px-4 py-2 bg-gray-300 rounded ${
            startIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Dias Anteriores
        </button>
        <button
          onClick={handleNext}
          disabled={endIndex >= totalDays}
          className={`px-4 py-2 bg-gray-300 rounded ${
            endIndex >= totalDays ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Dias Recentes
        </button>
      </div>
    </div>
  );
}
