// File: client/src/lib/pdfExport.ts
import { jsPDF } from 'jspdf';
import type { Patient, Prescription, Treatment } from '@shared/schema';

export const generatePatientPDF = (
  patient: Patient,
  prescriptions: Prescription[] = [],
  treatments: Treatment[] = []
) => {
  console.log('✨ COMPLETE MEDICAL RECORD PDF GENERATOR ✨');
  console.log('Patient:', patient.firstName, patient.lastName);
  console.log('Prescriptions count:', prescriptions?.length || 0);
  console.log('Treatments count:', treatments?.length || 0);
  
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 15;
  let Y = margin;

  // Colors
  const primaryPink: [number, number, number] = [236, 72, 153];
  const secondaryPink: [number, number, number] = [249, 168, 212];
  const darkGray: [number, number, number] = [55, 65, 81];
  const lightGray: [number, number, number] = [243, 244, 246];

  // Helper: Draw header/footer
  const drawHeaderFooter = () => {
    // Header bar
    doc.setFillColor(...primaryPink);
    doc.rect(0, 0, W, 8, 'F');
    
    // Footer
    const footerY = H - 25;
    doc.setFillColor(...lightGray);
    doc.rect(0, footerY, W, 25, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('MediCare Health System', margin, footerY + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('123 Healthcare Avenue, Suite 100', margin, footerY + 11);
    doc.text('Metropolis, NY 10001', margin, footerY + 15);
    doc.text('Phone: (123) 456-7890 | Email: contact@medicare.health', margin, footerY + 19);
    doc.text('Website: www.medicare.health', margin, footerY + 23);
    
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text('For appointments, billing inquiries, or medical assistance, please contact us', W / 2, footerY + 6, { align: 'center' });
    doc.text('Thank you for choosing MediCare Health System for your healthcare needs.', W / 2, footerY + 10, { align: 'center' });
  };

  // Helper: Section title
  const sectionTitle = (title: string, yPos: number) => {
    doc.setFillColor(...primaryPink);
    doc.rect(margin, yPos, W - 2 * margin, 8, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 3, yPos + 5.5);
    
    return yPos + 8;
  };

  // Helper: Field with label
  const field = (label: string, value: string, x: number, y: number, width: number = 85) => {
    doc.setFontSize(8);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(value || 'N/A', width - 5);
    doc.text(lines, x, y + 4);
    
    return y + 4 + (lines.length * 4);
  };

  // Helper: Draw border box
  const drawBox = (x: number, y: number, w: number, h: number) => {
    doc.setDrawColor(...secondaryPink);
    doc.setLineWidth(0.5);
    doc.rect(x, y, w, h, 'D');
  };

  // ==================== PAGE 1 ====================
  drawHeaderFooter();
  Y = 15;

  // Date in top right
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  doc.text(now.toLocaleDateString(), W - margin, Y, { align: 'right' });
  Y += 8;

  // Main title
  doc.setFontSize(18);
  doc.setTextColor(...primaryPink);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Medical Record', margin, Y);
  Y += 12;

  // Patient Information Section
  Y = sectionTitle('Patient Information', Y);
  Y += 5;

  const boxY = Y;
  const boxHeight = 58;
  drawBox(margin, Y, W - 2 * margin, boxHeight);
  Y += 5;

  // Patient name with status badge on same line
  doc.setFontSize(14);
  doc.setTextColor(...primaryPink);
  doc.setFont('helvetica', 'bold');
  const patientName = `${patient.firstName} ${patient.lastName}`;
  doc.text(patientName, margin + 3, Y);
  
  // Status badge positioned right after the name
  const nameWidth = doc.getTextWidth(patientName);
  const statusColors: Record<string, [number, number, number]> = {
    active: [34, 197, 94],
    inactive: [156, 163, 175],
    critical: [239, 68, 68]
  };
  const statusColor = statusColors[patient.status] || statusColors.active;
  doc.setFillColor(...statusColor);
  doc.roundedRect(margin + 3 + nameWidth + 3, Y - 4, 18, 5, 1, 1, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.status.toUpperCase(), margin + 3 + nameWidth + 5, Y - 0.5);

  Y += 7;

  // Two columns layout
  const col1X = margin + 3;
  const col2X = W / 2 + 5;
  let col1Y = Y;
  let col2Y = Y;

  // Column 1
  col1Y = field('Birth Date', patient.dateOfBirth, col1X, col1Y);
  col1Y += 2;
  col1Y = field('Gender', patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1), col1X, col1Y);
  col1Y += 2;
  if (patient.phone) {
    col1Y = field('Phone', patient.phone, col1X, col1Y);
  }

  // Column 2
  if (patient.bloodType) {
    col2Y = field('Blood Type', patient.bloodType, col2X, col2Y);
    col2Y += 2;
  }
  if (patient.email) {
    col2Y = field('Email', patient.email, col2X, col2Y, (W / 2) - margin - 8);
    col2Y += 2;
  }
  if (patient.address) {
    col2Y = field('Address', patient.address, col2X, col2Y, (W / 2) - margin - 8);
  }

  Y = boxY + boxHeight + 8;

  // Emergency Contact Section
  if (patient.emergencyContactName || patient.emergencyContactPhone) {
    Y = sectionTitle('Emergency Contact', Y);
    Y += 5;

    const emergBoxY = Y;
    const emergBoxHeight = 25;
    drawBox(margin, Y, W - 2 * margin, emergBoxHeight);
    Y += 5;

    col1Y = Y;
    col2Y = Y;

    if (patient.emergencyContactName) {
      col1Y = field('Contact Name', patient.emergencyContactName, col1X, col1Y, (W / 2) - margin - 6);
    }
    if (patient.emergencyContactPhone) {
      col2Y = field('Contact Phone', patient.emergencyContactPhone, col2X, col2Y, (W / 2) - margin - 6);
    }

    Y = emergBoxY + emergBoxHeight + 8;
  }

  // General Medical History Section
  Y = sectionTitle('General Medical History', Y);
  Y += 5;

  const histBoxY = Y;
  let histBoxHeight = 20;
  
  // Calculate needed height
  let tempY = 5;
  if (patient.medicalHistory && patient.medicalHistory.length > 0) {
    const histText = patient.medicalHistory.join(', ');
    const histLines = doc.splitTextToSize(histText, W - 2 * margin - 10);
    tempY += histLines.length * 4 + 8;
  } else {
    tempY += 12;
  }
  
  if (patient.allergies && patient.allergies.length > 0) {
    const allergyText = patient.allergies.join(', ');
    const allergyLines = doc.splitTextToSize(allergyText, W - 2 * margin - 10);
    tempY += allergyLines.length * 4 + 8;
  } else {
    tempY += 12;
  }
  
  histBoxHeight = tempY + 5;
  
  drawBox(margin, Y, W - 2 * margin, histBoxHeight);
  Y += 5;

  if (patient.medicalHistory && patient.medicalHistory.length > 0) {
    Y = field('Medical History', patient.medicalHistory.join(', '), margin + 3, Y, W - 2 * margin - 6);
    Y += 2;
  } else {
    Y = field('Medical History', 'No significant medical history recorded', margin + 3, Y, W - 2 * margin - 6);
    Y += 2;
  }

  if (patient.allergies && patient.allergies.length > 0) {
    Y = field('Allergies', patient.allergies.join(', '), margin + 3, Y, W - 2 * margin - 6);
  } else {
    Y = field('Allergies', 'No known allergies', margin + 3, Y, W - 2 * margin - 6);
  }

  Y = histBoxY + histBoxHeight + 8;

  // ==================== PRESCRIPTIONS ====================
  if (prescriptions && prescriptions.length > 0) {
    // Check if we need a new page
    if (Y > H - 100) {
      doc.addPage();
      drawHeaderFooter();
      Y = 15;
    }

    Y = sectionTitle('Prescription History', Y);
    Y += 5;

    prescriptions.forEach((rx, index) => {
      // Calculate box height based on content
      let rxBoxHeight = 45;
      if (rx.instructions) {
        const instrLines = doc.splitTextToSize(rx.instructions, W - 2 * margin - 10);
        rxBoxHeight = 45 + (instrLines.length * 4);
      }
      
      if (Y > H - 90) {
        doc.addPage();
        drawHeaderFooter();
        Y = 15;
      }

      drawBox(margin, Y, W - 2 * margin, rxBoxHeight);
      
      const innerY = Y + 5;
      doc.setFontSize(11);
      doc.setTextColor(...primaryPink);
      doc.setFont('helvetica', 'bold');
      doc.text(`${rx.medication}`, margin + 3, innerY);
      
      let col1Y = innerY + 6;
      let col2Y = innerY + 6;
      
      // Column 1
      col1Y = field('Dosage', rx.dosage, margin + 3, col1Y, (W / 2) - margin - 6);
      col1Y = field('Frequency', rx.frequency, margin + 3, col1Y, (W / 2) - margin - 6);
      col1Y = field('Duration', rx.duration, margin + 3, col1Y, (W / 2) - margin - 6);
      
      // Column 2
      col2Y = field('Status', rx.status.toUpperCase(), col2X, col2Y, (W / 2) - margin - 6);
      col2Y = field('Prescribed By', rx.prescribedByName, col2X, col2Y, (W / 2) - margin - 6);
      
      if (rx.instructions) {
        const finalY = Math.max(col1Y, col2Y) + 2;
        field('Instructions', rx.instructions, margin + 3, finalY, W - 2 * margin - 6);
      }

      Y += rxBoxHeight + 5;
    });
  }

  // ==================== TREATMENTS ====================
  if (treatments && treatments.length > 0) {
    if (Y > H - 100) {
      doc.addPage();
      drawHeaderFooter();
      Y = 15;
    }

    Y = sectionTitle('Treatment History', Y);
    Y += 5;

    treatments.forEach((tr, index) => {
      // Calculate box height based on content
      let trBoxHeight = 50;
      
      if (tr.description) {
        const descLines = doc.splitTextToSize(tr.description, (W / 2) - margin - 10);
        trBoxHeight = Math.max(trBoxHeight, 30 + (descLines.length * 4));
      }
      
      if (tr.notes) {
        const noteLines = doc.splitTextToSize(tr.notes, W - 2 * margin - 10);
        trBoxHeight += (noteLines.length * 4);
      }
      
      if (Y > H - 90) {
        doc.addPage();
        drawHeaderFooter();
        Y = 15;
      }

      drawBox(margin, Y, W - 2 * margin, trBoxHeight);
      
      const innerY = Y + 5;
      doc.setFontSize(11);
      doc.setTextColor(...primaryPink);
      doc.setFont('helvetica', 'bold');
      doc.text(tr.treatmentType, margin + 3, innerY);
      
      let col1Y = innerY + 6;
      let col2Y = innerY + 6;
      
      // Column 1
      if (tr.description) {
        col1Y = field('Description', tr.description, margin + 3, col1Y, (W / 2) - margin - 6);
      }
      if (tr.diagnosis) {
        col1Y = field('Diagnosis', tr.diagnosis, margin + 3, col1Y, (W / 2) - margin - 6);
      }
      
      // Column 2
      col2Y = field('Priority', tr.priority.toUpperCase(), col2X, col2Y, (W / 2) - margin - 6);
      col2Y = field('Status', tr.status.toUpperCase(), col2X, col2Y, (W / 2) - margin - 6);
      
      if (tr.scheduledDate) {
        const schedDate = new Date(tr.scheduledDate);
        const dateStr = `${schedDate.toLocaleDateString()} ${schedDate.toLocaleTimeString()}`;
        col2Y = field('Scheduled', dateStr, col2X, col2Y, (W / 2) - margin - 6);
      }
      
      col2Y = field('Created By', tr.createdByName, col2X, col2Y, (W / 2) - margin - 6);
      
      if (tr.notes) {
        const finalY = Math.max(col1Y, col2Y) + 2;
        field('Notes', tr.notes, margin + 3, finalY, W - 2 * margin - 6);
      }

      Y += trBoxHeight + 5;
    });
  }

  // Add confidentiality notice at the end
  if (Y > H - 60) {
    doc.addPage();
    drawHeaderFooter();
    Y = 20;
  }
  
  Y += 10;
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, Y, W - 2 * margin, 20, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠ CONFIDENTIAL MEDICAL RECORD', margin + 3, Y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...darkGray);
  doc.text('This document contains protected health information (PHI) under HIPAA regulations.', margin + 3, Y + 11);
  doc.text('Unauthorized disclosure is strictly prohibited. For authorized personnel only.', margin + 3, Y + 16);

  // Page numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, W - margin, H - 8, { align: 'right' });
  }

  // Save
  const dateStr = now.toISOString().split('T')[0];
  const filename = `MediCare_${patient.lastName}_${patient.firstName}_${dateStr}.pdf`;
  doc.save(filename);
};