import { motion } from 'framer-motion';
import {
  Droplets,
  Car,
  ShoppingBasket,
  Zap,
  Construction,
  Activity,
  LucideIcon,
} from 'lucide-react';
import { useCityContext } from '@/contexts/CityContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type SystemLevel = 'low' | 'medium' | 'high' | 'critical';

type OverviewItem = {
  key: string;
  title: string;
  icon: LucideIcon;
  level: SystemLevel;
  valueLabel: string;
  mainLine: string;
  detailLine: string;
  gaugeValue: number;
};

const CityOverviewChart = () => {
  const { data: cityData, predictions } = useCityContext();

  const getSimpleStatusColor = (level: SystemLevel) => {
    if (level === 'low') return 'bg-success text-success-foreground';
    if (level === 'medium') return 'bg-warning text-warning-foreground';
    if (level === 'high') return 'bg-destructive/80 text-destructive-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const getTrafficLevel = () => {
    if (predictions.traffic.congestionLevel >= 80) return 'high';
    if (predictions.traffic.congestionLevel >= 50) return 'medium';
    return 'low';
  };

  const getHealthLevel = () => {
    if (predictions.health.status === 'hazardous') return 'critical';
    if (predictions.health.status === 'unhealthy') return 'high';
    if (predictions.health.status === 'moderate') return 'medium';
    return 'low';
  };

  const getWaterLevel = () => {
    if (predictions.waterSupply.status === 'critical') return 'critical';
    if (predictions.waterSupply.status === 'shortage') return 'high';
    if (predictions.waterSupply.status === 'normal') return 'medium';
    return 'low';
  };

  const getFoodLevel = () => {
    if (predictions.foodPrice.priceChangePercent > 20) return 'high';
    if (predictions.foodPrice.priceChangePercent > 5) return 'medium';
    return 'low';
  };

  const getEnergyLevel = () => {
    if (predictions.energyPrice.priceChangePercent > 15) return 'high';
    if (predictions.energyPrice.priceChangePercent > 5) return 'medium';
    return 'low';
  };

  const getPublicServiceLevel = (): SystemLevel => {
    if (predictions.publicServices.cleanupNeeded) return 'medium';
    if (cityData.publicServices.roadsNeedingRepair > 30) return 'high';
    return 'low';
  };

  const overviewItems: OverviewItem[] = [
    {
      key: 'traffic',
      title: 'Traffic',
      icon: Car,
      level: getTrafficLevel(),
      valueLabel: `${predictions.traffic.congestionLevel}% congestion`,
      mainLine:
        predictions.traffic.congestionLevel >= 80
          ? 'Heavy traffic across key routes.'
          : predictions.traffic.congestionLevel >= 50
          ? 'Busy roads, plan extra travel time.'
          : 'Traffic is flowing normally.',
      detailLine:
        predictions.traffic.roadsToAvoid.length > 0
          ? `Avoid: ${predictions.traffic.roadsToAvoid.join(', ')}.`
          : `Peak hours: ${predictions.traffic.peakHours}.`,
      gaugeValue: predictions.traffic.congestionLevel,
    },
    {
      key: 'health',
      title: 'Air & Health',
      icon: Activity,
      level: getHealthLevel(),
      valueLabel: `AQI ${predictions.health.aqi}`,
      mainLine: predictions.health.healthRisk,
      detailLine:
        predictions.health.recommendations.maskMandate ||
        predictions.health.recommendations.schoolHoliday ||
        predictions.health.recommendations.oddEvenScheme
          ? [
              predictions.health.recommendations.maskMandate ? 'Masks advised' : null,
              predictions.health.recommendations.schoolHoliday ? 'School changes' : null,
              predictions.health.recommendations.oddEvenScheme ? 'Vehicle limits' : null,
            ]
              .filter(Boolean)
              .join(' • ')
          : 'Normal outdoor activity is safe for most people.',
      gaugeValue: Math.min(predictions.health.aqi, 300) / 3,
    },
    {
      key: 'food',
      title: 'Food & Essentials',
      icon: ShoppingBasket,
      level: getFoodLevel(),
      valueLabel:
        predictions.foodPrice.priceChangePercent > 0
          ? `Prices +${predictions.foodPrice.priceChangePercent}%`
          : 'Prices stable',
      mainLine: predictions.foodPrice.supplyStatus,
      detailLine:
        predictions.foodPrice.affectedItems.length > 0
          ? `Watch items: ${predictions.foodPrice.affectedItems.slice(0, 3).join(', ')}.`
          : 'No major items under pressure today.',
      gaugeValue: Math.min(
        Math.max(predictions.foodPrice.priceChangePercent + 20, 0),
        100,
      ),
    },
    {
      key: 'energy',
      title: 'Energy Grid',
      icon: Zap,
      level: getEnergyLevel(),
      valueLabel:
        predictions.energyPrice.priceChangePercent > 0
          ? `Tariff may rise ${predictions.energyPrice.priceChangePercent}%`
          : 'Tariff stable',
      mainLine: `Current usage: ${cityData.energy.currentUsageMW} MW.`,
      detailLine: `Predicted rate: ₹${predictions.energyPrice.predictedRate} per unit.`,
      gaugeValue: Math.min(
        Math.max(predictions.energyPrice.priceChangePercent + 20, 0),
        100,
      ),
    },
    {
      key: 'publicServices',
      title: 'Public Services',
      icon: Construction,
      level: getPublicServiceLevel(),
      valueLabel: predictions.publicServices.cleanupNeeded
        ? 'Cleanup and repair active'
        : 'Regular maintenance running',
      mainLine: predictions.publicServices.roadMaintenancePlan,
      detailLine:
        predictions.publicServices.qualityImprovements.slice(0, 2).join(' • ') ||
        'No major works announced.',
      gaugeValue: predictions.publicServices.cleanupNeeded ? 70 : 40,
    },
    {
      key: 'water',
      title: 'Water Supply',
      icon: Droplets,
      level: getWaterLevel(),
      valueLabel: `${cityData.publicServices.waterSupplyLevel}% reservoir level`,
      mainLine: predictions.waterSupply.reason,
      detailLine:
        predictions.waterSupply.status === 'critical' ||
        predictions.waterSupply.status === 'shortage'
          ? `Shortage risk: ${predictions.waterSupply.shortageLevel}% for ${predictions.waterSupply.shortageDuration}.`
          : 'Supply is comfortable for daily use.',
      gaugeValue: cityData.publicServices.waterSupplyLevel,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border bg-card p-6 card-shadow"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">City Systems Overview</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Simple status view of the most important services for citizens today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {overviewItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="border-border/70 bg-muted/40">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
                  </div>
                  <Badge className={`${getSimpleStatusColor(item.level)} text-xs`}>
                    {item.level === 'low'
                      ? 'Normal'
                      : item.level === 'medium'
                      ? 'Caution'
                      : item.level === 'high'
                      ? 'Alert'
                      : 'Critical'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.valueLabel}</span>
                </div>
                <Progress value={item.gaugeValue} className="h-1.5" />
                <p className="text-sm text-muted-foreground line-clamp-2">{item.mainLine}</p>
                <p className="text-sm font-medium text-foreground line-clamp-2">
                  {item.detailLine}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CityOverviewChart;
