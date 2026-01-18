import { motion } from 'framer-motion';
import { Cloud, Bus, Droplets, Zap, Building2, Activity, Clock } from 'lucide-react';
import Header from '@/components/Header';
import MetricCard from '@/components/MetricCard';
import DirectiveBanner from '@/components/DirectiveBanner';
import DirectiveHistory from '@/components/DirectiveHistory';
import CityOverviewChart from '@/components/CityOverviewChart';
import FeedbackDialog from '@/components/FeedbackDialog';
import { useCityContext } from '@/contexts/CityContext';

const Index = () => {
  const { data, activeDirective, directiveHistory, decisionHistory } = useCityContext();

  const getStatusFromValue = (value: number, thresholds: { good: number; moderate: number; poor: number }) => {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.moderate) return 'moderate';
    if (value >= thresholds.poor) return 'poor';
    return 'critical';
  };

  // Get latest decision ID if available
  const currentDecisionId = decisionHistory.length > 0 ? decisionHistory[0].id : undefined;

  return (
    <div className="min-h-screen gradient-hero">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground"
          >
            <Activity className="h-4 w-4 animate-pulse text-accent" />
            Live City Intelligence
          </motion.div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Urban Intel AI
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Advanced city intelligence platform fueled by real-time government data injection.
            Urban Intel AI transforms raw data into actionable predictions.
          </p>

          {/* Quick stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Government Data Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" />
              <span>Updated: {new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </motion.section>

        {/* Live Data Grid */}
        <section className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 text-2xl font-bold text-foreground"
          >
            City Vitals
          </motion.h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Weather"
              value={data.weather.currentTemperature}
              unit="°C"
              icon={Cloud}
              status={data.weather.currentTemperature > 38 ? 'poor' : data.weather.currentTemperature > 32 ? 'moderate' : 'good'}
              gradient="air"
              description={`Humidity: ${data.weather.humidity}%, Wind: ${data.weather.windSpeed} km/h`}
            />

            <MetricCard
              title="Transportation"
              value={Math.round((data.transportation.busesOperating / data.transportation.totalBuses) * 100)}
              unit="%"
              icon={Bus}
              status={getStatusFromValue((data.transportation.busesOperating / data.transportation.totalBuses) * 100, { good: 80, moderate: 60, poor: 40 })}
              gradient="traffic"
              description={`${data.transportation.busesOperating} buses operating`}
            />

            <MetricCard
              title="Water Supply"
              value={data.publicServices.waterSupplyLevel}
              unit="%"
              icon={Droplets}
              status={getStatusFromValue(data.publicServices.waterSupplyLevel, { good: 70, moderate: 50, poor: 30 })}
              gradient="water"
              description="Reservoir capacity level"
            />

            <MetricCard
              title="Energy Grid"
              value={data.energy.gridStability}
              unit="%"
              icon={Zap}
              status={getStatusFromValue(data.energy.gridStability, { good: 90, moderate: 80, poor: 70 })}
              gradient="agriculture"
              description={`${data.energy.currentUsageMW} MW current usage`}
            />
          </div>
        </section>

        {/* City Overview Chart */}
        <section
          className={
            directiveHistory.length > 0 || activeDirective
              ? 'mb-12 grid gap-6 lg:grid-cols-2'
              : 'mb-12'
          }
        >
          <CityOverviewChart />
          {(directiveHistory.length > 0 || activeDirective) && <DirectiveHistory />}
        </section>

        {/* Official Directive Section */}
        <section className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 text-2xl font-bold text-foreground"
          >
            Official City Directive
          </motion.h2>

          <DirectiveBanner directive={activeDirective} />

          <div className="mt-4 flex justify-end">
            <FeedbackDialog directiveId={currentDecisionId} />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          <p>
            UrbanIntel • Smart City Intelligence Platform •
            <span className="ml-1 text-accent">Powered by AI</span>
          </p>
          <p className="mt-2">Data refreshes automatically every 60 seconds</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
