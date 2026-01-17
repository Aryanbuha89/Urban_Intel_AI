import { motion } from 'framer-motion';
import { Zap, TrendingDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PolicyOption } from '@/lib/mockData';

interface RecommendationCardProps {
  option: PolicyOption;
  index: number;
  onApprove: (option: PolicyOption) => void;
  isApproved?: boolean;
}

const priorityColors = {
  1: 'border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10',
  2: 'border-warning/30 bg-gradient-to-br from-warning/5 to-warning/10',
  3: 'border-info/30 bg-gradient-to-br from-info/5 to-info/10'
};

const priorityLabels = {
  1: { text: 'High Impact', color: 'bg-destructive/10 text-destructive' },
  2: { text: 'Balanced', color: 'bg-warning/10 text-warning' },
  3: { text: 'Low Risk', color: 'bg-info/10 text-info' }
};

const RecommendationCard = ({ option, index, onApprove, isApproved }: RecommendationCardProps) => {
  const priority = (option.id as 1 | 2 | 3) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300',
        isApproved 
          ? 'border-success/50 bg-success/5' 
          : priorityColors[priority]
      )}
    >
      {/* Option number badge */}
      <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-lg font-bold text-foreground/60">
        {option.id}
      </div>

      {/* Priority badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className={cn(
          'rounded-full px-3 py-1 text-xs font-semibold',
          priorityLabels[priority].color
        )}>
          {priorityLabels[priority].text}
        </span>
        {isApproved && (
          <span className="flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success">
            <Check className="h-3 w-3" />
            Published
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-bold text-foreground">{option.title}</h3>

      {/* Description */}
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
        {option.description}
      </p>

      {/* Impact prediction */}
      <div className="mb-6 flex items-center gap-2 rounded-lg bg-foreground/5 p-3">
        <TrendingDown className="h-5 w-5 text-accent" />
        <span className="text-sm font-medium text-foreground">{option.impact}</span>
      </div>

      {/* Approve button */}
      <Button
        onClick={() => onApprove(option)}
        disabled={isApproved}
        className={cn(
          'w-full gap-2 rounded-xl font-semibold transition-all',
          isApproved
            ? 'bg-success/20 text-success hover:bg-success/20'
            : 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl'
        )}
        size="lg"
      >
        {isApproved ? (
          <>
            <Check className="h-5 w-5" />
            Published
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            Approve & Publish
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default RecommendationCard;
