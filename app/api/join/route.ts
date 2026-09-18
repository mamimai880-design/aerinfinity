import { NextResponse } from "next/server";

const maxLength = 2_000;

type Application = {
  name?: string;
  discord?: string;
  discordId?: string;
  experience?: string;
  aircraft?: string;
  reason?: string;
};

export async function POST(request: Request) {
  const webhookUrl = process.env.DISCORD_APPLICATION_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Applications are not configured yet." }, { status: 503 });
  }

  let application: Application;
  try {
    application = await request.json() as Application;
  } catch {
    return NextResponse.json({ error: "Invalid application payload." }, { status: 400 });
  }

  const fields = [application.name, application.discord, application.discordId, application.experience, application.aircraft, application.reason];
  if (fields.some((field) => typeof field !== "string" || field.trim().length === 0 || field.length > maxLength)) {
    return NextResponse.json({ error: "Please complete every field with valid information." }, { status: 400 });
  }
  if (!/^\d{17,20}$/.test(application.discordId || "")) {
    return NextResponse.json({ error: "Please enter a valid Discord user ID." }, { status: 400 });
  }

  const messagePayload = {
      username: "Aer Infinity Recruitment",
      embeds: [{
        title: "New crew application",
        color: 5594623,
        fields: [
          { name: "Name", value: application.name, inline: true },
          { name: "Discord username", value: application.discord, inline: true },
          { name: "Discord user ID", value: application.discordId, inline: true },
          { name: "Experience", value: application.experience, inline: true },
          { name: "Favorite aircraft", value: application.aircraft, inline: true },
          { name: "Why they want to join", value: application.reason },
        ],
        footer: { text: "Aer Infinity recruitment" },
        timestamp: new Date().toISOString(),
      }],
      components: [{
        type: 1,
        components: [
          { type: 2, style: 3, label: "Confirm", custom_id: `application:accept:${application.discordId}` },
          { type: 2, style: 4, label: "Reject", custom_id: `application:reject:${application.discordId}` },
        ],
      }],
  };

  const botToken = process.env.DISCORD_BOT_TOKEN;
  let response: Response;
  if (botToken) {
    const webhookInfo = await fetch(webhookUrl, { headers: { Authorization: `Bot ${botToken}` } });
    const { channel_id: channelId } = await webhookInfo.json() as { channel_id?: string };
    if (!webhookInfo.ok || !channelId) {
      return NextResponse.json({ error: "The recruitment channel could not be found." }, { status: 502 });
    }
    response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: "New Aer Infinity crew application", embeds: messagePayload.embeds, components: messagePayload.components }),
    });
  } else {
    response = await fetch(`${webhookUrl}?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messagePayload),
    });
  }

  if (!response.ok) {
    return NextResponse.json({ error: "The application could not be delivered. Please try again later." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
