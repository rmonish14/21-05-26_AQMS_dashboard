import { useState, useRef, useEffect } from 'react';
import { Wind, User, Activity, ArrowRight, Loader2, Cpu, CircuitBoard, ShieldCheck, Key } from 'lucide-react';
import { cn } from '../lib/utils';

export type SessionPayload = {
  token: string;
  username: string;
  role: string;
};

interface AuthPageProps {
  onLogin: (session: SessionPayload) => void;
}

/* ═══════════════════════════════════════════════════════
   Auth Particle Background Canvas
   ═══════════════════════════════════════════════════════ */
function AuthCanvas() {
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
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      ctx.fillStyle = 'rgba(96, 211, 148, 0.2)';
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Connect nearby particles
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(96, 211, 148, ${0.1 * (1 - dist / 100)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />;
}

/* ═══════════════════════════════════════════════════════
   Data Pipeline Shimmer
   ═══════════════════════════════════════════════════════ */
function DataPipeline({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden z-20">
      <div className={cn(
        "h-full transition-all duration-700",
        isActive 
          ? "bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_2s_ease-in-out_infinite]" 
          : "bg-primary/20"
      )} />
    </div>
  );
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin]   = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('REQUIRED_FIELD_MISSING');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'operator' })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AUTH_GATEWAY_REJECTED');
      }

      if (isLogin) {
        onLogin({ token: data.token, username: data.username, role: data.role });
      } else {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        const loginData = await loginRes.json();
        
        if (!loginRes.ok) {
          setIsLogin(true);
          setError('REG_SUCCESSful. RE-AUTH REQUIRED.');
          setPassword('');
        } else {
          onLogin({ token: loginData.token, username: loginData.username, role: loginData.role });
        }
      }
    } catch (err: any) {
      setError(err.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4 antialiased overflow-hidden relative">
      <AuthCanvas />
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] opacity-70 animate-[float_10s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[128px] animate-[float_14s_ease-in-out_infinite_reverse] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Branding */}
        <div className="flex flex-col items-center justify-center mb-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/40 border border-white/20 relative overflow-hidden group active:scale-95 transition-transform">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] animate-[shimmer_3s_infinite] pointer-events-none"></div>
             <Wind className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">AQMS Portal <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded ml-2">Secure</span></h1>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest opacity-60">Industrial Air Monitoring & SCADA Control</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-[2.5rem] p-10 border border-border/50 shadow-2xl relative overflow-hidden bg-slate-900/40 backdrop-blur-3xl group">
          <DataPipeline isActive={loading} />
          
          <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
             <CircuitBoard className="w-24 h-24 text-primary" />
          </div>

          {/* Toggle Tabs */}
          <div className="flex p-1.5 bg-black/40 rounded-2xl mb-8 border border-white/5">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                isLogin ? "grow bg-primary text-black shadow-[0_0_20px_rgba(96,211,148,0.3)]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                !isLogin ? "grow bg-primary text-black shadow-[0_0_20px_rgba(96,211,148,0.3)]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Enroll
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                <Activity className="w-4 h-4 text-red-500 mt-0.5 shrink-0 animate-pulse" />
                <p className="text-[10px] text-red-500 font-black font-mono leading-snug">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                 <User className="w-3 h-3" /> Identity Signature
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="USERNAME_ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground/30 focus:bg-white/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <Key className="w-3 h-3" /> Encrypted Key
                </label>
                {isLogin && <a href="#" className="text-[9px] text-primary hover:underline font-black uppercase tracking-widest opacity-60">Reset</a>}
              </div>
              <div className="relative group">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground/30 focus:bg-white/10"
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden flex items-center justify-center gap-3 py-4 bg-primary text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all disabled:opacity-70 group active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Initialize_Access' : 'Operator_enroll'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-4">
           <div className="h-8 flex items-center gap-4 px-6 rounded-full border border-white/5 bg-white/5 backdrop-blur-xl">
              <span className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground">
                 <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                 AES-256_ACTIVE
              </span>
              <div className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground">
                 <Cpu className="w-3.5 h-3.5 text-blue-400" />
                 NODE_IDENT: 0x8F2
              </span>
           </div>
           <p className="text-center text-[9px] text-muted-foreground font-bold tracking-[0.3em] uppercase opacity-40">
             RESTRICTED_SYSTEM · ACTIVITY_LOG_ENABLED
           </p>
        </div>

      </div>
    </div>
  );
}

