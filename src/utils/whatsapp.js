// Utilitaire de génération des liens WhatsApp pour Tanger

/**
 * Nettoie et formate le numéro pour l'API WhatsApp wa.me
 * Supprime les espaces, les tirets et le 0 initial si format marocain local
 */
export function formatWhatsAppNumber(phone) {
  if (!phone) return '212661000000';
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    return '212' + clean.slice(1);
  }
  if (clean.startsWith('212')) {
    return clean;
  }
  return '212' + clean;
}

/**
 * Génère le lien WhatsApp avec message pré-rempli pour la confirmation patient
 */
export function generatePatientWhatsAppLink({
  patientName,
  phone,
  careTypeTitle,
  neighborhoodName,
  addressDetails,
  dateFormatted,
  timeSlotLabel,
  hasPrescription = false,
  coordinates = null,
  kinePhone = '212661000000'
}) {
  const number = formatWhatsAppNumber(kinePhone);
  
  let msg = `Bonjour Brahim, je viens d'effectuer une demande de rendez-vous pour une séance de kinésithérapie à domicile à Tanger :\n\n`;
  msg += `👤 *Patient :* ${patientName}\n`;
  msg += `📞 *Téléphone :* ${phone}\n`;
  msg += `🩺 *Soin :* ${careTypeTitle}\n`;
  msg += `📍 *Quartier :* ${neighborhoodName}\n`;
  if (addressDetails) {
    msg += `🏢 *Adresse :* ${addressDetails}\n`;
  }
  if (coordinates && coordinates.latitude && coordinates.longitude) {
    msg += `🗺️ *Position GPS :* https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}\n`;
  }
  msg += `📅 *Date :* ${dateFormatted}\n`;
  msg += `⏰ *Créneau :* ${timeSlotLabel}\n`;
  if (hasPrescription) {
    msg += `📄 *Ordonnance :* Photo jointe dans ma demande\n`;
  }
  msg += `\nMerci de me confirmer votre passage !`;

  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/**
 * Génère le lien WhatsApp pour le kiné : "J'arrive dans 10 minutes"
 */
export function generateKineArrivalWhatsAppLink(patientPhone, patientName) {
  const number = formatWhatsAppNumber(patientPhone);
  const msg = `Bonjour ${patientName || ''}, je suis Brahim votre kinésithérapeute. Je suis en route et j'arrive à votre domicile dans environ 10 minutes. À tout de suite !`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}
