import { NextResponse } from "next/server";
import { destinations } from "@/data/destinations";

const fallback = destinations.map((destination, index) => ({
  origin: "KIX",
  destination: destination.code,
  city: destination.city,
  airport: destination.airport,
  demand: [72, 64, 58, 49][index] || 42,
  level: ["High", "High", "Medium", "Medium"][index] || "Medium",
  flightsToday: [18, 15, 11, 8][index] || 6,
  live: false,
}));

export async function GET() {
  const accessKey = process.env.AVIATIONSTACK_ACCESS_KEY;
  if (!accessKey) return NextResponse.json({ source: "planned network", live: false, routes: fallback });

  try {
    const responses = await Promise.all(destinations.map(async (destination) => {
      const url = new URL("https://api.aviationstack.com/v1/flights");
      url.searchParams.set("access_key", accessKey);
      url.searchParams.set("dep_iata", destination.code === "KIX" ? "KIX" : "KIX");
      url.searchParams.set("arr_iata", destination.code);
      url.searchParams.set("flight_status", "scheduled");
      const response = await fetch(url, { next: { revalidate: 900 } });
      if (!response.ok) throw new Error("Aviation data unavailable");
      const result = await response.json() as { data?: unknown[] };
      const flightsToday = result.data?.length || 0;
      const demand = Math.min(98, Math.max(10, flightsToday * 7));
      return { origin: "KIX", destination: destination.code, city: destination.city, airport: destination.airport, demand, level: demand > 70 ? "High" : demand > 40 ? "Medium" : "Low", flightsToday, live: true };
    }));
    return NextResponse.json({ source: "Aviationstack scheduled flight data", live: true, routes: responses });
  } catch {
    return NextResponse.json({ source: "planned network", live: false, routes: fallback });
  }
}
