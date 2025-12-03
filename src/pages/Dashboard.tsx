import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import CCBForm from '@/components/dashboard/CCBForm';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X, Shield, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userPa, setUserPa] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('pa')
          .eq('user_id', user.id)
          .single();
        setUserPa(data?.pa || null);
      };
      fetchProfile();
    }
  }, [user]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {isAdmin ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Administrador</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">Agência PA {userPa || '—'}</span>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Olá, {user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Visão geral de todas as operações CCB de todas as agências' 
              : `Gerencie as operações de crédito CCB da Agência PA ${userPa}`}
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards key={refreshKey} isAdmin={isAdmin} userPa={userPa} />

        {/* New Operation Button */}
        <div className="mt-8 mb-6">
          {!showForm ? (
            <Button 
              variant="gradient" 
              size="lg"
              onClick={() => setShowForm(true)}
              className="animate-scale-in"
            >
              <Plus className="h-5 w-5" />
              Nova Operação CCB
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Cadastrar Nova Operação</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
              <CCBForm onSuccess={handleFormSuccess} defaultPa={userPa} />
            </div>
          )}
        </div>

        {/* Operations Tabs */}
        {!showForm && (
          <div className="mt-8">
            <DashboardTabs isAdmin={isAdmin} userPa={userPa} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
