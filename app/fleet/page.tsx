import Shell from "@/components/Shell";
import SectionHeader from "@/components/SectionHeader";
import FleetBrowser from "@/components/FleetBrowser";
export default function Fleet() { return <Shell><main className="section-pad pt-40"><SectionHeader eyebrow="The Aer Infinity fleet" title="Aircraft with somewhere to be." text="Fictional fleet assignments for every kind of virtual operation. Select an aircraft to inspect its profile." /><FleetBrowser /></main></Shell>; }