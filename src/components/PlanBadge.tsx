import { Badge } from './ui/badge';
import { Crown, Sparkles, Target } from 'lucide-react';

interface PlanBadgeProps {
  planType: 'free' | 'vip' | 'premium';
  className?: string;
}

export const PlanBadge = ({ planType, className }: PlanBadgeProps) => {
  const configs = {
    free: {
      label: 'Teste Grátis',
      icon: Target,
      variant: 'secondary' as const
    },
    vip: {
      label: 'VIP',
      icon: Sparkles,
      variant: 'default' as const
    },
    premium: {
      label: 'Premium',
      icon: Crown,
      variant: 'default' as const
    }
  };

  const config = configs[planType];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};
