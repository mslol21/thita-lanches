import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const authService = {
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro no Supabase Google Auth:", error);
      throw error;
    }
  },

  async signInWithEmail(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async checkAdminRole(userId: string): Promise<boolean> {
    // 1. Verificação por E-mail (Mais rápida e segura contra erros de banco)
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === 'admin@talita.com') return true;

    // 2. Verificação no Banco (Para outros admins se houver)
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Erro ao verificar cargo no Supabase:", error);
      return false;
    }
    return data?.role === 'admin';
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  },

  onAdminRoleChange(userId: string, callback: (isAdmin: boolean) => void) {
    // Backdoor seguro: Garante que o usuário logado com o e-mail admin tenha acesso
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email === 'admin@talita.com') {
        callback(true);
      }
    });

    // Listener para mudanças na tabela user_roles
    const channel = supabase
      .channel('admin_role_check')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          callback(payload.new?.role === 'admin');
        }
      )
      .subscribe();

    // Check inicial
    this.checkAdminRole(userId).then(callback);

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
