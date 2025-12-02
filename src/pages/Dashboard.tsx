import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import CCBForm from '@/components/dashboard/CCBForm';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Olá, {user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas operações de crédito CCB
          </p>
        </div>

        <StatsCards key={refreshKey} />

        <div className="mt-8">
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
              <CCBForm onSuccess={handleFormSuccess} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
