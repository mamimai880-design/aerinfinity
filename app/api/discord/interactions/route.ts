import { NextResponse } from "next/server";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { getFlightBrief } from "@/lib/flight-brief";

type Interaction = {
  type: number;
  data?: { custom_id?: string };
  message?: { embeds?: unknown[] };
};

function interactionResponse(content: string) {
  return NextResponse.json({ type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE, data: { content, flags: 64 } });
}

export async function POST(request: Request) {
  const publicKey = process.env.DISCORD_APPLICATION_PUBLIC_KEY;
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const rawBody = await request.text();

  if (!publicKey || !signature || !timestamp || !(await verifyKey(rawBody, signature, timestamp, publicKey))) {
    return new NextResponse("Invalid request signature.", { status: 401 });
  }

  let interaction: Interaction;
  try {
    interaction = JSON.parse(rawBody) as Interaction;
  } catch {
    return new NextResponse("Invalid interaction payload.", { status: 400 });
  }

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.MESSAGE_COMPONENT && interaction.data?.custom_id?.startsWith("flightbrief:")) {
    const [, origin, destination, city, depart, tripType] = interaction.data.custom_id.split(":");
    const action = interaction.data.custom_id.split(":")[6];
    if (action === "approve" || action === "reject") {
      const approved = action === "approve";
      return NextResponse.json({ type: InteractionResponseType.UPDATE_MESSAGE, data: { content: `Flight brief ${approved ? "approved" : "rejected"} by operations.`, embeds: interaction.message?.embeds || [], components: [{ type: 1, components: [{ type: 2, style: approved ? 3 : 4, label: approved ? "Route approved" : "Route rejected", custom_id: `flightbrief:${origin}:${destination}:${city}:${depart}:${tripType}:${action}`, disabled: true }, { type: 2, style: 2, label: "Refresh data", custom_id: `flightbrief:${origin}:${destination}:${city}:${depart}:${tripType}:refresh` }] }] } });
    }
    const brief = await getFlightBrief({ origin, destination, city, depart, tripType });
    const weather = brief.weather.date ? `Forecast: ${brief.weather.date.min}–${brief.weather.date.max}°C · rain ${brief.weather.date.rain}% · wind ${brief.weather.date.wind} km/h` : "Current weather available";
    const flights = brief.aviation.flights?.join("\n") || "Aviationstack key not configured; use the planning schedule.";
    return NextResponse.json({ type: InteractionResponseType.UPDATE_MESSAGE, data: { content: "Flight brief generated for staff.", embeds: [{ title: `${origin} -> ${destination} flight brief`, color: 5594623, fields: [{ name: "Weekly interest", value: `${brief.requests} requests · ${brief.passengers} passengers`, inline: true }, { name: "Estimated route pay", value: `$${brief.estimatedPay} total · $${brief.fare} per passenger`, inline: true }, { name: "Takeoff weather", value: weather }, { name: "Flight data", value: flights }], footer: { text: "Aer Infinity operations brief" }, timestamp: new Date().toISOString() }], components: [{ type: 1, components: [{ type: 2, style: 3, label: "Approve route", custom_id: `flightbrief:${origin}:${destination}:${city}:${depart}:${tripType}:approve` }, { type: 2, style: 4, label: "Reject route", custom_id: `flightbrief:${origin}:${destination}:${city}:${depart}:${tripType}:reject` }, { type: 2, style: 2, label: "Refresh data", custom_id: `flightbrief:${origin}:${destination}:${city}:${depart}:${tripType}:refresh` }] }] } });
  }

  if (interaction.type !== InteractionType.MESSAGE_COMPONENT || !interaction.data?.custom_id?.startsWith("application:")) {
    return interactionResponse("This interaction is not supported.");
  }

  const [, decision, applicantId] = interaction.data.custom_id.split(":");
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken || !applicantId || !/^\d{17,20}$/.test(applicantId)) {
    return interactionResponse("Discord bot messaging is not configured.");
  }

  const accepted = decision === "accept";
  const message = accepted
    ? "Your Aer Infinity application has been accepted. Welcome aboard. Please check the community for your next steps."
    : "Thank you for applying to Aer Infinity. We are unable to accept your application at this time, but we appreciate your interest.";
  const dmChannel = await discordRequest("/users/@me/channels", botToken, { recipient_id: applicantId });
  if (!dmChannel.ok) return interactionResponse("The applicant could not be messaged. They may have DMs disabled.");
  const channel = await dmChannel.json() as { id?: string };
  if (!channel.id) return interactionResponse("The applicant DM channel could not be created.");
  const dmMessage = await discordRequest(`/channels/${channel.id}/messages`, botToken, { content: message });
  if (!dmMessage.ok) return interactionResponse("The applicant could not be messaged. They may have DMs disabled.");

  const label = accepted ? "Accepted" : "Rejected";
  return NextResponse.json({
    type: InteractionResponseType.UPDATE_MESSAGE,
    data: {
      content: `Application ${label.toLowerCase}. The applicant was notified by Discord.`,
      embeds: interaction.message?.embeds || [],
      components: [{ type: 1, components: [
        { type: 2, style: accepted ? 3 : 4, label, custom_id: `application:${decision}:${applicantId}`, disabled: true },
        { type: 2, style: accepted ? 4 : 3, label: accepted ? "Reject" : "Confirm", custom_id: `application:${accepted ? "reject" : "accept"}:${applicantId}`, disabled: true },
      ] }],
    },
  });
}

async function discordRequest(path: string, token: string, body: Record<string, string>) {
  return fetch(`https://discord.com/api/v10${path}`, {
    method: "POST",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
