import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCityContext } from '@/contexts/CityContext';
import type { PolicyOption } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface ReportGeneratorProps {
  llmOptions?: PolicyOption[];
}

const ReportGenerator = ({ llmOptions }: ReportGeneratorProps) => {
  const { data, predictions, recommendations, decisionHistory, userProfile } = useCityContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = 20;

      // Colors
      const primaryColor = [13, 148, 136]; // Teal-600
      const secondaryColor = [30, 41, 59]; // Slate-800
      const accentColor = [249, 115, 22]; // Orange-500
      const lightBg = [248, 250, 252]; // Slate-50

      // Helper: Draw Header
      const drawHeader = () => {
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(0, 0, pageWidth, 40, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(24);
        pdf.setTextColor(255, 255, 255);
        pdf.text('UrbanIntel', margin, 20);

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text('AI-Powered Smart City Report', margin, 28);

        pdf.setFontSize(10);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 15, { align: 'right' });

        yPos = 50;
      };

      // Helper: Draw Section Title
      const drawSectionTitle = (title: string, icon: string = '') => {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          drawHeader();
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.text(title, margin, yPos);

        // Underline
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPos + 3, pageWidth - margin, yPos + 3);

        yPos += 15;
      };

      // Helper: Draw Card
      const drawCard = (x: number, y: number, width: number, height: number, title: string, content: string[], type: 'normal' | 'alert' | 'success' = 'normal') => {
        // Background
        pdf.setFillColor(255, 255, 255);
        if (type === 'alert') pdf.setDrawColor(239, 68, 68); // Red border
        else if (type === 'success') pdf.setDrawColor(34, 197, 94); // Green border
        else pdf.setDrawColor(226, 232, 240); // Gray border

        pdf.roundedRect(x, y, width, height, 3, 3, 'FD');

        // Title strip
        if (type === 'alert') pdf.setFillColor(254, 226, 226);
        else if (type === 'success') pdf.setFillColor(220, 252, 231);
        else pdf.setFillColor(241, 245, 249);

        pdf.rect(x, y, width, 10, 'F');

        // Title text
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        pdf.text(title, x + 5, y + 7);

        // Content
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105); // Slate-600

        let contentY = y + 16;
        content.forEach(line => {
          pdf.text(line, x + 5, contentY);
          contentY += 5;
        });
      };

      // Start Generation
      drawHeader();

      // 1. Executive Summary (City Data)
      drawSectionTitle('City Status Overview');

      const colWidth = (pageWidth - (margin * 3)) / 2;

      // Left Column: Weather & Transport
      drawCard(margin, yPos, colWidth, 40, 'Weather Conditions', [
        `Temp: ${data.weather.currentTemperature}°C | Humidity: ${data.weather.humidity}%`,
        `Wind: ${data.weather.windSpeed} km/h`,
        `Rainfall (12m): ${data.weather.rainfallLast12Months.reduce((a, b) => a + b, 0)}mm`,
        data.weather.recentStormOrFlood ? '! Recent Storm Alert' : 'No Active Storms'
      ]);

      drawCard(margin, yPos + 45, colWidth, 40, 'Transportation Network', [
        `Fleet Status: ${data.transportation.busesOperating}/${data.transportation.totalBuses} Buses`,
        `Traffic Volume: ${data.transportation.avgVehiclesPerHour.toLocaleString()}/hr`,
        `Congestion: ${data.transportation.busRoutesCongested.length > 0
          ? `${data.transportation.busRoutesCongested.length} Routes`
          : 'Minimal'}`
      ]);

      // Right Column: Energy & Public Services
      drawCard(margin + colWidth + margin, yPos, colWidth, 40, 'Energy Grid', [
        `Load: ${data.energy.currentUsageMW} MW / ${data.energy.peakDemandMW} MW`,
        `Grid Stability: ${data.energy.gridStability}%`,
        `Renewables: ${data.energy.renewablePercentage}% Mix`
      ]);

      drawCard(margin + colWidth + margin, yPos + 45, colWidth, 40, 'Public Infrastructure', [
        `Road Repairs Needed: ${data.publicServices.roadsNeedingRepair}`,
        `Water Reserves: ${data.publicServices.waterSupplyLevel}%`,
        `EMS Response: ${data.publicServices.emergencyResponseTime} min`
      ]);

      yPos += 95;

      // 2. AI Intelligence Report
      drawSectionTitle('AI Predictive Analysis');

      const predictHeight = 35;

      // Traffic Prediction
      drawCard(margin, yPos, pageWidth - (margin * 2), predictHeight,
        `Traffic Forecast (Confidence: ${predictions.traffic.confidence}%)`,
        [
          `Status: ${predictions.traffic.congestionLevel}% Congestion Level`,
          `Impact Analysis: ${predictions.traffic.weatherImpact}`,
          `Advisory: ${predictions.traffic.roadsToAvoid.length > 0 ? `Avoid ${predictions.traffic.roadsToAvoid.join(', ')}` : 'Normal Flow'}`
        ],
        predictions.traffic.congestionLevel > 70 ? 'alert' : 'normal'
      );
      yPos += predictHeight + 5;

      // Water Prediction
      drawCard(margin, yPos, pageWidth - (margin * 2), predictHeight,
        `Water Security (Confidence: ${predictions.waterSupply.confidence}%)`,
        [
          `Status: ${predictions.waterSupply.status.toUpperCase()}`,
          `Forecast: ${predictions.waterSupply.reason}`,
          `Duration: ${predictions.waterSupply.shortageDuration}`
        ],
        predictions.waterSupply.status === 'critical' ? 'alert' : 'normal'
      );
      yPos += predictHeight + 5;

      // Energy Prediction
      drawCard(margin, yPos, pageWidth - (margin * 2), predictHeight,
        `Energy Pricing Model (Confidence: ${predictions.energyPrice.confidence}%)`,
        [
          `Trend: ${predictions.energyPrice.priceChangePercent > 0 ? '+' : ''}${predictions.energyPrice.priceChangePercent}% Change`,
          `Rate Forecast: ${predictions.energyPrice.currentRate} -> ${predictions.energyPrice.predictedRate}`,
          `Driver: ${predictions.energyPrice.reason}`
        ],
        'success'
      );
      yPos += predictHeight + 15;

      // 3. Recommendations
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        drawHeader();
      }
      drawSectionTitle('Strategic Recommendations');

      const effectiveRecommendations = llmOptions && llmOptions.length > 0 ? llmOptions : recommendations;

      effectiveRecommendations.forEach((rec, i) => {
        if (yPos > pageHeight - 50) {
          pdf.addPage();
          drawHeader();
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${i + 1}. ${rec.title}`, margin, yPos);
        yPos += 5;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);

        const descLines = pdf.splitTextToSize(rec.description, pageWidth - (margin * 2));
        pdf.text(descLines, margin, yPos);
        yPos += (descLines.length * 5) + 2;

        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Impact: ${rec.impact} | Category: ${rec.category}`, margin, yPos);

        yPos += 10;
        pdf.setDrawColor(230);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      });

      // 4. Decision Log
      if (decisionHistory.length > 0) {
        if (yPos > pageHeight - 60) {
          pdf.addPage();
          drawHeader();
        }
        drawSectionTitle('Recent Policy Decisions');

        const pastResolutions = decisionHistory.slice(0, 5);
        pastResolutions.forEach((dec) => {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(0);
          pdf.text(`${new Date(dec.publishedAt || dec.createdAt).toLocaleDateString()} - ${dec.alertType}`, margin, yPos);

          pdf.setFont('helvetica', 'normal');
          pdf.text(`Status: ${dec.status} (Approved by ${dec.approvedBy})`, margin + 80, yPos);

          yPos += 6;
        });
      }

      // Footer (All Pages)
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');

        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`UrbanIntel Official Document | Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
      }

      // Save
      pdf.save(`UrbanIntel_Premium_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      // Database Save (Keep existing logic)
      if (userProfile?.role === 'admin') {
        // ... existing DB save logic ...
        const reportContent = {
          generatedAt: new Date().toISOString(),
          weather: data.weather,
          predictions: predictions,
          recommendations: effectiveRecommendations.map(r => r.title),
          decisions: decisionHistory.slice(0, 5).map(d => ({ id: d.id, status: d.status }))
        };

        const { error } = await supabase.from('reports').insert({
          title: `UrbanIntel Report - ${new Date().toLocaleDateString()}`,
          content: JSON.stringify(reportContent, null, 2),
          category: 'General',
          admin_id: (await supabase.auth.getUser()).data.user?.id
        });

        if (error) console.error('DB Report Save Error:', error);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a comprehensive PDF report including all current data, AI predictions,
            recommendations, and decision history.
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              Current city data snapshot
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              All AI predictions with confidence levels
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              Recommended actions and rationale
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              Decision history and audit trail
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Calendar className="h-3 w-3" />
            Report generated with timestamp: {new Date().toLocaleString()}
          </div>

          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportGenerator;
