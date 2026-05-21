import { Server, Database, Activity, Wifi, ServerCrash, Clock, RefreshCw, Zap, Cpu, CircuitBoard, Terminal } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════
   Diagnostics Network Background Canvas
   ═══════════════════════════════════════════════════════ */
function DiagnosticsCanvas() {
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

    const connections: any[] = [];
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    for (let i = 0; i < 20; i++) {
        connections.push({
            x1: Math.random() * w,
            y1: Math.random() * h,
            x2: Math.random() * w,
            y2: Math.random() * h,
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.005,
            color: Math.random() > 0.5 ? 'rgba(96, 211, 148, 0.1)' : 'rgba(56, 189, 248, 0.1)'
        });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      for (const c of connections) {
          c.progress += c.speed;
          if (c.progress > 1) {
              c.progress = 0;
              c.x1 = Math.random() * w;
              c.y1 = Math.random() * h;
              c.x2 = Math.random() * w;
              c.y2 = Math.random() * h;
          }
          
          ctx.beginPath();
          ctx.moveTo(c.x1, c.y1);
          ctx.lineTo(c.x2, c.y2);
          ctx.strokeStyle = c.color;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Packet
          const px = c.x1 + (c.x2 - c.x1) * c.progress;
          const py = c.y1 + (c.y2 - c.y1) * c.progress;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = c.color.replace('0.1', '0.8');
          ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   Data Pipeline Shimmer
   ═══════════════════════════════════════════════════════ */
function DataPipeline({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden rounded-t-xl">
      <div className={cn(
        "h-full rounded-full transition-all duration-700",
        isActive 
          ? "bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_2s_ease-in-out_infinite]" 
          : "bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      )} />
    </div>
  );
}

export default function DiagnosticsPage() {
  const [logs, setLogs] = useState<string[]>([
    '[INFO]  MQTT broker initialized on port 1883',
    '[INFO]  MongoDB connection established successfully',
    '[INFO]  WebSocket server listening on port 5000',
    '[WARN]  beta-002 latency spike detected (482 ms)',
    '[INFO]  JWT token rotated for session: admin@10.0.0.1',
    '[DEBUG] Connection pool size: 12 / 20',
  ]);

  useEffect(() => {
    const msgs = [
      '[INFO]  Heartbeat received from alpha-001',
      '[DEBUG] Garbage collection: freed 14.2 MB',
      '[INFO]  Telemetry batch written to MongoDB',
      '[WARN]  Throughput degraded in Zone B pipeline',
      '[INFO]  Alert rule evaluated: PM2.5 threshold OK',
    ];
    const interval = setInterval(() => {
      const ts = new Date().toISOString().slice(11, 19);
      setLogs(prev => [`${ts}  ${msgs[Math.floor(Math.random() * msgs.length)]}`, ...prev].slice(0, 20));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { label: 'Core API',       status: 'Operational', icon: Server,   color: 'text-primary'    },
    { label: 'MQTT Broker',    status: 'Connected',   icon: Wifi,     color: 'text-blue-500'   },
    { label: 'Database',       status: 'Healthy',     icon: Database, color: 'text-primary'    },
    { label: 'WebSocket Hub',  status: 'Active',      icon: Activity, color: 'text-purple-500' },
  ];

  const nodes = [
    { id: 'alpha-001', firmware: 'v2.1.0', ping: '12 ms',  seen: '0s ago',  state: 'online'    },
    { id: 'beta-002',  firmware: 'v2.1.0', ping: '145 ms', seen: '2s ago',  state: 'degraded'  },
    { id: 'gamma-003', firmware: 'v1.9.4', ping: '—',      seen: '4m ago',  state: 'offline'   },
    { id: 'delta-004', firmware: 'v2.1.0', ping: '24 ms',  seen: '1s ago',  state: 'online'    },
  ];

  const stateColor = (s: string) =>
    s === 'online' ? 'text-primary' : s === 'offline' ? 'text-destructive' : 'text-yellow-500 dark:text-yellow-400';
  const stateDot = (s: string) =>
    s === 'online' ? 'bg-primary' : s === 'offline' ? 'bg-destructive' : 'bg-yellow-500';

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background text-foreground relative">
      <DiagnosticsCanvas />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/8 rounded-full blur-[120px] animate-[float_14s_ease-in-out_infinite_reverse] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-6 space-y-6 w-full">

          {/* Page title */}
          <div className="flex items-center justify-between pb-4 border-b border-border/30">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-primary/10">
                  <ServerCrash className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  System Diagnostics
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 animate-pulse">MONITORING</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5 font-mono">Infrastructure health and real-time event logs</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-secondary/80 border border-border hover:border-primary/50 transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> Force Sync
            </button>
          </div>

          {/* Service health cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((svc) => (
              <div key={svc.label} className="group relative glass-card rounded-xl p-5 border border-border overflow-hidden transition-all hover:scale-105 hover:shadow-lg">
                <DataPipeline isActive={svc.status !== 'Offline'} />
                <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-25 transition-opacity">
                   <CircuitBoard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <svc.icon className={cn('w-5 h-5', svc.color)} />
                  <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    {svc.status}
                  </span>
                </div>
                <p className="text-xs font-bold text-foreground relative z-10">{svc.label}</p>
              </div>
            ))}
          </div>

          {/* Node table + Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Node table */}
            <div className="lg:col-span-2 group relative glass-card rounded-2xl flex flex-col overflow-hidden border border-border/50 backdrop-blur-sm shadow-xl">
              <DataPipeline isActive={true} />
              <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between shrink-0 bg-card/10">
                <div className="flex items-center gap-3">
                  <Wifi className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">Node Connectivity</h3>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">FLT_STATUS: NOMINAL</span>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#111] text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border/50">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold">Asset ID</th>
                      <th className="text-left px-4 py-3 font-bold">Firmware</th>
                      <th className="text-left px-4 py-3 font-bold">Latency</th>
                      <th className="text-left px-4 py-3 font-bold">Status</th>
                      <th className="text-right px-6 py-4 font-bold">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 bg-card/5">
                    {nodes.map(n => (
                      <tr key={n.id} className="hover:bg-primary/5 transition-colors group/row">
                        <td className="px-6 py-4 font-mono font-bold text-foreground flex items-center gap-3">
                          <span className={cn('w-2 h-2 rounded-full shrink-0 shadow-sm shadow-black/50', stateDot(n.state), n.state === 'online' && 'animate-pulse')} />
                          {n.id}
                        </td>
                        <td className="px-4 py-4 font-mono text-muted-foreground">{n.firmware}</td>
                        <td className={cn('px-4 py-4 font-mono font-bold', n.ping === '—' ? 'text-destructive' : 'text-foreground')}>{n.ping}</td>
                        <td className={cn('px-4 py-4 font-bold capitalize', stateColor(n.state))}>{n.state}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground flex items-center justify-end gap-2 font-mono">
                          <Clock className="w-3 h-3" />{n.seen}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-border/10 bg-card/5 text-[9px] font-mono text-muted-foreground">
                TOTAL_NODES: {nodes.length} | ACTIVE: {nodes.filter(n => n.state === 'online').length} | DOWNTIME: 0.04%
              </div>
            </div>

            {/* Logs panel */}
            <div className="group relative glass-card rounded-2xl flex flex-col overflow-hidden border border-border/50 backdrop-blur-sm shadow-xl min-h-[420px]">
              <DataPipeline isActive={true} />
              <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3 shrink-0 bg-card/10">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold">Real-time Logs</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-black/20 space-y-2 font-mono text-[10px] scrollbar-hide">
                {logs.map((log, i) => (
                  <div key={i} className={cn(
                    'leading-relaxed border-b border-white/5 pb-2 transition-colors hover:bg-white/5 px-2 rounded',
                    log.includes('[WARN]') ? 'text-orange-400' :
                    log.includes('[DEBUG]') ? 'text-muted-foreground/60' : 
                    log.includes('[INFO]') ? 'text-blue-400' : 'text-foreground/80'
                  )}>
                    <span className="opacity-40 mr-2">{i.toString().padStart(2, '0')}</span>
                    {log}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border/10 flex items-center justify-between bg-card/5">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                 </div>
                 <span className="text-[9px] font-mono text-muted-foreground">STREAM_ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-8 py-3 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground shrink-0 bg-card/30 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Infrastructure: <span className="text-foreground font-bold">HYBRID_CLOUD</span>
          </span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Control Layer: <span className="text-foreground font-bold">NODE_JS_V20_LTS</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span>Uptime: 99.998%</span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            SYSTEM_ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}

