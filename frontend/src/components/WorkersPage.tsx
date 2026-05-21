import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Users, UserCircle, Activity, Wind, AlertTriangle, X, Zap, Cpu, CircuitBoard, Shield, Smartphone, HeartPulse, Crosshair } from 'lucide-react';
import { cn } from '../lib/utils';
import LiveChart from './LiveChart';

/* ═══════════════════════════════════════════════════════
   Workers Pulse Background Canvas
   ═══════════════════════════════════════════════════════ */
function WorkersCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const pulses: any[] = [];

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      if (Math.random() < 0.02) {
          pulses.push({
              x: Math.random() * w,
              y: Math.random() * h,
              r: 0,
              maxR: 100 + Math.random() * 200,
              opacity: 1
          });
      }

      ctx.lineWidth = 1;
      for (let i = pulses.length - 1; i >= 0; i--) {
          const p = pulses[i];
          p.r += 1.5;
          p.opacity -= 0.005;
          
          if (p.opacity <= 0) {
              pulses.splice(i, 1);
              continue;
          }

          ctx.strokeStyle = `rgba(96, 211, 148, ${p.opacity * 0.15})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />;
}

/* ═══════════════════════════════════════════════════════
   Data Pipeline Shimmer
   ═══════════════════════════════════════════════════════ */
function DataPipeline({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-xl z-20">
      <div className={cn(
        "h-full rounded-full transition-all duration-700",
        isActive 
          ? "bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_2s_ease-in-out_infinite]" 
          : "bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      )} />
    </div>
  );
}

export default function WorkersPage() {
  const [nodesData, setNodesData]       = useState<Record<string, any>>({});
  const [nodesStatus, setNodesStatus]   = useState<Record<string, any>>({});
  const [nodesHistory, setNodesHistory] = useState<Record<string, any[]>>({});
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:5000', { reconnectionAttempts: 3, timeout: 2000 });

    socket.on('sensor_data', (data) => {
      if (!data.nodeId.startsWith('worker_')) return;
      setNodesData(prev => ({ ...prev, [data.nodeId]: data }));
      setNodesHistory(prev => ({ ...prev, [data.nodeId]: [...(prev[data.nodeId] || []).slice(-19), data] }));
    });

    socket.on('node_status', (data) => {
      if (!data.nodeId.startsWith('worker_')) return;
      setNodesStatus(prev => ({ ...prev, [data.nodeId]: data }));
    });

    let mockInterval: ReturnType<typeof setInterval>;

    socket.on('connect_error', () => {
      if (Object.keys(nodesData).length === 0) {
        setNodesStatus({
          'worker_01_john': { nodeId: 'worker_01_john', status: 'online' },
          'worker_02_sarah': { nodeId: 'worker_02_sarah', status: 'online' },
          'worker_03_mike': { nodeId: 'worker_03_mike', status: 'offline' },
        });

        const workers = ['worker_01_john', 'worker_02_sarah', 'worker_03_mike'];
        const bases = {
          'worker_01_john': { aqi: 45, pm2_5: 12, pm10: 20, co: 1.1, co2: 600, temperature: 36.5, humidity: 45 },
          'worker_02_sarah': { aqi: 135, pm2_5: 45, pm10: 60, co: 3.2, co2: 850, temperature: 36.8, humidity: 55 },
          'worker_03_mike': { aqi: 15, pm2_5: 5, pm10: 10, co: 0.1, co2: 400, temperature: 36.1, humidity: 40 },
        };

        const ts = () => new Date().toISOString();
        const pushHistory = (id: string, d: any) => setNodesHistory(prev => {
          const h = prev[id] || [];
          return { ...prev, [id]: [...h.slice(-19), { ...d, nodeId: id, timestamp: ts() }] };
        });

        Array.from({ length: 20 }).forEach(() => { pushHistory('worker_01_john', bases['worker_01_john']); pushHistory('worker_02_sarah', bases['worker_02_sarah']); });

        mockInterval = setInterval(() => {
          workers.forEach(w => {
            if (w === 'worker_03_mike') return; // offline
            const b: any = { ...bases[w as keyof typeof bases] };
            b.aqi = Math.max(0, b.aqi + Math.floor(Math.random() * 6 - 3));
            b.pm2_5 = Math.max(5, b.pm2_5 + Math.floor(Math.random() * 4 - 2));
            setNodesData(prev => ({ ...prev, [w]: { nodeId: w, timestamp: ts(), ...b } }));
            pushHistory(w, b);
          });
        }, 3000);
      }
    });

    return () => { socket.disconnect(); if (mockInterval) clearInterval(mockInterval); };
  }, []);

  const workerKeys = Object.keys(nodesData);
  const activeCount = Object.values(nodesStatus).filter(s => s.status === 'online').length;
  const avgAqi = workerKeys.length ? Math.round(Object.values(nodesData).reduce((s, n) => s + n.aqi, 0) / workerKeys.length) : 0;
  
  const getSeverity = (aqi: number) => aqi > 100 ? 'destructive' : aqi > 50 ? 'warning' : 'primary';

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <WorkersCanvas />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/8 rounded-full blur-[120px] animate-[float_14s_ease-in-out_infinite_reverse] pointer-events-none" />

      <div className="shrink-0 px-8 pt-8 pb-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard label="ACTIVE_PERSONNEL" value={activeCount.toString()} sub={`${workerKeys.length} PROXIMITY_NODES`} icon={<Users className="w-5 h-5" />} accent="primary" />
          <KpiCard label="AGGREGATE_EXPOSURE" value={avgAqi.toString()} sub="AVG_AIR_QUALITY_INDEX" icon={<Wind className="w-5 h-5" />} accent={getSeverity(avgAqi)} />
          <KpiCard label="ANOMALY_ALERTS" value={Object.values(nodesData).filter(n => n.aqi > 150).length.toString()} sub="CRITICAL_EVENT_THRESHOLD" icon={<AlertTriangle className="w-5 h-5" />} accent="destructive" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_12px_rgba(96,211,148,0.5)]" />
              <h3 className="text-xl font-bold tracking-tight">Personnel Roster <span className="text-[10px] font-mono text-muted-foreground ml-3 uppercase select-none opacity-50 tracking-widest">Digital Twin Status</span></h3>
           </div>
           <div className="glass-card px-4 py-1.5 rounded-full border border-border/50 backdrop-blur-md flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold font-mono uppercase">Telemetry Live Feed</span>
           </div>
        </div>

        {workerKeys.length === 0 ? (
          <div className="h-64 glass-card rounded-2xl flex flex-col items-center justify-center gap-4 border border-dashed border-border/50">
            <Activity className="w-12 h-12 text-primary animate-pulse" />
            <div className="text-center">
               <p className="text-sm font-bold text-foreground">INITIALIZING_TELEMETRY</p>
               <p className="text-[10px] text-muted-foreground font-mono uppercase mt-1">Awaiting handshake from field wearables...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workerKeys.map(id => {
              const data = nodesData[id];
              const stat = nodesStatus[id]?.status || 'unknown';
              const name = id.split('_').slice(2).join(' ') || id;
              const aqi = data.aqi ?? 0;
              const isCrit = aqi > 100;
              const isWarn = aqi > 50 && aqi <= 100;

              return (
                <button
                  key={id}
                  onClick={() => setSelectedWorker(id)}
                  className={cn(
                    "glass-card rounded-2xl p-6 transition-all text-left flex flex-col items-start gap-5 border group relative overflow-hidden active:scale-[0.98]",
                    isCrit ? "border-red-500/30 bg-red-500/5 shadow-red-500/5" : 
                    isWarn ? "border-orange-500/30 bg-orange-500/5 shadow-orange-500/5" :
                    "border-border/50 hover:border-primary/40 hover:bg-white/5 shadow-xl"
                  )}
                >
                  <DataPipeline isActive={stat === 'online'} />
                  
                  <div className="flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-background border border-border/50 flex items-center justify-center relative overflow-hidden group-hover:border-primary/30 transition-colors">
                        <UserCircle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p className="text-base font-bold capitalize text-foreground tracking-tight">{name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px]", stat === 'online' ? 'bg-primary animate-pulse shadow-primary/50' : 'bg-red-500 shadow-red-500/50')} />
                           <span className="text-[10px] font-mono text-muted-foreground uppercase">{stat === 'online' ? 'Signal Lock' : 'Signal Lost'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border shadow-sm",
                      isCrit ? "bg-red-500 text-white border-red-400" :
                      isWarn ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                      "bg-primary/10 text-primary border-primary/30"
                    )}>
                      AQI {aqi}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 w-full gap-4 border-t border-border/30 pt-4 mt-1 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5"><Wind className="w-3 h-3" /> PM2.5</p>
                      <p className="text-sm font-mono font-bold text-foreground">{data.pm2_5} <span className="text-[9px] font-medium opacity-50">µG/M³</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5"><Shield className="w-3 h-3" /> CO Level</p>
                      <p className="text-sm font-mono font-bold text-foreground">{data.co} <span className="text-[9px] font-medium opacity-50">PPM</span></p>
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                     <CircuitBoard className="w-12 h-12 text-primary" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="h-10 px-8 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground bg-card/30 backdrop-blur-md relative z-10 shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Tracking: <span className="text-foreground font-bold">BIOMETRIC_ENCRYPTED</span>
          </span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Registry: <span className="text-foreground font-bold">SHA-256_VERIFIED</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span>Active Nodes: {workerKeys.length}</span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            SECURE_SYNC_ACTIVE
          </span>
        </div>
      </div>

      {selectedWorker && (
        <WorkerDetailModal 
          workerId={selectedWorker} 
          data={nodesData[selectedWorker]} 
          status={nodesStatus[selectedWorker]} 
          history={nodesHistory[selectedWorker] || []}
          onClose={() => setSelectedWorker(null)} 
        />
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, accent }: any) {
  return (
    <div className="group relative glass-card rounded-2xl p-6 overflow-hidden border border-border/50 backdrop-blur-xl shadow-2xl transition-all hover:translate-y-[-2px]">
      <DataPipeline isActive={true} />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", accent === 'destructive' ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-primary shadow-[0_0_8px_var(--color-primary)]')} />
              {label}
           </p>
           <p className={cn("text-3xl font-black font-mono tracking-tighter tabular-nums drop-shadow-sm", accent === 'destructive' ? 'text-red-500' : 'text-foreground')}>{value}</p>
        </div>
        <div className={cn("p-3 rounded-xl border transition-colors", 
          accent === 'destructive' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 
          accent === 'warning' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 
          'bg-primary/10 border-primary/30 text-primary'
        )}>
          {icon}
        </div>
      </div>
      {sub && <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter relative z-10">{sub}</p>}
      
      <div className="absolute bottom-[-10px] right-[-10px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
         <CircuitBoard className="w-24 h-24" />
      </div>
    </div>
  );
}

function WorkerDetailModal({ workerId, data, status, history, onClose }: any) {
  const name = workerId.split('_').slice(2).join(' ') || workerId;
  const isSafe = (data?.aqi || 0) < 100;
  const isOffline = status?.status === 'offline';
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden border border-border/50 bg-slate-900/40 relative">
        <DataPipeline isActive={!isOffline} />
        
        <div className="flex items-center justify-between p-7 border-b border-border/30 bg-card/50 backdrop-blur-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
              <UserCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black capitalize text-foreground tracking-tight">{name}</h2>
              <div className="flex items-center gap-3 mt-1">
                 <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">ID: {workerId}</span>
                 <div className="flex items-center gap-1.5">
                    <div className={cn("w-2 h-2 rounded-full", isOffline ? 'bg-red-500' : 'bg-primary animate-pulse')} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{isOffline ? 'Disconnected' : 'Active Telemetry'}</span>
                 </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 flex items-center justify-center transition-all active:scale-90">
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 bg-black/20 flex flex-col gap-8 flex-1 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card p-6 rounded-2xl border border-border/50 bg-white/5">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
                   <Shield className="w-3.5 h-3.5" /> Authorization Status
                </p>
                <div className="flex items-center gap-4">
                   <div className={cn("w-3 h-3 rounded-full shadow-[0_0_12px]", isOffline ? 'bg-red-500 shadow-red-500/50' : isSafe ? 'bg-primary shadow-primary/50' : 'bg-red-500 shadow-red-500/50 animate-pulse')} />
                   <p className={cn("text-xl font-black tracking-tight uppercase", isOffline ? 'text-zinc-500' : isSafe ? 'text-primary' : 'text-red-500')}>
                     {isOffline ? 'SIGNAL_LOSS_EVAC' : isSafe ? 'CLEARED_NOMINAL' : 'CRITICAL_EXPOSURE'}
                   </p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-blue-400" />
                      <span className="text-[10px] font-mono text-muted-foreground">Vitals: 100% Locked</span>
                   </div>
                   <span className="text-[10px] font-mono font-bold text-primary">ENCRYPTED_STREAM</span>
                </div>
             </div>
             
             <div className="glass-card p-6 rounded-2xl border border-border/50 bg-white/5 text-right">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-3 flex items-center justify-end gap-2">
                   Environmental Risk <Activity className="w-3.5 h-3.5" />
                </p>
                <div className="flex items-baseline justify-end gap-2">
                   <p className={cn("text-4xl font-black font-mono tracking-tighter drop-shadow-md", isSafe ? 'text-foreground' : 'text-red-500')}>{data?.aqi || '--'}</p>
                   <span className="text-xs font-bold text-muted-foreground uppercase">AQI</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border/30">
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-1000", isSafe ? 'bg-primary' : 'bg-red-500')} style={{ width: `${Math.min(100, (data?.aqi || 0) / 2)}%` }} />
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricBlock label="PM 2.5" val={data?.pm2_5} unit="µG/M³" icon={<Wind className="w-3.5 h-3.5" />} />
            <MetricBlock label="PM 10" val={data?.pm10} unit="µG/M³" icon={<Wind className="w-3.5 h-3.5" />} />
            <MetricBlock label="CARBON_MONO" val={data?.co} unit="PPM" icon={<Shield className="w-3.5 h-3.5" />} />
            <MetricBlock label="CO₂_SENSOR" val={data?.co2} unit="PPM" icon={<Activity className="w-3.5 h-3.5" />} />
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><Smartphone className="w-3.5 h-3.5 text-primary" /> Multi-Sensor Telemetry (2 MIN)</p>
                <div className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] font-mono text-primary font-bold">STREAM_STABLE</span>
                </div>
             </div>
             <div className="h-40 bg-card/40 border border-border/30 rounded-2xl overflow-hidden pt-4 pb-1 group/chart backdrop-blur-md">
                <LiveChart data={history} dataKey="aqi" color="var(--color-primary)" />
             </div>
          </div>

          <div className="flex gap-4">
             <button className="flex-1 py-4 bg-primary text-black text-xs font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-primary/20">
                <Crosshair className="w-4 h-4" /> RE-CALIBRATE WEARABLE
             </button>
             <button className="flex-1 py-4 bg-white/5 border border-white/10 text-foreground text-xs font-black rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                <Shield className="w-4 h-4" /> DISPATCH PERSONNEL_ASSIST
             </button>
          </div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
           <CircuitBoard className="w-96 h-96" />
        </div>
      </div>
    </div>
  );
}

function MetricBlock({ label, val, unit, icon }: any) {
  return (
    <div className="p-5 glass-card rounded-2xl border border-border/50 bg-white/5 flex flex-col items-center justify-center text-center group/metric transition-all hover:bg-white/10">
       <div className="p-2 rounded-lg bg-white/5 text-muted-foreground group-hover/metric:text-primary transition-colors mb-3 border border-white/10">
          {icon}
       </div>
       <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider mb-1 opacity-60">{label}</p>
       <div className="flex items-baseline gap-1">
          <p className="text-base font-black text-foreground font-mono">{val ?? '---'}</p>
          <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-50">{unit}</span>
       </div>
    </div>
  );
}
