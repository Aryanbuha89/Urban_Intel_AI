import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Shield, LogOut, RefreshCw, LayoutDashboard, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCityContext } from '@/contexts/CityContext';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();
  const { isLoggedIn, logout, refreshData } = useCityContext();
  const isAdmin = location.pathname === '/admin';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
            <Building2 className="h-5 w-5 text-white absolute" />
            <Activity className="h-3 w-3 text-white absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Urban Intel AI</h1>
            <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">Advanced City OS</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh Data</span>
          </Button>

          {isLoggedIn && isAdmin ? (
            <>
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Public View</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Link to="/admin">
              <Button
                size="sm"
                className={cn(
                  'gap-2 rounded-xl shadow-lg transition-all hover:shadow-xl',
                  isAdmin
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Portal</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
