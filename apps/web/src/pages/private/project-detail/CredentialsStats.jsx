import StatCard from "@/components/Stats";
import { Database, Key, Server, Zap } from "lucide-react";

export default function CredentialsStats({ credentials = [] }) {
  const live = credentials.filter(c => c.environment?.toLowerCase() === "live").length;
  const testing = credentials.filter(c => ["testing", "staging"].includes(c.environment?.toLowerCase())).length;
  const dev = credentials.filter(c => c.environment?.toLowerCase() === "development").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 ">
      <StatCard title="Total" value={credentials.length} icon={<Key size={18}/>} iconClass="text-purple-500 bg-purple-500/15" />
      <StatCard title="Live" value={live} icon={<Server size={18}/>} iconClass="text-red-500 bg-red-500/15" />
      <StatCard title="Testing/Staging" value={testing} icon={<Zap size={18}/>} iconClass="text-blue-500 bg-blue-500/15" />
      <StatCard title="Development" value={dev} icon={<Database size={18}/>} iconClass="text-green-500 bg-green-500/15" />
    </div>
  );
}