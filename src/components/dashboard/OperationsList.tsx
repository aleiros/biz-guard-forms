import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Operation {
  id: string;
  pa: string;
  produto: string;
  limite: number;
  conta_corrente: string;
  nome: string;
  cpf_cnpj: string;
  numero_ccb: string;
  modalidade: string;
  status: string;
  pendencia: boolean;
  pendente_malote: boolean;
  pendencia_regularizacao: boolean;
  created_at: string;
}

interface OperationsListProps {
  filter: 'aberto' | 'liquidado' | 'prejuizo_quitado' | 'transferencia_prejuizo' | 'repactuado' | 'pendente_malote' | 'pendencia_regularizacao';
  isAdmin?: boolean;
  userPa?: string | null;
  title: string;
  emptyMessage?: string;
}

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  cancelado: 'Cancelado',
  aberto: 'Aberto',
  liquidado: 'Liquidado',
  prejuizo_quitado: 'Prejuízo Quitado',
  transferencia_prejuizo: 'Transf. Prejuízo',
  repactuado: 'Repactuado',
};

const statusColors: Record<string, string> = {
  pendente: 'bg-warning/10 text-warning border-warning/20',
  em_analise: 'bg-primary/10 text-primary border-primary/20',
  aprovado: 'bg-success/10 text-success border-success/20',
  rejeitado: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelado: 'bg-muted text-muted-foreground border-muted',
  aberto: 'bg-primary/10 text-primary border-primary/20',
  liquidado: 'bg-success/10 text-success border-success/20',
  prejuizo_quitado: 'bg-destructive/10 text-destructive border-destructive/20',
  transferencia_prejuizo: 'bg-warning/10 text-warning border-warning/20',
  repactuado: 'bg-secondary text-secondary-foreground border-secondary',
};

const modalidadeLabels: Record<string, string> = {
  capital_giro: 'Capital de Giro',
  financiamento: 'Financiamento',
  emprestimo: 'Empréstimo',
  credito_pessoal: 'Crédito Pessoal',
  consignado: 'Consignado',
};

const OperationsList = ({ filter, isAdmin, userPa, title, emptyMessage }: OperationsListProps) => {
  const { user } = useAuth();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOperations = async () => {
      if (!user) return;

      let query = supabase
        .from('ccb_operations')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filter based on type
      if (filter === 'pendente_malote') {
        query = query.eq('pendente_malote', true);
      } else if (filter === 'pendencia_regularizacao') {
        query = query.eq('pendencia_regularizacao', true);
      } else {
        query = query.eq('status', filter);
      }

      // If not admin, filter by PA
      if (!isAdmin && userPa) {
        query = query.eq('pa', userPa);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching operations:', error);
        return;
      }

      setOperations(data || []);
      setLoading(false);
    };

    fetchOperations();
  }, [user, filter, isAdmin, userPa]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCpfCnpj = (value: string) => {
    if (value.length === 11) {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            {emptyMessage || 'Nenhuma operação encontrada'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{title} ({operations.length})</h3>
      <div className="grid gap-4">
        {operations.map((op) => (
          <Card key={op.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-2 py-1 rounded bg-primary/10 text-primary">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="text-sm font-medium">PA {op.pa}</span>
                    </div>
                    <Badge variant="outline" className={statusColors[op.status]}>
                      {statusLabels[op.status] || op.status}
                    </Badge>
                    {op.pendencia && (
                      <Badge variant="destructive">Pendência</Badge>
                    )}
                    {op.pendente_malote && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        Malote
                      </Badge>
                    )}
                    {op.pendencia_regularizacao && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        Regularização
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{op.nome}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{formatCpfCnpj(op.cpf_cnpj)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span>CCB: <strong className="text-foreground">{op.numero_ccb}</strong></span>
                    <span>CC: {op.conta_corrente}</span>
                    <span>{modalidadeLabels[op.modalidade] || op.modalidade}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xl font-bold text-foreground">
                    {formatCurrency(op.limite)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(op.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OperationsList;
