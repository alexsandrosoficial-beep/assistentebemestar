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
    <nav className="sticky top-0 z-50 w-full border-b glass-effect shadow-soft animate-fade-in-down">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent shadow-medium transition-all duration-300 group-hover:shadow-glow group-hover:scale-110" />
          <span className="text-xl font-bold gradient-text">Assistente</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link, index) => (
            <Link
              key={link.to}
              to={link.to}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 rounded-lg hover:bg-secondary/50 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-secondary/80 transition-all duration-300 hover:scale-110"
          >
            {isDark ? <Sun className="h-5 w-5 animate-glow-pulse" /> : <Moon className="h-5 w-5" />}
          </Button>

          {!loading && (
            user ? (
              <Link to="/perfil" className="hidden md:block">
                <Button variant="gradient" className="hover-scale shadow-medium">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Button>
              </Link>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button variant="gradient" className="hover-scale shadow-medium">Entrar</Button>
              </Link>
            )
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="hover:bg-secondary/80 transition-all duration-300">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="glass-effect">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg font-medium text-muted-foreground hover:text-primary transition-all duration-300 px-4 py-2 rounded-lg hover:bg-secondary/50 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {link.label}
                  </Link>
                ))}
                {!loading && (
                  user ? (
                    <Link to="/perfil" className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                      <Button variant="gradient" className="w-full hover-scale shadow-medium">
                        <User className="h-4 w-4 mr-2" />
                        Perfil
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth" className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                      <Button variant="gradient" className="w-full hover-scale shadow-medium">Entrar</Button>
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
