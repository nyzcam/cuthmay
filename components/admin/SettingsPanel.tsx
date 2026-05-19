import { motion } from "framer-motion";
import { RefreshCw, RotateCcw, SlidersHorizontal, Sparkles, Wand2 } from "lucide-react";
import { Theme, ThemeName } from "@/config/themeConfig";

interface SettingsPanelProps {
  currentTheme: Theme;
  currentThemeName: ThemeName;
  availableThemes: Theme[];
  onThemeChange: (theme: ThemeName) => void;
  onResetTheme: () => void;
  onRefreshData: () => void;
  onResetFilters: () => void;
  onClearSearch: () => void;
  isLoadingGuests: boolean;
  isLoadingComments: boolean;
  searchQuery: string;
  filterRelationship: string;
  commentStatusFilter: string;
}

function ThemePreview({ theme, isActive }: { theme: Theme; isActive: boolean }) {
  return (
    <span
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[10px] font-bold uppercase tracking-[0.2em]"
      style={{
        background: `${theme.cssVars.primary}22`,
        borderColor: isActive ? theme.cssVars.primary : "rgba(255,255,255,0.12)",
        color: theme.cssVars.light,
      }}
    >
      {theme.id.slice(0, 2)}
    </span>
  );
}

export function SettingsPanel({
  currentTheme,
  currentThemeName,
  availableThemes,
  onThemeChange,
  onResetTheme,
  onRefreshData,
  onResetFilters,
  onClearSearch,
  isLoadingGuests,
  isLoadingComments,
  searchQuery,
  filterRelationship,
  commentStatusFilter,
}: SettingsPanelProps) {
  const activeFilters = [searchQuery, filterRelationship !== "all", commentStatusFilter !== "all"].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/70">
              <SlidersHorizontal size={16} />
              <span className="text-sm font-medium">ការកំណត់</span>
            </div>
            <h2 className="text-xl font-bold text-white">Settings panel</h2>
            <p className="max-w-2xl text-sm leading-6 text-white/45">
              ប្ដូររូបរាងផ្ទាំងគ្រប់គ្រង, សម្អាតតម្រង, និងធ្វើឲ្យទិន្នន័យទាន់សម័យនៅទីនេះ។
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={onRefreshData}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              <RefreshCw size={15} className={isLoadingGuests || isLoadingComments ? "animate-spin" : undefined} />
              Refresh
            </button>
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              <Sparkles size={15} />
              Reset filters
            </button>
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              <Wand2 size={15} />
              Clear search
            </button>
            <button
              type="button"
              onClick={onResetTheme}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              <RotateCcw size={15} />
              Default theme
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Current theme</p>
            <div className="mt-3 flex items-center gap-3">
              <ThemePreview theme={currentTheme} isActive />
              <div>
                <p className="text-sm font-semibold text-white">{currentTheme.name}</p>
                <p className="text-xs text-white/45">{currentTheme.description}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Active filters</p>
            <p className="mt-3 text-2xl font-bold text-white">{activeFilters}</p>
            <p className="text-xs text-white/45">ភាគរយតម្រងសកម្មនៅលើទំព័រ</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Theme id</p>
            <p className="mt-3 text-2xl font-bold text-white">{currentThemeName}</p>
            <p className="text-xs text-white/45">បានរក្សាទុកក្នុង local storage</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Appearance</h3>
            <p className="text-sm text-white/45">ជ្រើសរើសប្រធានបទដែលសមនឹងពិធីមង្គលការ និងផ្ទៃខាងក្រោយរបស់អ្នក</p>
          </div>
          <div className="text-xs text-white/35">{availableThemes.length} themes</div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {availableThemes.map((theme) => {
            const isActive = theme.id === currentThemeName;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onThemeChange(theme.id)}
                className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                  isActive ? "shadow-lg shadow-cyan-500/10" : "bg-black/10 hover:bg-white/10"
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${theme.cssVars.primary}26, ${theme.cssVars.dark}1f)`
                    : undefined,
                  borderColor: isActive ? theme.cssVars.primary : "rgba(255,255,255,0.12)",
                }}
              >
                <div className="flex items-start gap-3">
                  <ThemePreview theme={theme} isActive={isActive} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">{theme.name}</p>
                      {isActive && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white/60">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/45">{theme.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}