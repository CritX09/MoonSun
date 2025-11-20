import React, { useState } from 'react';
import { AppTheme } from './types';
import { ThemeToggle } from './components/ThemeToggle';
import { AutomationPanel } from './components/AutomationPanel';
import { SmartAssistant } from './components/SmartAssistant';
import { NetworkChart } from './components/NetworkChart';
import { Monitor, Cpu, Wifi, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [theme, setTheme] = useState<AppTheme>(AppTheme.SUNSHINE);

  const isSun = theme === AppTheme.SUNSHINE;

  return (
    <div className={`min-h-screen transition-colors duration-700 overflow-x-hidden ${
      isSun 
        ? 'bg-gradient-to-br from-orange-50 via-white to-yellow-50' 
        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
    }`}>
      
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          <h1 className={`text-4xl md:text-6xl font-black tracking-tight mb-4 transition-colors duration-500 ${
            isSun ? 'text-orange-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400'
          }`}>
            MOONLIGHT<span className={isSun ? 'text-orange-500' : 'text-indigo-500'}>/</span>SUNSHINE
          </h1>
          <p className={`text-lg font-medium mb-8 ${isSun ? 'text-gray-600' : 'text-indigo-200/70'}`}>
            Automation & Optimization Hub
          </p>
          
          <ThemeToggle currentTheme={theme} onToggle={setTheme} />
        </header>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Monitor, label: "Host Status", val: "Online", color: isSun ? "text-green-600" : "text-green-400" },
            { icon: Wifi, label: "Network", val: "5Ghz / 866Mbps", color: isSun ? "text-blue-600" : "text-blue-400" },
            { icon: Cpu, label: "Encoding", val: "HEVC HDR", color: isSun ? "text-purple-600" : "text-purple-400" },
            { icon: Settings, label: "Mode", val: isSun ? "Productivity" : "Low Latency", color: isSun ? "text-orange-600" : "text-indigo-400" },
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-xl border backdrop-blur-sm flex flex-col items-center justify-center gap-2 transition-colors duration-500 ${
              isSun 
                ? 'bg-white/60 border-orange-100 hover:border-orange-300' 
                : 'bg-white/5 border-white/10 hover:border-indigo-500/50'
            }`}>
              <stat.icon className={stat.color} size={24} />
              <span className={`text-xs font-bold uppercase tracking-wider ${isSun ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</span>
              <span className={`font-bold ${isSun ? 'text-gray-800' : 'text-gray-200'}`}>{stat.val}</span>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* Left Column: Visualization & Quick Actions */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <NetworkChart theme={theme} />
            
            <div className="flex-1 h-full min-h-[500px]">
               <AutomationPanel theme={theme} />
            </div>
          </div>

          {/* Right Column: Assistant */}
          <div className="lg:col-span-4 h-[600px] lg:h-auto">
            <SmartAssistant theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
