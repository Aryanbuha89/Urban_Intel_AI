// Mock data for UrbanIntel Smart City Dashboard

// ===========================================
// DATA INTERFACES - Government Injected Data
// ===========================================

export interface WeatherData {
  currentTemperature: number;
  humidity: number;
  windSpeed: number;
  currentRainfall: number;
  rainfallLast12Months: number[]; // Monthly rainfall in mm
  recentStormOrFlood: boolean;
  stormDate?: string;
}

export interface TransportationData {
  busesOperating: number;
  totalBuses: number;
  busRoutesCongested: string[]; // "west", "south", "east", "north", "central"
  avgVehiclesPerHour: number;
  peakHourMultiplier: number;
}

export interface AgricultureSupplyData {
  cropYieldLastYear: number; // percentage of normal
  currentStockLevel: number; // percentage of normal reserves
  supplyChainEfficiency: number; // percentage
  majorCropsAffected: string[];
  importDependency: number; // percentage
}

export interface EnergyData {
  currentUsageMW: number;
  avgUsageLastYear: number;
  peakDemandMW: number;
  gridStability: number; // percentage
  renewablePercentage: number;
}

export interface PublicServicesData {
  roadsNeedingRepair: number;
  waterSupplyLevel: number; // percentage of capacity
  sewerSystemHealth: number; // percentage
  emergencyResponseTime: number; // minutes
  pendingMaintenanceTasks: number;
}

export interface CityData {
  id: string;
  timestamp: string;
  weather: WeatherData;
  transportation: TransportationData;
  agriculture: AgricultureSupplyData;
  energy: EnergyData;
  publicServices: PublicServicesData;
}

// ===========================================
// PREDICTION INTERFACES
// ===========================================

export interface WaterSupplyPrediction {
  status: 'abundant' | 'normal' | 'shortage' | 'critical';
  shortageLevel: number; // 0-100
  shortageDuration: string; // "15 days", "1 month", etc.
  reason: string;
  confidence: number;
}

export interface TrafficPrediction {
  congestionLevel: number; // 0-100
  affectedAreas: string[];
  peakHours: string;
  roadsToAvoid: string[];
  reason: string;
  weatherImpact: string;
  busImpact: string;
  confidence: number;
}

export interface FoodPricePrediction {
  priceChangePercent: number;
  affectedItems: string[];
  reason: string;
  timeline: string;
  supplyStatus: string;
  confidence: number;
}

export interface EnergyPricePrediction {
  priceChangePercent: number;
  currentRate: number;
  predictedRate: number;
  reason: string;
  timeline: string;
  confidence: number;
}

export interface PublicServicesPrediction {
  roadMaintenancePlan: string;
  maintenanceTimeline: string;
  cleanupNeeded: boolean;
  cleanupReason?: string;
  cleanupDuration?: string;
  qualityImprovements: string[];
  confidence: number;
}

export interface AllPredictions {
  waterSupply: WaterSupplyPrediction;
  traffic: TrafficPrediction;
  foodPrice: FoodPricePrediction;
  energyPrice: EnergyPricePrediction;
  publicServices: PublicServicesPrediction;
}

// ===========================================
// POLICY INTERFACES
// ===========================================

export interface PolicyOption {
  id: number;
  title: string;
  description: string;
  impact: string;
  instructionText: string;
  category: string;
  basedOn: string[];
}

export interface PolicyDecision {
  id: string;
  alertType: string;
  aiOptions: PolicyOption[];
  selectedOptionId: number | null;
  status: 'PENDING' | 'PUBLISHED';
  approvedBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  predictions?: AllPredictions;
}

export interface DirectiveItem {
  id: string;
  text: string;
  timestamp: string;
  isActive: boolean;
  category?: string;
}

// ===========================================
// MOCK DATA GENERATION
// ===========================================

