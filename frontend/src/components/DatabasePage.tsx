import { useState, useEffect, useRef } from 'react';
import { Database, HardDrive, LayoutGrid, TableProperties, Activity, Zap, Cpu, CircuitBoard, Search } from 'lucide-react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════
   Database Flow Background Canvas
   ═══════════════════════════════════════════════════════ */
function DatabaseCanvas() {
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

    const particles: any[] = [];
    const particleCount = 50;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      
      ctx.strokeStyle = 'rgba(96, 211, 148, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }

      for (const p of particles) {
        p.y += p.speed;
        if (p.y > h) p.y = -10;
        
        ctx.fillStyle = `rgba(96, 211, 148, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Data line
        if (frame % 2 === 0) {
          ctx.strokeStyle = `rgba(96, 211, 148, ${p.opacity * 0.3})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y - 20);
          ctx.stroke();
        }
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
      style={{ opacity: 0.4 }}
    />
  );
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

type TableOverview = {
  name: string;
  rowCount: number;
};

type DBOverview = {
  database: string;
  size: string;
  tables: TableOverview[];
};

type TableData = {
  table: string;
  columns: { name: string; type: string }[];
  rows: any[];
};

export default function DatabasePage() {
  const [overview, setOverview] = useState<DBOverview | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/database/overview')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch database overview');
        return res.json();
      })
      .then(data => {
        setOverview(data);
        if (data.tables.length > 0) {
          setActiveTable(data.tables[0].name);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!activeTable) return;
    setTableLoading(true);
    
    fetch(`http://localhost:5000/api/database/table/${activeTable}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch table ${activeTable}`);
        return res.json();
      })
      .then(data => {
        setTableData(data);
        setTableLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTableLoading(false);
      });
  }, [activeTable]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background text-foreground relative">
        <DatabaseCanvas />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Database className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-sm font-mono text-muted-foreground animate-pulse">Initializing Database Connection...</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background p-8 relative">
        <DatabaseCanvas />
        <div className="glass-card p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive max-w-md w-full text-center relative z-10 backdrop-blur-md">
          <Activity className="w-12 h-12 mx-auto mb-4 animate-bounce text-destructive" />
          <h3 className="text-xl font-bold">SQL Link Severed</h3>
          <p className="text-sm opacity-80 mt-2 font-mono">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-destructive text-white rounded-lg text-sm font-bold hover:bg-destructive/80 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background text-foreground relative">
      <DatabaseCanvas />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-[float_10s_ease-in-out_infinite] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/8 rounded-full blur-[120px] animate-[float_14s_ease-in-out_infinite_reverse] pointer-events-none" />

      {/* ── Top Metric Strip ── */}
      <div className="shrink-0 px-8 py-6 border-b border-border bg-card/30 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              PostgreSQL Explorer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 animate-pulse">CONNECTED</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Instance: <span className="text-foreground font-bold">{overview.database}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="group relative glass-card px-5 py-3 rounded-xl border border-border min-w-[160px] overflow-hidden transition-all hover:scale-105">
            <div className="absolute top-1 right-1 opacity-10 group-hover:opacity-20 transition-opacity">
              <CircuitBoard className="w-6 h-6 text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5 mb-1"><HardDrive className="w-3 h-3" /> Storage Used</p>
            <p className="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{overview.size}</p>
          </div>
          <div className="group relative glass-card px-5 py-3 rounded-xl border border-border min-w-[160px] overflow-hidden transition-all hover:scale-105">
            <div className="absolute top-1 right-1 opacity-10 group-hover:opacity-20 transition-opacity">
              <TableProperties className="w-6 h-6 text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5 mb-1"><LayoutGrid className="w-3 h-3" /> Schema Density</p>
            <p className="text-2xl font-bold font-mono tabular-nums">{overview.tables.length} <span className="text-xs font-normal">Tables</span></p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* ── Left Sidebar (Table List) ── */}
        <div className="w-72 shrink-0 border-r border-border bg-card/20 backdrop-blur-sm flex flex-col overflow-y-auto p-5 space-y-2">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2 flex items-center justify-between">
             Public Schemas
             <Search className="w-3 h-3 cursor-pointer hover:text-primary transition-colors" />
           </p>
           {overview.tables.map(table => (
             <button
               key={table.name}
               onClick={() => setActiveTable(table.name)}
               className={cn(
                 "flex flex-col text-left px-4 py-3.5 rounded-xl transition-all w-full relative overflow-hidden group border",
                 activeTable === table.name 
                   ? "bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/5" 
                   : "text-muted-foreground hover:bg-secondary hover:text-foreground border-transparent"
               )}
             >
               {activeTable === table.name && (
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
               )}
               <div className="flex items-center gap-3 w-full">
                 <TableProperties className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", activeTable === table.name ? "text-primary" : "text-muted-foreground")} />
                 <span className="text-sm font-bold truncate tracking-tight">{table.name}</span>
               </div>
               <div className="flex items-center justify-between mt-2 w-full">
                 <span className="text-[10px] font-mono opacity-70 tabular-nums">{table.rowCount.toLocaleString()} entries</span>
                 {activeTable === table.name && <div className="w-1 h-1 rounded-full bg-primary animate-ping" />}
               </div>
             </button>
           ))}
        </div>

        {/* ── Main Data View ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background/20 relative">
          
          {tableLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-md z-30">
               <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                 <p className="text-[10px] font-mono tracking-widest text-primary animate-pulse">EXTRACTING DATASET...</p>
               </div>
            </div>
          ) : null}

          {/* Table Header Details */}
          <div className="px-8 py-5 border-b border-border/30 bg-card/10 backdrop-blur-sm flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-lg">
                 <TableProperties className="w-4 h-4 text-primary" />
               </div>
               <div>
                 <h3 className="text-base font-bold text-foreground font-mono">public.{activeTable}</h3>
                 <p className="text-xs text-muted-foreground mt-0.5 font-mono">Relational snapshot · Latest 100 entries</p>
               </div>
             </div>
             <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-[10px] font-bold border border-border hover:border-primary/50 transition-all">SQL EXPLAIN</button>
                <button className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-[10px] font-bold border border-primary/30 hover:bg-primary/30 transition-all">REFRESH</button>
             </div>
          </div>

          {/* Data Grid */}
          <div className="flex-1 overflow-auto p-8">
            {!tableData || tableData.rows.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center border border-dashed border-border/50 rounded-2xl bg-card/5 backdrop-blur-sm">
                 <TableProperties className="w-12 h-12 text-muted-foreground/30 mb-4" />
                 <p className="text-sm text-muted-foreground font-mono">DATASET_EMPTY_OR_UNAVAILABLE</p>
                 <p className="text-[10px] text-muted-foreground/50 mt-2">Zero records returned for requested schema.</p>
              </div>
            ) : (
              <div className="group relative glass-card rounded-2xl border border-border/50 overflow-hidden shadow-2xl backdrop-blur-md">
                <DataPipeline isActive={!tableLoading} />
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-[#111] text-muted-foreground text-[10px] uppercase tracking-widest sticky top-0 z-10 border-b border-border/50">
                    <tr>
                      {tableData.columns.map((col, i) => (
                        <th key={col.name} className={cn("px-5 py-4 font-bold whitespace-nowrap", i > 0 && "border-l border-border/20")}>
                          <div className="flex items-center gap-2">
                             {col.name} 
                             <span className="text-[9px] lowercase font-mono px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">{col.type}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 bg-card/5">
                    {tableData.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-primary/5 transition-colors group/row">
                        {tableData.columns.map((col, cIndex) => {
                          let val = row[col.name];
                          
                          // Format special types
                          if (val === null) val = <span className="text-muted-foreground/50 italic font-mono">NULL</span>;
                          else if (typeof val === 'object') val = <span className="text-blue-400 font-mono text-[10px]">{JSON.stringify(val).slice(0, 40)}{JSON.stringify(val).length > 40 ? '...' : ''}</span>;
                          else if (typeof val === 'boolean') val = val ? <span className="text-green-500 font-bold font-mono">TRUE</span> : <span className="text-destructive font-bold font-mono">FALSE</span>;
                          
                          // Handle precise dates
                          if (col.type === 'timestamp without time zone' && val) {
                              try { val = <span className="text-foreground/80 font-mono">{new Date(val as string).toLocaleString()}</span>; } catch { }
                          }

                          return (
                            <td key={col.name} className={cn("px-5 py-3.5 font-mono text-xs whitespace-nowrap group-hover/row:text-foreground transition-colors", cIndex > 0 && "border-l border-border/10")}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-8 py-3 border-t border-border/30 flex items-center justify-between text-[10px] font-mono text-muted-foreground shrink-0 bg-card/30 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            Backend Protocol: <span className="text-foreground font-bold">SQL_OVER_HTTP</span>
          </span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Optimizer: <span className="text-foreground font-bold">PostgreSQL 14.x Hybrid</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span>{overview.tables.reduce((acc, t) => acc + t.rowCount, 0).toLocaleString()} records indexed</span>
          <span className="h-3 w-px bg-border/50" />
          <span className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", tableLoading ? "bg-orange-400 animate-pulse" : "bg-green-400")} />
            {tableLoading ? 'QUERY_IN_PROGRESS' : 'SQL_IDLE'}
          </span>
        </div>
      </div>
    </div>
  );
}

