import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CityData,
  PolicyDecision,
  PolicyOption,
  DirectiveItem,
  AllPredictions,
  BackendModelOutputs,
  generateCityData,
  generateAllPredictions,
  generateAllPredictionsFromBackend,
  generateFinalRecommendations,
  getCrisisType,
  generateMockDecisionHistory,
} from '@/lib/mockData';

interface CityContextType {
  data: CityData;
  predictions: AllPredictions;
  currentCrisis: { type: string; severity: 'low' | 'medium' | 'high' | 'critical' };
  recommendations: PolicyOption[];
  activeDirective: string | null;
  directiveHistory: DirectiveItem[];
  decisionHistory: PolicyDecision[];
  backendMode: 'backend' | 'mock';
  backendOutputs: BackendModelOutputs | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  approveRecommendation: (option: PolicyOption) => void;
  refreshData: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (url && url.trim().length > 0) {
    return url;
  }
  return 'http://localhost:8000';
};

const fetchRealWeatherData = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/current-weather`, {
      method: 'GET',
    });
    if (!response.ok) {
      console.error('Weather API request failed', response.status, response.statusText);
      return null;
    }
    const json = await response.json();
    return {
      currentTemperature: json.currentTemperature,
      humidity: json.humidity,
      windSpeed: json.windSpeed,
      currentRainfall: json.currentRainfall,
      rainfallLast12Months: json.rainfallLast12Months ?? [],
      recentStormOrFlood: json.recentStormOrFlood,
      aqi: json.aqi,
    };
  } catch (error) {
    console.error('Weather API request error', error);
    return null;
  }
};

const fetchBackendOutputs = async (cityData: CityData): Promise<BackendModelOutputs | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/predict-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weather: {
          currentTemperature: cityData.weather.currentTemperature,
          humidity: cityData.weather.humidity,
          windSpeed: cityData.weather.windSpeed,
          currentRainfall: cityData.weather.currentRainfall,
          rainfallLast12Months: cityData.weather.rainfallLast12Months,
          recentStormOrFlood: cityData.weather.recentStormOrFlood,
          aqi: cityData.weather.aqi,
        },
        transportation: {
          busesOperating: cityData.transportation.busesOperating,
          totalBuses: cityData.transportation.totalBuses,
          busRoutesCongested: cityData.transportation.busRoutesCongested,
          avgVehiclesPerHour: cityData.transportation.avgVehiclesPerHour,
          peakHourMultiplier: cityData.transportation.peakHourMultiplier,
        },
        agriculture: {
          cropYieldLastYear: cityData.agriculture.cropYieldLastYear,
          currentStockLevel: cityData.agriculture.currentStockLevel,
          supplyChainEfficiency: cityData.agriculture.supplyChainEfficiency,
          importDependency: cityData.agriculture.importDependency,
        },
        energy: {
          currentUsageMW: cityData.energy.currentUsageMW,
          avgUsageLastYear: cityData.energy.avgUsageLastYear,
          peakDemandMW: cityData.energy.peakDemandMW,
          gridStability: cityData.energy.gridStability,
          renewablePercentage: cityData.energy.renewablePercentage,
        },
        publicServices: {
          roadsNeedingRepair: cityData.publicServices.roadsNeedingRepair,
          waterSupplyLevel: cityData.publicServices.waterSupplyLevel,
          sewerSystemHealth: cityData.publicServices.sewerSystemHealth,
          emergencyResponseTime: cityData.publicServices.emergencyResponseTime,
          pendingMaintenanceTasks: cityData.publicServices.pendingMaintenanceTasks,
        },
      }),
    });
    if (!response.ok) {
      console.error('Backend prediction request failed', response.status, response.statusText);
      return null;
    }
    const json = await response.json();
    return {
      waterShortageLevel: json.waterShortageLevel,
      trafficCongestionLevel: json.trafficCongestionLevel,
      foodPriceChangePercent: json.foodPriceChangePercent,
      energyPriceChangePercent: json.energyPriceChangePercent,
      publicCleanupNeeded: json.publicCleanupNeeded,
      healthStatus: json.healthStatus,
    };
  } catch (error) {
    console.error('Backend prediction request error', error);
    return null;
  }
};

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CityData>(generateCityData());
  const [predictions, setPredictions] = useState<AllPredictions>(generateAllPredictions(data));
  const [recommendations, setRecommendations] = useState<PolicyOption[]>([]);
  const [activeDirective, setActiveDirective] = useState<string | null>(null);
  const [directiveHistory, setDirectiveHistory] = useState<DirectiveItem[]>([]);
  const [decisionHistory, setDecisionHistory] = useState<PolicyDecision[]>(generateMockDecisionHistory());
  const [backendMode, setBackendMode] = useState<'backend' | 'mock'>('mock');
  const [backendOutputs, setBackendOutputs] = useState<BackendModelOutputs | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const currentCrisis = getCrisisType(data, predictions);

  const refreshData = useCallback(() => {
    (async () => {
      const baseData = generateCityData();
      const realWeather = await fetchRealWeatherData();
      const mergedData: CityData = realWeather
        ? {
            ...baseData,
            weather: {
              ...baseData.weather,
              ...realWeather,
            },
          }
        : baseData;

      setData(mergedData);

      const backendOutputs = await fetchBackendOutputs(mergedData);
      if (backendOutputs) {
        setBackendMode('backend');
        setBackendOutputs(backendOutputs);
        const newPredictions = generateAllPredictionsFromBackend(mergedData, backendOutputs);
        setPredictions(newPredictions);
        setRecommendations(generateFinalRecommendations(mergedData, newPredictions));
      } else {
        setBackendMode('mock');
        setBackendOutputs(null);
        const fallbackPredictions = generateAllPredictions(mergedData);
        setPredictions(fallbackPredictions);
        setRecommendations(generateFinalRecommendations(mergedData, fallbackPredictions));
      }
    })();
  }, []);

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const login = useCallback((username: string, password: string): boolean => {
    if (username === 'admin' && password === 'urbanintel') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const approveRecommendation = useCallback((option: PolicyOption) => {
    // Move current directive to history
    if (activeDirective) {
      setDirectiveHistory(prev => [{
        id: crypto.randomUUID(),
        text: activeDirective,
        timestamp: new Date().toISOString(),
        isActive: false,
        category: option.category,
      }, ...prev.slice(0, 9)]);
    }
    
    setActiveDirective(option.instructionText);
    
    const newDecision: PolicyDecision = {
      id: crypto.randomUUID(),
      alertType: currentCrisis.type,
      aiOptions: recommendations,
      selectedOptionId: option.id,
      status: 'PUBLISHED',
      approvedBy: 'Admin',
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      predictions,
    };
    
    setDecisionHistory(prev => [newDecision, ...prev]);
  }, [activeDirective, currentCrisis.type, recommendations, predictions]);

  return (
    <CityContext.Provider value={{
      data,
      predictions,
      currentCrisis,
      recommendations,
      activeDirective,
      directiveHistory,
      decisionHistory,
      backendMode,
      backendOutputs,
      isLoggedIn,
      login,
      logout,
      approveRecommendation,
      refreshData
    }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCityContext = () => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCityContext must be used within a CityProvider');
  }
  return context;
};
