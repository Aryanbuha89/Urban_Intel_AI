import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogOut, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useCityContext } from '@/contexts/CityContext';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();
  const { isLoggedIn, logout, refreshData, userProfile } = useCityContext();
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
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-primary/20 transition-all duration-300 group-hover:shadow-primary/40">
            <img
              src="/city2.png"
              alt="Urban Intel AI logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Urban Intel AI</h1>
            <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">Advanced City OS</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            className="gap-2 rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-primary shadow-md transition-all duration-300 hover:border-primary hover:from-primary/20 hover:to-accent/20 hover:shadow-lg hover:scale-105"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Refresh Data</span>
          </Button>

          {isLoggedIn && isAdmin ? (
            <>
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-info/10 px-4 py-2 text-accent shadow-md transition-all duration-300 hover:border-accent hover:from-accent/20 hover:to-info/20 hover:shadow-lg hover:scale-105"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline font-semibold">Public View</span>
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 border border-border/50">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Admin</span>
                  <span className="text-xs font-semibold text-foreground leading-none">
                    {userProfile?.username || 'Authorized'}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2 rounded-lg border-2 border-destructive/30 bg-gradient-to-r from-destructive/10 to-red-500/10 px-4 py-2 text-destructive shadow-md transition-all duration-300 hover:border-destructive hover:from-destructive/20 hover:to-red-500/20 hover:shadow-lg hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">Logout</span>
              </Button>
            </>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg transition-all hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Open admin portal"
                >
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-80 p-0 border-border">
                <div className="rounded-2xl bg-card p-4">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mb-4 text-center">
                    <h2 className="text-base font-semibold text-foreground">Admin Portal</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Continue in public view or sign in as admin.
                    </p>
                  </div>
                  <div className="space-y-5">
                    <Link to="/">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center rounded-xl border-2 border-accent/40 bg-gradient-to-r from-accent/5 to-info/5 text-accent shadow-sm hover:border-accent hover:from-accent/10 hover:to-info/10"
                      >
                        Public View
                      </Button>
                    </Link>
                    <Link to="/admin" className="block">
                      <Button
                        size="sm"
                        className="w-full justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      >
                        Sign in as admin
                      </Button>
                    </Link>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
