import Link from "next/link";
import Shell from "@/components/Shell";
import SectionHeader from "@/components/SectionHeader";
import DiscordSection from "@/components/DiscordSection";
import { site } from "@/data/site";

export default function About() {
  return <Shell><main className="pt-[76px]">
    <section className="section-pad grid items-end gap-8 border-b border-white/10 md:grid-cols-2">
      <div><p className="eyebrow mb-5">About Aer Infinity</p><h1 className="display-font text-6xl leading-none md:text-8xl">From Kansai<br /><span className="text-[#54d5ff]">to beyond.</span></h1></div>
      <p className="max-w-md text-base leading-7 text-[#95a9bf]">Aer Infinity is a Japanese low-cost airline development experiment, founded in Osaka to grow a carrier from a small regional operation into an international airline.</p>
    </section>
    <section className="section-pad grid gap-12 md:grid-cols-3">
      <div><p className="eyebrow mb-4">Formation</p><h2 className="display-font text-4xl">A focused beginning.</h2></div>
      <div className="grid gap-7 text-[#95a9bf] md:col-span-2 md:grid-cols-2"><p className="leading-7">Aer Infinity was established on <strong className="text-[#f4f8fc]">{site.founded}</strong> in {site.headquarters}. Founded by <Link href={site.founderUrl} className="text-[#54d5ff] hover:underline">{site.founder}</Link>, the airline is built as a long-term development project focused on fleet, routes, operations, and commercial strategy.</p><p className="leading-7">{site.hub} was selected as headquarters and primary hub. Initial services are centered on domestic and regional destinations while the operation establishes its foundation.</p></div>
    </section>
    <section className="section-pad border-y border-white/10 bg-[#081829]"><SectionHeader eyebrow="Early operations" title="Grow deliberately." text="Aer Infinity is in its early operational stage. New aircraft and routes will be introduced over time, with international expansion planned as operational capacity develops." /><div className="grid gap-4 md:grid-cols-3">{[["01", "Build the fleet", "The Airbus A320-200 is the airline's first aircraft type, with two aircraft in service."], ["02", "Connect Japan", "The initial network links Kansai with Tokyo, Fukuoka, and Sapporo."], ["03", "Expand internationally", "International service is the next stage, not the starting point."]].map(([number, title, text]) => <div key={number} className="border-t border-[#54d5ff]/40 pt-5"><p className="eyebrow">{number}</p><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-[#95a9bf]">{text}</p></div>)}</div></section>
    <section className="section-pad"><SectionHeader eyebrow="Service philosophy" title="Essential, efficient, evolving." text="Aer Infinity follows a low-cost operating model. The initial onboard offering focuses on essential passenger services, with additional food, beverages, entertainment, and other amenities developing alongside the fleet and network." /></section>
    <DiscordSection />
  </main></Shell>;
}