export const generateCityData = (): CityData => {
  // Simulate last 12 months of rainfall (varying amounts)
  const rainfallPattern = [
    15, 20, 35, 80, 150, 300, 350, 280, 180, 60, 25, 18
  ].map(base => base + Math.round(Math.random() * 40 - 20));

  const totalRainfall = rainfallPattern.reduce((a, b) => a + b, 0);
  const avgRainfall = 1500; // Normal annual rainfall in mm
  const isLowRainfall = totalRainfall < avgRainfall * 0.7;

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    weather: {
      currentTemperature: Math.round(28 + Math.random() * 15),
      humidity: Math.round(40 + Math.random() * 50),
      windSpeed: Math.round(5 + Math.random() * 25),
      currentRainfall: Math.round(Math.random() * 50),
      rainfallLast12Months: rainfallPattern,
      recentStormOrFlood: Math.random() > 0.7,
      stormDate: Math.random() > 0.7 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    },
    transportation: {
      busesOperating: Math.round(150 + Math.random() * 100),
      totalBuses: 300,
      busRoutesCongested: ['west', 'south'].filter(() => Math.random() > 0.3),
      avgVehiclesPerHour: Math.round(5000 + Math.random() * 3000),
      peakHourMultiplier: 1.5 + Math.random() * 0.8,
    },
    agriculture: {
      cropYieldLastYear: isLowRainfall ? 60 + Math.random() * 20 : 85 + Math.random() * 15,
      currentStockLevel: Math.round(40 + Math.random() * 50),
      supplyChainEfficiency: Math.round(60 + Math.random() * 35),
      majorCropsAffected: isLowRainfall ? ['Rice', 'Wheat', 'Cotton'] : [],
      importDependency: Math.round(10 + Math.random() * 30),
    },
    energy: {
      currentUsageMW: Math.round(800 + Math.random() * 400),
      avgUsageLastYear: 900,
      peakDemandMW: Math.round(1100 + Math.random() * 300),
      gridStability: Math.round(85 + Math.random() * 15),
      renewablePercentage: Math.round(15 + Math.random() * 20),
    },
    publicServices: {
      roadsNeedingRepair: Math.round(10 + Math.random() * 40),
      waterSupplyLevel: Math.round(40 + Math.random() * 50),
      sewerSystemHealth: Math.round(70 + Math.random() * 25),
      emergencyResponseTime: Math.round(8 + Math.random() * 12),
      pendingMaintenanceTasks: Math.round(20 + Math.random() * 50),
    },
  };
};

// ===========================================
// AI PREDICTION MODELS
// ===========================================

export const predictWaterSupply = (data: CityData): WaterSupplyPrediction => {
  const totalRainfall = data.weather.rainfallLast12Months.reduce((a, b) => a + b, 0);
  const avgExpected = 1500; // mm per year
  const rainfallPercentage = (totalRainfall / avgExpected) * 100;
  const waterLevel = data.publicServices.waterSupplyLevel;

  let status: WaterSupplyPrediction['status'];
  let shortageLevel: number;
  let shortageDuration: string;
  let reason: string;

  if (rainfallPercentage < 50 || waterLevel < 30) {
    status = 'critical';
    shortageLevel = 85;
    shortageDuration = '2-3 months';
    reason = `Annual rainfall at ${Math.round(rainfallPercentage)}% of normal (${totalRainfall}mm vs ${avgExpected}mm expected). Reservoir at ${waterLevel}% capacity.`;
  } else if (rainfallPercentage < 70 || waterLevel < 50) {
    status = 'shortage';
    shortageLevel = 60;
    shortageDuration = '1 month';
    reason = `Below-average rainfall (${Math.round(rainfallPercentage)}% of normal). Water conservation measures needed.`;
  } else if (rainfallPercentage > 130) {
    status = 'abundant';
    shortageLevel = 0;
    shortageDuration = 'N/A';
    reason = `Above-average rainfall (${Math.round(rainfallPercentage)}% of normal). Good water reserves.`;
  } else {
    status = 'normal';
    shortageLevel = 15;
    shortageDuration = 'N/A';
    reason = 'Normal rainfall patterns. Water supply stable.';
  }

  return {
    status,
    shortageLevel,
    shortageDuration,
    reason,
    confidence: 85 + Math.round(Math.random() * 10),
  };
};

