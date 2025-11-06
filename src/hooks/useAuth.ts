import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseTyped as supabase } from '@/integrations/supabase/client-typed';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name
          }
        }
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Wait a bit for the session to be fully established
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name
          } as any);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast({
            title: "Aviso",
            description: "Conta criada, mas houve um problema ao criar o perfil. Por favor, faça login.",
            variant: "destructive",
          });
          return { error: profileError };
        }

        // Create free trial subscription (7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: data.user.id,
            plan_type: 'free',
            status: 'active',
            expires_at: expiresAt.toISOString()
          } as any);

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
          toast({
            title: "Aviso",
            description: "Conta criada, mas houve um problema ao criar a assinatura. Por favor, escolha um plano.",
            variant: "destructive",
          });
          navigate('/planos');
          return { error: subscriptionError };
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Você ganhou 7 dias grátis para testar todas as funcionalidades!",
        });

        navigate('/chat');
      }

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.message === 'User already registered' 
        ? 'Este email já está cadastrado. Faça login ou use outro email.'
        : error.message;
      
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login.';
        }
        
        throw new Error(errorMessage);
      }

      // Check if user has a subscription
      if (data.user) {
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', data.user.id)
          .eq('status', 'active')
          .maybeSingle();

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta.",
        });

        if (subscription) {
          navigate('/chat');
        } else {
          navigate('/planos');
        }
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const checkSubscription = async () => {
    if (!user) return null;

    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    // Check if subscription has expired
    if (data && (data as any).expires_at) {
      const expiresAt = new Date((data as any).expires_at);
      const now = new Date();
      
      if (now > expiresAt) {
        // Update subscription status to expired
        await supabase
          .from('user_subscriptions')
          // @ts-ignore - Temporary fix until Supabase types are regenerated
          .update({ status: 'expired' })
          .eq('id', (data as any).id);
        
        return null;
      }
    }

    return data;
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    checkSubscription
  };
};
