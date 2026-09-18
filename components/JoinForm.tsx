"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "sending" | "sent" | "error";

export default function JoinForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "The application could not be sent.");
      setStatus("sent");
      form.reset();
    } catch (submissionError) {
      setStatus("error");
      setError(submissionError instanceof Error ? submissionError.message : "The application could not be sent.");
    }
  }

  if (status === "sent") return <div className="glass p-8 text-center md:p-14"><p className="eyebrow">Application delivered</p><h2 className="display-font mt-4 text-4xl">You are cleared for departure.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#95a9bf]">Your application has been sent to the Aer Infinity recruitment team.</p><button onClick={() => setStatus("idle")} className="mt-8 border border-[#54d5ff]/50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#54d5ff]">Submit another</button></div>;

  return <form onSubmit={submit} className="glass grid gap-5 p-6 md:grid-cols-2 md:p-9"><label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#95a9bf]">Name<input name="name" required maxLength={100} className="border border-white/15 bg-[#06111f] p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#54d5ff]" /></label><label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#95a9bf]">Discord username<input name="discord" required maxLength={100} className="border border-white/15 bg-[#06111f] p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#54d5ff]" /></label><label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#95a9bf]">Discord user ID<input name="discordId" required pattern="[0-9]{17,20}" maxLength={20} inputMode="numeric" placeholder="Example: 123456789012345678" className="border border-white/15 bg-[#06111f] p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#54d5ff]" /><span className="text-[10px] font-normal normal-case tracking-normal text-[#60758d]">Required so we can message you when a decision is made.</span></label><label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#95a9bf]">Experience<select name="experience" className="border border-white/15 bg-[#06111f] p-3 text-sm font-normal normal-case tracking-normal outline-none"><option>New to flight simulation</option><option>Some experience</option><option>Experienced pilot</option></select></label><label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#95a9bf]">Favorite aircraft<input name="aircraft" required maxLength={100} className="border border-white/15 bg-[#06111f] p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#54d5ff]" /></label><label className="grid gap-2 text-xs font-bold uppercase tracking-widest text-[#95a9bf] md:col-span-2">Why do you want to join?<textarea name="reason" required maxLength={2000} rows={5} className="resize-y border border-white/15 bg-[#06111f] p-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#54d5ff]" /></label>{status === "error" && <p role="alert" className="text-sm text-[#ff9c9c] md:col-span-2">{error}</p>}<button disabled={status === "sending"} className="bg-[#54d5ff] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#06111f] transition hover:bg-white disabled:cursor-wait disabled:opacity-60 md:col-span-2 md:justify-self-start">{status === "sending" ? "Sending application..." : "Send application"}</button></form>;
}
