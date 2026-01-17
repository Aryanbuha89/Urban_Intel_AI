import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Loader2, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCityContext } from '@/contexts/CityContext';
import jsPDF from 'jspdf';

const ReportGenerator = () => {
  const { data, predictions, recommendations, decisionHistory } = useCityContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Helper function to add text with word wrap
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6) => {
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(line, x, yPos);
          yPos += lineHeight;
        });
        return yPos;
      };

      // Title
      pdf.setFontSize(22);
      pdf.setTextColor(13, 110, 110); // Primary color
      pdf.text('UrbanIntel - Government Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Divider
      pdf.setDrawColor(200);
      pdf.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;

      // Section: Current Data Summary
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text('1. Current City Data', 20, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(60);

      // Weather
      pdf.setFont('helvetica', 'bold');
      pdf.text('Weather:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Temperature: ${data.weather.currentTemperature}°C, Humidity: ${data.weather.humidity}%, Wind: ${data.weather.windSpeed} km/h`, 25, yPos, 160);
      addWrappedText(`Annual Rainfall: ${data.weather.rainfallLast12Months.reduce((a, b) => a + b, 0)}mm (12 months)`, 25, yPos, 160);
      if (data.weather.recentStormOrFlood) {
        addWrappedText('⚠️ Recent storm/flood event detected', 25, yPos, 160);
      }
      yPos += 4;

      // Transportation
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transportation:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Buses Operating: ${data.transportation.busesOperating}/${data.transportation.totalBuses}`, 25, yPos, 160);
      addWrappedText(`Avg Vehicles/Hour: ${data.transportation.avgVehiclesPerHour.toLocaleString()}`, 25, yPos, 160);
      if (data.transportation.busRoutesCongested.length > 0) {
        addWrappedText(`Congested Routes: ${data.transportation.busRoutesCongested.join(', ')}`, 25, yPos, 160);
      }
      yPos += 4;

      // Agriculture
      pdf.setFont('helvetica', 'bold');
      pdf.text('Agriculture Supply Chain:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Crop Yield (Last Year): ${Math.round(data.agriculture.cropYieldLastYear)}% of normal`, 25, yPos, 160);
      addWrappedText(`Stock Level: ${Math.round(data.agriculture.currentStockLevel)}%, Supply Chain Efficiency: ${Math.round(data.agriculture.supplyChainEfficiency)}%`, 25, yPos, 160);
      yPos += 4;

      // Energy
      pdf.setFont('helvetica', 'bold');
      pdf.text('Energy:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Current Usage: ${data.energy.currentUsageMW} MW, Peak Demand: ${data.energy.peakDemandMW} MW`, 25, yPos, 160);
      addWrappedText(`Grid Stability: ${data.energy.gridStability}%, Renewable: ${data.energy.renewablePercentage}%`, 25, yPos, 160);
      yPos += 4;

      // Public Services
      pdf.setFont('helvetica', 'bold');
      pdf.text('Public Services:', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Roads Needing Repair: ${data.publicServices.roadsNeedingRepair}, Water Supply: ${data.publicServices.waterSupplyLevel}%`, 25, yPos, 160);
      addWrappedText(`Emergency Response Time: ${data.publicServices.emergencyResponseTime} minutes`, 25, yPos, 160);
      yPos += 10;

      // Section: AI Predictions
      if (yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text('2. AI Predictions', 20, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(60);

      // Water Supply
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Water Supply - Status: ${predictions.waterSupply.status.toUpperCase()}`, 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Shortage Level: ${predictions.waterSupply.shortageLevel}%, Duration: ${predictions.waterSupply.shortageDuration}`, 25, yPos, 160);
      addWrappedText(`Reason: ${predictions.waterSupply.reason}`, 25, yPos, 160);
      addWrappedText(`Confidence: ${predictions.waterSupply.confidence}%`, 25, yPos, 160);
      yPos += 4;

      // Traffic
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Traffic - Congestion: ${predictions.traffic.congestionLevel}%`, 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Peak Hours: ${predictions.traffic.peakHours}`, 25, yPos, 160);
      if (predictions.traffic.roadsToAvoid.length > 0) {
        addWrappedText(`Roads to Avoid: ${predictions.traffic.roadsToAvoid.join(', ')}`, 25, yPos, 160);
      }
      addWrappedText(`Weather Impact: ${predictions.traffic.weatherImpact}`, 25, yPos, 160);
      addWrappedText(`Bus Impact: ${predictions.traffic.busImpact}`, 25, yPos, 160);
      addWrappedText(`Confidence: ${predictions.traffic.confidence}%`, 25, yPos, 160);
      yPos += 4;

      // Food Price
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Food Prices - Change: ${predictions.foodPrice.priceChangePercent > 0 ? '+' : ''}${predictions.foodPrice.priceChangePercent}%`, 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Supply Status: ${predictions.foodPrice.supplyStatus}`, 25, yPos, 160);
      if (predictions.foodPrice.affectedItems.length > 0) {
        addWrappedText(`Affected Items: ${predictions.foodPrice.affectedItems.join(', ')}`, 25, yPos, 160);
      }
      addWrappedText(`Reason: ${predictions.foodPrice.reason}`, 25, yPos, 160);
      addWrappedText(`Confidence: ${predictions.foodPrice.confidence}%`, 25, yPos, 160);
      yPos += 4;

      // Energy Price
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Energy Prices - Change: ${predictions.energyPrice.priceChangePercent > 0 ? '+' : ''}${predictions.energyPrice.priceChangePercent}%`, 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Current Rate: ₹${predictions.energyPrice.currentRate}/unit → Predicted: ₹${predictions.energyPrice.predictedRate}/unit`, 25, yPos, 160);
      addWrappedText(`Reason: ${predictions.energyPrice.reason}`, 25, yPos, 160);
      addWrappedText(`Confidence: ${predictions.energyPrice.confidence}%`, 25, yPos, 160);
      yPos += 4;

      // Public Services
      pdf.setFont('helvetica', 'bold');
      pdf.text('Public Services Forecast', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 6;
      addWrappedText(`Maintenance Plan: ${predictions.publicServices.roadMaintenancePlan}`, 25, yPos, 160);
      addWrappedText(`Timeline: ${predictions.publicServices.maintenanceTimeline}`, 25, yPos, 160);
      if (predictions.publicServices.cleanupNeeded) {
        addWrappedText(`⚠️ Cleanup Required: ${predictions.publicServices.cleanupReason}`, 25, yPos, 160);
        addWrappedText(`Duration: ${predictions.publicServices.cleanupDuration}`, 25, yPos, 160);
      }
      addWrappedText(`Confidence: ${predictions.publicServices.confidence}%`, 25, yPos, 160);
      yPos += 10;

      // Section: Recommendations
      if (yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text('3. AI Recommendations', 20, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      recommendations.forEach((rec, index) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0);
        pdf.text(`Option ${index + 1}: ${rec.title}`, 20, yPos);
        yPos += 6;

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60);
        addWrappedText(`Category: ${rec.category}`, 25, yPos, 160);
        addWrappedText(`Description: ${rec.description}`, 25, yPos, 160);
        addWrappedText(`Impact: ${rec.impact}`, 25, yPos, 160);
        addWrappedText(`Public Message: ${rec.instructionText}`, 25, yPos, 160);
        addWrappedText(`Based On: ${rec.basedOn.join(', ')}`, 25, yPos, 160);
        yPos += 6;
      });

      // Section: Decision History
      if (yPos > 200) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text('4. Recent Decisions', 20, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      const recentDecisions = decisionHistory.slice(0, 5);
      recentDecisions.forEach((decision) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0);
        pdf.text(`${decision.alertType} - ${new Date(decision.publishedAt || decision.createdAt).toLocaleDateString()}`, 20, yPos);
        yPos += 6;

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60);
        addWrappedText(`Status: ${decision.status}, Approved By: ${decision.approvedBy || 'N/A'}`, 25, yPos, 160);

        const selectedOption = decision.aiOptions.find(o => o.id === decision.selectedOptionId);
        if (selectedOption) {
          addWrappedText(`Decision: ${selectedOption.title}`, 25, yPos, 160);
        }
        yPos += 4;
      });

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(
          `UrbanIntel Government Report - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      pdf.save(`UrbanIntel_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
