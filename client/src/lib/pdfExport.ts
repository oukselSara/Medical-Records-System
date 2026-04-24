import { jsPDF } from 'jspdf';
import type { Patient, Prescription, Treatment } from '@shared/schema';

export const generatePatientPDF = (
  patient: Patient,
  prescriptions: Prescription[] = [],
  treatments: Treatment[] = []
) => {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 15;
  let Y = margin;

  // Premium Color Palette
  const pink = [236, 72, 153];
  const darkText = [31, 41, 55];
  const grayText = [107, 114, 128];
  const lightGray = [156, 163, 175];
  const red = [239, 68, 68];
  const amber = [245, 158, 11];
  const green = [34, 197, 94];

  const now = new Date();
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  // ==================== PREMIUM HEADER ====================
  // Top pink line
  doc.setDrawColor(pink[0], pink[1], pink[2]);
  doc.setLineWidth(2);
  doc.line(margin, Y, W - margin, Y);
  Y += 10;

  // LOGO/TITLE - Big and Bold
  doc.setFontSize(22);
  doc.setTextColor(pink[0], pink[1], pink[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('MediCare Health System', W / 2, Y, { align: 'center' });
  Y += 7;

  // Contact details
  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('123 Healthcare Avenue, Suite 100, Metropolis, NY 10001', W / 2, Y, { align: 'center' });
  Y += 4;
  doc.text('Phone: (123) 456-7890 | Email: contact@medicare.health', W / 2, Y, { align: 'center' });
  Y += 4;
  doc.text('Website: www.medicare.health', W / 2, Y, { align: 'center' });
  Y += 7;

  // Bottom line
  doc.setDrawColor(pink[0], pink[1], pink[2]);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, Y, W - margin - 10, Y);
  Y += 3;

  // Date in corner
  doc.setFontSize(10);
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text(formatDate(now), W - margin, margin + 12, { align: 'right' });

  Y += 10;

  // Document title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text('Patient Medical Record', W / 2, Y, { align: 'center' });
  Y += 12;

  // ==================== PATIENT INFO BOX ====================
  const boxH = 58;
  
  // Box background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, Y, W - 2 * margin, boxH, 3, 3, 'F');
  doc.setDrawColor(pink[0], pink[1], pink[2]);
  doc.setLineWidth(1);
  doc.roundedRect(margin, Y, W - 2 * margin, boxH, 3, 3, 'S');
  
  let boxY = Y + 8;

  // Section title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pink[0], pink[1], pink[2]);
  doc.text('Patient Information', margin + 5, boxY);
  boxY += 8;

  // Name + Status
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  const name = `${patient.firstName} ${patient.lastName}`;
  doc.text(name, margin + 5, boxY);
  
  // Status badge
  const statusX = margin + 5 + doc.getTextWidth(name) + 5;
  const statusColors: Record<string, number[]> = {
    active: green,
    inactive: lightGray,
    critical: red
  };
  const sColor = statusColors[patient.status] || green;
  doc.setFillColor(sColor[0], sColor[1], sColor[2]);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const sTxt = patient.status.toUpperCase();
  const sW = doc.getTextWidth(sTxt) + 8;
  doc.roundedRect(statusX, boxY - 4, sW, 6, 2, 2, 'F');
  doc.text(sTxt, statusX + 4, boxY);
  boxY += 8;

  // Two columns
  const c1 = margin + 5;
  const c2 = W / 2 + 5;
  let y1 = boxY;
  let y2 = boxY;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);

  // LEFT COLUMN
  doc.setFont('helvetica', 'bold');
  doc.text('Birth Date', c1, y1);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.dateOfBirth, c1 + 24, y1);
  y1 += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Gender', c1, y1);
  doc.setFont('helvetica', 'normal');
  doc.text(patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1), c1 + 24, y1);
  y1 += 5;

  if (patient.phone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Phone', c1, y1);
    doc.setFont('helvetica', 'normal');
    doc.text(patient.phone, c1 + 24, y1);
    y1 += 5;
  }

  if (patient.bloodType) {
    doc.setFont('helvetica', 'bold');
    doc.text('Blood Type', c1, y1);
    doc.setFont('helvetica', 'normal');
    doc.text(patient.bloodType, c1 + 24, y1);
  }

  // RIGHT COLUMN
  if (patient.email) {
    doc.setFont('helvetica', 'bold');
    doc.text('Email', c2, y2);
    doc.setFont('helvetica', 'normal');
    const email = patient.email.length > 35 ? patient.email.substring(0, 32) + '...' : patient.email;
    doc.text(email, c2 + 24, y2);
    y2 += 5;
  }

  if (patient.address) {
    doc.setFont('helvetica', 'bold');
    doc.text('Address', c2, y2);
    doc.setFont('helvetica', 'normal');
    const addrLines = doc.splitTextToSize(patient.address, W / 2 - 35);
    doc.text(addrLines, c2 + 24, y2);
  }

  Y += boxH + 10;

  // ==================== EMERGENCY CONTACT ====================
  if (patient.emergencyContactName || patient.emergencyContactPhone) {
    const eH = 20;
    
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, Y, W - 2 * margin, eH, 3, 3, 'F');
    doc.setDrawColor(amber[0], amber[1], amber[2]);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, Y, W - 2 * margin, eH, 3, 3, 'S');
    
    let eY = Y + 7;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('Emergency Contact', margin + 5, eY);
    eY += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    
    if (patient.emergencyContactName) {
      doc.setFont('helvetica', 'bold');
      doc.text('Contact Name', margin + 5, eY);
      doc.setFont('helvetica', 'normal');
      doc.text(patient.emergencyContactName, margin + 35, eY);
    }
    
    if (patient.emergencyContactPhone) {
      doc.setFont('helvetica', 'bold');
      doc.text('Contact Phone', c2, eY);
      doc.setFont('helvetica', 'normal');
      doc.text(patient.emergencyContactPhone, c2 + 32, eY);
    }
    
    Y += eH + 10;
  }

  // ==================== MEDICAL HISTORY ====================
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(pink[0], pink[1], pink[2]);
  doc.text('General Medical History', margin + 5, Y);
  Y += 8;

  // Medical History
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  doc.text('Medical History', margin + 5, Y);
  Y += 5;
  
  doc.setFont('helvetica', 'normal');
  if (patient.medicalHistory && patient.medicalHistory.length > 0) {
    patient.medicalHistory.forEach(h => {
      const lines = doc.splitTextToSize(h, W - 2 * margin - 10);
      doc.text(lines, margin + 7, Y);
      Y += lines.length * 4.5;
    });
  } else {
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('No significant medical history recorded', margin + 7, Y);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    Y += 5;
  }
  Y += 4;

  // Allergies
  doc.setFont('helvetica', 'bold');
  doc.text('Allergies', margin + 5, Y);
  Y += 5;
  
  doc.setFont('helvetica', 'normal');
  if (patient.allergies && patient.allergies.length > 0) {
    doc.setTextColor(red[0], red[1], red[2]);
    doc.text(patient.allergies.join(', '), margin + 7, Y);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  } else {
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('No known allergies', margin + 7, Y);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
  }
  Y += 8;

  // Current Medications
  if (patient.currentMedications && patient.currentMedications.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Current Medications', margin + 5, Y);
    Y += 5;
    
    doc.setFont('helvetica', 'normal');
    patient.currentMedications.forEach(m => {
      doc.text(`• ${m}`, margin + 7, Y);
      Y += 5;
    });
    Y += 4;
  }

  // ==================== PRESCRIPTIONS ====================
  if (prescriptions && prescriptions.length > 0) {
    if (Y > H - 70) {
      doc.addPage();
      Y = margin;
    }

    Y += 5;

    // Divider
    doc.setDrawColor(pink[0], pink[1], pink[2]);
    doc.setLineWidth(1.5);
    doc.line(margin, Y, W - margin, Y);
    Y += 10;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(pink[0], pink[1], pink[2]);
    doc.text('ORDONNANCE MÉDICALE / PRESCRIPTION', W / 2, Y, { align: 'center' });
    Y += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('Faire s.v.p / Please fill:', margin + 5, Y);
    Y += 8;

    prescriptions.forEach((rx, i) => {
      if (Y > H - 50) {
        doc.addPage();
        Y = margin + 10;
      }

      // Prescription card
      const cardY = Y;
      const cardH = 32 + (rx.instructions ? 8 : 0) + (rx.duration ? 4 : 0);
      
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin + 2, cardY, W - 2 * margin - 4, cardH, 2, 2, 'F');
      doc.setDrawColor(pink[0], pink[1], pink[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin + 2, cardY, W - 2 * margin - 4, cardH, 2, 2, 'S');
      
      Y = cardY + 6;

      // Number + Med name
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(`${i + 1}.`, margin + 6, Y);
      doc.text(rx.medication, margin + 12, Y);
      Y += 6;
      
      // Dosage + Frequency
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text(`${rx.dosage} - ${rx.frequency}`, margin + 12, Y);
      Y += 5;
      
      // Duration
      if (rx.duration) {
        doc.setFontSize(8);
        doc.text(`Durée / Duration: ${rx.duration}`, margin + 12, Y);
        Y += 4;
      }
      
      // Status
      doc.setFontSize(8);
      const check = rx.status === 'active' ? '✓' : '○';
      doc.setTextColor(rx.status === 'active' ? green[0] : grayText[0], rx.status === 'active' ? green[1] : grayText[1], rx.status === 'active' ? green[2] : grayText[2]);
      doc.text(`${check} Statut / Status: ${rx.status.toUpperCase()}`, margin + 12, Y);
      Y += 5;
      
      // Instructions
      if (rx.instructions) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        const inst = doc.splitTextToSize(rx.instructions, W - 2 * margin - 20);
        doc.text(inst, margin + 12, Y);
        Y += inst.length * 3.5 + 2;
      }
      
      // Footer: Doctor + Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`Prescrit par / Prescribed by: ${rx.prescribedByName}`, margin + 12, Y);
      if (rx.createdAt) {
        doc.text(`Date: ${formatDate(rx.createdAt)}`, W - margin - 30, Y);
      }
      
      Y += 10;
    });
  }

  // ==================== TREATMENTS ====================
  if (treatments && treatments.length > 0) {
    if (Y > H - 70) {
      doc.addPage();
      Y = margin;
    }

    Y += 5;

    // Divider
    doc.setDrawColor(pink[0], pink[1], pink[2]);
    doc.setLineWidth(1.5);
    doc.line(margin, Y, W - margin, Y);
    Y += 10;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(pink[0], pink[1], pink[2]);
    doc.text('TRAITEMENTS / TREATMENTS', W / 2, Y, { align: 'center' });
    Y += 10;

    treatments.forEach((tr, i) => {
      if (Y > H - 50) {
        doc.addPage();
        Y = margin + 10;
      }

      // Treatment card
      const cardY = Y;
      const cardH = 38 + (tr.notes ? 8 : 0) + (tr.diagnosis ? 4 : 0);
      
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin + 2, cardY, W - 2 * margin - 4, cardH, 2, 2, 'F');
      doc.setDrawColor(pink[0], pink[1], pink[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin + 2, cardY, W - 2 * margin - 4, cardH, 2, 2, 'S');
      
      Y = cardY + 6;

      // Number + Treatment name
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkText[0], darkText[1], darkText[2]);
      doc.text(`${i + 1}.`, margin + 6, Y);
      doc.text(tr.treatmentType, margin + 12, Y);
      Y += 6;
      
      // Description
      if (tr.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        const desc = doc.splitTextToSize(tr.description, W - 2 * margin - 20);
        doc.text(desc, margin + 12, Y);
        Y += desc.length * 4 + 2;
      }
      
      // Diagnosis
      if (tr.diagnosis) {
        doc.setFontSize(8);
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(`Diagnostic / Diagnosis: ${tr.diagnosis}`, margin + 12, Y);
        Y += 4;
      }
      
      // Priority + Status
      doc.setFontSize(8);
      const pColors: Record<string, number[]> = {
        high: red,
        medium: amber,
        low: green
      };
      const pColor = pColors[tr.priority.toLowerCase()] || grayText;
      doc.setTextColor(pColor[0], pColor[1], pColor[2]);
      doc.text(`● Priorité / Priority: ${tr.priority.toUpperCase()}`, margin + 12, Y);
      doc.setTextColor(grayText[0], grayText[1], grayText[2]);
      doc.text(`| Statut / Status: ${tr.status.toUpperCase()}`, margin + 60, Y);
      Y += 4;
      
      // Scheduled date
      if (tr.scheduledDate) {
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        const sDate = new Date(tr.scheduledDate);
        const time = sDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        doc.text(`Prévu pour / Scheduled for: ${formatDate(tr.scheduledDate)} à / at ${time}`, margin + 12, Y);
        Y += 4;
      }
      
      // Notes
      if (tr.notes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(grayText[0], grayText[1], grayText[2]);
        const notes = doc.splitTextToSize(`Notes: ${tr.notes}`, W - 2 * margin - 20);
        doc.text(notes, margin + 12, Y);
        Y += notes.length * 3.5 + 2;
      }
      
      // Footer: Doctor + Date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`Par / By: ${tr.createdByName}`, margin + 12, Y);
      if (tr.createdAt) {
        doc.text(`Date: ${formatDate(tr.createdAt)}`, W - margin - 30, Y);
      }
      
      Y += 10;
    });
  }

  // ==================== FOOTER (ALL PAGES) ====================
  const total = doc.getNumberOfPages();
  
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    
    const fY = H - 32;
    
    // Line
    doc.setDrawColor(pink[0], pink[1], pink[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, fY, W - margin, fY);
    
    // Thank you
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text('Remerciements / Thank You', W / 2, fY + 5, { align: 'center' });
    
    // Doctor stamp
    const sY = fY + 9;
    const sW = 70;
    const sH = 17;
    const sX = W / 2 - sW / 2;
    
    doc.setDrawColor(pink[0], pink[1], pink[2]);
    doc.setLineWidth(1);
    doc.roundedRect(sX, sY, sW, sH, 2, 2, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(pink[0], pink[1], pink[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Dr MediCare Health', sX + sW / 2, sY + 6, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Médecine Générale', sX + sW / 2, sY + 10, { align: 'center' });
    doc.setFontSize(7);
    doc.text("N° D'ORDRE: 4177", sX + sW / 2, sY + 14, { align: 'center' });
    
    // Bottom
    const bY = H - 13;
    doc.setFontSize(6);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFont('helvetica', 'italic');
    doc.text("L'identité du patient est établie selon sa déclaration ou celle de son tuteur", W / 2, bY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Adresse : 123 Healthcare Avenue, Suite 100, Metropolis, NY 10001', margin, bY + 3);
    doc.text('Mob : (123) 456-7890', W - margin, bY + 3, { align: 'right' });
    
    doc.setFontSize(6);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('⚠ CONFIDENTIAL MEDICAL RECORD', W / 2, bY + 6, { align: 'center' });
    doc.text('Document confidentiel - Information médicale protégée (HIPAA)', W / 2, bY + 9, { align: 'center' });
    
    // Page number
    doc.setFontSize(8);
    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.text(`${p}/${total}`, W / 2, H - 3, { align: 'center' });
  }

  // Save
  const file = `MediCare_${patient.lastName}_${patient.firstName}_${formatDate(now).replace(/\//g, '-')}.pdf`;
  doc.save(file);
};