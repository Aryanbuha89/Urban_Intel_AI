import { motion } from 'framer-motion';
import {
  Droplets,
  Car,
  ShoppingBasket,
  Zap,
  Construction,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Brain,
  Activity,
  Ban,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCityContext } from '@/contexts/CityContext';

const PredictionsPanel = () => {
  const { predictions, backendMode, backendOutputs } = useCityContext();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'shortage': return 'bg-warning text-warning-foreground';
      case 'normal': return 'bg-success text-success-foreground';
      case 'abundant': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 p-3">
            <Brain className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Predictions</h2>
            <p className="text-sm text-muted-foreground">
              Cascading analysis based on injected government data
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs">
          <Badge
            variant={backendMode === 'backend' ? 'default' : 'outline'}
            className={backendMode === 'backend' ? 'bg-success text-success-foreground' : ''}
          >
            {backendMode === 'backend' ? 'Model backend active' : 'Mock rules only'}
          </Badge>
          {backendMode === 'backend' && backendOutputs && (
            <span className="text-[10px] text-muted-foreground">
              W:{Math.round(backendOutputs.waterShortageLevel)} T:{Math.round(backendOutputs.trafficCongestionLevel)} F:{Math.round(backendOutputs.foodPriceChangePercent)} E:{Math.round(backendOutputs.energyPriceChangePercent)} P:{backendOutputs.publicCleanupNeeded ? '1' : '0'} H:{backendOutputs.healthStatus}
            </span>
          )}
        </div>
      </div>

      {/* Data Flow Indicator */}
      <motion.div
        variants={item}
        className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3"
      >
        <span className="px-2 py-1 rounded bg-info/20 text-info">Weather</span>
        <span>→</span>
        <span className="px-2 py-1 rounded bg-warning/20 text-warning">Water & Traffic</span>
        <span>→</span>
        <span className="px-2 py-1 rounded bg-success/20 text-success">Food & Energy</span>
        <span>→</span>
        <span className="px-2 py-1 rounded bg-primary/20 text-primary">Public Services</span>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Row 1: Traffic Prediction */}
        <motion.div variants={item}>
          <Card className={`h-full ${predictions.traffic.congestionLevel > 70 ? 'border-warning border-2' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5 text-warning" />
                  Traffic Prediction
                </div>
                <Badge variant={predictions.traffic.congestionLevel > 70 ? 'destructive' : predictions.traffic.congestionLevel > 50 ? 'secondary' : 'outline'}>
                  {predictions.traffic.congestionLevel}% Congestion
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={predictions.traffic.congestionLevel} className="h-3" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Peak Hours</p>
                  <p className="font-medium">{predictions.traffic.peakHours}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Affected Areas</p>
                  <p className="font-medium">{predictions.traffic.affectedAreas.join(', ') || 'None'}</p>
                </div>
              </div>

              {predictions.traffic.roadsToAvoid.length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10">
                  <p className="text-sm font-medium text-destructive flex items-center gap-1 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Roads to Avoid
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {predictions.traffic.roadsToAvoid.map((road) => (
                      <span key={road} className="px-2 py-1 text-xs rounded bg-destructive/20 text-destructive">
                        {road}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Weather Impact:</strong> {predictions.traffic.weatherImpact}</p>
                <p><strong>Bus Impact:</strong> {predictions.traffic.busImpact}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.traffic.confidence}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Row 1: Health Prediction */}
        <motion.div variants={item}>
          <Card className={`h-full ${predictions.health.status === 'hazardous' ? 'border-destructive border-2' : predictions.health.status === 'unhealthy' ? 'border-warning border-2' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-destructive" />
                  Health & Safety Prediction
                </div>
                <Badge className={
                  predictions.health.status === 'hazardous' ? 'bg-destructive text-destructive-foreground' :
                    predictions.health.status === 'unhealthy' ? 'bg-warning text-warning-foreground' :
                      predictions.health.status === 'moderate' ? 'bg-secondary text-secondary-foreground' :
                        'bg-success text-success-foreground'
                }>
                  AQI: {predictions.health.aqi}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Risk Assessment</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{predictions.health.healthRisk}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Mandates</p>
                <div className="flex flex-wrap gap-2">
                  {predictions.health.recommendations.schoolHoliday && (
                    <Badge variant="destructive" className="flex gap-1 items-center px-2 py-0.5 text-[10px]">
                      <Ban className="h-3 w-3" /> Schools Closed
                    </Badge>
                  )}
                  {predictions.health.recommendations.oddEvenScheme && (
                    <Badge variant="destructive" className="flex gap-1 items-center px-2 py-0.5 text-[10px]">
                      <Car className="h-3 w-3" /> Odd-Even
                    </Badge>
                  )}
                  {predictions.health.recommendations.maskMandate && (
                    <Badge className="bg-warning text-warning-foreground flex gap-1 items-center px-2 py-0.5 text-[10px]">
                      <ShieldAlert className="h-3 w-3" /> Masks
                    </Badge>
                  )}
                  {!predictions.health.recommendations.schoolHoliday && !predictions.health.recommendations.oddEvenScheme && !predictions.health.recommendations.maskMandate && (
                    <Badge variant="outline" className="text-muted-foreground px-2 py-0.5 text-[10px]">Normal</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.health?.confidence || 85}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Row 2: Food Price Prediction */}
        <motion.div variants={item}>
          <Card className={`h-full ${predictions.foodPrice.priceChangePercent > 15 ? 'border-destructive border-2' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <ShoppingBasket className="h-5 w-5 text-success" />
                  Food Price Prediction
                </div>
                {predictions.foodPrice.priceChangePercent > 0 ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{predictions.foodPrice.priceChangePercent}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    Stable
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Supply Status</p>
                <p className="font-medium">{predictions.foodPrice.supplyStatus}</p>
              </div>

              {predictions.foodPrice.affectedItems.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Affected Items</p>
                  <div className="flex flex-wrap gap-1">
                    {predictions.foodPrice.affectedItems.map((item) => (
                      <span key={item} className="px-2 py-1 text-xs rounded-full bg-warning/20 text-warning">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm">
                <p><strong>Timeline:</strong> {predictions.foodPrice.timeline}</p>
                <p className="text-muted-foreground mt-2 line-clamp-1">{predictions.foodPrice.reason}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.foodPrice.confidence}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Row 2: Energy Price Prediction */}
        <motion.div variants={item}>
          <Card className={`h-full ${predictions.energyPrice.priceChangePercent > 10 ? 'border-accent border-2' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-accent" />
                  Energy Price Prediction
                </div>
                {predictions.energyPrice.priceChangePercent > 0 ? (
                  <Badge className="bg-accent text-accent-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{predictions.energyPrice.priceChangePercent}%
                  </Badge>
                ) : (
                  <Badge variant="outline">Stable</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-xl font-bold">₹{predictions.energyPrice.currentRate}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 text-center">
                  <p className="text-xs text-muted-foreground">Predicted</p>
                  <p className="text-xl font-bold text-accent">₹{predictions.energyPrice.predictedRate}</p>
                </div>
              </div>

              <div className="text-sm">
                <p><strong>Timeline:</strong> {predictions.energyPrice.timeline}</p>
                <p className="text-muted-foreground mt-2 line-clamp-1">{predictions.energyPrice.reason}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.energyPrice.confidence}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Row 3: Public Services Prediction */}
        <motion.div variants={item}>
          <Card className={`h-full ${predictions.publicServices.cleanupNeeded ? 'border-primary border-2' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <Construction className="h-5 w-5 text-primary" />
                  Public Services
                </div>
                {predictions.publicServices.cleanupNeeded && (
                  <Badge className="bg-primary text-primary-foreground">
                    Cleanup
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Maintenance Plan</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{predictions.publicServices.roadMaintenancePlan}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2"> improvements</p>
                <div className="flex flex-wrap gap-2">
                  {predictions.publicServices.qualityImprovements.slice(0, 3).map((improvement) => (
                    <span
                      key={improvement}
                      className="px-2 py-1 text-xs rounded-full bg-success/20 text-success"
                    >
                      {improvement}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.publicServices.confidence}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Row 3: Water Supply Prediction */}
        <motion.div variants={item}>
          <Card className={`h-full ${predictions.waterSupply.status === 'critical' || predictions.waterSupply.status === 'shortage' ? 'border-warning border-2' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <Droplets className="h-5 w-5 text-info" />
                  Water Supply
                </div>
                <Badge className={getStatusColor(predictions.waterSupply.status)}>
                  {predictions.waterSupply.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Shortage Risk</span>
                  <span className="font-bold">{predictions.waterSupply.shortageLevel}%</span>
                </div>
                <Progress value={predictions.waterSupply.shortageLevel} className="h-3" />
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground line-clamp-2">{predictions.waterSupply.reason}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.waterSupply.confidence}%
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div >
    </motion.div >
  );
};

export default PredictionsPanel;
