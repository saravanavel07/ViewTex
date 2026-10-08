import React from 'react';
import { ViewtexLogo } from '../mascot/ViewtexLogo';
import { MascotState } from '../mascot/MascotAlien';
import {
  FileText,
  Bookmark,
  History,
  Activity,
  Split,
  Settings,
  Info,
  Sparkles,
  Search as SearchIcon,
} from 'lucide-react';

export type ActiveTab =
  | 'search'
  | 'explore'
  | 'documents'
  | 'collections'
  | 'history'
  | 'compare'
  | 'health'
  | 'about';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mascotState: MascotState;
  onMascotClick: () => void;
  collectionsCount: number;
  historyCount: number;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  mascotState,
  onMascotClick,
  collectionsCount,
  historyCount,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E6E1D7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: VIEWTEX Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab('search')}
            className="flex items-center text-left focus:outline-none group"
            title="VIEWTEX — Return to Search"
          >
            <ViewtexLogo
              layout="horizontal"
              size="sm"
              mascotState={mascotState}
              onMascotClick={onMascotClick}
            />
          </button>

          {/* Primary Navigation Typography Links (Zero-pill discipline) */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <button
              onClick={() => onSelectTab('search')}
              className={`transition-colors py-1 relative ${
                activeTab === 'search'
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70] hover:text-[#1E2022]'
              }`}
            >
              Search
            </button>

            <button
              onClick={() => onSelectTab('explore')}
              className={`transition-colors py-1 relative ${
                activeTab === 'explore'
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70] hover:text-[#1E2022]'
              }`}
            >
              Explore
            </button>

            <button
              onClick={() => onSelectTab('documents')}
              className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70] hover:text-[#1E2022]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Documents
            </button>

            <button
              onClick={() => onSelectTab('collections')}
              className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                activeTab === 'collections'
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70] hover:text-[#1E2022]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Collections
              {collectionsCount > 0 && (
                <span className="text-[10px] text-[#848B94] font-mono">
                  ({collectionsCount})
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70] hover:text-[#1E2022]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
              {historyCount > 0 && (
                <span className="text-[10px] text-[#848B94] font-mono">
                  ({historyCount})
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('compare')}
              className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                activeTab === 'compare'
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70] hover:text-[#1E2022]'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Compare
            </button>

            <button
              onClick={() => onSelectTab('health')}
              className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                activeTab === 'health'
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70] hover:text-[#1E2022]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Health
            </button>

            <button
              onClick={() => onSelectTab('about')}
              className={`transition-colors py-1 relative flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70] hover:text-[#1E2022]'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              About
            </button>
          </nav>
        </div>

        {/* Right: Controls & Preferences */}
        <div className="flex items-center gap-2">
          {/* Mascot Interaction Button */}
          <button
            onClick={onMascotClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#575D65] hover:text-[#1E2022] rounded-md hover:bg-[#F3EFE6] transition-colors"
            title="Interact with VIEWTEX Mascot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C87A3E]" />
            <span className="font-mono text-[11px]">Mascot</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-[#575D65] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
            aria-label="Settings and Preferences"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-[#ECE8E0] gap-4 text-xs font-medium no-scrollbar">
        {(['search', 'explore', 'documents', 'collections', 'history', 'compare', 'health', 'about'] as ActiveTab[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`capitalize shrink-0 pb-1 ${
                activeTab === tab
                  ? 'text-[#1E2022] font-semibold border-b-2 border-[#2C3036]'
                  : 'text-[#666B70]'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>
    </header>
  );
};
