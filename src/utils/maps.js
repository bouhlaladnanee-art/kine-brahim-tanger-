
export function getGoogleMapsUrl(appointment) {
  if (appointment.geoCoordinates && appointment.geoCoordinates.latitude && appointment.geoCoordinates.longitude) {
    const { latitude, longitude } = appointment.geoCoordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  
  const query = encodeURIComponent(`${appointment.addressDetails || ''} ${appointment.neighborhoodName || ''} Tanger Maroc`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getWazeUrl(appointment) {
  if (appointment.geoCoordinates && appointment.geoCoordinates.latitude && appointment.geoCoordinates.longitude) {
    const { latitude, longitude } = appointment.geoCoordinates;
    return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  }
  
  const query = encodeURIComponent(`${appointment.neighborhoodName || ''} Tanger Maroc`.trim());
  return `https://waze.com/ul?q=${query}&navigate=yes`;
}
