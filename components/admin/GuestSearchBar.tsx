import { Search, Filter } from "lucide-react";

interface GuestSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterRelationship: string;
  onFilterChange: (relationship: string) => void;
  relationshipLabels: Record<string, string>;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  "immediate-family": "គ្រួសារបន្ទាន់",
  family: "គ្រួសារ",
  vip: "VIP",
  friend: "មិត្តភ័ក្ដ",
  colleague: "មិត្តរួមការងារ",
  guest: "ភ្ញៀវ",
};

export function GuestSearchBar({
  searchQuery,
  onSearchChange,
  filterRelationship,
  onFilterChange,
}: GuestSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="ស្វែងរកភ្ញៀវ..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder-white/30 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10"
        />
      </div>
      <select
        value={filterRelationship}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm focus:outline-none focus:border-white/30 appearance-none"
      >
        <option value="all">ប្រភេទទាំងអស់</option>
        {Object.entries(RELATIONSHIP_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
