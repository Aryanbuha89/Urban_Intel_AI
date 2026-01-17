import { motion, AnimatePresence } from 'framer-motion';
import { History, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCityContext } from '@/contexts/CityContext';
import { cn } from '@/lib/utils';

const DirectiveHistory = () => {
  const { directiveHistory, activeDirective } = useCityContext();

  if (directiveHistory.length === 0 && !activeDirective) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6 card-shadow"
    >
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Directive History</h3>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {activeDirective && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative rounded-xl border-2 border-warning/30 bg-warning/5 p-4"
            >
              <div className="absolute -left-1 top-4 h-2 w-2 rounded-full bg-warning animate-pulse" />
              <div className="ml-3">
                <div className="mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-xs font-semibold uppercase text-warning">Active Now</span>
                </div>
                <p className="text-sm text-foreground">{activeDirective}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date().toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}

          {directiveHistory.map((directive, index) => (
            <motion.div
              key={directive.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative rounded-xl border p-4',
                directive.isActive 
                  ? 'border-success/30 bg-success/5' 
                  : 'border-border bg-muted/30'
              )}
            >
              <div className={cn(
                'absolute -left-1 top-4 h-2 w-2 rounded-full',
                directive.isActive ? 'bg-success' : 'bg-muted-foreground'
              )} />
              <div className="ml-3">
                <div className="mb-1 flex items-center gap-2">
                  {directive.isActive ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <History className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={cn(
                    'text-xs font-semibold uppercase',
                    directive.isActive ? 'text-success' : 'text-muted-foreground'
                  )}>
                    {directive.isActive ? 'Completed' : 'Past Directive'}
                  </span>
                </div>
                <p className="text-sm text-foreground">{directive.text}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(directive.timestamp).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DirectiveHistory;
