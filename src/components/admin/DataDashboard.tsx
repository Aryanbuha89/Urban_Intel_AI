import { motion } from 'framer-motion';
import { 
  Cloud, 
  Bus, 
  Wheat, 
  Zap, 
  Building2,
  Droplets,
  Wind,
  Thermometer,
  TrendingUp,
  TrendingDown,
  Gauge
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCityContext } from '@/contexts/CityContext';

const DataDashboard = () => {
  const { data } = useCityContext();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-3">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Government Data Portal</h2>
          <p className="text-sm text-muted-foreground">
            Injected city data • Last updated: {new Date(data.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Weather Section */}
        <motion.div variants={item}>
          <Card className="h-full border-l-4 border-l-info">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cloud className="h-5 w-5 text-info" />
                Weather Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="text-lg font-bold">{data.weather.currentTemperature}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-info" />
                  <div>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                    <p className="text-lg font-bold">{data.weather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wind</p>
                    <p className="text-lg font-bold">{data.weather.windSpeed} km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-info" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rainfall</p>
                    <p className="text-lg font-bold">{data.weather.currentRainfall} mm</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Annual Rainfall (12 months)</p>
                <div className="flex gap-1">
                  {data.weather.rainfallLast12Months.map((rain, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-info/20 rounded-t relative"
                      style={{ height: `${Math.min(40, rain / 10)}px` }}
                      title={`Month ${i + 1}: ${rain}mm`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total: {data.weather.rainfallLast12Months.reduce((a, b) => a + b, 0)}mm
                </p>
                {data.weather.recentStormOrFlood && (
                  <p className="text-xs text-warning mt-2">⚠️ Recent storm/flood detected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transportation Section */}
        <motion.div variants={item}>
          <Card className="h-full border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bus className="h-5 w-5 text-warning" />
                Transportation Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Bus Fleet Utilization</span>
                    <span className="font-medium">
                      {data.transportation.busesOperating}/{data.transportation.totalBuses}
                    </span>
                  </div>
                  <Progress 
                    value={(data.transportation.busesOperating / data.transportation.totalBuses) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Vehicles/Hour</p>
                    <p className="text-lg font-bold">{data.transportation.avgVehiclesPerHour.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Peak Multiplier</p>
                    <p className="text-lg font-bold">{data.transportation.peakHourMultiplier.toFixed(1)}x</p>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Congested Routes</p>
                <div className="flex flex-wrap gap-1">
                  {data.transportation.busRoutesCongested.length > 0 ? (
                    data.transportation.busRoutesCongested.map((route) => (
                      <span 
                        key={route}
                        className="px-2 py-1 text-xs rounded-full bg-warning/20 text-warning capitalize"
                      >
                        {route}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-success">All routes clear</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Agriculture Supply Chain */}
        <motion.div variants={item}>
          <Card className="h-full border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wheat className="h-5 w-5 text-success" />
                Agriculture Supply Chain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Crop Yield (Last Year)</span>
                  <div className="flex items-center gap-1">
                    {data.agriculture.cropYieldLastYear < 80 ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-success" />
                    )}
                    <span className="font-bold">{Math.round(data.agriculture.cropYieldLastYear)}%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Stock Level</span>
                    <span className="font-medium">{Math.round(data.agriculture.currentStockLevel)}%</span>
                  </div>
                  <Progress 
                    value={data.agriculture.currentStockLevel} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Supply Chain Efficiency</span>
                    <span className="font-medium">{Math.round(data.agriculture.supplyChainEfficiency)}%</span>
                  </div>
                  <Progress 
                    value={data.agriculture.supplyChainEfficiency} 
                    className="h-2"
                  />
                </div>
              </div>
              {data.agriculture.majorCropsAffected.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-destructive mb-2">⚠️ Affected Crops</p>
                  <div className="flex flex-wrap gap-1">
                    {data.agriculture.majorCropsAffected.map((crop) => (
                      <span 
                        key={crop}
                        className="px-2 py-1 text-xs rounded-full bg-destructive/20 text-destructive"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Energy Consumption */}
        <motion.div variants={item}>
          <Card className="h-full border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-accent" />
                Energy Consumption
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Current Usage</p>
                  <p className="text-lg font-bold">{data.energy.currentUsageMW} MW</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Year Avg</p>
                  <p className="text-lg font-bold">{data.energy.avgUsageLastYear} MW</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peak Demand</p>
                  <p className="text-lg font-bold">{data.energy.peakDemandMW} MW</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Renewable</p>
                  <p className="text-lg font-bold text-success">{data.energy.renewablePercentage}%</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Grid Stability</span>
                  <span className={`font-bold ${data.energy.gridStability > 90 ? 'text-success' : data.energy.gridStability > 80 ? 'text-warning' : 'text-destructive'}`}>
                    {data.energy.gridStability}%
                  </span>
                </div>
                <Progress value={data.energy.gridStability} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Public Services */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="h-full border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Public Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Gauge className="h-6 w-6 mx-auto text-warning mb-2" />
                  <p className="text-2xl font-bold">{data.publicServices.roadsNeedingRepair}</p>
                  <p className="text-xs text-muted-foreground">Roads Needing Repair</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Droplets className="h-6 w-6 mx-auto text-info mb-2" />
                  <p className="text-2xl font-bold">{data.publicServices.waterSupplyLevel}%</p>
                  <p className="text-xs text-muted-foreground">Water Supply</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Building2 className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{data.publicServices.sewerSystemHealth}%</p>
                  <p className="text-xs text-muted-foreground">Sewer Health</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <Zap className="h-6 w-6 mx-auto text-destructive mb-2" />
                  <p className="text-2xl font-bold">{data.publicServices.emergencyResponseTime} min</p>
                  <p className="text-xs text-muted-foreground">Emergency Response</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <TrendingUp className="h-6 w-6 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{data.publicServices.pendingMaintenanceTasks}</p>
                  <p className="text-xs text-muted-foreground">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DataDashboard;
