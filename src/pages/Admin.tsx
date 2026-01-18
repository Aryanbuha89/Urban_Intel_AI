import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { AlertTriangle, Brain, Shield, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';
import CrisisIndicator from '@/components/CrisisIndicator';
import DecisionHistory from '@/components/DecisionHistory';
import RecommendationCard from '@/components/RecommendationCard';
import DataDashboard from '@/components/admin/DataDashboard';
import PredictionsPanel from '@/components/admin/PredictionsPanel';
import ReportGenerator from '@/components/admin/ReportGenerator';
import { useCityContext } from '@/contexts/CityContext';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PolicyOption, AllPredictions } from '@/lib/mockData';

const getCategoryFromText = (text: string): string => {
  const lower = text.toLowerCase();
  if (lower.includes('health')) return 'Public Health';
  if (lower.includes('cleanup') || lower.includes('waste') || lower.includes('sanitation')) return 'Public Services';
  if (lower.includes('traffic') || lower.includes('transport') || lower.includes('mobility')) return 'Traffic';
  if (lower.includes('energy') || lower.includes('electric') || lower.includes('power')) return 'Energy';
  if (lower.includes('water')) return 'Water Supply';
  if (lower.includes('food') || lower.includes('price')) return 'Food Prices';
  return 'General';
};

const parseLlmTextToOptions = (text: string, predictions: AllPredictions): PolicyOption[] => {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const items: string[] = [];
  let current = '';
  for (const line of lines) {
    const isBullet = /^\d+\./.test(line) || /^[-•]/.test(line);
    if (isBullet) {
      if (current) {
        items.push(current.trim());
      }
      current = line;
    } else {
      current = current ? `${current} ${line}` : line;
    }
  }
  if (current) {
    items.push(current.trim());
  }

  const filteredItems = items
    .map(item => item.trim())
    .filter(item => {
      const lower = item.toLowerCase();
      if (lower.startsWith('example:')) return false;
      if (lower.includes('bullet') || lower.includes('bullets')) return false;
      if (lower.includes('line') && lower.includes('long')) return false;
      if (/^[-•]\s*water shortage risk level/i.test(lower)) return false;
      if (/^[-•]\s*traffic congestion level/i.test(lower)) return false;
      if (/^[-•]\s*food price change percent/i.test(lower)) return false;
      if (/^[-•]\s*energy price change percent/i.test(lower)) return false;
      if (/^[-•]\s*public cleanup needed probability/i.test(lower)) return false;
      if (/^[-•]\s*health status index/i.test(lower)) return false;
      return true;
    });

  const source = filteredItems.length > 0 ? filteredItems : (items.length > 0 ? items : [text]);
  return source.slice(0, 3).map((raw, index) => {
    const clean = raw.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim();
    const firstSentenceEnd = clean.indexOf('.');
    const titleSource = firstSentenceEnd > 0 ? clean.slice(0, firstSentenceEnd) : clean;
    const titleWords = titleSource.split(/\s+/).slice(0, 8);
    const title = titleWords
      .map(word => (word.length > 1 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toUpperCase()))
      .join(' ');
    const category = getCategoryFromText(clean);
    let impactDetail = `Priority action for ${category}`;
    if (category === 'Water Supply' && predictions?.waterSupply) {
      impactDetail = `Water shortage level: ${predictions.waterSupply.shortageLevel}% (status: ${predictions.waterSupply.status})`;
    } else if (category === 'Traffic' && predictions?.traffic) {
      impactDetail = `Traffic congestion level: ${predictions.traffic.congestionLevel}% (confidence: ${predictions.traffic.confidence}%)`;
    } else if (category === 'Food Prices' && predictions?.foodPrice) {
      impactDetail = `Food price change: ${predictions.foodPrice.priceChangePercent}% (confidence: ${predictions.foodPrice.confidence}%)`;
    } else if (category === 'Energy' && predictions?.energyPrice) {
      impactDetail = `Energy price change: ${predictions.energyPrice.priceChangePercent}% (rate: ₹${predictions.energyPrice.currentRate}→₹${predictions.energyPrice.predictedRate})`;
    } else if (category === 'Public Services' && predictions?.publicServices) {
      impactDetail = `Cleanup needed: ${predictions.publicServices.cleanupNeeded ? 'Yes' : 'No'} (confidence: ${predictions.publicServices.confidence}%)`;
    } else if (category === 'Public Health' && predictions?.health) {
      impactDetail = `Health status: ${predictions.health.status.toUpperCase()} (AQI: ${predictions.health.aqi}, confidence: ${predictions.health.confidence}%)`;
    }
    const option: PolicyOption = {
      id: index + 1,
      title,
      description: clean,
      impact: impactDetail,
      instructionText: clean,
      category,
      basedOn: ['LLM policy advisor', 'Latest model outputs'],
    };
    return option;
  });
};

