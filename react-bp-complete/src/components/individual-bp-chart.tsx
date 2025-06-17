import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IndividualBPChartProps {
  patientName: string;
  readings: any[];
  height?: string;
}

export function IndividualBPChart({ patientName, readings, height = 'h-64' }: IndividualBPChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!readings || readings.length === 0 || !chartRef.current) return;

    import('chart.js/auto').then(({ default: Chart }) => {
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;

      const existingChart = Chart.getChart(ctx);
      if (existingChart) {
        existingChart.destroy();
      }

      // Sort readings by date and take last 10
      const sortedReadings = readings
        .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
        .slice(-10);

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedReadings.map(r => 
            new Date(r.recordedAt).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          ),
          datasets: [
            {
              label: 'Systolic',
              data: sortedReadings.map(r => r.systolic),
              borderColor: '#DC2626',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              tension: 0.4,
              pointBackgroundColor: '#DC2626',
              pointBorderColor: '#DC2626',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Diastolic',
              data: sortedReadings.map(r => r.diastolic),
              borderColor: '#EA580C',
              backgroundColor: 'rgba(234, 88, 12, 0.1)',
              tension: 0.4,
              pointBackgroundColor: '#EA580C',
              pointBorderColor: '#EA580C',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            title: {
              display: true,
              text: `${patientName} - Blood Pressure Trend`,
              font: {
                size: 16,
                weight: 'bold',
              },
            },
            legend: {
              position: 'top',
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              callbacks: {
                afterBody: function(context) {
                  const index = context[0].dataIndex;
                  const reading = sortedReadings[index];
                  const category = reading.category;
                  const notes = reading.notes;
                  
                  let result = [`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`];
                  if (reading.heartRate) {
                    result.push(`Heart Rate: ${reading.heartRate} bpm`);
                  }
                  if (notes && notes.length > 0) {
                    result.push(`Notes: ${notes}`);
                  }
                  return result;
                }
              }
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Blood Pressure (mmHg)',
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
              beginAtZero: false,
              min: 40,
              max: 200,
              ticks: {
                stepSize: 20,
              },
            },
          },
          elements: {
            point: {
              hoverBorderWidth: 3,
            },
          },
        },
      });
    });
  }, [readings, patientName]);

  if (!readings || readings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{patientName} - Blood Pressure Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg`}>
            <p className="text-gray-500">No blood pressure readings available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className={`${height} relative`}>
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}