import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

interface BPChartProps {
  patientId?: number;
  period?: string;
  height?: string;
}

export function BPChart({ patientId, period = '7d', height = 'h-48' }: BPChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data: trends } = useQuery({
    queryKey: ['/api/readings/trends', { period }],
  });

  useEffect(() => {
    if (!trends || !canvasRef.current) return;

    // Import Chart.js dynamically
    import('chart.js/auto').then(({ default: Chart }) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart
      const existingChart = Chart.getChart(ctx);
      if (existingChart) {
        existingChart.destroy();
      }

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: trends.map((t: any) => new Date(t.date).toLocaleDateString()),
          datasets: [
            {
              label: 'Abnormal Readings',
              data: trends.map((t: any) => t.abnormalCount),
              borderColor: '#DC2626',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Normal Readings',
              data: trends.map((t: any) => t.normalCount),
              borderColor: '#16A34A',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    });
  }, [trends]);

  return (
    <div className={height}>
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}
