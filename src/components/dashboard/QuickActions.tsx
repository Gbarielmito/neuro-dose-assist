import { Plus, History, FileText, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Registrar Dose",
      description: "Nova entrada",
      href: "/dose",
      variant: "neuro" as const,
    },
    {
      icon: Brain,
      label: "Consultar IA",
      description: "Recomendações",
      href: "/dose",
      variant: "secondary" as const,
    },
    {
      icon: History,
      label: "Histórico",
      description: "Ver registros",
      href: "/history",
      variant: "secondary" as const,
    },
    {
      icon: FileText,
      label: "Relatório",
      description: "Exportar PDF",
      href: "/reports",
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link key={action.label} to={action.href}>
          <Button
            variant={action.variant}
            className="w-full h-auto py-4 flex-col gap-2"
          >
            <action.icon className="w-6 h-6" />
            <div className="text-center">
              <div className="font-medium">{action.label}</div>
              <div className="text-xs opacity-80">{action.description}</div>
            </div>
          </Button>
        </Link>
      ))}
    </div>
  );
}
