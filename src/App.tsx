import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Planos from "./pages/Planos";
import Contato from "./pages/Contato";
import Politica from "./pages/Politica";
import Termos from "./pages/Termos";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import VoiceChat from "./pages/VoiceChat";
import Perfil from "./pages/Perfil";
import Metas from "./pages/Metas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/politica" element={<Politica />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/voz" element={<VoiceChat />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/metas" element={<Metas />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
