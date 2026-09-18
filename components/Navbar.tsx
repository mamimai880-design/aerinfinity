"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { site } from "@/data/site";
const links = [["About", "/about"], ["Fleet", "/fleet"], ["Destinations", "/destinations"], ["Operations", "/operations"], ["Community", "/community"]];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#06111f]/75 backdrop-blur-xl"><div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-5 lg:px-8"><Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}><Image src="/aer-infinity-logo.svg" alt="Aer Infinity" width={210} height={76} className="h-14 w-auto object-contain" priority /></Link><nav className="hidden items-center gap-7 lg:flex">{links.map(([label, href]) => <Link key={href} href={href} className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#95a9bf] transition-colors hover:text-white">{label}</Link>)}<a href={site.discord} className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#95a9bf] hover:text-white">Discord</a><Link href="/join" className="border border-[#54d5ff]/50 px-4 py-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#54d5ff] transition hover:bg-[#54d5ff] hover:text-[#06111f]">Join us</Link></nav><button className="p-2 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>{open && <nav className="border-t border-white/10 bg-[#071522] px-5 py-5 lg:hidden">{[...links, ["Join us", "/join"]].map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-white/10 py-4 text-xs font-bold uppercase tracking-[.18em] text-[#dce9f5]">{label}</Link>)}</nav>}</header>;
}