import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  RefreshCw, 
  Twitter, 
  Zap, 
  BarChart3, 
  Clock,
  ExternalLink,
  Search,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { scanForMarketEvents, MarketEvent } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock data for the chart to show "market volatility"
const volatilityData = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  value: 40 + Math.random() * 20 + (i > 10 ? Math.random() * 30 : 0),
}));

export default function App() {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const newEvents = await scanForMarketEvents();
      setEvents(newEvents);
      setLastScan(new Date());
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    handleScan();
    // Auto-scan every 5 minutes (simulated)
    const interval = setInterval(handleScan, 300000);
    return () => clearInterval(interval);
  }, [handleScan]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center border border-brand-accent/20">
            <Activity className="text-brand-accent w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">MARKET WATCH <span className="text-brand-accent">ALPHA</span></h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Sentiment Analysis Engine v2.4</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase">System Status</span>
            <span className="text-xs font-mono text-brand-bull flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-bull animate-pulse" />
              OPERATIONAL
            </span>
          </div>
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
              isScanning 
                ? "bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed" 
                : "bg-brand-accent/10 border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isScanning && "animate-spin")} />
            {isScanning ? "SCANNING..." : "FORCE SCAN"}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Left Column: Feed */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Live Intelligence Feed
            </h2>
            {lastScan && (
              <span className="text-[10px] font-mono text-slate-500">
                LAST UPDATED: {format(lastScan, 'HH:mm:ss')}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {events.length === 0 && !isScanning ? (
                <div className="glass-panel p-8 text-center">
                  <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">No recent high-impact events detected.</p>
                  <button onClick={handleScan} className="mt-4 text-brand-accent text-xs underline">Try scanning manually</button>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedEvent(event)}
                    className={cn(
                      "glass-panel p-4 cursor-pointer transition-all hover:border-brand-accent/50 group relative",
                      selectedEvent?.id === event.id && "border-brand-accent ring-1 ring-brand-accent/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                          <span className="text-xs font-bold text-slate-300">{event.author[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200">{event.author}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{event.timestamp}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        event.sentiment === 'bullish' ? "bg-brand-bull/10 text-brand-bull border border-brand-bull/20" :
                        event.sentiment === 'bearish' ? "bg-brand-bear/10 text-brand-bear border border-brand-bear/20" :
                        "bg-slate-800 text-slate-400 border border-slate-700"
                      )}>
                        {event.sentiment}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {event.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {event.affectedAssets.slice(0, 2).map(asset => (
                          <span key={asset} className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                            ${asset}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                        <BarChart3 className="w-3 h-3" />
                        IMPACT: {event.impactScore}%
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Analysis & Charts */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          {/* Top Row: Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-4 flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="scanline" />
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Volatility Index</span>
                <Activity className="w-4 h-4 text-brand-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">24.82</div>
                <div className="text-[10px] text-brand-bull font-mono">+4.2% (HIGH)</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volatilityData}>
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-4 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Sentiment Score</span>
                <TrendingUp className="w-4 h-4 text-brand-bull" />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono">68/100</div>
                <div className="text-[10px] text-brand-bull font-mono">BULLISH BIAS</div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-brand-bull h-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="glass-panel p-4 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Active Watchlist</span>
                <ShieldAlert className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['TRUMP', 'MUSK', 'POWELL', 'BUTERN'].map(name => (
                  <span key={name} className="text-[9px] font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-300">
                    {name}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-auto uppercase">
                Monitoring 12 sources
              </div>
            </div>
          </div>

          {/* Main Analysis Area */}
          <div className="flex-1 glass-panel flex flex-col min-h-0">
            {selectedEvent ? (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-brand-border flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-xl font-bold">
                      {selectedEvent.author[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{selectedEvent.author}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {selectedEvent.timestamp}
                        </span>
                        {selectedEvent.sourceUrl && (
                          <a 
                            href={selectedEvent.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-brand-accent hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Source
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-500 uppercase mb-1">Impact Probability</div>
                    <div className="text-2xl font-bold font-mono text-brand-accent">{selectedEvent.impactScore}%</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  <section>
                    <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Original Content</h4>
                    <div className="bg-brand-bg/50 p-4 rounded-lg border border-brand-border italic text-slate-300 leading-relaxed">
                      "{selectedEvent.content}"
                    </div>
                  </section>

                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">AI Deep Analysis</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {selectedEvent.analysis}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Affected Assets</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedEvent.affectedAssets.map(asset => (
                          <div key={asset} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-brand-accent/10 rounded flex items-center justify-center text-[10px] font-bold text-brand-accent">
                                $
                              </div>
                              <span className="text-sm font-bold">{asset}</span>
                            </div>
                            <div className={cn(
                              "text-xs font-mono",
                              selectedEvent.sentiment === 'bullish' ? "text-brand-bull" : "text-brand-bear"
                            )}>
                              {selectedEvent.sentiment === 'bullish' ? '+POTENTIAL' : '-RISK'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Projected Volatility</h4>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={volatilityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                          <XAxis dataKey="time" hide />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#141417', border: '1px solid #27272A', borderRadius: '8px' }}
                            itemStyle={{ color: '#3B82F6' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3B82F6" 
                            strokeWidth={2} 
                            dot={false} 
                            animationDuration={1000}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                  <BarChart3 className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Select an Intelligence Event</h3>
                <p className="text-slate-500 max-w-md">
                  Click on a feed item from the left panel to view deep AI analysis, market impact projections, and affected asset lists.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-brand-border bg-brand-bg flex items-center justify-between px-6 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-bull" />
            API: CONNECTED
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-bull" />
            ENGINE: GEMINI-3-FLASH
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>LATENCY: 142MS</span>
          <span>© 2026 MARKET WATCH ALPHA</span>
        </div>
      </footer>
    </div>
  );
}
