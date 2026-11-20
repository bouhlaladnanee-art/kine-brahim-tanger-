import React from 'react';
import { Home, CalendarClock, Menu } from 'lucide-react';

const TABS = [
  { id: 'jour', label: "Aujourd'hui", icon: Home },
  { id: 'planning', label: 'Planning', icon: CalendarClock },
  { id: 'plus', label: 'Plus', icon: Menu },
];

export default function AdminBottomNav({ activeTab, onSelectTab, pendingCount = 0 }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 safe-bottom no-print">
      <div className="max-w-md mx-auto grid grid-cols-3 h-16">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge = id === 'jour' && pendingCount > 0 ? pendingCount : null;
          return (
            <button
              key={id}
              onClick={() => onSelectTab(id)}
              className={`flex flex-col items-center justify-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}
            >
              <span className="relative">
                <Icon className="w-6 h-6" />
                {badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[11px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </span>
              <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
