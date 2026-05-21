import { useState, useRef, useEffect } from 'react';
import { Sliders, ShieldCheck, Server, Save, CheckCircle2, Bell, Mail, MessageSquare, Smartphone, Zap, Cpu, CircuitBoard, Cog, Shield, Key, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════
   Settings Geometric Background Canvas
   ═══════════════════════════════════════════════════════ */
function SettingsCanvas() {
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
    const shapes: any[] = [];

    for (let i = 0; i < 15; i++) {
        shapes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: 20 + Math.random() * 40,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.01,
            opacity: 0.05 + Math.random() * 0.05
        });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      for (const s of shapes) {
          s.rotation += s.vRot;
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rotation);
          ctx.strokeStyle = `rgba(96, 211, 148, ${s.opacity})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(-s.size/2, -s.size/2, s.size, s.size);
          ctx.restore();
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

const TABS = [
  { id: 'thresholds',    label: 'Alert Thresholds', icon: Sliders       },
  { id: 'notifications', label: 'Notifications',    icon: Bell          },
  { id: 'security',      label: 'Admin Security',   icon: ShieldCheck   },
  { id: 'network',       label: 'MQTT / Network',   icon: Server        },
];

export default function SettingsPage({
  thresholds: ext,
  alertEmail: extEmail,
  onConfigChange,
}: {
  thresholds?: { aqi: number; pm25: number; co: number; co2: number };
  alertEmail?: string;
  onConfigChange?: (updates: { thresholds?: any, alertEmail?: string }) => void;
} = {}) {
  const [activeTab,  setActiveTab]  = useState('thresholds');
  const [aqiLimit,   setAqiLimit]   = useState(ext?.aqi  ?? 150);
  const [coLimit,    setCoLimit]    = useState(ext?.co   ?? 9);
  const [co2Limit,   setCo2Limit]   = useState(ext?.co2  ?? 1000);
  const [pm25Limit,  setPm25Limit]  = useState(ext?.pm25 ?? 35);
  const [muteAlerts,  setMuteAlerts]  = useState(false);
  const [saved,       setSaved]       = useState(false);

  // Notification state
  const [emailEnabled,    setEmailEnabled]    = useState(!!extEmail);
  const [emailAddr,       setEmailAddr]       = useState(extEmail || '');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramToken,   setTelegramToken]   = useState('');
  const [telegramChatId,  setTelegramChatId]  = useState('');
  const [smsEnabled,      setSmsEnabled]      = useState(false);
  const [smsNumber,       setSmsNumber]       = useState('');
  const [notifyOnWarn,    setNotifyOnWarn]    = useState(true);
  const [notifyOnCrit,    setNotifyOnCrit]    = useState(true);

  // MQTT Cloud config
  const [mqttHost, setMqttHost]   = useState('localhost');
  const [mqttPort, setMqttPort]   = useState('1883');
  const [mqttUser, setMqttUser]   = useState('');
  const [mqttPass, setMqttPass]   = useState('');
  const [mqttTls,  setMqttTls]    = useState(false);

  const save = () => {
    onConfigChange?.({ 
       thresholds: { aqi: aqiLimit, pm25: pm25Limit, co: coLimit, co2: co2Limit },
       alertEmail: emailEnabled ? emailAddr : '' 
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background text-foreground relative">
      <SettingsCanvas />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/8 rounded-full blur-[120px] animate-[float_14s_ease-in-out_infinite_reverse] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-6 space-y-6 w-full">

          {/* Page header */}
          <div className="flex items-center justify-between pb-6 border-b border-border/30">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-primary/10">
                  <Sliders className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h2 className="text-xl font-bold tracking-tight">Configuration Hub</h2>
                  <p className="text-sm text-muted-foreground mt-0.5 font-mono uppercase tracking-tighter">Global Control & Alert Logic Registry</p>
               </div>
            </div>
            <button
              onClick={save}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 shadow-lg',
                saved
                  ? 'bg-primary/20 text-primary border-primary/40 shadow-primary/10'
                  : 'bg-primary text-black border-transparent hover:opacity-90 shadow-primary/20'
              )}
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'SYNC_COMPLETE' : 'PUSH_CHANGES'}
            </button>
          </div>

          <div className="flex gap-8">
            {/* Tab nav */}
            <aside className="w-64 shrink-0 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-4">Core Clusters</p>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-bold text-left transition-all border group relative overflow-hidden',
                    activeTab === t.id
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/5'
                      : 'text-muted-foreground border-transparent hover:bg-white/5 hover:text-foreground'
                  )}
                >
                  {activeTab === t.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />}
                  <t.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeTab === t.id ? "text-primary" : "text-muted-foreground")} />
                  <span className="uppercase tracking-wider">{t.label}</span>
                </button>
              ))}

              <div className="mt-8 p-4 glass-card rounded-xl border border-border/50 bg-black/5">
                 <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin Status</span>
                 </div>
                 <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-foreground">Level 7 Access</span>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 </div>
              </div>
            </aside>

            {/* Panel */}
            <div className="flex-1 group relative glass-card rounded-2xl p-8 min-h-[560px] border border-border/50 backdrop-blur-xl shadow-2xl overflow-hidden self-start">
              <DataPipeline isActive={true} />
              <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <CircuitBoard className="w-16 h-16 text-primary" />
              </div>

              {/* ── THRESHOLDS ── */}
              {activeTab === 'thresholds' && (
                <div className="space-y-8 relative z-10">
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                       <Cog className="w-5 h-5 text-primary" />
                       Environmental Thresholds
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">Define critical boundary logic for automated response triggers</p>
                  </div>
                  <div className="space-y-6">
                    <ThresholdRow label="Zone Critical AQI"     description="High-priority alert when AQI exceeds this level."              value={aqiLimit}  min={50}  max={300}  step={5}  unit=""       color="text-red-500"                       onChange={setAqiLimit}  />
                    <ThresholdRow label="PM 2.5 Density"       description="WHO guideline: 15 µg/m³ per 24h average (indoor)."            value={pm25Limit} min={10}  max={150}  step={5}  unit="µg/m³" color="text-orange-500"                        onChange={setPm25Limit} />
                    <ThresholdRow label="CO Exposure Limit"    description="Carbon monoxide safety limit. NIOSH ceiling: 35 ppm."          value={coLimit}   min={1}   max={50}   step={1}  unit="ppm"   color="text-yellow-400"                       onChange={setCoLimit}   />
                    <ThresholdRow label="CO₂ Atmospheric Cap"  description="Indoor air quality degradation boundary."                      value={co2Limit}  min={400} max={2000} step={50} unit="ppm"   color="text-blue-400"                         onChange={setCo2Limit}  />
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-border/30">
                    <div>
                      <p className="text-sm font-bold text-foreground">Suppress Visual Alerts</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Mutes UI indicators while maintaining full DB ledger recording.</p>
                    </div>
                    <Toggle value={muteAlerts} onChange={setMuteAlerts} />
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-8 relative z-10">
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                       <Bell className="w-5 h-5 text-primary" />
                       Notification Clusters
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">Configure external communication protocols for threat alerts</p>
                  </div>

                  {/* Trigger conditions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 rounded-xl border border-border/30 bg-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-foreground uppercase">On Warning</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Moderate breach event</p>
                      </div>
                      <Toggle value={notifyOnWarn} onChange={setNotifyOnWarn} />
                    </div>
                    <div className="glass-card p-4 rounded-xl border border-border/30 bg-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-foreground uppercase">On Critical</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Severe threshold breach</p>
                      </div>
                      <Toggle value={notifyOnCrit} onChange={setNotifyOnCrit} />
                    </div>
                  </div>

                  {/* Channels */}
                  <div className="space-y-6">
                    {/* Email */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                             <Mail className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground uppercase">SMTP Direct Email</p>
                            <p className="text-[10px] text-muted-foreground font-mono">Primary dispatch for incident reports</p>
                          </div>
                        </div>
                        <Toggle value={emailEnabled} onChange={setEmailEnabled} />
                      </div>
                      {emailEnabled && (
                        <div className="relative group">
                           <input
                             type="email"
                             placeholder="operator@system.io"
                             value={emailAddr}
                             onChange={e => setEmailAddr(e.target.value)}
                             className="w-full max-w-sm bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all font-mono"
                           />
                           <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                              <Zap className="w-3 h-3 text-primary animate-pulse" />
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Telegram */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-400/10 rounded-lg border border-blue-400/20">
                             <MessageSquare className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground uppercase">Telegram Bot API</p>
                            <p className="text-[10px] text-muted-foreground font-mono">Encrypted push-alerts to secure groups</p>
                          </div>
                        </div>
                        <Toggle value={telegramEnabled} onChange={setTelegramEnabled} />
                      </div>
                      {telegramEnabled && (
                        <div className="grid grid-cols-2 gap-4 max-w-lg">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Bot Token</label>
                            <input type="password" placeholder="123:ABC..." value={telegramToken} onChange={e => setTelegramToken(e.target.value)}
                              className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Chat ID</label>
                            <input type="text" placeholder="-1001..." value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)}
                              className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SMS */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                             <Smartphone className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground uppercase">GSM / SMS Integration</p>
                            <p className="text-[10px] text-muted-foreground font-mono">Failover telephony alerts (Twilio)</p>
                          </div>
                        </div>
                        <Toggle value={smsEnabled} onChange={setSmsEnabled} />
                      </div>
                      {smsEnabled && (
                        <input type="tel" placeholder="+1..." value={smsNumber} onChange={e => setSmsNumber(e.target.value)}
                          className="w-full max-w-xs bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeTab === 'security' && (
                <div className="space-y-8 relative z-10">
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5 text-primary" />
                       Encryption & Cryptography
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">Access credentials and API key rotation management</p>
                  </div>
                  <div className="space-y-8 max-w-sm">
                    <div>
                      <label className="text-xs font-bold text-foreground uppercase tracking-widest block mb-3 flex items-center gap-2"><Key className="w-3 h-3" /> Master API Registry</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input type="password" disabled value="xxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-muted-foreground" />
                        </div>
                        <button className="px-5 py-3 text-[10px] font-bold uppercase border border-border/50 rounded-xl hover:bg-white/5 transition-all text-foreground bg-white/5 active:scale-95">Rotate</button>
                      </div>
                      <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                         <p className="text-[10px] text-red-500 font-bold uppercase leading-snug flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Warning: Critical Action
                         </p>
                         <p className="text-[9px] text-red-500/70 mt-1 font-mono uppercase">Key rotation disconnects all field controllers until pair-sync completes.</p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-border/30">
                      <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Active Sessions</p>
                      <div className="space-y-3">
                        {['admin@10.0.0.1 · Windows', 'api-service@edge_04 · Linux'].map(s => (
                          <div key={s} className="flex items-center justify-between px-5 py-3.5 bg-black/20 border border-border/50 rounded-xl group/row transition-all hover:bg-white/5">
                            <span className="text-[10px] font-mono text-muted-foreground group-hover/row:text-foreground">{s}</span>
                            <button className="text-[10px] text-red-500 font-bold uppercase hover:underline opacity-0 group-hover/row:opacity-100 transition-opacity">Revoke</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MQTT / NETWORK ── */}
              {activeTab === 'network' && (
                <div className="space-y-8 relative z-10">
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                       <Server className="w-5 h-5 text-primary" />
                       Network Topology
                    </h2>
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-tighter">MQTT broker bridging and data retention parameters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-xl">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Broker Host Authority</label>
                      <input value={mqttHost} onChange={e => setMqttHost(e.target.value)}
                        placeholder="broker.hivemq.com"
                        className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Service Port</label>
                      <input value={mqttPort} onChange={e => setMqttPort(e.target.value)}
                        placeholder="1883"
                        className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                    <div className="flex items-end pb-0.5">
                      <div className="flex items-center justify-between w-full px-5 py-3 bg-black/40 border border-border/50 rounded-xl group">
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">TLS / SHA-256</span>
                        <Toggle value={mqttTls} onChange={setMqttTls} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Vault User</label>
                      <input value={mqttUser} onChange={e => setMqttUser(e.target.value)}
                        className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block ml-1">Vault Secret</label>
                      <input type="password" value={mqttPass} onChange={e => setMqttPass(e.target.value)}
                        className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border/30">
                    <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Tunnel Status</p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: 'Host Origin',  value: mqttHost, color: 'text-primary' },
                        { dot: true, label: 'Handshake', value: mqttTls ? 'Secure' : 'Open', color: mqttTls ? 'text-primary' : 'text-yellow-400' },
                        { label: 'Latency', value: '4ms', color: 'text-foreground' },
                        { label: 'Uptime', value: '14.2d', color: 'text-foreground' },
                      ].map((item) => (
                        <div key={item.label} className="bg-black/20 border border-border/50 rounded-xl px-4 py-3 transition-all hover:bg-white/5">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">{item.label}</p>
                          <div className="flex items-center gap-2">
                             {item.dot && <div className={cn("w-1.5 h-1.5 rounded-full", mqttTls ? "bg-primary" : "bg-yellow-400")} />}
                             <p className={cn("text-[10px] font-mono font-bold truncate", item.color)}>{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-8 py-3 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground shrink-0 bg-card/30 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Config Context: <span className="text-foreground font-bold">LOCAL_PERSISTENT</span>
          </span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Core: <span className="text-foreground font-bold">SHA-256_HASH_VERIFIED</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span>Synced: 0.2s ago</span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full bg-primary", saved && "animate-ping")} />
            SYSTEM_IDLE
          </span>
        </div>
      </div>
    </div>
  );
}

function ThresholdRow({ label, description, value, min, max, step, unit, color, onChange }: {
  label: string; description: string; value: number;
  min: number; max: number; step: number;
  unit: string; color: string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-4 pb-6 border-b border-border/30 last:border-0 group/row">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-foreground uppercase tracking-tight group-hover/row:text-primary transition-colors">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono leading-relaxed">{description}</p>
        </div>
        <div className="text-right">
          <span className={cn('font-mono font-bold text-2xl tabular-nums drop-shadow-sm', color)}>
            {value}
          </span>
          {unit && <span className="text-muted-foreground text-[10px] font-bold ml-1 uppercase">{unit}</span>}
        </div>
      </div>
      <div className="relative h-6 flex items-center">
         <div className="absolute inset-0 h-1 my-auto bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary/20" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
         </div>
         <input type="range" min={min} max={max} step={step} value={value}
           onChange={e => onChange(parseInt(e.target.value))}
           className="absolute inset-0 w-full h-1 my-auto bg-transparent appearance-none cursor-pointer accent-primary slider-thumb-premium" />
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-all duration-300 border-2 shrink-0 group',
        value ? 'bg-primary border-primary shadow-[0_0_12px_rgba(96,211,148,0.3)]' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
      )}
    >
      <div className={cn(
        'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 transform shadow-xl',
        value ? 'left-6 bg-black translate-x-0' : 'left-1 bg-zinc-500 translate-x-0'
      )}>
         {value && <Zap className="w-2.5 h-2.5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />}
      </div>
    </button>
  );
}

