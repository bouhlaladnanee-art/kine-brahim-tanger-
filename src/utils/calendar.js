
function getEventDates(dateStr, timeSlot) {
  let startHour = 9;
  let endHour = 10;

  if (timeSlot === 'apres_midi') {
    startHour = 14;
    endHour = 15;
  } else if (timeSlot === 'fin_journee') {
    startHour = 17;
    endHour = 18;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  
  const startDate = new Date(Date.UTC(year, month - 1, day, startHour, 0, 0));
  const endDate = new Date(Date.UTC(year, month - 1, day, endHour, 0, 0));

  const formatUTC = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return {
    startUTC: formatUTC(startDate),
    endUTC: formatUTC(endDate),
    startDate,
    endDate
  };
}

export function generateGoogleCalendarUrl(appointment) {
  const { startUTC, endUTC } = getEventDates(appointment.date, appointment.timeSlot);
  
  const title = `Kiné Domicile — ${appointment.patientName} (${appointment.careTypeTitle})`;
  
  let details = `Séance de kinésithérapie à domicile à Tanger\n\n`;
  details += `Patient : ${appointment.patientName}\n`;
  details += `Téléphone : ${appointment.phone}\n`;
  details += `Soin : ${appointment.careTypeTitle}\n`;
  details += `Quartier : ${appointment.neighborhoodName}\n`;
  if (appointment.addressDetails) {
    details += `Adresse : ${appointment.addressDetails}\n`;
  }
  if (appointment.notes) {
    details += `Remarques : ${appointment.notes}\n`;
  }
  if (appointment.geoCoordinates) {
    details += `GPS : https://maps.google.com/?q=${appointment.geoCoordinates.latitude},${appointment.geoCoordinates.longitude}\n`;
  }

  const location = appointment.addressDetails 
    ? `${appointment.addressDetails}, ${appointment.neighborhoodName}, Tanger, Maroc`
    : `${appointment.neighborhoodName}, Tanger, Maroc`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startUTC}/${endUTC}`,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICSFile(appointment) {
  const { startUTC, endUTC } = getEventDates(appointment.date, appointment.timeSlot);
  
  const title = `Kiné Domicile — ${appointment.patientName}`;
  const location = `${appointment.addressDetails || ''}, ${appointment.neighborhoodName}, Tanger, Maroc`.trim();
  const description = `Séance Kiné à domicile Tanger\\nPatient: ${appointment.patientName}\\nTél: ${appointment.phone}\\nSoin: ${appointment.careTypeTitle}\\nNotes: ${appointment.notes || 'Aucune'}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kine Tanger Domicile//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:kine-${appointment.id}@kinetanger.ma`,
    `DTSTAMP:${startUTC}`,
    `DTSTART:${startUTC}`,
    `DTEND:${endUTC}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `kine-${appointment.patientName.replace(/\s+/g, '_')}-${appointment.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
