export type Destination = { code: string; city: string; airport: string; country: string; region: string; hub?: boolean; image: string; };
export const destinations: Destination[] = [
  { code: "KIX", city: "Osaka", airport: "Kansai International Airport", country: "Japan", region: "Asia", hub: true, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80" },
  { code: "HND", city: "Tokyo", airport: "Haneda Airport", country: "Japan", region: "Asia", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80" },
  { code: "FUK", city: "Fukuoka", airport: "Fukuoka Airport", country: "Japan", region: "Asia", image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1000&q=80" },
  { code: "CTS", city: "Sapporo", airport: "New Chitose Airport", country: "Japan", region: "Asia", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1000&q=80" },
];