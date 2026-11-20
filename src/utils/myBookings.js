// Réservations du patient mémorisées sur SON appareil (jeton de suivi + résumé).
// Aucune donnée d'autres patients : seul le jeton permet de relire une demande.

const STORAGE_KEY = 'kine_tanger_my_bookings';

export function getMyBookings() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(list) ? list.filter(b => b && b.token) : [];
  } catch {
    return [];
  }
}

export function saveMyBooking({ token, patientName, careTypeTitle, date, timeSlotLabel }) {
  if (!token) return;
  try {
    const others = getMyBookings().filter(b => b.token !== token);
    const entry = { token, patientName, careTypeTitle, date, timeSlotLabel, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...others].slice(0, 20)));
  } catch {
    // Stockage indisponible (navigation privée) : le lien de suivi WhatsApp reste valable
  }
}

export function removeMyBooking(token) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getMyBookings().filter(b => b.token !== token)));
  } catch {
  }
}

export function getTrackingUrl(token) {
  return `${window.location.origin}/suivi/${token}`;
}

export function formatDateLong(iso, locale = 'fr-FR') {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
}
