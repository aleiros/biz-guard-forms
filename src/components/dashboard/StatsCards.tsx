import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Stats {
  total: number;
  aprovados: number;
  pendentes: number;
  pendencias: number;
}

const StatsCards = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    aprovados: 0,
    pendentes: 0,
    pendencias: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('ccb_operations')
        .select('status, pendencia')
        .eq('user_id', user.id);

      if (error || !data) return;

      setStats({
        total: data.length,
        aprovados: data.filter(op => op.status === 'aprovado').length,
        pendentes: data.filter(op => op.status === 'pendente' || op.status === 'em_analise').length,
        pendencias: data.filter(op => op.pendencia).length,
      });
    };

    fetchStats();
  }, [user]);

  const cards = [
    {
      title: 'Total de Operações',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Aprovadas',
      value: stats.aprovados,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Em Análise',
      value: stats.pendentes,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Com Pendências',
      value: stats.pendencias,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={card.title} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${card.bgColor} flex items-center justify-center`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
