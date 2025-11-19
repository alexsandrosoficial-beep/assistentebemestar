import { useState } from 'react';
import { Mic, MicOff, Phone, PhoneOff, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { cn } from '@/lib/utils';

export const VoiceChat = () => {
  const {
    messages,
    isConnected,
    isRecording,
    isSpeaking,
    error,
    connect,
    disconnect,
    sendTextMessage
  } = useVoiceChat();

  const [textInput, setTextInput] = useState('');

  const handleConnect = async () => {
    if (!isConnected) {
      await connect();
    } else {
      disconnect();
    }
  };

  const handleSendText = () => {
    if (textInput.trim() && isConnected) {
      sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in-up glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="relative">
            <Phone className="w-6 h-6 text-primary" />
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <span className="gradient-text">Modo de Voz</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status */}
        <div className="text-center space-y-2">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!isConnected && !error && (
            <p className="text-sm text-muted-foreground">
              Clique para iniciar uma conversa por voz
            </p>
          )}
          {isConnected && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {isRecording && (
                  <div className="flex items-center gap-2 text-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Ouvindo...</span>
                  </div>
                )}
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Assistente falando...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Conversation */}
        {isConnected && messages.length > 0 && (
          <ScrollArea className="h-64 rounded-lg border p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Text input when connected */}
        {isConnected && (
          <div className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Ou digite uma mensagem..."
              className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={handleSendText}
              disabled={!textInput.trim()}
              size="icon"
              variant="outline"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleConnect}
            size="lg"
            variant={isConnected ? 'destructive' : 'default'}
            className={cn(
              "hover-lift",
              isConnected && "animate-glow-pulse"
            )}
          >
            {isConnected ? (
              <>
                <PhoneOff className="w-5 h-5 mr-2" />
                Desconectar
              </>
            ) : (
              <>
                <Phone className="w-5 h-5 mr-2" />
                Iniciar Conversa
              </>
            )}
          </Button>

          {isConnected && (
            <Button
              variant="outline"
              size="lg"
              disabled
              className="hover-scale"
            >
              {isRecording ? (
                <>
                  <Mic className="w-5 h-5 mr-2 text-green-500" />
                  Microfone Ativo
                </>
              ) : (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Microfone
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>💡 Fale naturalmente com o assistente</p>
          <p>🎤 O microfone detectará automaticamente quando você parar de falar</p>
        </div>
      </CardContent>
    </Card>
  );
};