export const predictTraffic = (data: CityData, waterPrediction: WaterSupplyPrediction): TrafficPrediction => {
  const { transportation, weather } = data;
  const busesRatio = transportation.busesOperating / transportation.totalBuses;
  const isHarshWeather = weather.currentTemperature > 40 || weather.currentRainfall > 30 || weather.windSpeed > 20;

  let congestionLevel = 40; // Base level
  const roadsToAvoid: string[] = [];
  const affectedAreas: string[] = [];
  let weatherImpact = 'Normal conditions';
  let busImpact = 'Normal bus operations';

  // Bus impact on traffic
  if (busesRatio > 0.8) {
    congestionLevel += 20;
    affectedAreas.push(...transportation.busRoutesCongested);
    busImpact = `High bus activity (${transportation.busesOperating}/${transportation.totalBuses}) causing congestion in ${transportation.busRoutesCongested.join(', ')} areas`;
    
    if (transportation.busRoutesCongested.includes('west')) {
      roadsToAvoid.push('West Ring Road', 'Industrial Highway');
    }
    if (transportation.busRoutesCongested.includes('south')) {
      roadsToAvoid.push('South Main Street', 'Market Road');
    }
  }

  // Weather impact
  if (isHarshWeather) {
    congestionLevel += 25;
    if (weather.currentRainfall > 30) {
      weatherImpact = `Heavy rainfall (${weather.currentRainfall}mm) slowing traffic. Visibility reduced.`;
      roadsToAvoid.push('Low-lying areas', 'Underpass roads');
    } else if (weather.currentTemperature > 40) {
      weatherImpact = `Extreme heat (${weather.currentTemperature}°C) causing road surface issues.`;
    } else {
      weatherImpact = `High winds (${weather.windSpeed} km/h) affecting vehicle stability.`;
    }
    affectedAreas.push('Major highways', 'City center');
  }

  congestionLevel = Math.min(100, congestionLevel);

  return {
    congestionLevel: Math.round(congestionLevel),
    affectedAreas: [...new Set(affectedAreas)],
    peakHours: '8-10 AM, 5-8 PM',
    roadsToAvoid,
    reason: `Based on ${transportation.avgVehiclesPerHour} vehicles/hour with ${Math.round(transportation.peakHourMultiplier * 100 - 100)}% peak increase`,
    weatherImpact,
    busImpact,
    confidence: 78 + Math.round(Math.random() * 15),
  };
};

export const predictFoodPrice = (data: CityData, waterPrediction: WaterSupplyPrediction): FoodPricePrediction => {
  const { agriculture, weather } = data;
  const totalRainfall = weather.rainfallLast12Months.reduce((a, b) => a + b, 0);
  const isLowRainfall = totalRainfall < 1050; // 70% of normal

  let priceChangePercent = 0;
  let reason = '';
  let supplyStatus = 'Normal supply levels';
  const affectedItems: string[] = [];
  let timeline = 'Next 1-2 months';

  // Low rainfall impact on agriculture
  if (isLowRainfall) {
    priceChangePercent += 15;
    reason = `Low rainfall over past year (${totalRainfall}mm) reduced crop yield to ${Math.round(agriculture.cropYieldLastYear)}%. `;
    affectedItems.push(...agriculture.majorCropsAffected);
    supplyStatus = `Crop yield at ${Math.round(agriculture.cropYieldLastYear)}% of normal`;
  }

  // Supply chain issues
  if (agriculture.currentStockLevel < 50) {
    priceChangePercent += 10;
    reason += `Current stock at ${Math.round(agriculture.currentStockLevel)}% of normal reserves. `;
    affectedItems.push('Vegetables', 'Pulses');
    supplyStatus += `. Stock reserves low at ${Math.round(agriculture.currentStockLevel)}%`;
  }

  if (agriculture.supplyChainEfficiency < 70) {
    priceChangePercent += 8;
    reason += `Supply chain efficiency at ${Math.round(agriculture.supplyChainEfficiency)}% causing delays.`;
  }

  // Water shortage compounds the problem
  if (waterPrediction.status === 'critical' || waterPrediction.status === 'shortage') {
    priceChangePercent += 5;
    reason += ' Water shortage affecting food production.';
  }

  if (priceChangePercent === 0) {
    reason = 'Stable agricultural conditions and supply chain.';
    supplyStatus = 'Healthy stock levels and supply chain';
  }

  return {
    priceChangePercent: Math.round(priceChangePercent),
    affectedItems: [...new Set(affectedItems)],
    reason: reason || 'Normal market conditions expected',
    timeline,
    supplyStatus,
    confidence: 72 + Math.round(Math.random() * 18),
  };
};