const Admin = () => {
  const {
    data,
    predictions,
    isLoggedIn,
    currentCrisis,
    decisionHistory,
    userProfile,
    approveRecommendation,
  } = useCityContext();

  const [approvedOptionId, setApprovedOptionId] = useState<number | null>(null);
  const [whatIfRainfallTotal, setWhatIfRainfallTotal] = useState<number>(() =>
    data.weather.rainfallLast12Months.reduce((sum, value) => sum + value, 0)
  );
  const [whatIfForm, setWhatIfForm] = useState(() => ({
    weather: {
      currentTemperature: data.weather.currentTemperature,
      humidity: data.weather.humidity,
      windSpeed: data.weather.windSpeed,
      currentRainfall: data.weather.currentRainfall,
      recentStormOrFlood: data.weather.recentStormOrFlood,
      aqi: data.weather.aqi,
    },
    transportation: {
      busesOperating: data.transportation.busesOperating,
      totalBuses: data.transportation.totalBuses,
      avgVehiclesPerHour: data.transportation.avgVehiclesPerHour,
      peakHourMultiplier: data.transportation.peakHourMultiplier,
      congestedWest: data.transportation.busRoutesCongested.includes('west'),
      congestedSouth: data.transportation.busRoutesCongested.includes('south'),
      congestedEast: data.transportation.busRoutesCongested.includes('east'),
      congestedNorth: data.transportation.busRoutesCongested.includes('north'),
      congestedCentral: data.transportation.busRoutesCongested.includes('central'),
    },
    agriculture: {
      cropYieldLastYear: data.agriculture.cropYieldLastYear,
      currentStockLevel: data.agriculture.currentStockLevel,
      supplyChainEfficiency: data.agriculture.supplyChainEfficiency,
      importDependency: data.agriculture.importDependency,
    },
    energy: {
      currentUsageMW: data.energy.currentUsageMW,
      avgUsageLastYear: data.energy.avgUsageLastYear,
      peakDemandMW: data.energy.peakDemandMW,
      gridStability: data.energy.gridStability,
      renewablePercentage: data.energy.renewablePercentage,
    },
    publicServices: {
      roadsNeedingRepair: data.publicServices.roadsNeedingRepair,
      waterSupplyLevel: data.publicServices.waterSupplyLevel,
      sewerSystemHealth: data.publicServices.sewerSystemHealth,
      emergencyResponseTime: data.publicServices.emergencyResponseTime,
      pendingMaintenanceTasks: data.publicServices.pendingMaintenanceTasks,
    },
  }));
  const [whatIfLoadingAll, setWhatIfLoadingAll] = useState(false);
  const [whatIfLoadingWater, setWhatIfLoadingWater] = useState(false);
  const [whatIfLoadingTraffic, setWhatIfLoadingTraffic] = useState(false);
  const [whatIfLoadingFood, setWhatIfLoadingFood] = useState(false);
  const [whatIfLoadingEnergy, setWhatIfLoadingEnergy] = useState(false);
  const [whatIfLoadingHealth, setWhatIfLoadingHealth] = useState(false);
  const [whatIfLoadingPublicServices, setWhatIfLoadingPublicServices] = useState(false);
  const [whatIfError, setWhatIfError] = useState<string | null>(null);
  const [whatIfOutputs, setWhatIfOutputs] = useState<{
    waterShortageLevel: number | null;
    trafficCongestionLevel: number | null;
    foodPriceChangePercent: number | null;
    energyPriceChangePercent: number | null;
    healthStatus: number | null;
    publicCleanupNeeded: number | null;
  }>({
    waterShortageLevel: null,
    trafficCongestionLevel: null,
    foodPriceChangePercent: null,
    energyPriceChangePercent: null,
    healthStatus: null,
    publicCleanupNeeded: null,
  });
  const [llmText, setLlmText] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [llmOptions, setLlmOptions] = useState<PolicyOption[]>([]);
  const [whatIfLlmText, setWhatIfLlmText] = useState<string | null>(null);
  const [whatIfLlmLoading, setWhatIfLlmLoading] = useState(false);
  const [whatIfLlmError, setWhatIfLlmError] = useState<string | null>(null);

  const handleApprove = async (option: PolicyOption) => {
    await approveRecommendation(option);
    setApprovedOptionId(option.id);
  };

  const whatIfRainfallAverage = useMemo(() => {
    if (whatIfRainfallTotal <= 0) {
      return 0;
    }
    return Math.round((whatIfRainfallTotal / 12) * 10) / 10;
  }, [whatIfRainfallTotal]);

  const getApiBaseUrl = () => {
    const url = import.meta.env.VITE_API_BASE_URL as string | undefined;
    if (url && url.trim().length > 0) {
      return url;
    }
    return 'http://localhost:8000';
  };

  const handleWhatIfChange =
    <
      TSection extends keyof typeof whatIfForm,
      TField extends keyof (typeof whatIfForm)[TSection]
    >(
      section: TSection,
      field: TField
    ) =>
      (value: string | boolean) => {
        setWhatIfForm(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        }));
      };

  const runWhatIfPrediction = async () => {
    const rainfallLast12Months =
      whatIfRainfallTotal > 0
        ? Array.from({ length: 12 }, () => whatIfRainfallTotal / 12)
        : Array.from({ length: 12 }, () => 0);

    const busRoutesCongested: string[] = [];
    if (whatIfForm.transportation.congestedWest) busRoutesCongested.push('west');
    if (whatIfForm.transportation.congestedSouth) busRoutesCongested.push('south');
    if (whatIfForm.transportation.congestedEast) busRoutesCongested.push('east');
    if (whatIfForm.transportation.congestedNorth) busRoutesCongested.push('north');
    if (whatIfForm.transportation.congestedCentral) busRoutesCongested.push('central');

    const payload = {
      weather: {
        currentTemperature: Number(whatIfForm.weather.currentTemperature),
        humidity: Number(whatIfForm.weather.humidity),
        windSpeed: Number(whatIfForm.weather.windSpeed),
        currentRainfall: Number(whatIfForm.weather.currentRainfall),
        rainfallLast12Months,
        recentStormOrFlood: Boolean(whatIfForm.weather.recentStormOrFlood),
        aqi: Number(whatIfForm.weather.aqi),
      },
      transportation: {
        busesOperating: Number(whatIfForm.transportation.busesOperating),
        totalBuses: Number(whatIfForm.transportation.totalBuses),
        busRoutesCongested,
        avgVehiclesPerHour: Number(whatIfForm.transportation.avgVehiclesPerHour),
        peakHourMultiplier: Number(whatIfForm.transportation.peakHourMultiplier),
      },
      agriculture: {
        cropYieldLastYear: Number(whatIfForm.agriculture.cropYieldLastYear),
        currentStockLevel: Number(whatIfForm.agriculture.currentStockLevel),
        supplyChainEfficiency: Number(whatIfForm.agriculture.supplyChainEfficiency),
        importDependency: Number(whatIfForm.agriculture.importDependency),
      },
      energy: {
        currentUsageMW: Number(whatIfForm.energy.currentUsageMW),
        avgUsageLastYear: Number(whatIfForm.energy.avgUsageLastYear),
        peakDemandMW: Number(whatIfForm.energy.peakDemandMW),
        gridStability: Number(whatIfForm.energy.gridStability),
        renewablePercentage: Number(whatIfForm.energy.renewablePercentage),
      },
      publicServices: {
        roadsNeedingRepair: Number(whatIfForm.publicServices.roadsNeedingRepair),
        waterSupplyLevel: Number(whatIfForm.publicServices.waterSupplyLevel),
        sewerSystemHealth: Number(whatIfForm.publicServices.sewerSystemHealth),
        emergencyResponseTime: Number(whatIfForm.publicServices.emergencyResponseTime),
        pendingMaintenanceTasks: Number(whatIfForm.publicServices.pendingMaintenanceTasks),
      },
    };

    const response = await fetch(`${getApiBaseUrl()}/predict-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Prediction request failed (${response.status})`);
    }

    const json = await response.json();
    return {
      waterShortageLevel: typeof json.waterShortageLevel === 'number' ? json.waterShortageLevel : null,
      trafficCongestionLevel:
        typeof json.trafficCongestionLevel === 'number' ? json.trafficCongestionLevel : null,
      foodPriceChangePercent:
        typeof json.foodPriceChangePercent === 'number' ? json.foodPriceChangePercent : null,
      energyPriceChangePercent:
        typeof json.energyPriceChangePercent === 'number' ? json.energyPriceChangePercent : null,
      healthStatus: typeof json.healthStatus === 'number' ? json.healthStatus : null,
      publicCleanupNeeded:
        typeof json.publicCleanupNeeded === 'number' ? json.publicCleanupNeeded : null,
    };
  };

  const handleRunWhatIfAll = async () => {
    setWhatIfLoadingAll(true);
    setWhatIfError(null);
    try {
      const outputs = await runWhatIfPrediction();
      setWhatIfOutputs(outputs);

      // Log to database
      if (userProfile?.role === 'admin') {
        supabase.from('prediction_logs').insert({
          inputs: whatIfForm,
          outputs: outputs,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }).then(({ error }) => {
          if (error) console.error('Failed to log prediction', error);
        });
      }
    } catch (error) {
      setWhatIfError(
        error instanceof Error
          ? error.message
          : 'Prediction request error. Please verify backend is running.'
      );
      setWhatIfOutputs({
        waterShortageLevel: null,
        trafficCongestionLevel: null,
        foodPriceChangePercent: null,
        energyPriceChangePercent: null,
        healthStatus: null,
        publicCleanupNeeded: null,
      });
    } finally {
      setWhatIfLoadingAll(false);
    }
  };

  const handleRunWaterPrediction = async () => {
    setWhatIfLoadingWater(true);
    setWhatIfError(null);
    try {
      const outputs = await runWhatIfPrediction();
      setWhatIfOutputs(prev => ({
        ...prev,
        waterShortageLevel: outputs.waterShortageLevel,
      }));

      // Log to database
      if (userProfile?.role === 'admin') {
        supabase.from('prediction_logs').insert({
          inputs: whatIfForm,
          outputs: outputs,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }).then(({ error }) => {
          if (error) console.error('Failed to log prediction', error);
        });
      }
    } catch (error) {
      setWhatIfError(
        error instanceof Error
          ? error.message
          : 'Prediction request error. Please verify backend is running.'
      );
      setWhatIfOutputs({
        waterShortageLevel: null,
        trafficCongestionLevel: null,
        foodPriceChangePercent: null,
        energyPriceChangePercent: null,
        healthStatus: null,
        publicCleanupNeeded: null,
      });
    } finally {
      setWhatIfLoadingWater(false);
    }
  };

  const handleRunTrafficPrediction = async () => {
    setWhatIfLoadingTraffic(true);
    setWhatIfError(null);
    try {
      const outputs = await runWhatIfPrediction();
      setWhatIfOutputs(prev => ({
        ...prev,
        trafficCongestionLevel: outputs.trafficCongestionLevel,
      }));

      // Log to database
      if (userProfile?.role === 'admin') {
        supabase.from('prediction_logs').insert({
          inputs: whatIfForm,
          outputs: outputs,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }).then(({ error }) => {
          if (error) console.error('Failed to log prediction', error);
        });
      }
    } catch (error) {
      setWhatIfError(
        error instanceof Error
          ? error.message
          : 'Prediction request error. Please verify backend is running.'
      );
      setWhatIfOutputs({
        waterShortageLevel: null,
        trafficCongestionLevel: null,
        foodPriceChangePercent: null,
        energyPriceChangePercent: null,
        healthStatus: null,
        publicCleanupNeeded: null,
      });
    } finally {
      setWhatIfLoadingTraffic(false);
    }
  };

  const handleRunFoodPrediction = async () => {
    setWhatIfLoadingFood(true);
    setWhatIfError(null);
    try {
      const outputs = await runWhatIfPrediction();
      setWhatIfOutputs(prev => ({
        ...prev,
        foodPriceChangePercent: outputs.foodPriceChangePercent,
      }));

      // Log to database
      if (userProfile?.role === 'admin') {
        supabase.from('prediction_logs').insert({
          inputs: whatIfForm,
          outputs: outputs,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }).then(({ error }) => {
          if (error) console.error('Failed to log prediction', error);
        });
      }
    } catch (error) {
      setWhatIfError(
        error instanceof Error
          ? error.message
          : 'Prediction request error. Please verify backend is running.'
      );
      setWhatIfOutputs({
        waterShortageLevel: null,
        trafficCongestionLevel: null,
        foodPriceChangePercent: null,
        energyPriceChangePercent: null,
        healthStatus: null,
        publicCleanupNeeded: null,
      });
    } finally {
      setWhatIfLoadingFood(false);
    }
  };

  const handleRunEnergyPrediction = async () => {
    setWhatIfLoadingEnergy(true);
    setWhatIfError(null);
    try {
      const outputs = await runWhatIfPrediction();
      setWhatIfOutputs(prev => ({
        ...prev,
        energyPriceChangePercent: outputs.energyPriceChangePercent,
      }));

      // Log to database
      if (userProfile?.role === 'admin') {
        supabase.from('prediction_logs').insert({
          inputs: whatIfForm,
          outputs: outputs,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }).then(({ error }) => {
          if (error) console.error('Failed to log prediction', error);
        });
      }
    } catch (error) {
      setWhatIfError(
        error instanceof Error
          ? error.message
          : 'Prediction request error. Please verify backend is running.'
      );
      setWhatIfOutputs({
        waterShortageLevel: null,
        trafficCongestionLevel: null,
        foodPriceChangePercent: null,
        energyPriceChangePercent: null,
        healthStatus: null,
        publicCleanupNeeded: null,
      });
    } finally {
      setWhatIfLoadingEnergy(false);
    }
  };

  const handleRunHealthPrediction = async () => {
    setWhatIfLoadingHealth(true);
    setWhatIfError(null);
    try {
      setWhatIfOutputs(prev => ({
        ...prev,
        healthStatus: null,
      }));
      const outputs = await runWhatIfPrediction();
      setWhatIfOutputs(prev => ({
        ...prev,
        healthStatus: outputs.healthStatus,
      }));

      // Log to database
      if (userProfile?.role === 'admin') {
        supabase.from('prediction_logs').insert({
          inputs: whatIfForm,
          outputs: outputs,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }).then(({ error }) => {
          if (error) console.error('Failed to log prediction', error);
        });
      }
    } catch (error) {
      setWhatIfError(
        error instanceof Error
          ? error.message
          : 'Prediction request error. Please verify backend is running.'
      );
      setWhatIfOutputs({
        waterShortageLevel: null,
        trafficCongestionLevel: null,
        foodPriceChangePercent: null,
        energyPriceChangePercent: null,
        healthStatus: null,
        publicCleanupNeeded: null,
      });
    } finally {
      setWhatIfLoadingHealth(false);
    }
  };

  const handleRunPublicServicesPrediction = async () => {
    setWhatIfLoadingPublicServices(true);
    setWhatIfError(null);
    try {
      setWhatIfOutputs(prev => ({
        ...prev,
        publicCleanupNeeded: null,
      }));
      const outputs = await runWhatIfPrediction();
      setWhatIfOutputs(prev => ({
        ...prev,
        publicCleanupNeeded: outputs.publicCleanupNeeded,
      }));

      // Log to database
      if (userProfile?.role === 'admin') {
        supabase.from('prediction_logs').insert({
          inputs: whatIfForm,
          outputs: outputs,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }).then(({ error }) => {
          if (error) console.error('Failed to log prediction', error);
        });
      }
    } catch (error) {
      setWhatIfError(
        error instanceof Error
          ? error.message
          : 'Prediction request error. Please verify backend is running.'
      );
      setWhatIfOutputs({
        waterShortageLevel: null,
        trafficCongestionLevel: null,
        foodPriceChangePercent: null,
        energyPriceChangePercent: null,
        healthStatus: null,
        publicCleanupNeeded: null,
      });
    } finally {
      setWhatIfLoadingPublicServices(false);
    }
  };

  const handleGenerateLlmRecommendations = async () => {
    setLlmLoading(true);
    setLlmError(null);
    setApprovedOptionId(null);

    try {
      const payload = {
        waterShortageLevel: predictions.waterSupply.shortageLevel,
        trafficCongestionLevel: predictions.traffic.congestionLevel,
        foodPriceChangePercent: predictions.foodPrice.priceChangePercent,
        energyPriceChangePercent: predictions.energyPrice.priceChangePercent,
        publicCleanupNeeded: typeof predictions.publicServices.cleanupNeeded === 'number'
          ? predictions.publicServices.cleanupNeeded
          : predictions.publicServices.cleanupNeeded
            ? 70
            : 10,
        healthStatus: predictions.health.status === 'good'
          ? 25
          : predictions.health.status === 'moderate'
            ? 50
            : predictions.health.status === 'unhealthy'
              ? 75
              : 90,
      };

      const response = await fetch(`${getApiBaseUrl()}/llm-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`LLM recommendations request failed (${response.status})`);
      }

      const json = await response.json() as { recommendations: string };
      setLlmText(json.recommendations);
      setLlmOptions(parseLlmTextToOptions(json.recommendations, predictions));
    } catch (error) {
      setLlmError(
        error instanceof Error
          ? error.message
          : 'LLM recommendations request error. Please verify backend is running.'
      );
      setLlmText(null);
      setLlmOptions([]);
    } finally {
      setLlmLoading(false);
    }
  };

  const handleGenerateWhatIfLlmRecommendations = async () => {
    setWhatIfLlmLoading(true);
    setWhatIfLlmError(null);
    setWhatIfLlmText(null);

    try {
      if (whatIfOutputs.waterShortageLevel === null) {
        throw new Error("Please run the predictions first to generate policies.");
      }

      const payload = {
        waterShortageLevel: whatIfOutputs.waterShortageLevel ?? 0,
        trafficCongestionLevel: whatIfOutputs.trafficCongestionLevel ?? 0,
        foodPriceChangePercent: whatIfOutputs.foodPriceChangePercent ?? 0,
        energyPriceChangePercent: whatIfOutputs.energyPriceChangePercent ?? 0,
        publicCleanupNeeded: whatIfOutputs.publicCleanupNeeded ?? 0,
        healthStatus: whatIfOutputs.healthStatus ?? 0,
      };

      const response = await fetch(`${getApiBaseUrl()}/llm-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`LLM recommendations request failed (${response.status})`);
      }

      const json = await response.json() as { recommendations: string };
      setWhatIfLlmText(json.recommendations);
    } catch (error) {
      setWhatIfLlmError(
        error instanceof Error
          ? error.message
          : 'LLM recommendations request error. Please verify backend is running.'
      );
      setWhatIfLlmText(null);
    } finally {
      setWhatIfLlmLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen gradient-hero">
        <Header />
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Government Command Center
              </h1>
              <p className="text-muted-foreground">
                AI-powered policy recommendations based on city data
              </p>
            </div>
          </div>
        </motion.section>

        {/* Crisis Status */}
        <section className="mb-8">
          <CrisisIndicator type={currentCrisis.type} severity={currentCrisis.severity} />
        </section>

        {/* Main Tabs */}
        <Tabs defaultValue="data" className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-14 p-2 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border-3 border-primary/40 shadow-lg">
            <TabsTrigger
              value="data"
              className="border-2 border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:border-primary data-[state=active]:shadow-lg data-[state=active]:font-bold transition-all duration-200"
            >
              📊 City Data
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="border-2 border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent/20 data-[state=active]:to-info/20 data-[state=active]:border-accent data-[state=active]:shadow-lg data-[state=active]:font-bold transition-all duration-200"
            >
              🤖 AI Predictions
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="border-2 border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-success/20 data-[state=active]:to-primary/20 data-[state=active]:border-success data-[state=active]:shadow-lg data-[state=active]:font-bold transition-all duration-200"
            >
              ✅ Recommendations
            </TabsTrigger>
            <TabsTrigger
              value="what-if"
              className="border-2 border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-warning/20 data-[state=active]:to-accent/20 data-[state=active]:border-warning data-[state=active]:shadow-lg data-[state=active]:font-bold transition-all duration-200"
            >
              ❓ What If?
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <DataDashboard />
          </TabsContent>

          <TabsContent value="predictions">
            <PredictionsPanel />
          </TabsContent>

          <TabsContent value="recommendations">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-info/20 to-primary/20 p-3">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Final AI Recommendations</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Welcome to the Urban Intel AI control center. Monitor and verify system data below.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <Sparkles className="mr-1 inline h-4 w-4 text-warning" />
                    Based on cascading analysis from all data sources
                  </p>
                </div>
              </div>

              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <span>LLM Policy Advisor (Local)</span>
                    </span>
                    <Button
                      size="sm"
                      onClick={handleGenerateLlmRecommendations}
                      disabled={llmLoading}
                    >
                      {llmLoading ? 'Generating...' : 'Generate LLM recommendations'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Uses the current AI predictions as input to a large language model
                    to propose multiple coordinated policy actions for the city.
                  </p>
                  {llmError && (
                    <p className="text-xs text-red-500">
                      {llmError}
                    </p>
                  )}
                  {llmText && (
                    <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-line">
                      {llmText}
                    </div>
                  )}
                  {!llmText && !llmError && (
                    <p className="text-xs text-muted-foreground">
                      Click the button to generate 2–3 high-impact recommendations based on the latest model outputs.
                    </p>
                  )}
                </CardContent>
              </Card>

              {llmOptions.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {llmOptions.map((option, index) => (
                    <RecommendationCard
                      key={option.id}
                      option={option}
                      index={index}
                      onApprove={handleApprove}
                      isApproved={approvedOptionId === option.id}
                    />
                  ))}
                </div>
              )}

              {/* Report Generator */}
              <div className="mt-8">
                <ReportGenerator llmOptions={llmOptions} />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="what-if">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-warning/20 to-accent/20 p-3">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">What If? Scenario Testing</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manually enter government data and run the live ML models to verify outputs.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Judges can confirm the models are running by changing inputs and observing predictions.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <Card className="border-l-4 border-l-warning">
                  <CardHeader>
                    <CardTitle className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Manual Government Data Input</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Weather Inputs */}
                      <div className="space-y-2">
                        <h3 className="text-base font-bold text-sky-500 uppercase tracking-wide">Weather</h3>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="whatif-temp">Current temperature (°C)</Label>
                            <Input
                              id="whatif-temp"
                              type="number"
                              min={-10}
                              max={50}
                              value={whatIfForm.weather.currentTemperature}
                              onChange={e => handleWhatIfChange('weather', 'currentTemperature')(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-red-500">Range: -10 to 50</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-humidity">Humidity (%)</Label>
                            <Input
                              id="whatif-humidity"
                              type="number"
                              min={0}
                              max={100}
                              value={whatIfForm.weather.humidity}
                              onChange={e => handleWhatIfChange('weather', 'humidity')(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 0 to 100</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-wind">Wind speed (km/h)</Label>
                            <Input
                              id="whatif-wind"
                              type="number"
                              min={0}
                              max={60}
                              value={whatIfForm.weather.windSpeed}
                              onChange={e => handleWhatIfChange('weather', 'windSpeed')(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 0 to 60</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-rain">Current rainfall (mm)</Label>
                            <Input
                              id="whatif-rain"
                              type="number"
                              min={0}
                              max={200}
                              value={whatIfForm.weather.currentRainfall}
                              onChange={e => handleWhatIfChange('weather', 'currentRainfall')(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 0 to 200</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-rain-total">Rainfall last 12 months (mm total)</Label>
                            <Input
                              id="whatif-rain-total"
                              type="number"
                              min={0}
                              max={3000}
                              value={whatIfRainfallTotal}
                              onChange={e => setWhatIfRainfallTotal(Number(e.target.value) || 0)}
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 0 to 3000</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Average per month used for model: {whatIfRainfallAverage} mm
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              id="whatif-storm"
                              type="checkbox"
                              className="h-4 w-4 rounded border-input"
                              checked={whatIfForm.weather.recentStormOrFlood}
                              onChange={e =>
                                handleWhatIfChange('weather', 'recentStormOrFlood')(e.target.checked)
                              }
                            />
                            <Label htmlFor="whatif-storm">Recent storm or flood</Label>
                          </div>
                          <div>
                            <Label htmlFor="whatif-aqi">Air Quality Index (AQI)</Label>
                            <Input
                              id="whatif-aqi"
                              type="number"
                              min={0}
                              max={500}
                              value={whatIfForm.weather.aqi}
                              onChange={e => handleWhatIfChange('weather', 'aqi')(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 0 to 500</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-base font-bold text-orange-500 uppercase tracking-wide">Transportation</h3>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="whatif-buses-operating">Buses operating</Label>
                            <Input
                              id="whatif-buses-operating"
                              type="number"
                              min={120}
                              max={280}
                              value={whatIfForm.transportation.busesOperating}
                              onChange={e =>
                                handleWhatIfChange('transportation', 'busesOperating')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 120 to 280</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-vehicles">Average vehicles per hour</Label>
                            <Input
                              id="whatif-vehicles"
                              type="number"
                              min={3000}
                              max={9000}
                              value={whatIfForm.transportation.avgVehiclesPerHour}
                              onChange={e =>
                                handleWhatIfChange(
                                  'transportation',
                                  'avgVehiclesPerHour'
                                )(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 3000 to 9000</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-peak-multiplier">Peak hour multiplier</Label>
                            <Input
                              id="whatif-peak-multiplier"
                              type="number"
                              step="0.1"
                              min={1.2}
                              max={2.2}
                              value={whatIfForm.transportation.peakHourMultiplier}
                              onChange={e =>
                                handleWhatIfChange(
                                  'transportation',
                                  'peakHourMultiplier'
                                )(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 1.2 to 2.2</p>
                          </div>
                          <div className="space-y-1">
                            <Label>Congested routes</Label>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 rounded border-input"
                                  checked={whatIfForm.transportation.congestedWest}
                                  onChange={e =>
                                    handleWhatIfChange(
                                      'transportation',
                                      'congestedWest'
                                    )(e.target.checked)
                                  }
                                />
                                <span>West</span>
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 rounded border-input"
                                  checked={whatIfForm.transportation.congestedSouth}
                                  onChange={e =>
                                    handleWhatIfChange(
                                      'transportation',
                                      'congestedSouth'
                                    )(e.target.checked)
                                  }
                                />
                                <span>South</span>
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 rounded border-input"
                                  checked={whatIfForm.transportation.congestedEast}
                                  onChange={e =>
                                    handleWhatIfChange(
                                      'transportation',
                                      'congestedEast'
                                    )(e.target.checked)
                                  }
                                />
                                <span>East</span>
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 rounded border-input"
                                  checked={whatIfForm.transportation.congestedNorth}
                                  onChange={e =>
                                    handleWhatIfChange(
                                      'transportation',
                                      'congestedNorth'
                                    )(e.target.checked)
                                  }
                                />
                                <span>North</span>
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 rounded border-input"
                                  checked={whatIfForm.transportation.congestedCentral}
                                  onChange={e =>
                                    handleWhatIfChange(
                                      'transportation',
                                      'congestedCentral'
                                    )(e.target.checked)
                                  }
                                />
                                <span>Central</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h3 className="text-base font-bold text-emerald-600 uppercase tracking-wide">Agriculture</h3>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="whatif-crop-yield">Crop yield last year (% of normal)</Label>
                            <Input
                              id="whatif-crop-yield"
                              type="number"
                              min={50}
                              max={110}
                              value={whatIfForm.agriculture.cropYieldLastYear}
                              onChange={e =>
                                handleWhatIfChange('agriculture', 'cropYieldLastYear')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 50 to 110</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-stock-level">Current stock level (% of reserves)</Label>
                            <Input
                              id="whatif-stock-level"
                              type="number"
                              min={20}
                              max={100}
                              value={whatIfForm.agriculture.currentStockLevel}
                              onChange={e =>
                                handleWhatIfChange('agriculture', 'currentStockLevel')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 20 to 100</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-supply-efficiency">Supply chain efficiency (%)</Label>
                            <Input
                              id="whatif-supply-efficiency"
                              type="number"
                              min={50}
                              max={100}
                              value={whatIfForm.agriculture.supplyChainEfficiency}
                              onChange={e =>
                                handleWhatIfChange(
                                  'agriculture',
                                  'supplyChainEfficiency'
                                )(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 50 to 100</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-import-dependency">Import dependency (%)</Label>
                            <Input
                              id="whatif-import-dependency"
                              type="number"
                              min={5}
                              max={40}
                              value={whatIfForm.agriculture.importDependency}
                              onChange={e =>
                                handleWhatIfChange('agriculture', 'importDependency')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 5 to 40</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-base font-bold text-yellow-500 uppercase tracking-wide">Energy</h3>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="whatif-current-usage">Current usage (MW)</Label>
                            <Input
                              id="whatif-current-usage"
                              type="number"
                              min={600}
                              max={1300}
                              value={whatIfForm.energy.currentUsageMW}
                              onChange={e =>
                                handleWhatIfChange('energy', 'currentUsageMW')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 600 to 1300</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-avg-usage">Average usage last year (MW)</Label>
                            <Input
                              id="whatif-avg-usage"
                              type="number"
                              min={700}
                              max={1100}
                              value={whatIfForm.energy.avgUsageLastYear}
                              onChange={e =>
                                handleWhatIfChange('energy', 'avgUsageLastYear')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 700 to 1100</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-peak-demand">Peak demand (MW)</Label>
                            <Input
                              id="whatif-peak-demand"
                              type="number"
                              min={900}
                              max={1500}
                              value={whatIfForm.energy.peakDemandMW}
                              onChange={e =>
                                handleWhatIfChange('energy', 'peakDemandMW')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 900 to 1500</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-grid-stability">Grid stability (%)</Label>
                            <Input
                              id="whatif-grid-stability"
                              type="number"
                              min={75}
                              max={100}
                              value={whatIfForm.energy.gridStability}
                              onChange={e =>
                                handleWhatIfChange('energy', 'gridStability')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 75 to 100</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-renewable">Renewable percentage (%)</Label>
                            <Input
                              id="whatif-renewable"
                              type="number"
                              min={10}
                              max={40}
                              value={whatIfForm.energy.renewablePercentage}
                              onChange={e =>
                                handleWhatIfChange('energy', 'renewablePercentage')(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 10 to 40</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-rose-500 uppercase tracking-wide">Public Services</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="whatif-roads-repair">Roads needing repair</Label>
                            <Input
                              id="whatif-roads-repair"
                              type="number"
                              min={5}
                              max={50}
                              value={whatIfForm.publicServices.roadsNeedingRepair}
                              onChange={e =>
                                handleWhatIfChange(
                                  'publicServices',
                                  'roadsNeedingRepair'
                                )(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 5 to 50</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-water-supply">Water supply level (%)</Label>
                            <Input
                              id="whatif-water-supply"
                              type="number"
                              min={20}
                              max={100}
                              value={whatIfForm.publicServices.waterSupplyLevel}
                              onChange={e =>
                                handleWhatIfChange(
                                  'publicServices',
                                  'waterSupplyLevel'
                                )(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 20 to 100</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-sewer-health">Sewer system health (%)</Label>
                            <Input
                              id="whatif-sewer-health"
                              type="number"
                              min={60}
                              max={100}
                              value={whatIfForm.publicServices.sewerSystemHealth}
                              onChange={e =>
                                handleWhatIfChange(
                                  'publicServices',
                                  'sewerSystemHealth'
                                )(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 60 to 100</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="whatif-response-time">Emergency response time (minutes)</Label>
                            <Input
                              id="whatif-response-time"
                              type="number"
                              min={5}
                              max={25}
                              value={whatIfForm.publicServices.emergencyResponseTime}
                              onChange={e =>
                                handleWhatIfChange(
                                  'publicServices',
                                  'emergencyResponseTime'
                                )(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 5 to 25</p>
                          </div>
                          <div>
                            <Label htmlFor="whatif-maintenance-tasks">Pending maintenance tasks</Label>
                            <Input
                              id="whatif-maintenance-tasks"
                              type="number"
                              min={10}
                              max={70}
                              value={whatIfForm.publicServices.pendingMaintenanceTasks}
                              onChange={e =>
                                handleWhatIfChange(
                                  'publicServices',
                                  'pendingMaintenanceTasks'
                                )(e.target.value)
                              }
                            />
                            <p className="mt-1 text-xs text-red-500">Range: 10 to 70</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button
                        type="button"
                        onClick={handleRunWhatIfAll}
                        disabled={whatIfLoadingAll}
                        className="rounded-xl px-6"
                      >
                        {whatIfLoadingAll ? 'Running predictions…' : 'Run What If Predictions'}
                      </Button>
                      {whatIfError && (
                        <p className="text-sm text-destructive">
                          {whatIfError}
                        </p>
                      )}
                      {!whatIfError && !whatIfLoadingAll && whatIfOutputs.waterShortageLevel !== null && (
                        <p className="text-xs text-muted-foreground">
                          Models executed successfully using the manual inputs above.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-l-4 border-l-info h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg">What If? Model Outputs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        These values come directly from the trained ML models, using the manual data
                        you entered. Judges can change inputs and rerun predictions to confirm live
                        model behavior.
                      </p>
                      <div className="space-y-3">
                        <div className="rounded-lg bg-primary/5 p-3">
                          <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                            Water Shortage Model
                          </div>
                          <div className="mt-1 text-2xl font-bold">
                            {whatIfOutputs.waterShortageLevel !== null
                              ? `${Math.round(whatIfOutputs.waterShortageLevel)}%`
                              : '—'}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Higher value means more severe shortage risk.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleRunWaterPrediction}
                            disabled={whatIfLoadingWater}
                          >
                            {whatIfLoadingWater ? 'Running…' : 'Run water prediction'}
                          </Button>
                        </div>
                        <div className="rounded-lg bg-accent/5 p-3">
                          <div className="text-xs font-semibold text-accent uppercase tracking-wide">
                            Traffic Congestion Model
                          </div>
                          <div className="mt-1 text-2xl font-bold">
                            {whatIfOutputs.trafficCongestionLevel !== null
                              ? `${Math.round(whatIfOutputs.trafficCongestionLevel)}%`
                              : '—'}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Predicted citywide congestion level based on weather and transport load.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleRunTrafficPrediction}
                            disabled={whatIfLoadingTraffic}
                          >
                            {whatIfLoadingTraffic ? 'Running…' : 'Run traffic prediction'}
                          </Button>
                        </div>
                        <div className="rounded-lg bg-warning/5 p-3">
                          <div className="text-xs font-semibold text-warning uppercase tracking-wide">
                            Food Price Model
                          </div>
                          <div className="mt-1 text-2xl font-bold">
                            {whatIfOutputs.foodPriceChangePercent !== null
                              ? `${Math.round(whatIfOutputs.foodPriceChangePercent)}%`
                              : '—'}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Expected change in food prices given rainfall, stocks and logistics.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleRunFoodPrediction}
                            disabled={whatIfLoadingFood}
                          >
                            {whatIfLoadingFood ? 'Running…' : 'Run food price prediction'}
                          </Button>
                        </div>
                        <div className="rounded-lg bg-success/5 p-3">
                          <div className="text-xs font-semibold text-success uppercase tracking-wide">
                            Energy Price Model
                          </div>
                          <div className="mt-1 text-2xl font-bold">
                            {whatIfOutputs.energyPriceChangePercent !== null
                              ? `${Math.round(whatIfOutputs.energyPriceChangePercent)}%`
                              : '—'}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Predicted adjustment in energy tariffs from current load and stability.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleRunEnergyPrediction}
                            disabled={whatIfLoadingEnergy}
                          >
                            {whatIfLoadingEnergy ? 'Running…' : 'Run energy price prediction'}
                          </Button>
                        </div>
                        <div className="rounded-lg bg-destructive/5 p-3">
                          <div className="text-xs font-semibold text-destructive uppercase tracking-wide">
                            Health Status Model
                          </div>
                          <div className="mt-1 text-2xl font-bold">
                            {whatIfOutputs.healthStatus !== null
                              ? `${Math.round(whatIfOutputs.healthStatus)}%`
                              : '—'}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Higher value means more severe population health risk (0% to 100%).
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleRunHealthPrediction}
                            disabled={whatIfLoadingHealth}
                          >
                            {whatIfLoadingHealth ? 'Running…' : 'Run health prediction'}
                          </Button>
                        </div>
                        <div className="rounded-lg bg-info/5 p-3">
                          <div className="text-xs font-semibold text-info uppercase tracking-wide">
                            Public Cleanup Model
                          </div>
                          <div className="mt-1 text-2xl font-bold">
                            {whatIfOutputs.publicCleanupNeeded !== null
                              ? `${Math.round(whatIfOutputs.publicCleanupNeeded)}%`
                              : '—'}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Probability that major cleanup operations should be triggered (0% to 100%).
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleRunPublicServicesPrediction}
                            disabled={whatIfLoadingPublicServices}
                          >
                            {whatIfLoadingPublicServices ? 'Running…' : 'Run cleanup prediction'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500 h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        What If? AI Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Generate policy recommendations based on the hypothentical scenario above.
                      </p>

                      <Button
                        size="sm"
                        onClick={handleGenerateWhatIfLlmRecommendations}
                        disabled={whatIfLlmLoading}
                        className="w-full"
                      >
                        {whatIfLlmLoading ? 'Generating Policies...' : 'Generate Policies'}
                      </Button>

                      {whatIfLlmError && (
                        <p className="text-xs text-red-500">
                          {whatIfLlmError}
                        </p>
                      )}

                      {whatIfLlmText && (
                        <div className="rounded-md bg-muted p-3 text-xs whitespace-pre-line">
                          {whatIfLlmText}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Decision History */}
        <DecisionHistory decisions={decisionHistory} />

        {/* Footer */}
        <footer className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          <p>Urban Intel AI Admin Portal • Secure Government Access</p>
          <p className="mt-2">All decisions are logged and auditable</p>
        </footer>
      </main>
    </div>
  );
};

export default Admin;
