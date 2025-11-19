import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VoiceSelector } from "@/components/VoiceSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Trash2,
  Clock,
  Mail,
  AlertCircle,
  Crown,
  Sparkles,
  TrendingUp,
  Shield,
  CheckCircle2,
  Edit2,
  Check,
  X,
  FileText,
  Phone,
  MapPin
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  bio: z.string().trim().max(500, "Bio muito longa").optional(),
  phone: z.string().trim().max(20, "Telefone muito longo").optional(),
  location: z.string().trim().max(100, "Localização muito longa").optional(),
});

const Perfil = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [daysActive, setDaysActive] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editedPhone, setEditedPhone] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editedLocation, setEditedLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadProfile();
      loadSubscription();
    }
  }, [user, loading, navigate]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setEditedName(data.name || "");
        setEditedBio(data.bio || "");
        setEditedPhone(data.phone || "");
        setEditedLocation(data.location || "");
        
        // Calcular dias desde o cadastro
        const createdDate = new Date(data.created_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysActive(diffDays);
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as informações do perfil",
        variant: "destructive",
      });
    }
  };

  const loadSubscription = async () => {
    try {
      const sub = await checkSubscription();
      setSubscription(sub);
    } catch (error: any) {
      console.error("Erro ao carregar assinatura:", error);
    }
  };

  const handleStartEditName = () => {
    setIsEditingName(true);
    setEditedName(profile?.name || "");
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName(profile?.name || "");
  };

  const handleSaveName = async () => {
    try {
      const validated = profileSchema.pick({ name: true }).parse({ name: editedName });
      setIsSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ name: validated.name, updated_at: new Date().toISOString() })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile({ ...profile, name: validated.name });
      setIsEditingName(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível atualizar suas informações",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditBio = () => {
    setIsEditingBio(true);
    setEditedBio(profile?.bio || "");
  };

  const handleCancelEditBio = () => {
    setIsEditingBio(false);
    setEditedBio(profile?.bio || "");
  };

  const handleSaveBio = async () => {
    try {
      const validated = profileSchema.pick({ bio: true }).parse({ bio: editedBio });
      setIsSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ bio: validated.bio, updated_at: new Date().toISOString() })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile({ ...profile, bio: validated.bio });
      setIsEditingBio(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Bio atualizada com sucesso.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível atualizar a bio",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditPhone = () => {
    setIsEditingPhone(true);
    setEditedPhone(profile?.phone || "");
  };

  const handleCancelEditPhone = () => {
    setIsEditingPhone(false);
    setEditedPhone(profile?.phone || "");
  };

  const handleSavePhone = async () => {
    try {
      const validated = profileSchema.pick({ phone: true }).parse({ phone: editedPhone });
      setIsSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ phone: validated.phone, updated_at: new Date().toISOString() })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile({ ...profile, phone: validated.phone });
      setIsEditingPhone(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Telefone atualizado com sucesso.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível atualizar o telefone",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditLocation = () => {
    setIsEditingLocation(true);
    setEditedLocation(profile?.location || "");
  };

  const handleCancelEditLocation = () => {
    setIsEditingLocation(false);
    setEditedLocation(profile?.location || "");
  };

  const handleSaveLocation = async () => {
    try {
      const validated = profileSchema.pick({ location: true }).parse({ location: editedLocation });
      setIsSaving(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ location: validated.location, updated_at: new Date().toISOString() })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile({ ...profile, location: validated.location });
      setIsEditingLocation(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Localização atualizada com sucesso.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível atualizar a localização",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", user?.id)
        .eq("status", "active");

      if (error) throw error;

      toast({
        title: "Plano cancelado",
        description: "Seu plano foi cancelado com sucesso",
      });

      loadSubscription();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o plano",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Deletar perfil (cascade vai deletar subscription)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user?.id);

      if (profileError) throw profileError;

      toast({
        title: "Conta deletada",
        description: "Sua conta foi deletada com sucesso",
      });

      await signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conta",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPlanName = (planType: string) => {
    const plans: Record<string, string> = {
      free: "Gratuito",
      basic: "Básico",
      premium: "Premium",
      enterprise: "Empresarial",
    };
    return plans[planType] || planType;
  };

  const getStatusName = (status: string) => {
    const statuses: Record<string, string> = {
      active: "Ativo",
      cancelled: "Cancelado",
      expired: "Expirado",
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 bg-gradient-to-b from-background via-secondary/20 to-background">
        <div className="container max-w-6xl">
          {/* Header com Badge Premium */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full border border-primary/30 animate-fade-in">
              {subscription?.plan_type === 'premium' ? (
                <>
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">Membro Premium</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">Membro {getPlanName(subscription?.plan_type || 'free')}</span>
                </>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gerencie suas informações e acompanhe sua jornada de saúde e bem-estar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card de Informações Pessoais - Redesenhado */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border border-border/50 hover:border-primary/30 transition-colors group">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Nome</p>
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="h-9"
                            placeholder="Digite seu nome"
                            maxLength={100}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveName();
                              if (e.key === 'Escape') handleCancelEditName();
                            }}
                            autoFocus
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleSaveName}
                            disabled={isSaving}
                            className="h-9 w-9 flex-shrink-0"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleCancelEditName}
                            disabled={isSaving}
                            className="h-9 w-9 flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{profile?.name || "Não informado"}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleStartEditName}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-semibold">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border border-border/50 hover:border-primary/30 transition-colors group">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Bio</p>
                      {isEditingBio ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editedBio}
                            onChange={(e) => setEditedBio(e.target.value)}
                            className="h-9"
                            placeholder="Conte um pouco sobre você"
                            maxLength={500}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveBio();
                              if (e.key === 'Escape') handleCancelEditBio();
                            }}
                            autoFocus
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleSaveBio}
                            disabled={isSaving}
                            className="h-9 w-9 flex-shrink-0"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleCancelEditBio}
                            disabled={isSaving}
                            className="h-9 w-9 flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{profile?.bio || "Não informada"}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleStartEditBio}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border border-border/50 hover:border-primary/30 transition-colors group">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                      {isEditingPhone ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            className="h-9"
                            placeholder="(00) 00000-0000"
                            maxLength={20}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePhone();
                              if (e.key === 'Escape') handleCancelEditPhone();
                            }}
                            autoFocus
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleSavePhone}
                            disabled={isSaving}
                            className="h-9 w-9 flex-shrink-0"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleCancelEditPhone}
                            disabled={isSaving}
                            className="h-9 w-9 flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{profile?.phone || "Não informado"}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleStartEditPhone}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border border-border/50 hover:border-primary/30 transition-colors group">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Localização</p>
                      {isEditingLocation ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editedLocation}
                            onChange={(e) => setEditedLocation(e.target.value)}
                            className="h-9"
                            placeholder="Cidade, Estado"
                            maxLength={100}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveLocation();
                              if (e.key === 'Escape') handleCancelEditLocation();
                            }}
                            autoFocus
                          />
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleSaveLocation}
                            disabled={isSaving}
                            className="h-9 w-9 flex-shrink-0"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={handleCancelEditLocation}
                            disabled={isSaving}
                            className="h-9 w-9 flex-shrink-0"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{profile?.location || "Não informada"}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleStartEditLocation}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20 text-center">
                      <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Tempo de uso</p>
                      <p className="text-2xl font-bold text-primary">{daysActive}</p>
                      <p className="text-xs text-muted-foreground">dias</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20 text-center">
                      <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Membro desde</p>
                      <p className="text-sm font-bold">
                        {profile?.created_at ? formatDate(profile.created_at) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card do Plano Atual - Redesenhado */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                {subscription ? (
                  <>
                    <div className="relative">
                      <div className={`p-6 rounded-xl border-2 text-center ${
                        subscription.plan_type === 'premium' 
                          ? 'bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/50' 
                          : 'bg-gradient-to-br from-muted/50 to-background border-border'
                      }`}>
                        {subscription.plan_type === 'premium' && (
                          <Sparkles className="h-8 w-8 text-primary mx-auto mb-3 animate-pulse" />
                        )}
                        <p className="text-sm text-muted-foreground mb-2">Seu Plano</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {getPlanName(subscription.plan_type)}
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                          {subscription.status === 'active' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-500">Ativo</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium text-amber-500">{getStatusName(subscription.status)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Início</span>
                        </div>
                        <span className="font-semibold text-sm">
                          {formatDate(subscription.started_at)}
                        </span>
                      </div>

                      {subscription.expires_at && (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Validade</span>
                          </div>
                          <span className="font-semibold text-sm">
                            {formatDate(subscription.expires_at)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {subscription.status === "active" && subscription.plan_type !== "free" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Cancelar Plano
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancelar plano?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja cancelar seu plano? Você perderá acesso aos
                              recursos premium.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelSubscription}>
                              Confirmar Cancelamento
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground mb-4">Nenhum plano ativo</p>
                    <Button onClick={() => navigate('/planos')} className="gap-2">
                      <Crown className="h-4 w-4" />
                      Ver Planos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice Selector - Only for Premium users */}
            {subscription && subscription.plan_type === 'premium' && user && (
              <div className="md:col-span-2">
                <VoiceSelector userId={user.id} currentVoice={profile?.preferred_voice} />
              </div>
            )}

            {/* Card de Ações da Conta - Redesenhado (Ocupa toda largura) */}
            <Card className="md:col-span-2 relative overflow-hidden border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  Gerenciar Conta
                </CardTitle>
                <CardDescription className="text-base">
                  Configurações e ações importantes da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-start gap-3 h-auto py-4 hover:bg-muted/50 transition-colors group"
                    onClick={signOut}
                  >
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <LogOut className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Sair da Conta</p>
                      <p className="text-xs text-muted-foreground">Fazer logout da aplicação</p>
                    </div>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start gap-3 h-auto py-4 hover:bg-destructive/10 transition-colors group border-destructive/50"
                      >
                        <div className="p-2 bg-destructive/10 rounded-lg group-hover:bg-destructive/20 transition-colors">
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-destructive">Deletar Conta</p>
                          <p className="text-xs text-muted-foreground">Remover permanentemente</p>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deletar conta permanentemente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Todos os seus dados serão
                          permanentemente removidos de nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Sim, deletar conta
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;
