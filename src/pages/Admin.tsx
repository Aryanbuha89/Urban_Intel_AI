import { motion } from 'framer-motion';
import { Brain, Shield, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import LoginForm from '@/components/LoginForm';
import CrisisIndicator from '@/components/CrisisIndicator';
import RecommendationCard from '@/components/RecommendationCard';
import DecisionHistory from '@/components/DecisionHistory';
import DataDashboard from '@/components/admin/DataDashboard';
import PredictionsPanel from '@/components/admin/PredictionsPanel';
import ReportGenerator from '@/components/admin/ReportGenerator';
import { useCityContext } from '@/contexts/CityContext';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PolicyOption } from '@/lib/mockData';

const Admin = () => {
  const {
    isLoggedIn,
    currentCrisis,
    recommendations,
    decisionHistory,
    approveRecommendation
  } = useCityContext();

  const [approvedOptionId, setApprovedOptionId] = useState<number | null>(null);

  const handleApprove = (option: PolicyOption) => {
    approveRecommendation(option);
    setApprovedOptionId(option.id);
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
          <TabsList className="grid w-full grid-cols-3 mb-6 h-14 p-2 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border-3 border-primary/40 shadow-lg">
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
          </TabsList>

          <TabsContent value="data">
            <DataDashboard />
          </TabsContent>

          <TabsContent value="predictions">
            <PredictionsPanel />
          </TabsContent>

          <TabsContent value="recommendations">
            {/* AI Decision Hub */}
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

              {/* Recommendation Cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((option, index) => (
                  <RecommendationCard
                    key={option.id}
                    option={option}
                    index={index}
                    onApprove={handleApprove}
                    isApproved={approvedOptionId === option.id}
                  />
                ))}
              </div>

              {/* Report Generator */}
              <div className="mt-8">
                <ReportGenerator />
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Decision History */}
        <DecisionHistory decisions={decisionHistory} />

        {/* Footer */}
        <footer className="mt-12 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          <p>UrbanIntel Admin Portal • Secure Government Access</p>
          <p className="mt-2">All decisions are logged and auditable</p>
        </footer>
      </main>
    </div>
  );
};

export default Admin;
