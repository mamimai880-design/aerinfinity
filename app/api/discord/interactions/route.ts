import { NextResponse } from "next/server";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";

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
