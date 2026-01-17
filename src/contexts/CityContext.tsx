import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  CityData,
  PolicyDecision, 
  PolicyOption,
  DirectiveItem,
  AllPredictions,
  generateCityData, 
  generateAllPredictions,
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
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  approveRecommendation: (option: PolicyOption) => void;
  refreshData: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<CityData>(generateCityData());
  const [predictions, setPredictions] = useState<AllPredictions>(generateAllPredictions(data));
  const [recommendations, setRecommendations] = useState<PolicyOption[]>([]);
  const [activeDirective, setActiveDirective] = useState<string | null>(null);
  const [directiveHistory, setDirectiveHistory] = useState<DirectiveItem[]>([]);
  const [decisionHistory, setDecisionHistory] = useState<PolicyDecision[]>(generateMockDecisionHistory());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const currentCrisis = getCrisisType(data, predictions);

  // Update predictions and recommendations when data changes
  useEffect(() => {
    const newPredictions = generateAllPredictions(data);
    setPredictions(newPredictions);
    setRecommendations(generateFinalRecommendations(data, newPredictions));
  }, [data]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateCityData());
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

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

  const refreshData = useCallback(() => {
    setData(generateCityData());
  }, []);

  return (
    <CityContext.Provider value={{
      data,
      predictions,
      currentCrisis,
      recommendations,
      activeDirective,
      directiveHistory,
      decisionHistory,
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
