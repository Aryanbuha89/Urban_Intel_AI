import { motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrisisIndicatorProps {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const severityConfig = {
  low: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    label: 'Normal Operations'
  },
  medium: {
    icon: Info,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
    label: 'Advisory'
  },
  high: {
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    label: 'Warning'
  },
  critical: {
    icon: AlertOctagon,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    label: 'Critical'
  }
};

const crisisLabels: Record<string, string> = {
  POLLUTION_CRITICAL: 'Critical Air Pollution',
  WATER_SCARCITY: 'Water Supply Crisis',
  AIR_QUALITY_ALERT: 'Air Quality Warning',
  DROUGHT_WARNING: 'Agricultural Drought',
  NORMAL: 'All Systems Normal'
};

const CrisisIndicator = ({ type, severity }: CrisisIndicatorProps) => {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-4 rounded-2xl border-2 p-4',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className={cn('rounded-xl p-3', config.bgColor)}>
        {severity === 'critical' ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Icon className={cn('h-8 w-8', config.color)} />
          </motion.div>
        ) : (
          <Icon className={cn('h-8 w-8', config.color)} />
        )}
      </div>
      
      <div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
            config.bgColor,
            config.color
          )}>
            {config.label}
          </span>
        </div>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          {crisisLabels[type] || type.replace(/_/g, ' ')}
        </h2>
        <p className="text-sm text-muted-foreground">
          AI analysis complete • {new Date().toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};

export default CrisisIndicator;
