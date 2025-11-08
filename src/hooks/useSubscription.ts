import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  started_at: string;
  expires_at: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const isPremium = subscription?.plan_type === 'premium';
  const isVip = subscription?.plan_type === 'vip';
  const isFree = subscription?.plan_type === 'free';

  return {
    subscription,
    loading,
    isPremium,
    isVip,
    isFree,
    hasActiveSubscription: !!subscription
  };
};
