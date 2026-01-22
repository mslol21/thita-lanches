import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md w-full animate-in fade-in zoom-in duration-300">
          <div className="mx-auto mb-6 text-6xl">🚫</div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">
            Acesso Negado
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">
            A conta <strong>{user.email}</strong> não tem permissão para acessar o painel administrativo.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="default" onClick={() => logout()} className="w-full h-12 text-lg font-bold">
              Sair e usar outra conta
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link to="/">Voltar ao Cardápio</Link>
            </Button>
          </div>
          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-[10px] font-mono text-muted-foreground break-all">
              Seu ID: {user.uid}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
