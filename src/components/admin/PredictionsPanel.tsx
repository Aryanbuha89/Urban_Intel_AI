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
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCityContext } from '@/contexts/CityContext';

const PredictionsPanel = () => {
  const { predictions } = useCityContext();

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
      <div className="flex items-center gap-3 mb-6">
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
        {/* Water Supply Prediction */}
        <motion.div variants={item}>
          <Card className={`h-full ${predictions.waterSupply.status === 'critical' || predictions.waterSupply.status === 'shortage' ? 'border-warning border-2' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <Droplets className="h-5 w-5 text-info" />
                  Water Supply Prediction
                </div>
                <Badge className={getStatusColor(predictions.waterSupply.status)}>
                  {predictions.waterSupply.status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Shortage Risk Level</span>
                  <span className="font-bold">{predictions.waterSupply.shortageLevel}%</span>
                </div>
                <Progress value={predictions.waterSupply.shortageLevel} className="h-3" />
              </div>
              {predictions.waterSupply.shortageDuration !== 'N/A' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-sm font-medium">Expected Duration</p>
                    <p className="text-lg font-bold text-warning">{predictions.waterSupply.shortageDuration}</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{predictions.waterSupply.reason}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.waterSupply.confidence}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Prediction */}
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

        {/* Food Price Prediction */}
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
                <p className="text-muted-foreground mt-2">{predictions.foodPrice.reason}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.foodPrice.confidence}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Energy Price Prediction */}
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
                  <p className="text-xs text-muted-foreground">Current Rate</p>
                  <p className="text-xl font-bold">₹{predictions.energyPrice.currentRate}/unit</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 text-center">
                  <p className="text-xs text-muted-foreground">Predicted Rate</p>
                  <p className="text-xl font-bold text-accent">₹{predictions.energyPrice.predictedRate}/unit</p>
                </div>
              </div>

              <div className="text-sm">
                <p><strong>Timeline:</strong> {predictions.energyPrice.timeline}</p>
                <p className="text-muted-foreground mt-2">{predictions.energyPrice.reason}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                Confidence: {predictions.energyPrice.confidence}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Public Services Prediction */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className={`${predictions.publicServices.cleanupNeeded ? 'border-primary border-2' : ''}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <Construction className="h-5 w-5 text-primary" />
                  Public Services Prediction
                </div>
                {predictions.publicServices.cleanupNeeded && (
                  <Badge className="bg-primary text-primary-foreground">
                    Cleanup Required
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-2">Road Maintenance Plan</p>
                  <p className="text-sm text-muted-foreground">{predictions.publicServices.roadMaintenancePlan}</p>
                  <p className="text-sm mt-2">
                    <strong>Timeline:</strong> {predictions.publicServices.maintenanceTimeline}
                  </p>
                </div>

                {predictions.publicServices.cleanupNeeded && (
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm font-medium text-primary mb-2">Storm/Flood Recovery</p>
                    <p className="text-sm text-muted-foreground">{predictions.publicServices.cleanupReason}</p>
                    <p className="text-sm mt-2">
                      <strong>Duration:</strong> {predictions.publicServices.cleanupDuration}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Planned Improvements</p>
                <div className="flex flex-wrap gap-2">
                  {predictions.publicServices.qualityImprovements.map((improvement) => (
                    <span 
                      key={improvement}
                      className="px-3 py-1 text-sm rounded-full bg-success/20 text-success"
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
      </div>
    </motion.div>
  );
};

export default PredictionsPanel;
