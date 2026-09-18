import Shell from "@/components/Shell";
import SectionHeader from "@/components/SectionHeader";
import DestinationBrowser from "@/components/DestinationBrowser";
export default function Destinations() { return <Shell><main className="section-pad pt-40"><SectionHeader eyebrow="The global network" title="Leave the ordinary behind." text="Explore the airports and cities currently connected by Aer Infinity virtual operations." /><DestinationBrowser /></main></Shell>; }