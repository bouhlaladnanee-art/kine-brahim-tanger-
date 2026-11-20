
export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error("La géolocalisation n'est pas supportée par votre navigateur."));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        });
      },
      (error) => {
        let message = "Impossible de récupérer votre position GPS.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Accès GPS refusé. Vous pouvez autoriser la localisation dans vos paramètres ou préciser votre adresse.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Position GPS indisponible. Veuillez vérifier votre connexion.";
            break;
          case error.TIMEOUT:
            message = "Délai d'attente dépassé pour la capture GPS.";
            break;
        }
        reject(new Error(message));
      },
      options
    );
  });
}
