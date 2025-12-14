import { jsPDF } from 'jspdf';
import type { Patient, Prescription, Treatment } from '@shared/schema';

export const generatePatientPDF = (
  patient: Patient,
  prescriptions: Prescription[] = [],
  treatments: Treatment[] = []
) => {
  console.log('✨ FRENCH MEDICAL FORM PDF GENERATOR ✨');
  console.log('Patient:', patient.firstName, patient.lastName);
  console.log('Prescriptions:', prescriptions.length);
  console.log('Treatments:', treatments.length);
  
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const margin = 20;
  let Y = margin;

  // Colors
  const primaryPink: [number, number, number] = [236, 72, 153];
  const darkGray: [number, number, number] = [55, 65, 81];
  const lightGray: [number, number, number] = [150, 150, 150];

  // Calculate age
  const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31557600000);
  const now = new Date();

  // ==================== HEADER ====================
  // Top border line
  doc.setDrawColor(primaryPink[0], primaryPink[1], primaryPink[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, Y, W - margin, Y);
  Y += 8;

  // Clinic Name (Centered, Bold, Large)
  doc.setFontSize(16);
  doc.setTextColor(primaryPink[0], primaryPink[1], primaryPink[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('CABINET MEDICAL du Dr MediCare', W / 2, Y, { align: 'center' });
  Y += 8;

  // Second border line
  doc.setDrawColor(primaryPink[0], primaryPink[1], primaryPink[2]);
  doc.setLineWidth(0.5);
  doc.line(margin + 5, Y, W - margin - 5, Y);
  Y += 10;

  // Doctor info section (Left aligned - Bilingual)
  doc.setFontSize(9);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Dr : MediCare Health System', margin + 5, Y);
  Y += 5;
  doc.text('Specialist in General Medicine', margin + 5, Y);
  Y += 5;
  doc.text('Spécialiste en Médecine Générale', margin + 5, Y);
  Y += 5;
  doc.text('Electronic Medical Records System', margin + 5, Y);
  Y += 5;
  doc.text('OM : 4177', margin + 5, Y);
  Y += 10;

  // Patient info section (Bilingual)
  const infoStartY = Y;
  
  // Left side - Name (French)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Nom / Name', margin + 5, Y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${patient.lastName.toUpperCase()}`, margin + 28, Y);
  Y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Prénom / First Name', margin + 5, Y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${patient.firstName}`, margin + 40, Y);

  // Right side - Date and Age
  const rightX = W - margin - 55;
  let rightY = infoStartY;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${now.toLocaleDateString('en-US')}`, rightX + 12, rightY);
  rightY += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Age / Âge', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${age} years / ans`, rightX + 18, rightY);

  Y += 15;

  // Additional patient info (Bilingual)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  
  if (patient.gender) {
    doc.text(`Gender / Genre: ${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}`, margin + 5, Y);
    Y += 5;
  }
  
  if (patient.email) {
    doc.text(`Email / Courriel: ${patient.email}`, margin + 5, Y);
    Y += 5;
  }
  
  if (patient.phone) {
    doc.text(`Phone / Tél: ${patient.phone}`, margin + 5, Y);
    Y += 5;
  }
  
  if (patient.address) {
    doc.text(`Address / Adresse: ${patient.address}`, margin + 5, Y);
    Y += 5;
  }
  
  if (patient.bloodType) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Blood Type / Groupe sanguin: ${patient.bloodType}`, margin + 5, Y);
    doc.setFont('helvetica', 'normal');
    Y += 5;
  }

  Y += 5;

  // Emergency Contact (Bilingual)
  if (patient.emergencyContactName || patient.emergencyContactPhone) {
    doc.setFont('helvetica', 'bold');
    doc.text('Emergency Contact / Contact d\'urgence:', margin + 5, Y);
    doc.setFont('helvetica', 'normal');
    Y += 5;
    
    if (patient.emergencyContactName) {
      doc.text(`${patient.emergencyContactName}`, margin + 8, Y);
      Y += 5;
    }
    
    if (patient.emergencyContactPhone) {
      doc.text(`Phone / Tél: ${patient.emergencyContactPhone}`, margin + 8, Y);
      Y += 5;
    }
    
    Y += 3;
  }

  // Medical History & Allergies (Bilingual)
  if (patient.medicalHistory && patient.medicalHistory.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Medical History / Antécédents médicaux:', margin + 5, Y);
    doc.setFont('helvetica', 'normal');
    Y += 5;
    
    patient.medicalHistory.forEach(hist => {
      const lines = doc.splitTextToSize(hist, W - 2 * margin - 10);
      doc.text(lines, margin + 8, Y);
      Y += lines.length * 5;
    });
    Y += 3;
  }

  if (patient.allergies && patient.allergies.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('⚠ Allergies:', margin + 5, Y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(patient.allergies.join(', '), margin + 25, Y);
    Y += 8;
  }

  if (patient.currentMedications && patient.currentMedications.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Current Medications / Médicaments actuels:', margin + 5, Y);
    doc.setFont('helvetica', 'normal');
    Y += 5;
    
    patient.currentMedications.forEach(med => {
      doc.text(`• ${med}`, margin + 8, Y);
      Y += 5;
    });
    Y += 3;
  }

  // ==================== PRESCRIPTIONS SECTION ====================
  if (prescriptions && prescriptions.length > 0) {
    if (Y > H - 100) {
      doc.addPage();
      Y = margin;
    }

    Y += 5;

    // Section title (centered, underlined) - Bilingual
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const titleText = 'PRESCRIPTIONS / ORDONNANCES';
    const titleWidth = doc.getTextWidth(titleText);
    doc.text(titleText, W / 2, Y, { align: 'center' });
    
    // Underline
    doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - titleWidth / 2, Y + 1, W / 2 + titleWidth / 2, Y + 1);
    Y += 12;

    // List header - Bilingual
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Please fill / Faire s.v.p :', margin + 10, Y);
    Y += 8;

    // Prescriptions list
    prescriptions.forEach((rx, index) => {
      if (Y > H - 80) {
        doc.addPage();
        Y = margin;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Medication name with dash
      doc.text(`- ${rx.medication}`, margin + 20, Y);
      Y += 5;
      
      // Dosage and frequency
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text(`  ${rx.dosage} - ${rx.frequency}`, margin + 22, Y);
      Y += 5;
      
      // Duration (Bilingual)
      if (rx.duration) {
        doc.text(`  Duration / Durée: ${rx.duration}`, margin + 22, Y);
        Y += 5;
      }
      
      // Status (Bilingual)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`  Status / Statut: ${rx.status}`, margin + 22, Y);
      Y += 4;
      
      // Instructions (if any) - Bilingual
      if (rx.instructions) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('  Instructions:', margin + 22, Y);
        Y += 4;
        const instrLines = doc.splitTextToSize(rx.instructions, W - margin - 50);
        doc.text(instrLines, margin + 24, Y);
        Y += instrLines.length * 4;
      }
      
      // Prescribed by (Bilingual)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`Prescribed by / Prescrit par: ${rx.prescribedByName}`, margin + 22, Y);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      Y += 6;
    });
  }

  // ==================== TREATMENTS SECTION ====================
  if (treatments && treatments.length > 0) {
    if (Y > H - 100) {
      doc.addPage();
      Y = margin;
    }

    Y += 5;

    // Section title (Bilingual)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const treatmentTitle = 'TREATMENTS / TRAITEMENTS';
    const treatmentTitleWidth = doc.getTextWidth(treatmentTitle);
    doc.text(treatmentTitle, W / 2, Y, { align: 'center' });
    
    // Underline
    doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - treatmentTitleWidth / 2, Y + 1, W / 2 + treatmentTitleWidth / 2, Y + 1);
    Y += 12;

    // Treatments list
    treatments.forEach((tr, index) => {
      if (Y > H - 80) {
        doc.addPage();
        Y = margin;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Treatment type with dash
      doc.text(`- ${tr.treatmentType}`, margin + 20, Y);
      Y += 5;
      
      // Description
      if (tr.description) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        const descLines = doc.splitTextToSize(tr.description, W - margin - 50);
        doc.text(descLines, margin + 22, Y);
        Y += descLines.length * 4 + 2;
      }
      
      // Diagnosis (Bilingual)
      if (tr.diagnosis) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`  Diagnosis / Diagnostic: ${tr.diagnosis}`, margin + 22, Y);
        Y += 4;
      }
      
      // Priority and Status (Bilingual)
      doc.setFontSize(8);
      doc.text(`  Priority / Priorité: ${tr.priority.toUpperCase()} | Status / Statut: ${tr.status.toUpperCase()}`, margin + 22, Y);
      Y += 4;
      
      // Scheduled date (Bilingual)
      if (tr.scheduledDate) {
        const schedDate = new Date(tr.scheduledDate);
        doc.text(`  Scheduled for / Prévu pour: ${schedDate.toLocaleDateString('en-US')} at / à ${schedDate.toLocaleTimeString('en-US')}`, margin + 22, Y);
        Y += 4;
      }
      
      // Notes (Bilingual)
      if (tr.notes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('  Notes:', margin + 22, Y);
        Y += 4;
        const noteLines = doc.splitTextToSize(tr.notes, W - margin - 50);
        doc.text(noteLines, margin + 24, Y);
        Y += noteLines.length * 4;
      }
      
      // Created by (Bilingual)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`By / Par: ${tr.createdByName}`, margin + 22, Y);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      Y += 6;
    });
  }

  // ==================== FOOTER ====================
  // Position footer at bottom of last page
  const totalPages = doc.getNumberOfPages();
  doc.setPage(totalPages);
  
  Y = Math.max(Y + 10, H - 95);

  // "Remerciements" (Thank you) - Bilingual
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text('Thank you / Remerciements', W / 2, Y, { align: 'center' });
  Y += 15;

  // Doctor signature stamp box
  const stampX = W / 2 - 40;
  const stampY = Y;
  const stampW = 80;
  const stampH = 25;

  // Stamp border (pink)
  doc.setDrawColor(primaryPink[0], primaryPink[1], primaryPink[2]);
  doc.setLineWidth(1);
  doc.roundedRect(stampX, stampY, stampW, stampH, 3, 3, 'D');

  // Stamp content
  doc.setFontSize(10);
  doc.setTextColor(primaryPink[0], primaryPink[1], primaryPink[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Dr MediCare Health', stampX + stampW / 2, stampY + 8, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('General Medicine / Médecine Générale', stampX + stampW / 2, stampY + 14, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text(`N° D'ORDRE: 4177`, stampX + stampW / 2, stampY + 20, { align: 'center' });

  Y = stampY + stampH + 10;

  // Bottom section (Bilingual)
  doc.setFontSize(7);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFont('helvetica', 'italic');
  doc.text("Patient identity established according to their declaration or that of their guardian", W / 2, Y, { align: 'center' });
  Y += 3;
  doc.text("L'identité du patient est établie selon sa déclaration ou celle de son tuteur", W / 2, Y, { align: 'center' });
  Y += 5;

  // Contact info (Bilingual)
  doc.setFont('helvetica', 'normal');
  doc.text('Address / Adresse : 123 Healthcare Avenue, Suite 100, Metropolis, NY 10001', margin, Y);
  doc.text('Mobile / Mob : (123) 456-7890', W - margin, Y, { align: 'right' });
  Y += 4;
  
  // Confidentiality notice (Bilingual)
  doc.setFontSize(6);
  doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.text('⚠ Confidential Document - Protected Medical Information (HIPAA)', W / 2, Y, { align: 'center' });
  Y += 3;
  doc.text('⚠ Document confidentiel - Information médicale protégée (HIPAA)', W / 2, Y, { align: 'center' });

  // ==================== PAGE NUMBERS ====================
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(`${i}/${totalPages}`, W / 2, H - 5, { align: 'center' });
  }

  // Save
  const dateStr = now.toISOString().split('T')[0];
  const filename = `Ordonnance_${patient.lastName}_${patient.firstName}_${dateStr}.pdf`;
  console.log('Saving French medical form:', filename);
  doc.save(filename);
};