export const predictEnergyPrice = (data: CityData): EnergyPricePrediction => {
  const { energy } = data;
  const usageIncrease = ((energy.currentUsageMW - energy.avgUsageLastYear) / energy.avgUsageLastYear) * 100;
  const demandStress = energy.currentUsageMW / energy.peakDemandMW;

  const baseRate = 6.50; // Current rate per unit
  let priceChangePercent = 0;
  let reason = '';

  if (usageIncrease > 20) {
    priceChangePercent += 12;
    reason = `Energy consumption up ${Math.round(usageIncrease)}% from last year average. `;
  } else if (usageIncrease > 10) {
    priceChangePercent += 6;
    reason = `Moderate increase in energy demand (${Math.round(usageIncrease)}%). `;
  }

  if (demandStress > 0.9) {
    priceChangePercent += 8;
    reason += `Grid operating at ${Math.round(demandStress * 100)}% of peak capacity. `;
  }

  if (energy.gridStability < 90) {
    priceChangePercent += 5;
    reason += `Grid stability at ${Math.round(energy.gridStability)}% requiring additional infrastructure costs.`;
  }

  if (priceChangePercent === 0) {
    reason = 'Stable energy supply and demand. No significant price changes expected.';
  }

  const predictedRate = baseRate * (1 + priceChangePercent / 100);

  return {
    priceChangePercent: Math.round(priceChangePercent),
    currentRate: baseRate,
    predictedRate: Math.round(predictedRate * 100) / 100,
    reason: reason || 'Stable energy market',
    timeline: 'Next 2-3 months',
    confidence: 80 + Math.round(Math.random() * 15),
  };
};

export const predictPublicServices = (data: CityData): PublicServicesPrediction => {
  const { publicServices, weather } = data;
  const qualityImprovements: string[] = [];
  let cleanupNeeded = false;
  let cleanupReason: string | undefined;
  let cleanupDuration: string | undefined;
  let maintenancePlan = '';
  let maintenanceTimeline = '';

  // Storm/flood cleanup
  if (weather.recentStormOrFlood) {
    cleanupNeeded = true;
    cleanupReason = `Recent storm/flood on ${weather.stormDate ? new Date(weather.stormDate).toLocaleDateString() : 'last week'} caused debris and road damage`;
    cleanupDuration = '15 days';
    qualityImprovements.push('Debris clearance', 'Road surface repairs', 'Drain cleaning', 'Street light restoration');
  }

  // Road maintenance
  if (publicServices.roadsNeedingRepair > 20) {
    maintenancePlan = `${publicServices.roadsNeedingRepair} road segments identified for repair. Priority areas will be addressed first.`;
    maintenanceTimeline = publicServices.roadsNeedingRepair > 35 ? '30-45 days' : '15-20 days';
    qualityImprovements.push('Pothole repairs', 'Road resurfacing');
  } else {
    maintenancePlan = 'Regular maintenance schedule. No critical repairs needed.';
    maintenanceTimeline = 'Ongoing';
  }

  // Sewer system
  if (publicServices.sewerSystemHealth < 80) {
    qualityImprovements.push('Sewer line maintenance', 'Drainage improvements');
  }

  return {
    roadMaintenancePlan: maintenancePlan,
    maintenanceTimeline,
    cleanupNeeded,
    cleanupReason,
    cleanupDuration,
    qualityImprovements: qualityImprovements.length > 0 ? qualityImprovements : ['Routine maintenance only'],
    confidence: 88 + Math.round(Math.random() * 10),
  };
};

// ===========================================
// GENERATE ALL PREDICTIONS
// ===========================================

export const generateAllPredictions = (data: CityData): AllPredictions => {
  const waterSupply = predictWaterSupply(data);
  const traffic = predictTraffic(data, waterSupply);
  const foodPrice = predictFoodPrice(data, waterSupply);
  const energyPrice = predictEnergyPrice(data);
  const publicServices = predictPublicServices(data);

  return {
    waterSupply,
    traffic,
    foodPrice,
    energyPrice,
    publicServices,
  };
};

