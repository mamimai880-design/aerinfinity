import { NextResponse } from "next/server";

type RouteRequest = { origin?: string; destination?: string; city?: string; discord?: string };

export async function POST(request: Request) {
  const webhookUrl = process.env.DISCORD_APPLICATION_WEBHOOK_URL;
  if (!webhookUrl) return NextResponse.json({ error: "Route requests are not configured." }, { status: 503 });
  const body = await request.json() as RouteRequest;
  if (!body.origin || !body.destination || !body.city || !body.discord) return NextResponse.json({ error: "Complete all route request fields." }, { status: 400 });
  const response = await fetch(`${webhookUrl}?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Aer Infinity Route Planning", embeds: [{ title: "Route demand request", color: 5594623, fields: [{ name: "Route", value: `${body.origin} -> ${body.destination}`, inline: true }, { name: "Destination", value: `${body.city} (${body.destination})`, inline: true }, { name: "Requested by", value: body.discord }], footer: { text: "Aer Infinity flight screen" }, timestamp: new Date().toISOString() }] }),
  });
  if (!response.ok) return NextResponse.json({ error: "Could not send the route request." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
