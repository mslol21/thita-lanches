import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm space-y-2">
          <p className="font-semibold text-foreground">Talita Pinha - Bolos e Doces Artesanais</p>
          <div className="flex justify-center gap-4">
            <a href="https://instagram.com/talitapinhabolosedoces" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              @talitapinhabolosedoces
            </a>
            <span>•</span>
            <span className="hover:text-primary transition-colors">
              Ribeirão Preto - SP
            </span>
          </div>
          <p className="mt-4 opacity-70">© 2026 Talita Pinha. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
