import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DiagnosticoBasic {
  score: number;
}

interface AccionBasic {
  estado: string;
}

export function SecurityTrendChart({ diagnosticos }: { diagnosticos: DiagnosticoBasic[] }) {
  const data = {
    labels: diagnosticos
      .slice()
      .reverse()
      .map((d, i) => `Diagnóstico ${i + 1}`),
    datasets: [
      {
        label: "Score de Seguridad",
        data: diagnosticos
          .slice()
          .reverse()
          .map((d) => d.score),
        borderColor: "rgb(14, 165, 233)",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#9ca3af" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af" },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export function ActionsStatusChart({ 
  acciones,
  completed: propCompleted,
  inProgress: propInProgress,
  pending: propPending
}: { 
  acciones?: AccionBasic[];
  completed?: number;
  inProgress?: number;
  pending?: number;
}) {
  let completadas = 0, enProgreso = 0, pendientes = 0;
  
  if (acciones) {
    completadas = acciones.filter((a) => a.estado === "completada").length;
    enProgreso = acciones.filter((a) => a.estado === "en_progreso").length;
    const pendientesArr = acciones.filter((a) => a.estado === "pendiente" || a.estado === "vencida");
    pendientes = pendientesArr.length;
  } else if (propCompleted !== undefined && propInProgress !== undefined && propPending !== undefined) {
    completadas = propCompleted;
    enProgreso = propInProgress;
    pendientes = propPending;
  }

  const data = {
    labels: ["Completadas", "En Progreso", "Pendientes"],
    datasets: [
      {
        data: [completadas, enProgreso, pendientes],
        backgroundColor: [
          "rgb(34, 197, 94)",
          "rgb(14, 165, 233)",
          "rgb(234, 179, 8)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: "#9ca3af" },
      },
    },
    cutout: "60%",
  };

  return <Doughnut data={data} options={options} />;
}

export function CategoryScoreChart({ diagnostico }: { diagnostico: { respuestas?: Record<string, number> } }) {
  if (!diagnostico?.respuestas) return null;

  const categories = Object.entries(diagnostico.respuestas).map(([name, score]) => ({
    name: name.length > 12 ? name.substring(0, 12) + "..." : name,
    score: (score as number) * 10,
  }));

  const data = {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        label: "Puntuación",
        data: categories.map((c) => c.score),
        backgroundColor: categories.map((c) =>
          c.score >= 70
            ? "rgb(34, 197, 94)"
            : c.score >= 40
            ? "rgb(234, 179, 8)"
            : "rgb(239, 68, 68)"
        ),
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#9ca3af" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", maxRotation: 45 },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

export function ScoreEvolutionChart({ history }: { history: { mes: string, score: number }[] }) {
  const data = {
    labels: history.map(h => h.mes),
    datasets: [
      {
        label: "Security Score",
        data: history.map(h => h.score),
        borderColor: "rgb(14, 165, 233)",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(14, 165, 233)",
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(14, 165, 233, 0.4)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Score: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#9ca3af", stepSize: 20 },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af" },
      },
    },
  };

  return <Line data={data} options={options} />;
}
