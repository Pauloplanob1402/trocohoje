// Service to handle OpenStreetMap and Geolocation logic

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export const getCurrentLocation = (): Promise<GeoLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não suportada"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocoding using OpenStreetMap Nominatim API (Free, no key required for low volume)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          // Extract neighborhood or city
          const address = data.address.suburb || data.address.neighbourhood || data.address.city || data.address.town || "Localização desconhecida";
          
          resolve({
            lat: latitude,
            lng: longitude,
            address: `${address}`
          });
        } catch (error) {
          console.error("Erro ao buscar endereço:", error);
          resolve({ lat: latitude, lng: longitude, address: "Minha Localização" });
        }
      },
      (error) => {
        console.error("Erro de permissão GPS:", error);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};