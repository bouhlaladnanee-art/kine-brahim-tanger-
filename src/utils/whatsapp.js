// Utilitaire de génération des liens WhatsApp multilingue pour Tanger

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
 * Génère le lien WhatsApp avec message pré-rempli dans la langue du patient (FR, AR, EN, ES)
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
  kinePhone = '212661000000',
  language = 'fr'
}) {
  const number = formatWhatsAppNumber(kinePhone);

  let msg = '';

  if (language === 'ar') {
    msg = `السلام عليكم إبراهيم، لقد قمت بطلب موعد لحصة ترويض طبي منزلي في طنجة:\n\n`;
    msg += `👤 *المريض :* ${patientName}\n`;
    msg += `📞 *الهاتف :* ${phone}\n`;
    msg += `🩺 *نوع العلاج :* ${careTypeTitle}\n`;
    msg += `📍 *الحي :* ${neighborhoodName}\n`;
    if (addressDetails) {
      msg += `🏢 *العنوان :* ${addressDetails}\n`;
    }
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      msg += `🗺️ *الموقع GPS :* https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}\n`;
    }
    msg += `📅 *التاريخ :* ${dateFormatted}\n`;
    msg += `⏰ *الفترة :* ${timeSlotLabel}\n`;
    if (hasPrescription) {
      msg += `📄 *الوصفة الطبية :* مرفقة مع طلبي\n`;
    }
    msg += `\nشكراً لتأكيد موعد مروركم الكريم!`;
  } else if (language === 'en') {
    msg = `Hello Ibrahim, I have just booked an in-home physiotherapy session in Tangier:\n\n`;
    msg += `👤 *Patient:* ${patientName}\n`;
    msg += `📞 *Phone:* ${phone}\n`;
    msg += `🩺 *Care:* ${careTypeTitle}\n`;
    msg += `📍 *District:* ${neighborhoodName}\n`;
    if (addressDetails) {
      msg += `🏢 *Address:* ${addressDetails}\n`;
    }
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      msg += `🗺️ *GPS Position:* https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}\n`;
    }
    msg += `📅 *Date:* ${dateFormatted}\n`;
    msg += `⏰ *Time Slot:* ${timeSlotLabel}\n`;
    if (hasPrescription) {
      msg += `📄 *Prescription:* Photo attached in booking\n`;
    }
    msg += `\nThank you for confirming your visit!`;
  } else if (language === 'es') {
    msg = `Hola Ibrahim, acabo de solicitar una cita de fisioterapia a domicilio en Tánger:\n\n`;
    msg += `👤 *Paciente:* ${patientName}\n`;
    msg += `📞 *Teléfono:* ${phone}\n`;
    msg += `🩺 *Tratamiento:* ${careTypeTitle}\n`;
    msg += `📍 *Barrio:* ${neighborhoodName}\n`;
    if (addressDetails) {
      msg += `🏢 *Dirección:* ${addressDetails}\n`;
    }
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      msg += `🗺️ *Ubicación GPS:* https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}\n`;
    }
    msg += `📅 *Fecha:* ${dateFormatted}\n`;
    msg += `⏰ *Horario:* ${timeSlotLabel}\n`;
    if (hasPrescription) {
      msg += `📄 *Prescripción:* Volante adjunto en la solicitud\n`;
    }
    msg += `\n¡Muchas gracias por confirmar su visita!`;
  } else {
    // Français (par défaut)
    msg = `Bonjour Ibrahim, je viens d'effectuer une demande de rendez-vous pour une séance de kinésithérapie à domicile à Tanger :\n\n`;
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
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

/**
 * Génère le message WhatsApp d'arrivée pour le kiné
 */
export function generateKineArrivalWhatsAppLink(patientPhone, patientName) {
  const number = formatWhatsAppNumber(patientPhone);
  const msg = `Bonjour ${patientName || ''}, je suis Ibrahim votre kinésithérapeute. Je suis en route et j'arrive à votre domicile dans environ 10 minutes. À tout de suite !`;
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}