// ===========================================
// GENERATE FINAL RECOMMENDATIONS
// ===========================================

export const generateFinalRecommendations = (
  data: CityData,
  predictions: AllPredictions
): PolicyOption[] => {
  const options: PolicyOption[] = [];
  const { waterSupply, traffic, foodPrice, energyPrice, publicServices } = predictions;

  // Priority 1: Water Supply Crisis
  if (waterSupply.status === 'critical' || waterSupply.status === 'shortage') {
    options.push({
      id: 1,
      title: waterSupply.status === 'critical' ? 'Emergency Water Rationing' : 'Water Conservation Advisory',
      description: waterSupply.status === 'critical' 
        ? `Implement strict water rationing for ${waterSupply.shortageDuration}. Limit supply to essential services.`
        : `Issue water conservation advisory. Reduce non-essential water usage.`,
      impact: `Shortage Level: ${waterSupply.shortageLevel}% | Duration: ${waterSupply.shortageDuration}`,
      instructionText: waterSupply.status === 'critical'
        ? `🚨 WATER EMERGENCY: Water supply restricted. Supply available only 4 hours/day for next ${waterSupply.shortageDuration}. Store water for essential use.`
        : `💧 WATER ADVISORY: Reduce water usage. Avoid car washing and lawn watering for next 15 days.`,
      category: 'Water Supply',
      basedOn: ['Weather (Rainfall)', 'Water Reservoir Levels'],
    });
  }

  // Priority 2: Traffic Advisory
  if (traffic.congestionLevel > 60 || traffic.roadsToAvoid.length > 0) {
    options.push({
      id: 2,
      title: 'Traffic Management & Road Advisory',
      description: `Congestion at ${traffic.congestionLevel}%. ${traffic.weatherImpact}. ${traffic.busImpact}.`,
      impact: `Affected Areas: ${traffic.affectedAreas.join(', ')} | Peak Hours: ${traffic.peakHours}`,
      instructionText: traffic.roadsToAvoid.length > 0
        ? `🚗 TRAFFIC ALERT: Avoid ${traffic.roadsToAvoid.join(', ')}. Use alternate routes. ${traffic.weatherImpact}`
        : `🚦 TRAFFIC UPDATE: Expect delays in ${traffic.affectedAreas.join(', ')} during peak hours.`,
      category: 'Transportation',
      basedOn: ['Weather Prediction', 'Bus Operations Data', 'Vehicle Flow Data'],
    });
  }

  // Priority 3: Food Price Warning
  if (foodPrice.priceChangePercent > 10) {
    options.push({
      id: 3,
      title: 'Food Supply & Price Advisory',
      description: `Expected ${foodPrice.priceChangePercent}% price increase. ${foodPrice.supplyStatus}.`,
      impact: `Affected Items: ${foodPrice.affectedItems.join(', ')} | Timeline: ${foodPrice.timeline}`,
      instructionText: `🌾 FOOD ADVISORY: Prices expected to rise ${foodPrice.priceChangePercent}% for ${foodPrice.affectedItems.join(', ')}. Stock essential items. ${foodPrice.reason}`,
      category: 'Agriculture & Food',
      basedOn: ['Rainfall Data (12 months)', 'Supply Chain Data', 'Stock Levels'],
    });
  }

  // Priority 4: Energy Price Notice
  if (energyPrice.priceChangePercent > 5) {
    options.push({
      id: options.length + 1,
      title: 'Energy Price & Conservation Notice',
      description: `Electricity rates expected to increase from ₹${energyPrice.currentRate}/unit to ₹${energyPrice.predictedRate}/unit.`,
      impact: `Price Increase: ${energyPrice.priceChangePercent}% | Timeline: ${energyPrice.timeline}`,
      instructionText: `⚡ ENERGY NOTICE: Electricity rates increasing by ${energyPrice.priceChangePercent}% in ${energyPrice.timeline}. New rate: ₹${energyPrice.predictedRate}/unit. Reduce consumption.`,
      category: 'Energy',
      basedOn: ['Previous Year Energy Usage', 'Current Demand', 'Grid Capacity'],
    });
  }

  // Priority 5: Public Services (Storm cleanup, road maintenance)
  if (publicServices.cleanupNeeded || publicServices.qualityImprovements.length > 1) {
    options.push({
      id: options.length + 1,
      title: publicServices.cleanupNeeded ? 'City Cleanup & Road Improvement' : 'Road Maintenance Plan',
      description: publicServices.cleanupNeeded
        ? `${publicServices.cleanupReason}. Cleanup duration: ${publicServices.cleanupDuration}.`
        : publicServices.roadMaintenancePlan,
      impact: `Timeline: ${publicServices.cleanupNeeded ? publicServices.cleanupDuration : publicServices.maintenanceTimeline} | Work: ${publicServices.qualityImprovements.slice(0, 2).join(', ')}`,
      instructionText: publicServices.cleanupNeeded
        ? `🏗️ CITY CLEANUP: Road repair and cleanup in progress for next ${publicServices.cleanupDuration}. Expect traffic diversions. Areas: ${publicServices.qualityImprovements.join(', ')}.`
        : `🔧 MAINTENANCE: Road improvements scheduled. Work includes: ${publicServices.qualityImprovements.join(', ')}. Duration: ${publicServices.maintenanceTimeline}.`,
      category: 'Public Services',
      basedOn: ['Storm/Flood Data', 'Road Condition Reports', 'Maintenance Backlog'],
    });
  }

  // Ensure at least 3 options
  if (options.length < 3) {
    if (!options.find(o => o.category === 'Transportation')) {
      options.push({
        id: options.length + 1,
        title: 'Continue Normal Traffic Monitoring',
        description: 'Traffic flow within acceptable levels. Continue regular monitoring.',
        impact: 'Status: Normal | All routes operational',
        instructionText: '✅ TRAFFIC: All roads clear. Normal traffic flow expected today.',
        category: 'Transportation',
        basedOn: ['Current Traffic Data'],
      });
    }
    if (!options.find(o => o.category === 'General')) {
      options.push({
        id: options.length + 1,
        title: 'All Systems Operational',
        description: 'City services running normally. No critical issues detected.',
        impact: 'Status: Normal | All services operational',
        instructionText: '✅ CITY STATUS: All systems normal. Have a great day!',
        category: 'General',
        basedOn: ['All Data Sources'],
      });
    }
  }

  // Limit to top 3 most critical
  return options.slice(0, 3);
};

