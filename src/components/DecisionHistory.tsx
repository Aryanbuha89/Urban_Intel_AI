import { motion } from 'framer-motion';
import { History, CheckCircle, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PolicyDecision } from '@/lib/mockData';

interface DecisionHistoryProps {
  decisions: PolicyDecision[];
}

const alertLabels: Record<string, string> = {
  POLLUTION_CRITICAL: 'Pollution Crisis',
  WATER_SCARCITY: 'Water Scarcity',
  AIR_QUALITY_ALERT: 'Air Quality Alert',
  DROUGHT_WARNING: 'Drought Warning',
  NORMAL: 'Routine Check'
};

const DecisionHistory = ({ decisions }: DecisionHistoryProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6 card-shadow"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Decision History</h3>
          <p className="text-sm text-muted-foreground">Past policy actions and approvals</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Alert Type</TableHead>
              <TableHead className="font-semibold">Approved By</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {decisions.slice(0, 5).map((decision, index) => (
              <motion.tr
                key={decision.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border last:border-0"
              >
                <TableCell className="font-medium">
                  {alertLabels[decision.alertType] || decision.alertType}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {decision.approvedBy}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                    {decision.status === 'PUBLISHED' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {decision.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {decision.publishedAt
                    ? new Date(decision.publishedAt).toLocaleDateString()
                    : '-'
                  }
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default DecisionHistory;
