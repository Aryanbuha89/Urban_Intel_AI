import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Bell, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DirectiveBannerProps {
  directive: string | null;
  className?: string;
}

const DirectiveBanner = ({ directive, className }: DirectiveBannerProps) => {
  const isNormal = !directive || directive.includes('Normal') || directive.includes('✅');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={directive || 'normal'}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4 }}
        className={cn('relative overflow-hidden', className)}
      >
        <div className={cn(
          'relative rounded-2xl border-2 p-8',
          isNormal 
            ? 'border-success/30 bg-gradient-to-br from-secondary via-secondary/80 to-success/10' 
            : 'border-warning/30 bg-gradient-to-br from-warning/10 via-warning/5 to-destructive/5'
        )}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)`,
              backgroundSize: '10px 10px'
            }} />
          </div>

          {/* Animated pulse for alerts */}
          {!isNormal && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-warning/0 via-warning/10 to-warning/0"
            />
          )}

          <div className="relative z-10 flex items-start gap-6">
            {/* Icon */}
            <div className={cn(
              'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl',
              isNormal ? 'bg-success/20' : 'bg-warning/20'
            )}>
              {isNormal ? (
                <CheckCircle className="h-8 w-8 text-success" />
              ) : (
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <AlertTriangle className="h-8 w-8 text-warning" />
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Megaphone className={cn(
                  'h-4 w-4',
                  isNormal ? 'text-success' : 'text-warning'
                )} />
                <span className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  isNormal ? 'text-success' : 'text-warning'
                )}>
                  Official City Directive
                </span>
              </div>
              
              <p className={cn(
                'text-xl font-semibold leading-relaxed',
                isNormal ? 'text-secondary-foreground' : 'text-foreground'
              )}>
                {directive || '✅ All Systems Normal: City operations running smoothly. Thank you for your cooperation.'}
              </p>

              {!isNormal && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Bell className="h-4 w-4" />
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DirectiveBanner;
