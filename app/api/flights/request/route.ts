import { NextResponse } from "next/server";

type RouteRequest = { origin?: string; destination?: string; city?: string; discord?: string; tripType?: string; depart?: string; returnDate?: string; passengers?: string; stopover?: string; hotel?: boolean };

export async function POST(request: Request) {
  const webhookUrl = process.env.DISCORD_APPLICATION_WEBHOOK_URL;
  const operationsChannelId = process.env.DISCORD_OPERATIONS_CHANNEL_ID || "1358547247016444223";
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!webhookUrl) return NextResponse.json({ error: "Route requests are not configured." }, { status: 503 });
  const body = await request.json() as RouteRequest;
  if (!body.origin || !body.destination || !body.city || !body.discord) return NextResponse.json({ error: "Complete all route request fields." }, { status: 400 });
  const payload = { embeds: [{ title: "Route demand request", color: 5594623, fields: [{ name: "Route", value: `${body.origin} -> ${body.destination}`, inline: true }, { name: "Destination", value: `${body.city} (${body.destination})`, inline: true }, { name: "Trip", value: body.tripType || "roundtrip", inline: true }, { name: "Depart", value: body.depart || "not specified", inline: true }, { name: "Passengers", value: body.passengers || "1", inline: true }, { name: "Requested by", value: body.discord }, ...(body.stopover ? [{ name: "Stopover", value: body.stopover, inline: true }] : []), ...(body.hotel ? [{ name: "Hotel bundle", value: "Requested", inline: true }] : [])], footer: { text: "Aer Infinity flight screen" }, timestamp: new Date().toISOString() }], components: [{ type: 1, components: [{ type: 2, style: 1, label: "Generate flight brief", custom_id: `flightbrief:${body.origin}:${body.destination}:${body.city}:${body.depart || ""}:${body.tripType || "roundtrip"}` }] }] };
  const response = botToken ? await fetch(`https://discord.com/api/v10/channels/${operationsChannelId}/messages`, { method: "POST", headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ content: "New Aer Infinity route request", ...payload }) }) : await fetch(`${webhookUrl}?wait=true`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "Aer Infinity Route Planning", ...payload }) });
  if (!response.ok) return NextResponse.json({ error: "Could not send the route request." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
