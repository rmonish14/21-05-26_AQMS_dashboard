import { useState } from 'react';
import { MapPin, Power, Activity, Share2, Send, X, Loader2 } from 'lucide-react';
import LiveChart from './LiveChart';
import GaugeWidget from './GaugeWidget';
import { cn } from '../lib/utils';

interface NodeCardProps {
  data: any;
  status: any;
  history: any[];
}

export default function NodeCard({ data, status, history }: NodeCardProps) {
  const [relayActive, setRelayActive] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const isOffline = status?.status === 'offline';
  const lastSeen  = data.timestamp
    ? Math.floor((Date.now() - new Date(data.timestamp).getTime()) / 1000)
    : 0;

  const aqi = data.aqi ?? 0;

  const aqiMeta = aqi <= 50  ? { label: 'Good',      color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20'    }
               :  aqi <= 100 ? { label: 'Moderate',   color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
               :  aqi <= 150 ? { label: 'Sensitive',  color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' }
               :               { label: 'Unhealthy',  color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await fetch('http://localhost:5000/api/email/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: shareEmail.trim() || undefined,
          message: shareMessage,
          nodeData: { id: data.nodeId, aqi, status: status?.status }
        })
      });
      setShareSuccess(true);
      setTimeout(() => { setShowShare(false); setShareSuccess(false); setShareMessage(''); }, 2000);
    } catch (err) {
      console.error('Failed to share', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className={cn(
      "glass-card rounded-xl flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md",
      isOffline && "opacity-60"
    )}>

      {/* ── Card Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          {/* Live pulse indicator */}
          <div className="relative w-2 h-2">
            {!isOffline && (
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
            )}
            <span className={cn(
              "relative block w-2 h-2 rounded-full",
              isOffline ? 'bg-muted-foreground' : 'bg-primary'
            )} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground font-mono">{data.nodeId}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5" />
              Zone A · {isOffline ? 'Offline' : `Updated ${lastSeen}s ago`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AQI Badge */}
          <div className={cn("status-badge", aqiMeta.bg, aqiMeta.border, aqiMeta.color)}>
            AQI {aqi} · {aqiMeta.label}
          </div>
          {/* Share Button */}
          <button 
            onClick={() => setShowShare(true)}
            title="Dispatch Email Report"
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary border border-border text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex-1 flex flex-col gap-6">

        {/* Primary metrics table - Fixed alignment */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'PM 2.5', value: data.pm2_5, unit: 'µg/m³', color: 'orange' },
            { label: 'PM 10',  value: data.pm10,  unit: 'µg/m³', color: 'blue' },
            { label: 'CO',     value: data.co,    unit: 'ppm',   color: 'red' },
            { label: 'CO₂',    value: data.co2,   unit: 'ppm',   color: 'yellow' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="relative group">
              <div className={cn(
                "absolute inset-0 blur-lg opacity-0 group-hover:opacity-10 transition-opacity rounded-xl",
                color === 'orange' ? 'bg-orange-500' : color === 'blue' ? 'bg-blue-500' : color === 'red' ? 'bg-red-500' : 'bg-yellow-500'
              )} />
              <div className="relative bg-secondary/30 border border-border/50 rounded-xl px-4 py-3 flex flex-col">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-bold text-foreground tabular-nums font-mono leading-none">
                    {value ?? '--'}
                  </p>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">{unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Environmental gauges - Centered Flex */}
        <div className="flex items-center justify-center gap-8 py-2">
          <div className="flex flex-col items-center gap-2">
            <GaugeWidget
              value={data.temperature ?? 0} min={-10} max={50}
              label="Temp" unit="°C"
              colorClass="stroke-orange-400" size={80}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <GaugeWidget
              value={data.humidity ?? 0} min={0} max={100}
              label="Humid" unit="%"
              colorClass="stroke-blue-400" size={80}
            />
          </div>
        </div>

        {/* Trend sparkline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary" /> Real-time Trend
            </p>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-[8px] font-bold text-muted-foreground uppercase border border-border">2M Buffer</span>
          </div>
          <div className="h-16 w-full opacity-80 hover:opacity-100 transition-opacity">
            <LiveChart
              data={history}
              dataKey="aqi"
              color={aqi > 150 ? 'var(--color-destructive)' : 'var(--color-primary)'}
            />
          </div>
        </div>

        {/* Relay control section */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Exhaust System</p>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", relayActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground')} />
              <p className={cn("text-[10px] font-bold", relayActive ? 'text-primary' : 'text-muted-foreground')}>
                {relayActive ? 'ACTIVE_FLOW' : 'IDLE_STANDBY'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setRelayActive(v => !v)}
            disabled={isOffline}
            className={cn(
              "p-2.5 rounded-xl transition-all border shadow-sm",
              relayActive
                ? 'bg-primary border-primary text-primary-foreground shadow-primary/20'
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:bg-muted',
              isOffline && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* ── Share Modal Overlay ── */}
      {showShare && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full border border-border rounded-xl shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5"/> Share Node Telemetry</p>
              <button disabled={isSharing} onClick={() => setShowShare(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-4 space-y-3">
              {shareSuccess ? (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-3">
                    <Send className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Dispatched Successfully!</p>
                  <p className="text-[10px] text-muted-foreground mt-1">The report is on its way via NodeMailer.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground block mb-1.5">Recipient Override</label>
                    <input type="email" value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                      placeholder="Leave blank to use Default Settings Config"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground block mb-1.5">Custom Message</label>
                    <textarea value={shareMessage} onChange={e => setShareMessage(e.target.value)}
                      placeholder="Add an optional memo for the responder..."
                      rows={2}
                      className="w-full resize-none bg-secondary border border-border rounded-lg px-3 py-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <button 
                    onClick={handleShare} disabled={isSharing}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {isSharing ? 'Dispatching...' : 'Fire Dispatch Email'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
