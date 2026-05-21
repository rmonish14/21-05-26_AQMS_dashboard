import { useRef, useEffect } from 'react';
import { Cpu, Terminal, Shield, Network, FileDown, Code, ExternalLink, HardDrive, Zap, CircuitBoard, Layers, Activity, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════
   Info Holographic Background Canvas
   ═══════════════════════════════════════════════════════ */
function InfoCanvas() {
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
    let offset = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      ctx.strokeStyle = 'rgba(96, 211, 148, 0.03)';
      ctx.lineWidth = 1;
      
      offset += 0.5;
      for (let i = 0; i < w; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + Math.sin((offset + i) * 1) * 20, h);
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

export default function InfoPage() {
  const registry = [
    { id: 'alpha-001', mcu: 'ESP32-WROOM-32',   mac: '00:1B:44:11:3A:B7', protocol: 'MQTT/TLS',  firmware: 'v2.1.0', sensors: 'BME680, PMS5003',  status: 'stable'     },
    { id: 'beta-002',  mcu: 'ESP8266-12E',       mac: '00:1B:44:88:9C:F1', protocol: 'MQTT/TCP',  firmware: 'v2.0.4', sensors: 'DHT22, MH-Z19',    status: 'stable'     },
    { id: 'gamma-003', mcu: 'Nordic nRF9160',    mac: '00:1B:44:EE:22:98', protocol: 'CoAP/UDP',  firmware: 'v3.0.1', sensors: 'SCD30, SPS30',     status: 'beta'       },
    { id: 'delta-004', mcu: 'Raspberry Pi Zero', mac: 'B8:27:EB:4A:9C:3T', protocol: 'HTTP/REST', firmware: 'v1.9.9', sensors: 'Mock Aggregate',   status: 'deprecated' },
  ];

  const statusColor = (s: string) =>
    s === 'stable'     ? 'text-primary bg-primary/10 border-primary/20' :
    s === 'beta'       ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
    'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
      <InfoCanvas />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-[120px] animate-[float_14s_ease-in-out_infinite_reverse] pointer-events-none" />

      <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-border/30">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm shadow-xl shadow-primary/10">
               <HardDrive className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">System Matrix <span className="text-[10px] font-mono text-muted-foreground ml-3 uppercase select-none opacity-50 tracking-widest">Hardware Registry v4.2</span></h1>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono uppercase tracking-tighter">Global field controller positioning and hardware specification vault</p>
            </div>
          </div>

          {/* Architecture + links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 group relative glass-card rounded-2xl p-8 border border-border/50 backdrop-blur-md shadow-2xl overflow-hidden active:scale-[0.99] transition-transform">
              <DataPipeline isActive={true} />
              <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-15 transition-opacity">
                 <CircuitBoard className="w-20 h-20 text-primary" />
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Cpu className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground tracking-tight uppercase">Edge Compute Topology</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-medium relative z-10">
                The AQMS platform utilizes a high-performance decentralized hardware ecosystem. 
                Field nodes are optimized for <span className="text-primary font-mono">Real-Time Baseline Sampling</span> and local pre-processing. 
                Neural-tier validation, predictive modeling, and long-term storage are managed via the centralized API bridge.
                Every node maintains a secondary <span className="text-blue-400 font-mono">Volatile Memory Buffer</span> to ensure zero-loss tracking during sync cycles.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {[
                  { icon: Network, label: 'Central Relay Transport', value: 'MQTT Cluster (1883/TLS)', color: 'text-primary', bg: 'bg-primary/10' },
                  { icon: Shield,  label: 'Credential Verification',    value: 'ECC-256 + SHA-3 Crypt',   color: 'text-blue-400', bg: 'bg-blue-400/10' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className="bg-white/5 border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-4 group/item hover:bg-white/10 transition-colors border group-hover:border-white/10">
                    <div className={cn('p-2.5 rounded-xl border border-white/5', bg)}>
                       <Icon className={cn('w-4 h-4 shrink-0', color)} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
                      <p className="text-xs font-mono font-bold text-foreground mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-border/50 bg-black/5 divide-y divide-border/30">
              <div className="pb-4">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Technical Resources
                 </p>
                 <ul className="space-y-2">
                   {[
                     { icon: Code,        label: 'Node.js Backend Spec'   },
                     { icon: Terminal,    label: 'ESP32 FW Development'    },
                     { icon: FileDown,    label: 'Export Global Ledger'    },
                     { icon: ExternalLink,label: 'REST API Documentation'   },
                   ].map(({ icon: Icon, label }) => (
                     <li key={label}>
                       <a href="#" className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all group">
                         <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100" />
                            <span>{label}</span>
                         </div>
                         <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                       </a>
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="pt-6">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary" /> Security Baseline
                 </p>
                 <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <p className="text-[10px] text-primary font-mono leading-relaxed uppercase font-bold">
                       Awaiting RSA-4096 Pair...
                       <br />
                       Status: Secure_Link_EST
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Registry table */}
          <div className="glass-card rounded-3xl overflow-hidden border border-border/50 shadow-2xl relative">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <CircuitBoard className="w-64 h-64" />
             </div>
             
             <div className="px-8 py-5 border-b border-border/30 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Activity className="w-4 h-4 text-primary" />
                   <h3 className="text-sm font-bold text-foreground">Hardware Registry Ledger</h3>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">REGISTRY_UID: 4F92-XA100-LL</span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-[11px]">
                 <thead>
                   <tr className="bg-black/30 border-b border-border/30">
                     {['Asset ID', 'Microcontroller', 'MAC Signature', 'Protocol', 'Firmware', 'Sensor Array', 'Registry Status'].map(h => (
                       <th key={h} className="text-left px-8 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">{h}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/30">
                   {registry.map(r => (
                     <tr key={r.id} className="hover:bg-primary/5 transition-all group">
                       <td className="px-8 py-4 font-mono font-bold text-foreground group-hover:text-primary">{r.id}</td>
                       <td className="px-8 py-4 font-bold text-muted-foreground">{r.mcu}</td>
                       <td className="px-8 py-4 font-mono text-muted-foreground select-all opacity-70 group-hover:opacity-100">{r.mac}</td>
                       <td className="px-8 py-4">
                         <span className="text-[9px] font-black bg-white/5 text-foreground border border-white/10 px-2 py-0.5 rounded uppercase">{r.protocol}</span>
                       </td>
                       <td className="px-8 py-4 font-mono font-bold text-muted-foreground">{r.firmware}</td>
                       <td className="px-8 py-4 font-bold text-muted-foreground">{r.sensors}</td>
                       <td className="px-8 py-4">
                         <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-tighter', statusColor(r.status))}>{r.status}</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-10 px-8 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground bg-card/30 backdrop-blur-md relative z-10 shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Core: <span className="text-foreground font-bold">SHA-3_REGISTRY_CERTIFIED</span>
          </span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Registry: <span className="text-foreground font-bold">NODAL_MESH_V4</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span>Last Registry Update: 4.2h ago</span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            DATABASE_LEDGER_SYNCED
          </span>
        </div>
      </div>
    </div>
  );
}

