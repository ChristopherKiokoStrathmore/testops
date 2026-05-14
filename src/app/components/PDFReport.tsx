import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TestLog } from '../lib/supabase';
import { FileDown, FileType } from 'lucide-react';

interface PDFReportProps {
  logs: TestLog[];
  dateRange: string;
}

export function PDFReport({ logs, dateRange }: PDFReportProps) {
  
  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 0;
    
    // ========== HEADER SECTION ==========
    // Modern header with clean design
    doc.setFillColor(16, 185, 129); // Emerald
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FINTECH TESTING MANAGEMENT REPORT', pageWidth / 2, 12, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(dateRange, pageWidth / 2, 19, { align: 'center' });
    
    // Generated timestamp
    doc.setFontSize(7);
    const timestamp = new Date().toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
    doc.text(`Generated: ${timestamp}`, pageWidth / 2, 26, { align: 'center' });
    
    yPos = 35;
    
    // ========== EXECUTIVE SUMMARY SECTION ==========
    const summary = calculateSummary(logs);
    
    // Section title
    doc.setFillColor(31, 41, 55);
    doc.rect(10, yPos, pageWidth - 20, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', 15, yPos + 5);
    
    yPos += 10;
    
    // KPI Cards
    const cardWidth = (pageWidth - 50) / 4;
    const cards = [
      { 
        label: 'Total Tests', 
        value: summary.totalTests.toString(), 
        color: [99, 102, 241],
        sublabel: 'Tests Executed'
      },
      { 
        label: 'Overall Pass Rate', 
        value: `${summary.overallPassRate}%`, 
        color: summary.overallPassRate >= 80 ? [34, 197, 94] : summary.overallPassRate >= 60 ? [251, 191, 36] : [239, 68, 68],
        sublabel: `${summary.passedTests}/${summary.totalTests} Passed`
      },
      { 
        label: 'Unique Testers', 
        value: summary.uniqueTesters.toString(), 
        color: [168, 85, 247],
        sublabel: 'Active Users'
      },
      { 
        label: 'Critical Failures', 
        value: summary.failedWithoutPrompt.toString(), 
        color: summary.failedWithoutPrompt > 0 ? [239, 68, 68] : [34, 197, 94],
        sublabel: 'No Prompt Given'
      },
    ];
    
    cards.forEach((card, index) => {
      const x = 15 + (index * (cardWidth + 5));
      
      // Card background with border
      doc.setDrawColor(card.color[0], card.color[1], card.color[2]);
      doc.setLineWidth(0.5);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, yPos, cardWidth, 20, 2, 2, 'FD');
      
      // Colored top bar
      doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      doc.roundedRect(x, yPos, cardWidth, 4, 2, 2, 'F');
      
      // Value (large)
      doc.setTextColor(card.color[0], card.color[1], card.color[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(card.value, x + cardWidth / 2, yPos + 11, { align: 'center' });
      
      // Label
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(card.label.toUpperCase(), x + cardWidth / 2, yPos + 16, { align: 'center' });
      
      // Sublabel
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text(card.sublabel, x + cardWidth / 2, yPos + 19, { align: 'center' });
    });
    
    yPos += 25;
    
    // ========== CATEGORY PERFORMANCE SECTION ==========
    doc.setFillColor(30, 41, 59);
    doc.rect(10, yPos, pageWidth - 20, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CATEGORY PERFORMANCE BREAKDOWN', 15, yPos + 5.5);
    
    yPos += 11;
    
    const categoryStats = calculateCategoryStats(logs);
    const categoryCardWidth = (pageWidth - 55) / 4;
    const categoryColors = [
      [251, 191, 36], // Yellow/Orange for M-pesa
      [239, 68, 68],  // Red for Safaricom
      [251, 191, 36], // Yellow/Orange for USSD
      [239, 68, 68],  // Red for STK
    ];
    
    categoryStats.forEach((cat, index) => {
      const x = 15 + (index * (categoryCardWidth + 7));
      
      // Determine color based on pass rate
      let baseColor;
      if (cat.passRate >= 80) {
        baseColor = [34, 197, 94]; // Green
      } else if (cat.passRate >= 50) {
        baseColor = [251, 191, 36]; // Yellow/Orange
      } else {
        baseColor = [239, 68, 68]; // Red
      }
      
      // Card with shadow effect
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(x + 1, yPos + 1, categoryCardWidth, 26, 3, 3, 'F');
      
      // Card background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.8);
      doc.roundedRect(x, yPos, categoryCardWidth, 26, 3, 3, 'FD');
      
      // Category name bar with color
      doc.setFillColor(baseColor[0], baseColor[1], baseColor[2]);
      doc.roundedRect(x, yPos, categoryCardWidth, 7, 3, 3, 'F');
      doc.setFillColor(baseColor[0], baseColor[1], baseColor[2]);
      doc.rect(x, yPos + 3.5, categoryCardWidth, 3.5, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(cat.name.toUpperCase(), x + categoryCardWidth / 2, yPos + 5, { align: 'center' });
      
      // Pass Rate (large and centered)
      doc.setTextColor(baseColor[0], baseColor[1], baseColor[2]);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cat.passRate}%`, x + categoryCardWidth / 2, yPos + 17, { align: 'center' });
      
      // Stats with better spacing
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Passed: ${cat.passed}/${cat.total}`, x + categoryCardWidth / 2, yPos + 21.5, { align: 'center' });
      doc.setFontSize(6);
      doc.text(`Critical Failures: ${cat.failedNoPrompt}`, x + categoryCardWidth / 2, yPos + 24.5, { align: 'center' });
    });
    
    yPos += 30;
    
    // ========== HOURLY DETAILED REPORT ==========
    doc.setFillColor(30, 41, 59);
    doc.rect(10, yPos, pageWidth - 20, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('HOURLY PERFORMANCE ANALYSIS', 15, yPos + 5.5);
    
    yPos += 11;
    
    // Process logs by hour
    const hourlyData = processLogsForReport(logs);
    
    // Table data
    const tableData: any[] = [];
    
    hourlyData.forEach((hour) => {
      const row = [
        hour.time,
        hour.mpesa.passRate,
        hour.safaricom.passRate,
        hour.ussd.passRate,
        hour.stk.passRate,
        hour.totalTesters,
        hour.totalPasses,
        hour.totalFails,
        hour.mpesa.failedWithoutPrompt,
        hour.safaricom.failedWithoutPrompt,
        hour.ussd.failedWithoutPrompt,
        hour.stk.failedWithoutPrompt,
      ];
      tableData.push(row);
    });
    
    // Create table with better styling
    autoTable(doc, {
      startY: yPos,
      head: [
        [
          { content: 'TIME', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [30, 41, 59] } },
          { content: 'M-PESA', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [30, 41, 59] } },
          { content: 'SAFARICOM', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [30, 41, 59] } },
          { content: 'USSD', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [30, 41, 59] } },
          { content: 'STK', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', fillColor: [30, 41, 59] } },
          { content: 'TESTER ACTIVITY', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [30, 41, 59] } },
          { content: 'CRITICAL FAILURES (NO PROMPT)', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fillColor: [30, 41, 59] } },
        ],
        [
          { content: 'Testers', styles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'Passed', styles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'Failed', styles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'M-PESA', styles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'SAFARICOM', styles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'USSD', styles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'STK', styles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' } },
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        lineWidth: 0.8,
        lineColor: [255, 255, 255],
        cellPadding: 3.5,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        lineWidth: 0.8,
        lineColor: [180, 180, 180],
        cellPadding: 3.5,
        fontStyle: 'bold',
        fillColor: [255, 255, 255],
      },
      styles: {
        overflow: 'linebreak',
        halign: 'center',
        cellWidth: 'auto',
      },
      columnStyles: {
        0: { fillColor: [30, 41, 59], fontStyle: 'bold', textColor: [255, 255, 255], cellWidth: 22 },
        1: { fillColor: [255, 255, 255], cellWidth: 22 },
        2: { fillColor: [255, 255, 255], cellWidth: 26 },
        3: { fillColor: [255, 255, 255], cellWidth: 22 },
        4: { fillColor: [255, 255, 255], cellWidth: 22 },
        5: { fillColor: [250, 250, 250], textColor: [0, 0, 0], cellWidth: 20 },
        6: { fillColor: [250, 250, 250], textColor: [0, 0, 0], cellWidth: 20 },
        7: { fillColor: [250, 250, 250], textColor: [0, 0, 0], cellWidth: 20 },
        8: { fillColor: [250, 250, 250], textColor: [0, 0, 0], cellWidth: 20 },
        9: { fillColor: [250, 250, 250], textColor: [0, 0, 0], cellWidth: 20 },
        10: { fillColor: [250, 250, 250], textColor: [0, 0, 0], cellWidth: 20 },
        11: { fillColor: [250, 250, 250], textColor: [0, 0, 0], cellWidth: 20 },
      },
      didParseCell: function (data) {
        // Color coding for pass rates (columns 1-4)
        if (data.column.index >= 1 && data.column.index <= 4 && data.section === 'body') {
          const value = data.cell.text[0];
          if (value === '100%') {
            data.cell.styles.fillColor = [34, 197, 94]; // Bright Green
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
          } else if (value === '0%') {
            data.cell.styles.fillColor = [240, 240, 240]; // Light gray
            data.cell.styles.textColor = [120, 120, 120];
            data.cell.styles.fontStyle = 'bold';
          } else if (value === 'N/A') {
            data.cell.styles.fillColor = [240, 240, 240]; // Light gray
            data.cell.styles.textColor = [120, 120, 120];
            data.cell.styles.fontStyle = 'normal';
          } else {
            // Partial pass rate - Red
            data.cell.styles.fillColor = [239, 68, 68]; // Bright Red
            data.cell.styles.textColor = [255, 255, 255];
            data.cell.styles.fontStyle = 'bold';
          }
        }
        
        // Color coding for critical failures (columns 8-11)
        if (data.column.index >= 8 && data.column.index <= 11 && data.section === 'body') {
          const value = parseInt(data.cell.text[0]);
          if (value > 0) {
            data.cell.styles.fillColor = [239, 68, 68]; // Bright Red background
            data.cell.styles.textColor = [255, 255, 255]; // White text
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.fillColor = [250, 250, 250]; // Very light gray background
            data.cell.styles.textColor = [120, 120, 120]; // Gray text
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });
    
    // ========== FOOTER ==========
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.5);
      doc.line(10, doc.internal.pageSize.height - 12, pageWidth - 10, doc.internal.pageSize.height - 12);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Fintech Testing Management System - Confidential',
        pageWidth / 2,
        doc.internal.pageSize.height - 8,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 15,
        doc.internal.pageSize.height - 8,
        { align: 'right' }
      );
    }
    
    // Save PDF
    const fileName = `FinTech_Testing_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };
  
  const calculateSummary = (logs: TestLog[]) => {
    const totalTests = logs.length;
    const passedTests = logs.filter(log => !log.is_failed).length;
    const failedTests = logs.filter(log => log.is_failed).length;
    const overallPassRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const uniqueTesters = new Set(logs.map(log => log.profiles?.phone_number).filter(Boolean)).size;
    
    return {
      totalTests,
      passedTests,
      failedTests,
      overallPassRate,
      uniqueTesters,
    };
  };
  
  const calculateCategoryStats = (logs: TestLog[]) => {
    const categories = ['M-pesa', 'Safaricom', 'USSD', 'STK'];
    
    return categories.map(cat => {
      const categoryLogs = logs.filter(log => log.category === cat);
      const total = categoryLogs.length;
      const passed = categoryLogs.filter(log => !log.is_failed).length;
      const failed = categoryLogs.filter(log => log.is_failed).length;
      const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      return {
        name: cat,
        total,
        passed,
        failed,
        passRate,
      };
    });
  };
  
  const processLogsForReport = (logs: TestLog[]) => {
    // Group logs by hour
    const hourlyMap = new Map<string, TestLog[]>();
    
    logs.forEach((log) => {
      const date = new Date(log.created_at);
      const hour = date.getHours();
      const hourKey = `${hour}:00`;
      
      if (!hourlyMap.has(hourKey)) {
        hourlyMap.set(hourKey, []);
      }
      hourlyMap.get(hourKey)!.push(log);
    });
    
    // Process each hour
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hourKey = `${i}:00`;
      const hourLogs = hourlyMap.get(hourKey) || [];
      
      const getCategoryStats = (category: string) => {
        const categoryLogs = hourLogs.filter(log => log.category === category);
        const total = categoryLogs.length;
        const passed = categoryLogs.filter(log => !log.is_failed).length;
        const failed = categoryLogs.filter(log => log.is_failed).length;
        
        return {
          passRate: total > 0 ? `${Math.round((passed / total) * 100)}%` : 'N/A',
          failed: failed,
        };
      };
      
      const mpesa = getCategoryStats('M-pesa');
      const safaricom = getCategoryStats('Safaricom');
      const ussd = getCategoryStats('USSD');
      const stk = getCategoryStats('STK');
      
      const uniqueTesters = new Set(hourLogs.map(log => log.profiles?.phone_number).filter(Boolean)).size;
      const totalPasses = hourLogs.filter(log => !log.is_failed).length;
      const totalFails = hourLogs.filter(log => log.is_failed).length;
      
      return {
        time: i === 0 ? '12AM' : i < 12 ? `${i}AM` : i === 12 ? '12PM' : `${i - 12}PM`,
        mpesa,
        safaricom,
        ussd,
        stk,
        totalTesters: uniqueTesters, // Number of unique people who tested
        totalPasses,
        totalFails,
      };
    });
    
    // Filter to only include hours with data
    return hours.filter(hour => hour.totalTesters > 0);
  };
  
  return (
    <button
      onClick={generatePDF}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all duration-200 text-left group"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-all">
        <FileType className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold text-sm mb-0.5">PDF Report</h4>
        <p className="text-gray-400 text-xs">Professional formatted report</p>
      </div>
    </button>
  );
}
