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

export type StatsFilter = 'total' | 'aprovados' | 'pendentes' | 'pendencias' | null;

interface StatsCardsProps {
  isAdmin?: boolean;
  userPa?: string | null;
  onFilterChange?: (filter: StatsFilter) => void;
  activeFilter?: StatsFilter;
}

const StatsCards = ({ isAdmin, userPa, onFilterChange, activeFilter }: StatsCardsProps) => {
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

      let query = supabase
        .from('ccb_operations')
        .select('status, pendencia');
      
      // If not admin, filter by user_id OR pa
      if (!isAdmin) {
        if (userPa) {
          query = query.eq('pa', userPa);
        } else {
          query = query.eq('user_id', user.id);
        }
      }

      const { data, error } = await query;

      if (error || !data) return;

      setStats({
        total: data.length,
        aprovados: data.filter(op => op.status === 'aprovado').length,
        pendentes: data.filter(op => op.status === 'pendente' || op.status === 'em_analise').length,
        pendencias: data.filter(op => op.pendencia).length,
      });
    };

    fetchStats();
  }, [user, isAdmin, userPa]);

  const cards = [
    {
      title: 'Total de Operações',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      filterKey: 'total' as StatsFilter,
    },
    {
      title: 'Aprovadas',
      value: stats.aprovados,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      filterKey: 'aprovados' as StatsFilter,
    },
    {
      title: 'Em Análise',
      value: stats.pendentes,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      filterKey: 'pendentes' as StatsFilter,
    },
    {
      title: 'Com Pendências',
      value: stats.pendencias,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      filterKey: 'pendencias' as StatsFilter,
    },
  ];

  const isClickable = !isAdmin && onFilterChange;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className={`animate-slide-up ${isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${activeFilter === card.filterKey ? 'ring-2 ring-primary' : ''}`}
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => isClickable && onFilterChange(activeFilter === card.filterKey ? null : card.filterKey)}
        >
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