// ===========================================
// CRISIS TYPE DETERMINATION
// ===========================================

export const getCrisisType = (data: CityData, predictions: AllPredictions): { type: string; severity: 'low' | 'medium' | 'high' | 'critical' } => {
  const { waterSupply, traffic, foodPrice, energyPrice, publicServices } = predictions;

  if (waterSupply.status === 'critical') {
    return { type: 'WATER_CRISIS', severity: 'critical' };
  }
  if (foodPrice.priceChangePercent > 25) {
    return { type: 'FOOD_SUPPLY_CRISIS', severity: 'critical' };
  }
  if (waterSupply.status === 'shortage' || foodPrice.priceChangePercent > 15) {
    return { type: 'SUPPLY_SHORTAGE', severity: 'high' };
  }
  if (traffic.congestionLevel > 80) {
    return { type: 'TRAFFIC_GRIDLOCK', severity: 'high' };
  }
  if (publicServices.cleanupNeeded) {
    return { type: 'POST_STORM_RECOVERY', severity: 'medium' };
  }
  if (energyPrice.priceChangePercent > 10 || traffic.congestionLevel > 60) {
    return { type: 'RESOURCE_STRESS', severity: 'medium' };
  }
  return { type: 'NORMAL', severity: 'low' };
};

// ===========================================
// MOCK DECISION HISTORY
// ===========================================

export const generateMockDecisionHistory = (): PolicyDecision[] => [
  {
    id: crypto.randomUUID(),
    alertType: 'WATER_SHORTAGE',
    aiOptions: [],
    selectedOptionId: 1,
    status: 'PUBLISHED',
    approvedBy: 'Admin',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    alertType: 'TRAFFIC_ADVISORY',
    aiOptions: [],
    selectedOptionId: 2,
    status: 'PUBLISHED',
    approvedBy: 'Admin',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
