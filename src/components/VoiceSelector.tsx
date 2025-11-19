import { useState } from 'react';
import { Volume2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Voice {
  id: string;
  name: string;
  description: string;
  gender: string;
}

const AVAILABLE_VOICES: Voice[] = [
  { id: 'alloy', name: 'Alloy', description: 'Voz neutra e versátil', gender: 'Neutro' },
  { id: 'echo', name: 'Echo', description: 'Voz masculina clara e confiante', gender: 'Masculino' },
  { id: 'shimmer', name: 'Shimmer', description: 'Voz feminina suave e calorosa', gender: 'Feminino' },
  { id: 'ash', name: 'Ash', description: 'Voz masculina grave e profissional', gender: 'Masculino' },
  { id: 'ballad', name: 'Ballad', description: 'Voz feminina elegante e expressiva', gender: 'Feminino' },
  { id: 'coral', name: 'Coral', description: 'Voz feminina jovem e energética', gender: 'Feminino' },
  { id: 'sage', name: 'Sage', description: 'Voz masculina madura e sábia', gender: 'Masculino' },
  { id: 'verse', name: 'Verse', description: 'Voz masculina artística e expressiva', gender: 'Masculino' },
];

interface VoiceSelectorProps {
  userId: string;
  currentVoice?: string;
}

export const VoiceSelector = ({ userId, currentVoice = 'alloy' }: VoiceSelectorProps) => {
  const [selectedVoice, setSelectedVoice] = useState(currentVoice);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveVoice = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_voice: selectedVoice })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Voz atualizada!',
        description: `Você selecionou a voz ${AVAILABLE_VOICES.find(v => v.id === selectedVoice)?.name}`,
      });
    } catch (error) {
      console.error('Error saving voice:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar sua preferência de voz',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Volume2 className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>Voz do Assistente</CardTitle>
            <CardDescription>
              Escolha a voz que o assistente usará nas conversas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-300 text-left hover:shadow-md",
                selectedVoice === voice.id
                  ? "border-primary bg-primary/5 shadow-glow"
                  : "border-border hover:border-primary/50"
              )}
            >
              {selectedVoice === voice.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">{voice.name}</h4>
                <p className="text-xs text-muted-foreground">{voice.description}</p>
                <p className="text-xs text-muted-foreground font-medium mt-2">
                  {voice.gender}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSaveVoice}
            disabled={saving || selectedVoice === currentVoice}
            className="hover-lift"
          >
            {saving ? 'Salvando...' : 'Salvar Preferência'}
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">💡 Dica:</p>
          <p>
            Experimente diferentes vozes para encontrar aquela que mais combina com você. 
            A mudança será aplicada automaticamente nas próximas conversas por voz.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
