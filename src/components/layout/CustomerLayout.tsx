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
          <p className="font-semibold text-foreground">Thita Lanches - Desde 2015</p>
          <div className="flex justify-center gap-4">
            <a href="https://instagram.com/thita.lanches" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              @thita.lanches
            </a>
            <span>•</span>
            <a href="https://wa.me/5516997977939" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              (16) 99797-7939
            </a>
          </div>
          <p className="mt-4 opacity-70">© 2026 Thita Lanches. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
