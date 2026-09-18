type RequestPayload = { origin: string; destination: string; city: string; tripType?: string; depart?: string; returnDate?: string; passengers?: string; stopover?: string; hotel?: boolean };

type DiscordMessage = { timestamp?: string; embeds?: Array<{ fields?: Array<{ name?: string; value?: string }> }> };

export async function getFlightBrief(request: RequestPayload) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const webhookUrl = process.env.DISCORD_APPLICATION_WEBHOOK_URL;
  const channelId = await getWebhookChannel(webhookUrl, botToken);
  const messages = channelId && botToken ? await getRecentMessages(channelId, botToken) : [];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const routeRequests = messages.filter((message) => {
    const timestamp = message.timestamp ? Date.parse(message.timestamp) : 0;
    const route = message.embeds?.[0]?.fields?.find((field) => field.name === "Route")?.value || "";
    return timestamp >= weekAgo && route.includes(`${request.origin} -> ${request.destination}`);
  });
  const passengers = routeRequests.reduce((total, message) => {
    const value = message.embeds?.[0]?.fields?.find((field) => field.name === "Passengers")?.value;
    return total + Math.max(1, Number(value) || 1);
  }, 0);
  const weather = await getWeather(request.origin, request.depart);
  const aviation = await getAviation(request.origin, request.destination, request.depart);
  const fare = request.tripType === "roundtrip" ? 118 : request.tripType === "stopover" ? 148 : 69;
  return { requests: routeRequests.length, passengers: Math.max(passengers, routeRequests.length), estimatedPay: fare * Math.max(passengers, routeRequests.length), fare, weather, aviation, request };
}

async function getWebhookChannel(webhookUrl?: string, botToken?: string) {
  if (!webhookUrl || !botToken) return undefined;
  const response = await fetch(webhookUrl, { headers: { Authorization: `Bot ${botToken}` } });
  if (!response.ok) return undefined;
  return (await response.json() as { channel_id?: string }).channel_id;
}

async function getRecentMessages(channelId: string, botToken: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=100`, { headers: { Authorization: `Bot ${botToken}` } });
  if (!response.ok) return [];
  return await response.json() as DiscordMessage[];
}

async function getWeather(origin: string, date?: string) {
  const coordinates: Record<string, [number, number]> = { KIX: [34.4347, 135.244] };
  const [latitude, longitude] = coordinates[origin] || coordinates.KIX;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,visibility,weather_code");
  if (date) { url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,weather_code"); url.searchParams.set("forecast_days", "16"); }
  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) return { source: "Open-Meteo", available: false };
  const data = await response.json() as { current?: Record<string, number>; daily?: { time?: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[]; precipitation_probability_max?: number[]; wind_speed_10m_max?: number[] } };
  const index = date && data.daily?.time ? data.daily.time.indexOf(date) : -1;
  return { source: "Open-Meteo", available: true, current: data.current, date: index >= 0 ? { max: data.daily?.temperature_2m_max?.[index], min: data.daily?.temperature_2m_min?.[index], rain: data.daily?.precipitation_probability_max?.[index], wind: data.daily?.wind_speed_10m_max?.[index] } : undefined };
}

async function getAviation(origin: string, destination: string, date?: string) {
  const key = process.env.AVIATIONSTACK_ACCESS_KEY;
  if (!key) return { source: "Aviationstack", available: false, flights: undefined };
  const url = new URL("https://api.aviationstack.com/v1/flights");
  url.searchParams.set("access_key", key); url.searchParams.set("dep_iata", origin); url.searchParams.set("arr_iata", destination); url.searchParams.set("flight_status", "scheduled");
  if (date) url.searchParams.set("flight_date", date);
  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) return { source: "Aviationstack", available: false, flights: undefined };
  const data = await response.json() as { data?: Array<{ flight?: { number?: string }; departure?: { scheduled?: string }; arrival?: { scheduled?: string }; airline?: { name?: string } }> };
  return { source: "Aviationstack", available: true, flights: (data.data || []).slice(0, 5).map((flight) => `${flight.flight?.number || "Flight"} · ${flight.airline?.name || "Scheduled"} · ${flight.departure?.scheduled || "time pending"}`) };
}
