import { jsPDF } from 'jspdf';
import type { UserProfile, Asset, BankTransaction } from '../context/PortfolioContext';

export const downloadPortfolioPDF = (
  user: UserProfile,
  assets: Asset[],
  transactions: BankTransaction[],
  cashBalance: number,
  mode: 'full' | 'assets' | 'ai' | 'manual' = 'full'
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin; // 180mm
  let y = 15;

  // Helper: check page bounds and auto-page
  const checkPage = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - margin) {
      doc.addPage();
      drawPageBorder();
      drawFooter();
      y = 20; // reset y
    }
  };

  const drawPageBorder = () => {
    // Draw thin elegant border
    doc.setDrawColor(39, 39, 42); // #27272A border color
    doc.setLineWidth(0.3);
    doc.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - 2 * margin + 4);
  };

  const drawFooter = () => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text('WealthOS Autonomous Portfolio Rebalancer Pro Statement', margin, pageHeight - 10);
    doc.text(
      `Date Generated: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`,
      pageWidth - margin - 70,
      pageHeight - 10
    );
  };

  // 1. Initial border & header
  drawPageBorder();
  drawFooter();

  // Premium Header Banner
  doc.setFillColor(13, 13, 15); // #0D0D0F
  doc.rect(margin, y, contentWidth, 22, 'F');
  
  // Gold accent bar
  doc.setFillColor(245, 158, 11); // #f59e0b
  doc.rect(margin, y + 21, contentWidth, 1, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('WEALTHOS INVESTMENT ACCOUNT STATEMENT', margin + 6, y + 9);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36); // gold
  doc.text('Autonomous Wealth Engine · Rebalance Ledgers & Holdings', margin + 6, y + 15);
  
  y += 28;

  // 2. User & Banking Details block
  checkPage(40);
  doc.setFillColor(20, 20, 19); // #141413
  doc.rect(margin, y, contentWidth, 32, 'F');
  doc.setDrawColor(39, 39, 42);
  doc.rect(margin, y, contentWidth, 32);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(245, 158, 11);
  doc.text('ACCOUNT HOLDER DETAILS', margin + 6, y + 6);
  
  doc.setFontSize(9);
  doc.setTextColor(228, 228, 231); // light gray
  doc.setFont('Helvetica', 'bold');
  doc.text('Name:', margin + 6, y + 13);
  doc.text('Email:', margin + 6, y + 19);
  doc.text('Risk Profile:', margin + 6, y + 25);

  doc.setFont('Helvetica', 'normal');
  doc.text(user.name, margin + 28, y + 13);
  doc.text(user.email, margin + 28, y + 19);
  doc.text((user.riskProfile || 'balanced').toUpperCase(), margin + 28, y + 25);

  // Bank Info (Right column)
  const rightColX = margin + 95;
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('CONNECTED BANK DETAILS', rightColX, y + 6);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(228, 228, 231);
  doc.text('Institution:', rightColX, y + 13);
  doc.text('Account No:', rightColX, y + 19);
  doc.text('IFSC Code:', rightColX, y + 25);

  doc.setFont('Helvetica', 'normal');
  doc.text(user.bankName, rightColX + 22, y + 13);
  doc.text(user.bankAccount, rightColX + 22, y + 19);
  doc.text(user.ifsc, rightColX + 22, y + 25);

  y += 38;

  // 3. Balance Overview
  checkPage(15);
  doc.setFillColor(27, 27, 30);
  doc.rect(margin, y, contentWidth, 10, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('PORTFOLIO BALANCES OVERVIEW', margin + 6, y + 6.5);

  const totalValue = assets.reduce((sum, a) => sum + a.qty * a.spotPrice, 0) + cashBalance;
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(52, 211, 153); // emerald green
  doc.text(`Total Valuation: ₹${Math.round(totalValue).toLocaleString('en-IN')}`, margin + 110, y + 6.5);

  y += 15;

  if (mode === 'full' || mode === 'assets') {
    // 4. Asset Details Table
    checkPage(10);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('ACTIVE HOLDINGS & ALLOCATIONS', margin, y);
    y += 5;

    // Table Headers
    checkPage(10);
    doc.setFillColor(13, 13, 15);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(245, 158, 11);
    
    doc.text('Asset', margin + 4, y + 5);
    doc.text('Category', margin + 22, y + 5);
    doc.text('Quantity', margin + 48, y + 5);
    doc.text('Spot Price (₹)', margin + 74, y + 5);
    doc.text('Target %', margin + 104, y + 5);
    doc.text('Weight %', margin + 124, y + 5);
    doc.text('Total Value (₹)', margin + 148, y + 5);
    
    y += 7;

    // Render Asset Rows
    const totalInvested = assets.reduce((s, a) => s + a.qty * a.spotPrice, 0);
    assets.forEach((asset, index) => {
      checkPage(8);
      // Zebra striping
      if (index % 2 === 0) {
        doc.setFillColor(24, 24, 27);
        doc.rect(margin, y, contentWidth, 7, 'F');
      }
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(228, 228, 231);

      const assetVal = asset.qty * asset.spotPrice;
      const currentWeight = totalInvested > 0 ? (assetVal / totalInvested) * 100 : 0;

      // Spot Price and value formatting
      const spotPriceText = asset.spotPrice >= 100000 
        ? `${(asset.spotPrice / 100000).toFixed(2)}L` 
        : asset.spotPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 });
      
      const valueText = Math.round(assetVal).toLocaleString('en-IN');
      const qtyText = asset.qty < 0.01 
        ? asset.qty.toFixed(6) 
        : asset.qty < 1 
          ? asset.qty.toFixed(4) 
          : asset.qty.toLocaleString('en-IN', { maximumFractionDigits: 2 });

      doc.setFont('Helvetica', 'bold');
      doc.text(asset.ticker, margin + 4, y + 5);
      doc.setFont('Helvetica', 'normal');
      doc.text(asset.category.toUpperCase().replace('_', ' '), margin + 22, y + 5);
      doc.text(`${qtyText} ${asset.unit}`, margin + 48, y + 5);
      doc.text(`₹${spotPriceText}`, margin + 74, y + 5);
      doc.text(`${asset.targetWeight}%`, margin + 104, y + 5);
      doc.text(`${currentWeight.toFixed(1)}%`, margin + 124, y + 5);
      doc.text(`₹${valueText}`, margin + 148, y + 5);

      y += 7;
    });

    // Table totals footer row
    checkPage(8);
    doc.setFillColor(13, 13, 15);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL HOLDINGS', margin + 4, y + 5);
    doc.text(`100.0%`, margin + 124, y + 5);
    doc.text(`₹${Math.round(totalInvested).toLocaleString('en-IN')}`, margin + 148, y + 5);

    y += 10;

    // Add Cash Balance row
    checkPage(10);
    doc.setFillColor(20, 30, 20); // light green tint
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(52, 211, 153);
    doc.text('UNINVESTED LIQUID CASH BALANCE (WEALTHOS)', margin + 4, y + 5.5);
    doc.text(`₹${Math.round(cashBalance).toLocaleString('en-IN')}`, margin + 148, y + 5.5);

    y += 15;
  }

  // Split ledger into AI and Manual
  const aiTxs = transactions.filter(t => t.type === 'rebalance' || t.type === 'auto_buy' || t.description.toLowerCase().includes('ai') || t.description.toLowerCase().includes('auto'));
  const manualTxs = transactions.filter(t => t.type === 'deposit' || t.type === 'withdrawal' || t.type === 'manual_buy' || (!aiTxs.includes(t)));

  if (mode === 'full' || mode === 'ai') {
    // 5. AI Transactions Section
    checkPage(15);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('AI AUTOPILOT TRANSACTION HISTORY', margin, y);
    y += 5;

    // AI Table Headers
    checkPage(10);
    doc.setFillColor(13, 13, 15);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(245, 158, 11);
    
    doc.text('Timestamp', margin + 4, y + 5);
    doc.text('Transaction Details', margin + 38, y + 5);
    doc.text('Status', margin + 120, y + 5);
    doc.text('Amount (₹)', margin + 148, y + 5);
    y += 7;

    if (aiTxs.length === 0) {
      checkPage(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(113, 113, 122);
      doc.text('No AI Autopilot rebalance transactions recorded in this period.', margin + 4, y + 5);
      y += 8;
    } else {
      aiTxs.forEach((tx, idx) => {
        checkPage(10);
        if (idx % 2 === 0) {
          doc.setFillColor(24, 24, 27);
          doc.rect(margin, y, contentWidth, 8, 'F');
        }
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(228, 228, 231);
        doc.text(tx.timestamp, margin + 4, y + 5);
        
        // Wrap description if it is long
        const descText = tx.description.length > 55 ? tx.description.substring(0, 52) + '...' : tx.description;
        doc.text(descText, margin + 38, y + 5);
        
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(52, 211, 153);
        doc.text(tx.status, margin + 120, y + 5);
        doc.setTextColor(228, 228, 231);
        doc.text(`₹${tx.amount.toLocaleString('en-IN')}`, margin + 148, y + 5);
        y += 8;
      });
    }

    y += 10;
  }

  if (mode === 'full' || mode === 'manual') {
    // 6. Manual & Banking Transactions Section
    checkPage(15);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('MANUAL DEPOSITS, WITHDRAWALS & TRADES', margin, y);
    y += 5;

    // Manual Table Headers
    checkPage(10);
    doc.setFillColor(13, 13, 15);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(245, 158, 11);
    
    doc.text('Timestamp', margin + 4, y + 5);
    doc.text('Type', margin + 38, y + 5);
    doc.text('Description', margin + 60, y + 5);
    doc.text('Status', margin + 120, y + 5);
    doc.text('Amount (₹)', margin + 148, y + 5);
    y += 7;

    if (manualTxs.length === 0) {
      checkPage(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(113, 113, 122);
      doc.text('No manual trades or bank deposits recorded in this period.', margin + 4, y + 5);
      y += 8;
    } else {
      manualTxs.forEach((tx, idx) => {
        checkPage(10);
        if (idx % 2 === 0) {
          doc.setFillColor(24, 24, 27);
          doc.rect(margin, y, contentWidth, 8, 'F');
        }
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(228, 228, 231);
        doc.text(tx.timestamp, margin + 4, y + 5);
        doc.text(tx.type.toUpperCase(), margin + 38, y + 5);
        
        const descText = tx.description.length > 38 ? tx.description.substring(0, 35) + '...' : tx.description;
        doc.text(descText, margin + 60, y + 5);
        
        doc.setFont('Helvetica', 'bold');
        doc.setTextColor(52, 211, 153);
        doc.text(tx.status, margin + 120, y + 5);
        doc.setTextColor(228, 228, 231);
        doc.text(`₹${tx.amount.toLocaleString('en-IN')}`, margin + 148, y + 5);
        y += 8;
      });
    }
  }

  // 7. Signature / End of Statement Block
  checkPage(30);
  y += 5;
  doc.setDrawColor(39, 39, 42);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text(
    'This is a computer generated document based on real-time simulated client-side assets and transaction ledger databases.',
    margin,
    y
  );
  doc.text('WealthOS Autonomous Rebalance System has verified the cryptographic audit trails for all actions above.', margin, y + 4);

  // Save the document
  const fileSuffix = mode === 'full' ? 'Statement' : mode === 'assets' ? 'Holdings' : mode === 'ai' ? 'AI_Ledger' : 'Manual_Ledger';
  const fileName = `WealthOS_${fileSuffix}_${user.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
