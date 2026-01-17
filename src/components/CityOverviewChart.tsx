import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useCityContext } from '@/contexts/CityContext';

const CityOverviewChart = () => {
  const { data: cityData } = useCityContext();

  const chartData = [
    { 
      name: 'Water Supply', 
      value: cityData.publicServices.waterSupplyLevel, 
      color: 'hsl(199 89% 48%)',
      status: cityData.publicServices.waterSupplyLevel > 60 ? 'Good' : cityData.publicServices.waterSupplyLevel > 40 ? 'Moderate' : 'Low'
    },
    { 
      name: 'Energy Grid', 
      value: cityData.energy.gridStability, 
      color: 'hsl(38 92% 50%)',
      status: cityData.energy.gridStability > 90 ? 'Stable' : cityData.energy.gridStability > 80 ? 'Moderate' : 'Stressed'
    },
    { 
      name: 'Transport', 
      value: Math.round((cityData.transportation.busesOperating / cityData.transportation.totalBuses) * 100), 
      color: 'hsl(158 64% 40%)',
      status: cityData.transportation.busesOperating > 200 ? 'Good' : 'Reduced'
    },
    { 
      name: 'Supply Chain', 
      value: Math.round(cityData.agriculture.supplyChainEfficiency), 
      color: 'hsl(217 91% 60%)',
      status: cityData.agriculture.supplyChainEfficiency > 80 ? 'Efficient' : cityData.agriculture.supplyChainEfficiency > 60 ? 'Moderate' : 'Delayed'
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">Value: {Math.round(item.value)}%</p>
          <p className="text-sm" style={{ color: item.color }}>Status: {item.status}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border bg-card p-6 card-shadow"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground">City Systems Overview</h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {chartData.map((item) => (
          <div 
            key={item.name}
            className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
          >
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}:</span>
            <span className="text-xs font-medium text-foreground">{item.status}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CityOverviewChart;
