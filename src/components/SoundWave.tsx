import { cn } from '@/lib/utils';

interface SoundWaveProps {
  isActive: boolean;
  variant?: 'user' | 'assistant';
  className?: string;
}

export const SoundWave = ({ isActive, variant = 'user', className }: SoundWaveProps) => {
  const bars = Array.from({ length: 5 }, (_, i) => i);
  
  const variantColors = {
    user: 'bg-green-500',
    assistant: 'bg-primary'
  };

  return (
    <div className={cn("flex items-center justify-center gap-1 h-12", className)}>
      {bars.map((i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            variantColors[variant],
            isActive ? "animate-sound-wave" : "h-2 opacity-30"
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            height: isActive ? undefined : '8px'
          }}
        />
      ))}
    </div>
  );
};
