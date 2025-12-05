import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckCircle, AlertTriangle, ArrowRightLeft, RefreshCcw, Mail, FileWarning } from 'lucide-react';
import OperationsList from './OperationsList';

interface DashboardTabsProps {
  isAdmin: boolean;
  userPa: string | null;
}

const DashboardTabs = ({ isAdmin, userPa }: DashboardTabsProps) => {
  // Tabs para admin - todas as opções
  const adminTabs = [
    {
      value: 'aberto',
      label: 'Abertos',
      icon: FileText,
      filter: 'aberto' as const,
      title: 'CCBs Abertas',
      emptyMessage: 'Nenhuma CCB aberta no momento',
    },
    {
      value: 'pendente_malote',
      label: 'Pendente Malote',
      icon: Mail,
      filter: 'pendente_malote' as const,
      title: 'Documentos Pendentes - Malote',
      emptyMessage: 'Nenhum documento pendente de malote',
    },
    {
      value: 'pendencia_regularizacao',
      label: 'Pend. Regularização',
      icon: FileWarning,
      filter: 'pendencia_regularizacao' as const,
      title: 'Pendência de Regularização',
      emptyMessage: 'Nenhuma pendência de regularização',
    },
    {
      value: 'liquidado',
      label: 'Liquidadas',
      icon: CheckCircle,
      filter: 'liquidado' as const,
      title: 'CCBs Liquidadas',
      emptyMessage: 'Nenhuma CCB liquidada',
    },
    {
      value: 'prejuizo_quitado',
      label: 'Prejuízo Quitado',
      icon: AlertTriangle,
      filter: 'prejuizo_quitado' as const,
      title: 'Prejuízo Quitado',
      emptyMessage: 'Nenhum prejuízo quitado',
    },
    {
      value: 'transferencia_prejuizo',
      label: 'Transf. Prejuízo',
      icon: ArrowRightLeft,
      filter: 'transferencia_prejuizo' as const,
      title: 'Transferência de Prejuízo',
      emptyMessage: 'Nenhuma transferência de prejuízo',
    },
    {
      value: 'repactuado',
      label: 'Repactuadas',
      icon: RefreshCcw,
      filter: 'repactuado' as const,
      title: 'CCBs Repactuadas',
      emptyMessage: 'Nenhuma CCB repactuada',
    },
  ];

  // Tabs para agência - apenas visualização de pendências
  const agencyTabs = [
    {
      value: 'pendente_malote',
      label: 'Pendente Malote',
      icon: Mail,
      filter: 'pendente_malote' as const,
      title: 'Documentos Pendentes - Malote',
      emptyMessage: 'Nenhum documento pendente de malote na sua agência',
    },
    {
      value: 'pendencia_regularizacao',
      label: 'Pend. Regularização',
      icon: FileWarning,
      filter: 'pendencia_regularizacao' as const,
      title: 'Pendência de Regularização',
      emptyMessage: 'Nenhuma pendência de regularização na sua agência',
    },
  ];

  const tabs = isAdmin ? adminTabs : agencyTabs;
  const defaultTab = isAdmin ? 'aberto' : 'pendente_malote';

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          <OperationsList
            filter={tab.filter}
            isAdmin={isAdmin}
            userPa={userPa}
            title={tab.title}
            emptyMessage={tab.emptyMessage}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default DashboardTabs;
