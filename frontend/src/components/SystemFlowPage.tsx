import { useEffect, useRef, useState } from 'react';
import { Cpu, Wifi, Server, Database, LayoutDashboard, Share2, Activity, Zap, Smartphone, Wind, Sparkles, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════
   Neural Flow Background Canvas
   ═══════════════════════════════════════════════════════ */
function FlowCanvas() {
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

    const nodes: any[] = [];
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    for (let i = 0; i < 50; i++) {
        nodes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2
        });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;
      const step = 40;
      for(let x=0; x<w; x+=step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for(let y=0; y<h; y+=step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      nodes.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96, 211, 148, ${p.opacity * (Math.sin(frame * 0.05 + i) * 0.3 + 0.7)})`;
          ctx.fill();

          // Connections
          nodes.forEach((p2, j) => {
              if (i === j) return;
              const dist = Math.sqrt((p.x-p2.x)**2 + (p.y-p2.y)**2);
              if (dist < 100) {
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.strokeStyle = `rgba(96, 211, 148, ${0.1 * (1 - dist/100)})`;
                  ctx.stroke();
              }
          });
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />;
}

/* ═══════════════════════════════════════════════════════
   Flow Component Icon
   ═══════════════════════════════════════════════════════ */
function FlowNode({ icon: Icon, label, sub, colorClass, delay = 0, isActive = false }: any) {
  return (
    <div className={cn(
        "relative flex flex-col items-center gap-1.5 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4",
        isActive ? "scale-105" : "opacity-80 scale-100"
    )} style={{ animationDelay: `${delay}ms` }}>
      <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center border relative overflow-hidden group backdrop-blur-md transition-all duration-500",
          isActive ? "bg-primary/15 shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] border-primary/60 scale-105" : "bg-white/[0.03] border-white/10 shadow-inner"
      )}>
        <Icon className={cn("w-5 h-5 transition-all duration-700", isActive ? colorClass + " drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" : "text-muted-foreground")} />
        {isActive && <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse" />}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
        
        {/* Decorative corner pulse */}
        <div className={cn(
            "absolute -top-4 -right-4 w-8 h-8 rounded-full blur-xl transition-all duration-1000",
            isActive ? "opacity-60 scale-150" : "opacity-0 scale-50",
            colorClass.replace('text-', 'bg-')
        )} />
      </div>
      <div className="text-center">
        <p className={cn("text-[9px] font-black uppercase tracking-widest leading-none transition-colors", isActive ? "text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "text-muted-foreground/60")}>{label}</p>
        <p className="text-[7px] font-mono opacity-30 mt-1 uppercase tracking-tighter">{sub}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Data Stream Line
   ═══════════════════════════════════════════════════════ */
function DataStream({ active = false, direction = 'right', label = '' }: { active?: boolean, direction?: 'right' | 'left' | 'down' | 'up', label?: string }) {
  return (
    <div className={cn(
        "relative flex items-center justify-center z-0",
        direction === 'right' || direction === 'left' ? "w-16 h-4 mx-2" : "w-4 h-16 my-2"
    )}>
      <div className={cn(
          "absolute transition-all duration-1000",
          direction === 'right' || direction === 'left' ? "w-full h-[1.5px]" : "h-full w-[1.5px]",
          active ? "bg-gradient-to-r from-primary/20 via-primary to-primary/20 shadow-[0_0_15px_rgba(96,211,148,0.4)]" : "bg-white/[0.05]"
      )} />
      
      {/* Glossy data packets with glow blur */}
      {active && [0, 1, 2].map(i => (
        <div key={i} className={cn(
            "absolute rounded-full bg-white w-1 h-1 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
        )} style={{
             animation: `dataPulse${direction.charAt(0).toUpperCase() + direction.slice(1)} ${2 + i*0.5}s linear infinite`,
             animationDelay: `${i * 0.6}s`
        }} />
      ))}

      {label && (
          <span className={cn(
               "absolute font-black text-primary uppercase tracking-[0.25em] bg-[#020617]/90 px-2 py-0.5 rounded-full border border-primary/30 backdrop-blur-md whitespace-nowrap z-10 scale-[0.65]",
               direction === 'right' || direction === 'left' ? "-top-6 text-[10px]" : "left-4 text-[10px]"
          )}>
              {label}
          </span>
      )}
    </div>
  );
}

export default function SystemFlowPage() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 9);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#020617] text-foreground relative">
      <FlowCanvas />
      
      {/* ── Dynamic AI Background Orbs ── */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] animate-[colorShift_15s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[160px] animate-[colorShift_20s_ease-in-out_infinite_reverse] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[180px] animate-[pulse_10s_ease-in-out_infinite] pointer-events-none" />

      {/* ── Technical Grid Overlay ── */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] z-[4]" />
      <div className="absolute inset-0 pointer-events-none opacity-20 z-[3]" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      {/* ── Scanlines ── */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] z-[5] bg-[length:100%_4px]" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-6 overflow-hidden">
        
        {/* Header - Glass Aesthetic */}
        <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/40 text-[8px] font-black text-primary uppercase tracking-[0.3em] backdrop-blur-xl shadow-lg animate-pulse">
                <Sparkles className="w-2.5 h-2.5" /> Synchronized Ecosystem
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">System</span>
                <span className="text-primary italic ml-2 drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]">Matrix</span>
            </h1>
        </div>

        {/* Main Flow Diagram */}
        <div className="w-full flex flex-col items-center justify-center flex-1 min-h-0 py-4 scale-[0.7] sm:scale-[0.85] lg:scale-100 animate-[flowFloat_8s_ease-in-out_infinite]">
            <div className="flex items-center justify-center gap-0 w-full max-w-7xl px-4 relative">
                
                {/* Background flow light */}
                <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent top-1/2 -translate-y-1/2 blur-md opacity-50" />

                {/* 1. SENSOR CLUSTER */}
                <div className="flex flex-col items-center group perspective-1000">
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl transition-all duration-700 group-hover:rotate-y-12 group-hover:border-primary/30 group-hover:bg-white/[0.04]">
                        <FlowNode icon={Zap} label="PM2.5" sub="NODE_01" colorClass="text-orange-400" isActive={activeStep === 0} delay={0} />
                        <FlowNode icon={Activity} label="CO2" sub="NODE_02" colorClass="text-yellow-400" isActive={activeStep === 0} delay={100} />
                        <FlowNode icon={Wind} label="O3" sub="NODE_03" colorClass="text-blue-400" isActive={activeStep === 0} delay={200} />
                        <FlowNode icon={Activity} label="CO" sub="NODE_04" colorClass="text-red-400" isActive={activeStep === 0} delay={300} />
                    </div>
                </div>

                <DataStream direction="right" label="DATA_STREAM" active={activeStep === 0 || activeStep === 1} />

                {/* 2. EDGE CORE (PIC32 + TFT) */}
                <div className="flex flex-col items-center gap-8 translate-y-2">
                     <div className="relative p-0.5 rounded-2xl bg-gradient-to-br from-primary via-primary/30 to-transparent p-[1.5px] shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                            <span className="text-[7px] font-black text-white bg-primary px-3 py-0.5 rounded-full shadow-lg">CORE_v1.0</span>
                        </div>
                        <FlowNode icon={Cpu} label="PIC32CM" sub="Neural_Engine" colorClass="text-primary" isActive={activeStep === 1} delay={400} />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-6 w-px bg-gradient-to-b from-primary to-green-500 opacity-40" />
                        <FlowNode icon={Smartphone} label="1.8&quot; TFT" sub="LOCAL_DASH" colorClass="text-green-400" isActive={activeStep === 2} delay={500} />
                    </div>
                </div>

                <DataStream direction="right" label="TX_UART" active={activeStep === 1 || activeStep === 3} />

                {/* 3. COMMUNICATION BRIDGE */}
                <div className="flex flex-col items-center">
                    <FlowNode icon={Wifi} label="ESP-01S" sub="WIFI_SERCOM" colorClass="text-blue-400" isActive={activeStep === 3} delay={600} />
                    <div className="h-10 invisible" /> 
                </div>

                <DataStream direction="right" label="PUB_MQTT" active={activeStep === 3 || activeStep === 4} />

                {/* 4. CLOUD BROKER */}
                <div className="flex flex-col items-center">
                    <FlowNode icon={Share2} label="HIVEMQ" sub="TLS_CLOUD" colorClass="text-blue-400" isActive={activeStep === 4} delay={700} />
                    <div className="h-10 invisible" />
                </div>

                <DataStream direction="right" label="SUB_TLS" active={activeStep === 4 || activeStep === 5} />

                {/* 5. SCADA BACKEND (NODE + DB) */}
                <div className="flex flex-col items-center gap-8 -translate-y-2">
                    <div>
                        <FlowNode icon={Server} label="BACKEND" sub="NODEJS_SCADA" colorClass="text-purple-400" isActive={activeStep === 5} delay={800} />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-6 w-px bg-gradient-to-b from-purple-500 to-indigo-500 opacity-40" />
                        <FlowNode icon={Database} label="STORE" sub="PSQL_LEDGER" colorClass="text-indigo-400" isActive={activeStep === 8} delay={1100} />
                    </div>
                </div>

                <DataStream direction="right" label="WS_PIPE" active={activeStep === 5 || activeStep === 6 || activeStep === 7} />

                {/* 6. FRONTEND MATRIX */}
                <div className="flex items-center gap-3 p-4 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl transition-all duration-700 hover:border-primary/40">
                    <FlowNode icon={Zap} label="SOCKET" sub="PUSH_v2" colorClass="text-yellow-400" isActive={activeStep === 6} delay={900} />
                    <div className="w-6 h-px bg-gradient-to-r from-primary to-cyan-400 opacity-50 shadow-[0_0_10px_rgba(var(--primary-rgb),1)]" />
                    <FlowNode icon={LayoutDashboard} label="DASHBOARD" sub="REACT_WEB" colorClass="text-primary" isActive={activeStep === 7} delay={1000} />
                </div>

            </div>
        </div>

        {/* Description Grid - Glossy & Floating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl pb-4 mt-8">
            {[
                { icon: Cpu, title: 'Edge Intelligence', desc: '48MHz PIC32CM running local TinyML inference for zero-latency classification.', color: 'primary' },
                { icon: Wifi, title: 'Global Telemetry', desc: 'Encrypted MQTT bridge connecting industrial hardware to cloud infrastructure.', color: 'blue-500' },
                { icon: Sparkles, title: 'Omnichannel Sync', desc: 'Real-time state synchronization across hardware screens and web dashboard.', color: 'purple-500' }
            ].map((card, i) => (
                <div key={i} className="glass-card group relative p-5 rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl hover:bg-white/[0.03] transition-all duration-700 hover:scale-[1.03] hover:border-white/20 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="flex gap-4 items-center">
                        <div className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-700 group-hover:rotate-[360deg]",
                            `text-${card.color}`
                        )}>
                            <card.icon className="w-5.5 h-5.5 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 font-mono text-foreground/80">{card.title}</h4>
                            <p className="text-[8px] text-muted-foreground font-mono leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                                {card.desc}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

      </div>

      {/* Bottom Status Bar */}
      <div className="px-8 py-3 border-t border-white/5 bg-[#020617]/90 backdrop-blur-3xl flex items-center justify-between text-[8px] font-mono text-muted-foreground shrink-0 relative z-20">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-primary font-black tracking-[0.4em] uppercase">Status:</span> 
            <span className="text-foreground font-black tracking-widest">{['POLLING', 'INFERENCE', 'LCD_SYNC', 'BRIDGE', 'MQTT_TX', 'NODE_RX', 'STORAGE', 'SOCKET', 'LIVE_v1'][activeStep]}</span>
          </span>
          <span className="h-4 w-px bg-white/10" />
          <span className="tracking-widest">NETWORK: <span className="text-foreground font-bold italic">CONNECTED_SECURE</span></span>
        </div>
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2">
             <Layers className="w-3.5 h-3.5 text-primary animate-pulse" />
             NODE_UUID: <span className="text-foreground font-mono">0x4F_ALPHA</span>
          </span>
          <span className="h-4 w-px bg-white/10" />
          <span className="flex items-center gap-2 font-black text-green-500/80">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
            TRUSTZONE_ACTIVE
          </span>
        </div>
      </div>

      <style>{`
        @keyframes dataPulseRight {
            0% { transform: translate(-20px, 0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(20px, 0); opacity: 0; }
        }
        @keyframes dataPulseDown {
            0% { transform: translate(0, -20px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translate(0, 20px); opacity: 0; }
        }
        @keyframes flowFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
