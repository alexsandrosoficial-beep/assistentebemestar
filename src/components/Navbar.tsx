import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, Moon, Sun, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";

export const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const { user, loading } = useAuth();
  const { isPremium } = useSubscription();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const baseNavLinks = [
    { to: "/", label: "Início" },
    { to: "/planos", label: "Planos" },
    { to: "/chat", label: "Chat IA" },
    { to: "/contato", label: "Contato" },
  ];

  const navLinks = isPremium 
    ? [...baseNavLinks.slice(0, 3), { to: "/metas", label: "Metas" }, ...baseNavLinks.slice(3)]
    : baseNavLinks;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
          <span className="text-xl font-bold">Assistente</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {!loading && (
            user ? (
              <Link to="/perfil" className="hidden md:block">
                <Button variant="gradient">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Button>
              </Link>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button variant="gradient">Entrar</Button>
              </Link>
            )
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {!loading && (
                  user ? (
                    <Link to="/perfil">
                      <Button variant="gradient" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        Perfil
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth">
                      <Button variant="gradient" className="w-full">Entrar</Button>
                    </Link>
                  )
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
