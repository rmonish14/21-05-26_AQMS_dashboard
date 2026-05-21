import { useState, useRef, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import { MapPin, AlertTriangle, Crosshair, Navigation, Activity, Shield, Zap, Cpu, CircuitBoard, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

const DEFAULT_CENTER = { lat: 39.5393, lng: -119.4397 }; // Example: Industrial Park region
const DEFAULT_ZOOM = 15;

const NODES = [
  { id: 'alpha-001', lat: 39.5401, lng: -119.4447, status: 'online', aqi: 45, zone: 'Assembly A', type: 'Node' },
  { id: 'beta-002', lat: 39.5385, lng: -119.4365, status: 'online', aqi: 62, zone: 'Logistics Hub', type: 'Node' },
  { id: 'gamma-003', lat: 39.5420, lng: -119.4380, status: 'warning', aqi: 155, zone: 'Chemical Storage', type: 'Warning' },
  { id: 'delta-004', lat: 39.5370, lng: -119.4420, status: 'offline', aqi: 0, zone: 'Exterior Vent', type: 'Critical' },
];

const aqiLabel = (v: number) =>
  v <= 50 ? 'Good' : v <= 100 ? 'Moderate' : v <= 150 ? 'Sensitive' : v <= 200 ? 'Unhealthy' : 'Hazardous';

/* ═══════════════════════════════════════════════════════
   Map Radar Background Canvas
   ═══════════════════════════════════════════════════════ */
function MapCanvas() {
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
    let angle = 0;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.45;

      ctx.strokeStyle = 'rgba(96, 211, 148, 0.05)';
      ctx.lineWidth = 1;
      for (let r = 50; r <= maxR; r += 50) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      angle += 0.01;
      const gradient = ctx.createConicGradient(angle, cx, cy);
      gradient.addColorStop(0, 'rgba(96, 211, 148, 0.1)');
      gradient.addColorStop(0.1, 'rgba(96, 211, 148, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, angle - 0.5, angle);
      ctx.lineTo(cx, cy);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
      ctx.stroke();

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-30" />;
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

const MapMarker = ({ node, activeId, onClick }: any) => {
  const dotColor = (s: string) => s === 'online' ? 'bg-primary' : s === 'offline' ? 'bg-zinc-600' : 'bg-red-500';

  return (
    <button
      onClick={() => onClick(node)}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10 p-2"
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Animated Rings */}
        {node.status !== 'offline' && (
          <>
            <div className={cn('absolute inset-0 rounded-full opacity-40 animate-ping', node.status === 'warning' ? 'bg-red-500' : 'bg-primary')} />
            <div className={cn('absolute inset-1 rounded-full opacity-20 animate-[pulse_2s_infinite]', node.status === 'warning' ? 'bg-red-500' : 'bg-primary')} />
          </>
        )}
        
        {/* Core Marker */}
        <div className={cn(
          'w-4 h-4 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-300',
          dotColor(node.status),
          activeId === node.id ? 'scale-125 ring-4 ring-primary/30 shadow-primary/20' : 'group-hover:scale-110'
        )}>
          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50 shadow-sm" />
        </div>

        {/* Label */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0">
          <div className="bg-black/90 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md text-[9px] font-bold text-white shadow-2xl flex items-center gap-2">
             <div className={cn("w-1.5 h-1.5 rounded-full", dotColor(node.status))} />
             {node.id}
          </div>
          <div className="w-px h-2 bg-white/20 mx-auto" />
        </div>
      </div>
    </button>
  );
};

export default function MapPage() {
  const [active, setActive] = useState(NODES[0]);



  const aqiColor = (v: number) =>
    v <= 50 ? 'text-primary' : v <= 100 ? 'text-yellow-400' :
      v <= 150 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      <MapCanvas />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-[120px] animate-[float_14s_ease-in-out_infinite_reverse] pointer-events-none" />

      {/* ── Left Inspector Sidebar ── */}
      <div className="w-80 shrink-0 border-r border-border bg-card/30 backdrop-blur-xl flex flex-col relative z-10">
        <div className="p-6 border-b border-border/30">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-primary" />
             </div>
             <div>
                <h2 className="text-xl font-bold tracking-tight">Geospatial</h2>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Active Fleet Tracking</p>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="group relative glass-card rounded-2xl p-6 overflow-hidden border border-border transition-all shadow-2xl">
            <DataPipeline isActive={active.status !== 'offline'} />
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <CircuitBoard className="w-8 h-8 text-primary" />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 shadow-lg', active.status === 'online' ? 'bg-primary' : active.status === 'warning' ? 'bg-red-500 animate-pulse' : 'bg-zinc-600')} />
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-foreground font-mono truncate">{active.id}</h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{active.zone}</p>
              </div>
              <span className={cn(
                "ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border",
                active.status === 'online' ? 'bg-primary/10 text-primary border-primary/20' : 
                active.status === 'warning' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                'bg-zinc-800 text-zinc-400 border-zinc-700'
              )}>
                {active.status}
              </span>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1.5 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Environmental Pulse
                </p>
                <div className="flex items-baseline gap-2">
                   <p className={cn('text-5xl font-black font-mono tracking-tighter', aqiColor(active.aqi))}>
                     {active.status === 'offline' ? 'OFF' : active.aqi}
                   </p>
                   {active.status !== 'offline' && <span className="text-xs font-bold text-muted-foreground uppercase">AQI</span>}
                </div>
                {active.status !== 'offline' && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase", 
                      active.aqi > 100 ? "bg-red-500 text-white" : "bg-primary text-black"
                    )}>
                       {aqiLabel(active.aqi)}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">Threshold Target: 50</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-px bg-border/50 rounded-xl overflow-hidden border border-border/50">
                <div className="bg-black/20 p-4">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-400" /> Lat/Lng</p>
                  <p className="text-[11px] font-mono font-bold text-foreground">
                    {active.lat.toFixed(4)}<br />{active.lng.toFixed(4)}
                  </p>
                </div>
                <div className="bg-black/20 p-4">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1 flex items-center gap-1.5"><Shield className="w-3 h-3 text-primary" /> Sector</p>
                  <p className="text-[11px] font-bold text-foreground uppercase">{active.zone.split(' ')[0]}</p>
                </div>
              </div>

              {active.status === 'warning' && (
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]">
                  <AlertTriangle className="w-4 h-4" /> DISPATCH EVACUATION
                </button>
              )}
            </div>
          </div>
          
          {/* Legend */}
          <div className="glass-card rounded-xl p-4 border border-border/50 bg-black/5">
            <p className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
               <Layers className="w-3.5 h-3.5" /> Map Legend
            </p>
            <ul className="space-y-3">
              {[
                { dot: 'bg-primary shadow-primary/30', label: 'TOWER_NOMINAL', color: 'text-primary' },
                { dot: 'bg-red-500 shadow-red-500/30 animate-pulse', label: 'CRITICAL_ALARM', color: 'text-red-500' },
                { dot: 'bg-zinc-600 shadow-zinc-600/30', label: 'SIGNAL_LOST', color: 'text-zinc-500' },
              ].map(({ dot, label, color }) => (
                <li key={label} className="flex items-center gap-3 text-[10px] font-bold font-mono">
                  <div className={cn('w-2 h-2 rounded-full shadow-[0_0_8px]', dot)} />
                  <span className={color}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Main Map Area ── */}
      <div className="flex-1 flex flex-col relative">
        {/* Map Header HUD */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between gap-4 pointer-events-none">
           <div className="glass-card px-4 py-2 rounded-xl border border-border/50 flex items-center gap-4 backdrop-blur-xl shadow-2xl pointer-events-auto">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" />
                 <span className="text-[10px] font-bold font-mono text-foreground">SAT_LINK: 1.2 GB/S</span>
              </div>
              <span className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-3">
                 <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group">
                    <Crosshair className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                 </button>
                 <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group">
                    <Layers className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                 </button>
              </div>
           </div>
           
           <div className="glass-card px-5 py-2.5 rounded-xl border border-border/50 backdrop-blur-xl shadow-2xl pointer-events-auto flex items-center gap-4">
              <div className="flex flex-col">
                 <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter">Current Bounds</span>
                 <span className="text-[10px] font-mono text-primary">39.539°N 119.439°W</span>
              </div>
              <span className="h-6 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                 <Shield className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-bold font-mono">SEC_ZONE_B</span>
              </div>
           </div>
        </div>

        <div className="flex-1 bg-zinc-950 relative overflow-hidden">
           {/* Dark Map Styling via google-map-react options if needed, 
               but here we assume the provider handles the premium dark view. */}
           <GoogleMapReact
             bootstrapURLKeys={{ key: 'AIzaSyBBHfnFcwAl1JiDbog7u0Eu1cQd0omobjg' }}
             defaultCenter={DEFAULT_CENTER}
             defaultZoom={DEFAULT_ZOOM}
             options={{
                styles: [
                    { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
                    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#121212" }] },
                    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
                    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#222222" }] },
                    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f1f1f" }] },
                    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0d0d0d" }] }
                ],
                disableDefaultUI: true,
             }}
           >
              {NODES.map(node => (
                <MapMarker
                  key={node.id}
                  lat={node.lat}
                  lng={node.lng}
                  node={node}
                  activeId={active.id}
                  onClick={setActive}
                />
              ))}
           </GoogleMapReact>
        </div>

        {/* Bottom Status Bar */}
        <div className="h-10 px-8 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground bg-card/30 backdrop-blur-md relative z-10 shrink-0">
           <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                 <Zap className="w-3.5 h-3.5 text-primary" />
                 Stream: <span className="text-foreground font-bold">WGS-84_PROJECTION</span>
              </span>
              <span className="h-3 w-px bg-border/50" />
              <span className="flex items-center gap-2">
                 <Cpu className="w-3.5 h-3.5 text-blue-400" />
                 Engine: <span className="text-foreground font-bold">RADAR_CANVAS_V2</span>
              </span>
           </div>
           <div className="flex items-center gap-6">
              <span>Projection: Mercator Hybrid</span>
              <span className="h-3 w-px bg-border/50" />
              <span className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 GPS_LOCK: ACTIVE
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}

