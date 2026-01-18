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
import { supabase } from '@/integrations/supabase/client';

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
  userProfile: { username: string; role: string } | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  approveRecommendation: (option: PolicyOption) => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<{ username: string; role: string } | null>(null);

  // Check Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', userId)
      .single();

    if (data) {
      setUserProfile(data);
    }
  };

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

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const approveRecommendation = useCallback(async (option: PolicyOption) => {
    // Local state update (optimistic)
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

    // Save to Database
    if (userProfile?.role === 'admin') {
      const { error } = await supabase.from('decisions').insert({
        title: option.title,
        category: option.category,
        description: option.description,
        impact: option.impact,
        status: 'PUBLISHED',
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) {
        console.error('Failed to save decision to database:', error);
      } else {
        fetchDecisionHistory(); // Refresh list after save
      }
    }
  }, [activeDirective, currentCrisis.type, recommendations, predictions, userProfile]);

  const fetchDecisionHistory = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('decisions')
      .select(`
        *,
        profiles (username)
      `)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching decision history:', error);
      return;
    }

    if (data) {
      const mapped: PolicyDecision[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        alertType: row.category || 'ALERT',
        aiOptions: [],
        selectedOptionId: null,
        status: row.status as any,
        approvedBy: row.profiles?.username || 'Admin',
        publishedAt: row.created_at,
        createdAt: row.created_at,
        // Keep descriptions if needed, but not in table view
      }));
      setDecisionHistory(mapped);
    }
  }, []);

  // Fetch history on load if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchDecisionHistory();
    }
  }, [isLoggedIn, fetchDecisionHistory]);

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
      userProfile,
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
