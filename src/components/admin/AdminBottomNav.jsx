import React from 'react';
import { Route, Inbox, Receipt, History } from 'lucide-react';

export default function AdminBottomNav({ activeTab, onSelectTab, pendingCount = 0 }) {
  const tabs = [
    {
      id: 'tournee',
      label: 'Tournée',
      icon: Route,
      badge: null,
    },
    {
      id: 'demandes',
      label: 'Demandes',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: 'factures',
      label: 'Factures',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'historique',
      label: 'Historique',
      icon: History,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 safe-bottom shadow-lg no-print">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`
                relative flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none
                ${isActive ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'}
              `}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-primary' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
