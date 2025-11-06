import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
              <span className="text-xl font-bold">Assistente</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seu assistente de saúde e bem-estar, disponível 24/7.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
              </li>
              <li>
                <Link to="/planos" className="hover:text-primary transition-colors">Planos</Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-primary transition-colors">Contato</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/politica" className="hover:text-primary transition-colors">Política de Privacidade</Link>
              </li>
              <li>
                <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+55 (35) 99716-8761</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="break-all">suporte.empresarialvip@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Assistente. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs">
            Este assistente não substitui médicos ou profissionais especializados.
          </p>
        </div>
      </div>
    </footer>
  );
};
