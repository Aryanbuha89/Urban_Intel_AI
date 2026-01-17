import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  status: 'good' | 'moderate' | 'poor' | 'critical';
  gradient: 'traffic' | 'air' | 'water' | 'agriculture';
  description?: string;
}

const statusColors = {
  good: 'text-success',
  moderate: 'text-warning',
  poor: 'text-warning',
  critical: 'text-destructive'
};

const statusBadgeColors = {
  good: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  poor: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20'
};

const gradientClasses = {
  traffic: 'gradient-traffic',
  air: 'gradient-air',
  water: 'gradient-water',
  agriculture: 'gradient-agriculture'
};

const MetricCard = ({ title, value, unit, icon: Icon, status, gradient, description }: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 card-shadow transition-all duration-300 hover:card-shadow-hover',
        gradientClasses[gradient]
      )}
    >
      {/* Decorative background circle */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-foreground/5" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-xl bg-card/80 p-3 backdrop-blur-sm card-shadow">
            <Icon className={cn('h-6 w-6', statusColors[status])} />
          </div>
          <span className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium capitalize',
            statusBadgeColors[status]
          )}>
            {status}
          </span>
        </div>

        {/* Value */}
        <div className="mb-2">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            {value}
          </span>
          <span className="ml-1 text-lg text-muted-foreground">{unit}</span>
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}

        {/* Progress indicator */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(value, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              status === 'good' && 'bg-success',
              status === 'moderate' && 'bg-warning',
              status === 'poor' && 'bg-warning',
              status === 'critical' && 'bg-destructive'
            )}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
