import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, User } from 'lucide-react';

const DashboardHeader = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">SecureBank</h1>
            <p className="text-xs text-muted-foreground">Sistema CCB</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-foreground font-medium">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
