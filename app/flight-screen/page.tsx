import Shell from "@/components/Shell";
import FlightDemandScreen from "@/components/FlightDemandScreen";

export const metadata = { title: "Flight Planner | Aer Infinity", description: "Plan a virtual Aer Infinity itinerary from Kansai." };

export default function FlightScreenPage() { return <Shell><main className="pt-[76px]"><FlightDemandScreen /></main></Shell>; }
