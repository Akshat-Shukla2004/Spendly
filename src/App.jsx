import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ══════════════════════════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════════════════════════ */
const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#060810;--s1:#0B0D14;--s2:#10131C;--s3:#161A25;
      --b1:rgba(255,255,255,0.05);--b2:rgba(255,255,255,0.09);--b3:rgba(255,255,255,0.15);
      --tx:#E8ECF8;--tx2:#8890A8;--tx3:#454C62;
      --gr:#00E5A0;--red:#FF5C6A;--yellow:#FFBC3B;--blue:#4D9EFF;
      --font:'Outfit',sans-serif;--mono:'IBM Plex Mono',monospace;
    }
    html,body{background:var(--bg);color:var(--tx);font-family:var(--font);-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--tx3);border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes popIn{0%{transform:scale(.88);opacity:0}60%{transform:scale(1.03)}100%{transform:scale(1);opacity:1}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
    @keyframes toastIn{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
    @keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(28px)}}
    .fu{animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2) both}
    .fi{animation:fadeIn .28s ease both}
    .pi{animation:popIn .34s cubic-bezier(.22,.68,0,1.2) both}
    input,textarea,select{
      background:var(--s3);border:1.5px solid var(--b2);color:var(--tx);
      font-family:var(--mono);font-size:13px;border-radius:8px;padding:11px 14px;
      outline:none;width:100%;transition:border-color .18s,box-shadow .18s;
      appearance:none;-webkit-appearance:none;
    }
    input:focus,textarea:focus,select:focus{border-color:var(--gr);box-shadow:0 0 0 3px rgba(0,229,160,0.1)}
    input::placeholder,textarea::placeholder{color:var(--tx3)}
    select option{background:#161A25}
    input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.5);cursor:pointer}
    input[type="number"]::-webkit-inner-spin-button{-webkit-appearance:none}
    button{font-family:var(--font);cursor:pointer;border:none;outline:none;transition:all .16s}
    .btn-cta{background:var(--gr);color:#060810;font-weight:700;font-size:13.5px;padding:12px 24px;border-radius:8px;
      letter-spacing:.2px;display:inline-flex;align-items:center;gap:7px}
    .btn-cta:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,229,160,.25)}
    .btn-cta:active{transform:translateY(0);filter:brightness(.95)}
    .btn-cta:disabled{opacity:.35;cursor:not-allowed;transform:none;filter:none;box-shadow:none}
    .btn-ghost{background:transparent;color:var(--tx2);font-size:12px;padding:8px 16px;border-radius:8px;border:1.5px solid var(--b2)}
    .btn-ghost:hover{border-color:var(--b3);color:var(--tx);background:var(--s3)}
    .btn-icon{background:var(--s3);border:1.5px solid var(--b2);border-radius:8px;
      width:34px;height:34px;display:flex;align-items:center;justify-content:center;color:var(--tx2);font-size:14px}
    .btn-icon:hover{border-color:var(--b3);color:var(--tx)}
    .card{background:var(--s1);border:1.5px solid var(--b1);border-radius:18px;padding:22px}
    .dot-pulse span{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--gr);animation:blink 1.4s ease infinite}
    .dot-pulse span:nth-child(2){animation-delay:.2s}.dot-pulse span:nth-child(3){animation-delay:.4s}
    .ptrack{height:5px;border-radius:99px;background:var(--s3);overflow:hidden}
    .pfill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.22,.68,0,1)}
  `}</style>
);

/* ══════════════════════════════════════════════════════════════════════════════
   CONSTANTS & UTILS
══════════════════════════════════════════════════════════════════════════════ */
const CATS = [
  {id:"food",         label:"Food & Dining",  emoji:"🍽️", color:"#FF6B6B",hex:"255,107,107"},
  {id:"transport",    label:"Transport",       emoji:"🚗", color:"#4ECDC4",hex:"78,205,196"},
  {id:"shopping",     label:"Shopping",        emoji:"🛍️",color:"#FFBC3B",hex:"255,188,59"},
  {id:"entertainment",label:"Entertainment",   emoji:"🎬", color:"#A78BFA",hex:"167,139,250"},
  {id:"health",       label:"Health",          emoji:"💊", color:"#FF8FA3",hex:"255,143,163"},
  {id:"utilities",    label:"Utilities",       emoji:"⚡", color:"#B8FF8F",hex:"184,255,143"},
  {id:"travel",       label:"Travel",          emoji:"✈️", color:"#4D9EFF",hex:"77,158,255"},
  {id:"subscriptions",label:"Subscriptions",   emoji:"📱", color:"#C7CEEA",hex:"199,206,234"},
  {id:"other",        label:"Other",           emoji:"📦", color:"#8890A8",hex:"136,144,168"},
];
const DEFAULT_BUDGETS = {food:300,transport:150,shopping:200,entertainment:100,health:120,utilities:150,travel:500,subscriptions:50,other:100};
const SEED = [
  {id:1, desc:"Sushi omakase",     amount:120.00,cat:"food",         date:"2026-02-10",note:"Anniversary"},
  {id:2, desc:"Uber to downtown",  amount: 18.50,cat:"transport",    date:"2026-02-10",note:""},
  {id:3, desc:"Netflix + Spotify", amount: 28.98,cat:"subscriptions",date:"2026-02-09",note:""},
  {id:4, desc:"Gym membership",    amount: 59.99,cat:"health",       date:"2026-02-08",note:""},
  {id:5, desc:"Weekly groceries",  amount: 87.40,cat:"food",         date:"2026-02-07",note:""},
  {id:6, desc:"Electric bill",     amount: 94.22,cat:"utilities",    date:"2026-02-06",note:""},
  {id:7, desc:"Cinema + popcorn",  amount: 32.00,cat:"entertainment",date:"2026-02-05",note:""},
  {id:8, desc:"Amazon order",      amount: 56.75,cat:"shopping",     date:"2026-02-04",note:""},
  {id:9, desc:"Flight to NYC",     amount:240.00,cat:"travel",       date:"2026-02-03",note:"Work trip"},
  {id:10,desc:"Coffee shop",       amount: 21.60,cat:"food",         date:"2026-02-02",note:""},
  {id:11,desc:"Pharmacy",          amount: 14.50,cat:"health",       date:"2026-02-01",note:""},
  {id:12,desc:"Bus monthly pass",  amount: 45.00,cat:"transport",    date:"2026-01-31",note:""},
  {id:13,desc:"Takeout lunch",     amount: 16.80,cat:"food",         date:"2026-01-28",note:""},
  {id:14,desc:"New sneakers",      amount: 89.99,cat:"shopping",     date:"2026-01-25",note:""},
];

const c$   = id => CATS.find(x=>x.id===id)||CATS[8];
const cbg  = c  => `rgba(${c.hex},.12)`;
const cbdr = c  => `rgba(${c.hex},.28)`;
const $    = n  => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2}).format(n);
const fdt  = s  => new Date(s+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const yymm = d  => d.slice(0,7); // "2026-02"
const monthLabel = ym => { const [y,m]=ym.split("-"); return new Date(+y,+m-1,1).toLocaleDateString("en-US",{month:"long",year:"numeric"}); };

/* localStorage helpers */
const LS = {
  get: (k,fb) => { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):fb; }catch{return fb;} },
  set: (k,v)  => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} },
};

/* CSV export */
const exportCSV = (expenses) => {
  const header = "Date,Description,Category,Amount,Note";
  const rows = expenses.map(e=>`${e.date},"${e.desc.replace(/"/g,'""')}",${c$(e.cat).label},${e.amount.toFixed(2)},"${(e.note||"").replace(/"/g,'""')}"`);
  const blob = new Blob([[header,...rows].join("\n")],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `spendly-export-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
};

/* ══════════════════════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════════════════════ */
function Toast({msg,type,onDone}){
  const [out,setOut]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>{ setOut(true); setTimeout(onDone,300); },2800); return()=>clearTimeout(t); },[]);
  const col = type==="success"?"var(--gr)":type==="error"?"var(--red)":"var(--blue)";
  return(
    <div style={{background:"var(--s2)",border:`1.5px solid ${col}44`,borderRadius:12,
      padding:"12px 18px",maxWidth:300,display:"flex",alignItems:"center",gap:10,
      boxShadow:`0 12px 32px rgba(0,0,0,.4),0 0 0 1px ${col}22`,
      animation:out?"toastOut .3s ease forwards":"toastIn .3s ease both",
      fontFamily:"var(--font)",fontSize:13.5,fontWeight:500}}>
      <span style={{fontSize:16,color:col}}>{type==="success"?"✓":type==="error"?"✕":"ℹ"}</span>
      <span>{msg}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════════════════════════════════════════ */
function ConfirmDialog({msg,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(6,8,16,.88)",backdropFilter:"blur(12px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100,padding:16,
      animation:"fadeIn .2s ease both"}} onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div className="card pi" style={{width:"100%",maxWidth:360,border:"1.5px solid var(--b3)",
        boxShadow:"0 32px 80px rgba(0,0,0,.7)",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:14}}>🗑️</div>
        <div style={{fontWeight:700,fontSize:17,marginBottom:8}}>Delete expense?</div>
        <div style={{fontSize:13,color:"var(--tx2)",marginBottom:24,lineHeight:1.6}}>{msg}</div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-ghost" style={{flex:1,padding:"11px"}} onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"11px",borderRadius:8,
            background:"rgba(255,92,106,.15)",border:"1.5px solid rgba(255,92,106,.3)",
            color:"var(--red)",fontWeight:700,fontSize:13.5}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   DONUT CHART
══════════════════════════════════════════════════════════════════════════════ */
function Donut({segs,total,size=192}){
  const [hov,setHov]=useState(null);
  const R=size*.37,cx=size/2,cy=size/2,C=2*Math.PI*R;
  let off=0;
  const sl=segs.map(s=>{
    const p=total>0?s.value/total:0,d=p*C,sl={...s,d,g:C-d,off,p};
    off+=d; return sl;
  });
  return(
    <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--s3)" strokeWidth={size*.07}/>
        {sl.map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={R} fill="none" stroke={s.color}
            strokeWidth={hov===i?size*.096:size*.07}
            strokeDasharray={`${s.d} ${s.g}`} strokeDashoffset={-s.off}
            style={{transition:"stroke-width .2s,opacity .2s",cursor:"pointer",
              opacity:hov!==null&&hov!==i?.28:1,
              filter:hov===i?`drop-shadow(0 0 8px ${s.color}99)`:undefined}}
            onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}/>
        ))}
        <circle cx={cx} cy={cy} r={R*.68} fill="var(--s1)"/>
      </svg>
      <div style={{position:"absolute",textAlign:"center",pointerEvents:"none",userSelect:"none"}}>
        {hov!==null?(
          <>
            <div style={{fontSize:size*.1,fontWeight:800,color:sl[hov].color,fontFamily:"var(--mono)",lineHeight:1}}>{$(sl[hov].value)}</div>
            <div style={{fontSize:9.5,color:"var(--tx3)",marginTop:3,fontFamily:"var(--mono)",letterSpacing:1}}>{sl[hov].label.toUpperCase()}</div>
            <div style={{fontSize:12,color:sl[hov].color,marginTop:2,fontFamily:"var(--mono)"}}>{(sl[hov].p*100).toFixed(1)}%</div>
          </>
        ):(
          <>
            <div style={{fontSize:size*.1,fontWeight:800,color:"var(--tx)",fontFamily:"var(--mono)",lineHeight:1}}>{$(total)}</div>
            <div style={{fontSize:9.5,color:"var(--tx3)",marginTop:3,letterSpacing:2,fontFamily:"var(--mono)"}}>SPENT</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CHART TOOLTIP
══════════════════════════════════════════════════════════════════════════════ */
const CTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:"var(--s2)",border:"1.5px solid var(--b3)",borderRadius:10,
      padding:"10px 14px",fontSize:12,fontFamily:"var(--mono)"}}>
      <div style={{color:"var(--tx3)",marginBottom:4,fontSize:11}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color||"var(--gr)",fontWeight:600}}>{$(p.value)}</div>)}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════════════════════════ */
function StatCard({label,value,sub,accent,trend,trendGood,delay=0}){
  return(
    <div className="card fu" style={{animationDelay:`${delay}s`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,right:0,width:90,height:90,
        background:`radial-gradient(ellipse at top right,${accent||"var(--gr)"}18 0%,transparent 70%)`,
        pointerEvents:"none"}}/>
      <div style={{fontSize:10.5,color:"var(--tx3)",letterSpacing:1.8,fontFamily:"var(--mono)",marginBottom:10,fontWeight:500}}>{label}</div>
      <div style={{fontFamily:"var(--mono)",fontWeight:800,fontSize:28,color:accent||"var(--tx)",lineHeight:1,marginBottom:7,letterSpacing:-.5}}>
        {value}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:12,color:"var(--tx2)"}}>{sub}</div>
        {trend&&(
          <div style={{fontSize:11,fontFamily:"var(--mono)",fontWeight:600,
            color:trendGood?"var(--gr)":"var(--red)",
            background:trendGood?"rgba(0,229,160,.1)":"rgba(255,92,106,.1)",
            padding:"2px 8px",borderRadius:99}}>
            {trendGood?"↓":"↑"} {trend}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   EXPENSE ROW
══════════════════════════════════════════════════════════════════════════════ */
function ExpRow({exp,onDelete,onEdit,idx}){
  const [hov,setHov]=useState(false);
  const c=c$(exp.cat);
  return(
    <div className="fu"
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"flex",alignItems:"center",gap:13,padding:"11px 12px",borderRadius:12,
        background:hov?"var(--s2)":"transparent",border:`1.5px solid ${hov?"var(--b2)":"transparent"}`,
        transition:"all .15s",animationDelay:`${idx*.03}s`}}>
      <div style={{width:40,height:40,borderRadius:11,flexShrink:0,
        background:cbg(c),border:`1px solid ${cbdr(c)}`,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{c.emoji}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:13.5,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {exp.desc}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:99,
            fontSize:10.5,fontFamily:"var(--mono)",color:c.color,background:cbg(c),border:`1px solid ${cbdr(c)}`}}>
            {c.emoji} {c.label}
          </span>
          {exp.note&&<span style={{fontSize:11,color:"var(--tx3)",fontFamily:"var(--mono)",overflow:"hidden",
            textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:130}}>· {exp.note}</span>}
        </div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontWeight:700,fontSize:15,fontFamily:"var(--mono)",letterSpacing:-.3}}>{$(exp.amount)}</div>
        <div style={{fontSize:11,color:"var(--tx3)",fontFamily:"var(--mono)",marginTop:2}}>{fdt(exp.date)}</div>
      </div>
      {hov&&(
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button className="btn-icon" style={{width:30,height:30,fontSize:12}} onClick={()=>onEdit(exp)}>✏️</button>
          <button className="btn-icon" style={{width:30,height:30,fontSize:12,
            borderColor:"rgba(255,92,106,.25)",color:"var(--red)"}} onClick={()=>onDelete(exp)}>✕</button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ADD / EDIT MODAL
══════════════════════════════════════════════════════════════════════════════ */
function ExpModal({initial,onSave,onClose}){
  const editing = !!initial;
  const [form,setForm] = useState(initial||{
    desc:"",amount:"",cat:"food",
    date:new Date().toISOString().split("T")[0],note:""
  });
  const [detecting,setDetecting] = useState(false);
  const [err,setErr] = useState({});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const autoDetect = async () => {
    if(!form.desc.trim()) return;
    setDetecting(true);
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:30,
          messages:[{role:"user",content:`Classify this expense into exactly one category: food, transport, shopping, entertainment, health, utilities, travel, subscriptions, other.\nExpense: "${form.desc}"\nReply ONLY with the single category word.`}]}),
      });
      const d = await res.json();
      const det = d.content?.[0]?.text?.trim().toLowerCase().replace(/[^a-z]/g,"");
      if(CATS.find(c=>c.id===det)) set("cat",det);
    }catch(_){}
    setDetecting(false);
  };

  const validate = () => {
    const e={};
    if(!form.desc.trim()) e.desc="Description is required";
    if(!form.amount||isNaN(+form.amount)||+form.amount<=0) e.amount="Enter a valid amount";
    if(!form.date) e.date="Date is required";
    setErr(e);
    return Object.keys(e).length===0;
  };

  const submit = () => {
    if(!validate()) return;
    onSave({...form,id:initial?.id||Date.now(),amount:parseFloat((+form.amount).toFixed(2))});
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(6,8,16,.9)",backdropFilter:"blur(14px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16,
      animation:"fadeIn .2s ease both"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="card pi" style={{width:"100%",maxWidth:498,border:"1.5px solid var(--b3)",
        boxShadow:"0 40px 100px rgba(0,0,0,.7)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <div style={{fontWeight:800,fontSize:20,letterSpacing:-.4}}>{editing?"Edit Expense":"New Expense"}</div>
            <div style={{fontSize:12,color:"var(--tx3)",marginTop:2}}>{editing?"Update the details below":"Track your spending in seconds"}</div>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Description + auto-detect */}
          <div>
            <label style={{fontSize:11,color:"var(--tx3)",letterSpacing:1.5,fontFamily:"var(--mono)",display:"block",marginBottom:7}}>DESCRIPTION</label>
            <div style={{display:"flex",gap:8}}>
              <input placeholder="e.g. Lunch at Chipotle" value={form.desc}
                onChange={e=>set("desc",e.target.value)} onBlur={autoDetect}
                style={{flex:1,borderColor:err.desc?"var(--red)":undefined}}/>
              <button className="btn-icon" onClick={autoDetect} disabled={detecting}
                title="Auto-detect category"
                style={{flexShrink:0,width:42,color:detecting?"var(--gr)":"var(--tx2)"}}>
                {detecting
                  ?<div className="dot-pulse" style={{display:"flex",gap:2,justifyContent:"center"}}><span/><span/><span/></div>
                  :"✨"}
              </button>
            </div>
            {err.desc&&<div style={{fontSize:11,color:"var(--red)",marginTop:4,fontFamily:"var(--mono)"}}>{err.desc}</div>}
          </div>

          {/* Amount + Date */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:11,color:"var(--tx3)",letterSpacing:1.5,fontFamily:"var(--mono)",display:"block",marginBottom:7}}>AMOUNT (USD)</label>
              <input type="number" placeholder="0.00" min="0" step="0.01" value={form.amount}
                onChange={e=>set("amount",e.target.value)}
                style={{borderColor:err.amount?"var(--red)":undefined}}/>
              {err.amount&&<div style={{fontSize:11,color:"var(--red)",marginTop:4,fontFamily:"var(--mono)"}}>{err.amount}</div>}
            </div>
            <div>
              <label style={{fontSize:11,color:"var(--tx3)",letterSpacing:1.5,fontFamily:"var(--mono)",display:"block",marginBottom:7}}>DATE</label>
              <input type="date" value={form.date} onChange={e=>set("date",e.target.value)}
                style={{borderColor:err.date?"var(--red)":undefined}}/>
              {err.date&&<div style={{fontSize:11,color:"var(--red)",marginTop:4,fontFamily:"var(--mono)"}}>{err.date}</div>}
            </div>
          </div>

          {/* Category grid */}
          <div>
            <label style={{fontSize:11,color:"var(--tx3)",letterSpacing:1.5,fontFamily:"var(--mono)",display:"block",marginBottom:8}}>CATEGORY</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
              {CATS.map(c=>{
                const on=form.cat===c.id;
                return(
                  <button key={c.id} onClick={()=>set("cat",c.id)} style={{
                    padding:"9px 6px",borderRadius:10,fontSize:10.5,fontFamily:"var(--mono)",
                    display:"flex",alignItems:"center",gap:5,justifyContent:"center",
                    background:on?cbg(c):"var(--s3)",border:`1.5px solid ${on?cbdr(c):"var(--b1)"}`,
                    color:on?c.color:"var(--tx3)",fontWeight:on?600:400,transition:"all .15s",
                  }}>
                    <span style={{fontSize:14}}>{c.emoji}</span>
                    <span style={{fontSize:10}}>{c.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={{fontSize:11,color:"var(--tx3)",letterSpacing:1.5,fontFamily:"var(--mono)",display:"block",marginBottom:7}}>
              NOTE <span style={{opacity:.45}}>(OPTIONAL)</span>
            </label>
            <textarea placeholder="Anything to remember…" rows={2} value={form.note}
              onChange={e=>set("note",e.target.value)} style={{resize:"none"}}/>
          </div>

          <button className="btn-cta" style={{marginTop:2,justifyContent:"center"}} onClick={submit}>
            {editing?"Save Changes":"Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BUDGET EDIT MODAL
══════════════════════════════════════════════════════════════════════════════ */
function BudgetModal({budgets,onSave,onClose}){
  const [vals,setVals] = useState({...budgets});
  const set = (k,v) => setVals(p=>({...p,[k]:v}));
  const save = () => {
    const cleaned = {};
    CATS.forEach(c=>{ cleaned[c.id]=Math.max(0,parseFloat(vals[c.id])||0); });
    onSave(cleaned);
    onClose();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(6,8,16,.9)",backdropFilter:"blur(14px)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16,
      animation:"fadeIn .2s ease both"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="card pi" style={{width:"100%",maxWidth:480,border:"1.5px solid var(--b3)",
        boxShadow:"0 40px 100px rgba(0,0,0,.7)",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div>
            <div style={{fontWeight:800,fontSize:20,letterSpacing:-.4}}>Edit Budgets</div>
            <div style={{fontSize:12,color:"var(--tx3)",marginTop:2}}>Set your monthly limits per category</div>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          {CATS.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:34,height:34,borderRadius:9,flexShrink:0,
                background:cbg(c),border:`1px solid ${cbdr(c)}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{c.emoji}</div>
              <div style={{flex:1,fontSize:13,fontWeight:500}}>{c.label}</div>
              <div style={{width:110,flexShrink:0}}>
                <input type="number" min="0" step="10" value={vals[c.id]||0}
                  onChange={e=>set(c.id,e.target.value)}
                  style={{textAlign:"right",padding:"8px 12px",fontSize:13}}/>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-cta" style={{width:"100%",justifyContent:"center"}} onClick={save}>
          Save Budgets
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   AI PANEL
══════════════════════════════════════════════════════════════════════════════ */
function AIPanel({expenses}){
  const [result,setResult]  = useState(null);
  const [loading,setLoading]= useState(false);
  const [error,setError]    = useState(null);

  const analyze = async () => {
    setLoading(true); setError(null); setResult(null);
    const total = expenses.reduce((a,e)=>a+e.amount,0);
    const byCat = {};
    expenses.forEach(e=>{ byCat[e.cat]=(byCat[e.cat]||0)+e.amount; });
    const catSum = Object.entries(byCat).sort((a,b)=>b[1]-a[1])
      .map(([id,v])=>`${c$(id).label}: ${$(v)}`).join(", ");
    const prompt = `You are a sharp personal finance advisor. Analyze these expenses and return ONLY valid JSON (no markdown fences, no extra text).
Data: total ${$(total)}, ${expenses.length} transactions. By category: ${catSum}.
Top items: ${expenses.slice(0,8).map(e=>`${e.desc} (${$(e.amount)})`).join("; ")}
Required JSON:
{
  "headline":"punchy 8-word max summary",
  "score":<integer 1-100>,
  "scoreLabel":"Needs Work|Fair|Good|Solid|Excellent",
  "savingsPotential":<monthly savings number>,
  "insights":[
    {"type":"warning","title":"<short>","body":"<1-2 sentences with numbers>"},
    {"type":"tip","title":"<short>","body":"<1-2 sentences actionable>"},
    {"type":"praise","title":"<short>","body":"<1-2 sentences positive>"}
  ],
  "quickWins":["action 1","action 2","action 3"]
}`;
    try{
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:prompt}]}),
      });
      const d = await res.json();
      const raw = d.content?.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      setResult(JSON.parse(raw));
    }catch(e){ setError("Analysis failed — please try again."); }
    finally{ setLoading(false); }
  };

  const ts = {
    warning:{c:"var(--red)",  bg:"rgba(255,92,106,.07)", bd:"rgba(255,92,106,.2)",  icon:"⚠️"},
    tip:    {c:"var(--yellow)",bg:"rgba(255,188,59,.07)", bd:"rgba(255,188,59,.2)",  icon:"💡"},
    praise: {c:"var(--gr)",   bg:"rgba(0,229,160,.07)",  bd:"rgba(0,229,160,.2)",   icon:"✅"},
  };
  const sc = result?(result.score>=75?"var(--gr)":result.score>=50?"var(--yellow)":"var(--red)"):"var(--tx3)";

  return(
    <div>
      <div style={{background:"linear-gradient(135deg,#0B1A14 0%,#0B0D14 100%)",
        border:"1.5px solid rgba(0,229,160,.15)",borderRadius:18,padding:"20px 22px",marginBottom:14,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:46,borderRadius:13,background:"rgba(0,229,160,.1)",
            border:"1.5px solid rgba(0,229,160,.25)",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:22,boxShadow:"0 0 24px rgba(0,229,160,.15)"}}>🤖</div>
          <div>
            <div style={{fontWeight:800,fontSize:16,letterSpacing:-.2}}>AI Financial Advisor</div>
            <div style={{fontSize:11,color:"var(--tx3)",fontFamily:"var(--mono)",letterSpacing:1.2,marginTop:2}}>
              CLAUDE · {expenses.length} TRANSACTIONS
            </div>
          </div>
        </div>
        <button className="btn-cta" onClick={analyze} disabled={loading||expenses.length===0}
          style={{fontSize:12.5,padding:"10px 20px"}}>
          {loading
            ?<><div className="dot-pulse" style={{display:"flex",gap:3}}><span/><span/><span/></div><span>Analyzing…</span></>
            :result?"↺ Re-analyze":"✦ Get AI Insights"}
        </button>
      </div>

      {!loading&&!error&&!result&&(
        <div style={{textAlign:"center",padding:"52px 0",color:"var(--tx3)"}}>
          <div style={{fontSize:44,marginBottom:14}}>🔍</div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:8,color:"var(--tx2)"}}>No insights yet</div>
          <div style={{fontSize:12.5,fontFamily:"var(--mono)"}}>Click "Get AI Insights" to analyze your spending</div>
        </div>
      )}
      {error&&!loading&&(
        <div style={{padding:16,background:"rgba(255,92,106,.08)",border:"1.5px solid rgba(255,92,106,.2)",
          borderRadius:12,fontSize:13,color:"var(--red)"}}>{error}</div>
      )}
      {result&&!loading&&(
        <div className="fi">
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,marginBottom:14}}>
            <div className="card" style={{border:"1.5px solid var(--b2)"}}>
              <div style={{fontSize:10.5,color:"var(--tx3)",fontFamily:"var(--mono)",letterSpacing:1.5,marginBottom:10}}>FINANCIAL HEALTH</div>
              <div style={{fontWeight:700,fontSize:15.5,lineHeight:1.55,marginBottom:12}}>{result.headline}</div>
              {result.savingsPotential>0&&(
                <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12.5,color:"var(--gr)",fontFamily:"var(--mono)",fontWeight:600}}>
                  <span>💰</span><span>Save up to {$(result.savingsPotential)}/mo</span>
                </div>
              )}
            </div>
            <div style={{width:100,borderRadius:14,background:"var(--s2)",border:"1.5px solid var(--b2)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,padding:"14px 8px"}}>
              <div style={{fontSize:36,fontWeight:800,fontFamily:"var(--mono)",color:sc,lineHeight:1,
                textShadow:`0 0 20px ${sc}55`}}>{result.score}</div>
              <div style={{fontSize:9.5,color:"var(--tx3)",letterSpacing:1,textAlign:"center",fontFamily:"var(--mono)"}}>{result.scoreLabel?.toUpperCase()}</div>
              <div className="ptrack" style={{width:68,marginTop:2}}>
                <div className="pfill" style={{width:`${result.score}%`,background:sc}}/>
              </div>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {result.insights?.map((ins,i)=>{
              const s=ts[ins.type]||ts.tip;
              return(
                <div key={i} className="fu" style={{background:s.bg,border:`1.5px solid ${s.bd}`,
                  borderRadius:12,padding:"14px 16px",animationDelay:`${i*.07}s`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:15}}>{s.icon}</span>
                    <span style={{fontWeight:700,fontSize:13,color:s.c}}>{ins.title}</span>
                  </div>
                  <div style={{fontSize:12.5,color:"rgba(232,236,248,.75)",lineHeight:1.65,fontFamily:"var(--mono)"}}>{ins.body}</div>
                </div>
              );
            })}
          </div>

          {result.quickWins?.length>0&&(
            <div className="card" style={{border:"1.5px solid var(--b2)"}}>
              <div style={{fontSize:10.5,color:"var(--tx3)",fontFamily:"var(--mono)",letterSpacing:1.5,marginBottom:14}}>QUICK WINS</div>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {result.quickWins.map((w,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,fontSize:13}}>
                    <span style={{color:"var(--gr)",fontFamily:"var(--mono)",fontSize:11,fontWeight:700,marginTop:1,flexShrink:0,minWidth:20}}>
                      {String(i+1).padStart(2,"0")}
                    </span>
                    <span style={{color:"var(--tx2)",lineHeight:1.55}}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   BUDGET TAB
══════════════════════════════════════════════════════════════════════════════ */
function BudgetTab({expenses,budgets,onEditBudgets}){
  const totalBudget = Object.values(budgets).reduce((a,b)=>a+b,0);
  const totalSpent  = expenses.reduce((a,e)=>a+e.amount,0);
  const overCats    = CATS.filter(c=>{
    const sp=expenses.filter(e=>e.cat===c.id).reduce((a,e)=>a+e.amount,0);
    return sp>(budgets[c.id]||0);
  });

  return(
    <div className="fu">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div className="card">
          <div style={{fontSize:10.5,color:"var(--tx3)",fontFamily:"var(--mono)",letterSpacing:1.8,marginBottom:10}}>MONTHLY BUDGET</div>
          <div style={{fontFamily:"var(--mono)",fontSize:26,fontWeight:800,color:"var(--blue)",letterSpacing:-.5}}>{$(totalBudget)}</div>
          <div style={{fontSize:12,color:"var(--tx2)",marginTop:5}}>{$(totalSpent)} spent · {$(Math.max(totalBudget-totalSpent,0))} left</div>
          <div className="ptrack" style={{marginTop:12}}>
            <div className="pfill" style={{width:`${Math.min((totalSpent/totalBudget)*100,100)}%`,
              background:totalSpent>totalBudget?"var(--red)":"var(--blue)"}}/>
          </div>
          <div style={{fontSize:11,color:"var(--tx3)",fontFamily:"var(--mono)",marginTop:6}}>
            {((totalSpent/totalBudget)*100).toFixed(0)}% of budget used
          </div>
        </div>
        <div className="card">
          <div style={{fontSize:10.5,color:"var(--tx3)",fontFamily:"var(--mono)",letterSpacing:1.8,marginBottom:10}}>STATUS</div>
          <div style={{fontFamily:"var(--mono)",fontSize:26,fontWeight:800,letterSpacing:-.5,
            color:overCats.length>0?"var(--red)":"var(--gr)"}}>
            {overCats.length>0?`${overCats.length} Over`:"On Track"}
          </div>
          <div style={{fontSize:12,color:"var(--tx2)",marginTop:5,lineHeight:1.55}}>
            {overCats.length>0
              ?`Over in: ${overCats.map(c=>c.label).join(", ")}`
              :"All categories within budget 🎉"}
          </div>
          <button className="btn-ghost" style={{marginTop:14,width:"100%",fontSize:12}} onClick={onEditBudgets}>
            ✏️ Edit Budgets
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{fontSize:10.5,color:"var(--tx3)",fontFamily:"var(--mono)",letterSpacing:1.8,marginBottom:20}}>BUDGET VS ACTUAL</div>
        {CATS.map(c=>{
          const spent  = expenses.filter(e=>e.cat===c.id).reduce((a,e)=>a+e.amount,0);
          const budget = budgets[c.id]||0;
          if(spent===0&&budget===0) return null;
          const pct  = budget>0?Math.min((spent/budget)*100,100):spent>0?100:0;
          const over = spent>budget&&budget>0;
          return(
            <div key={c.id} style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:500}}>
                  <span>{c.emoji}</span><span>{c.label}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12.5,fontFamily:"var(--mono)",
                    color:over?"var(--red)":"var(--tx2)",fontWeight:over?600:400}}>{$(spent)}</span>
                  <span style={{fontSize:11,color:"var(--tx3)",fontFamily:"var(--mono)"}}>/ {$(budget)}</span>
                </div>
              </div>
              <div className="ptrack">
                <div className="pfill" style={{width:`${pct}%`,
                  background:over?"var(--red)":pct>75?"var(--yellow)":c.color}}/>
              </div>
              {over&&<div style={{fontSize:10.5,color:"var(--red)",marginTop:4,fontFamily:"var(--mono)"}}>+{$(spent-budget)} over budget</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════════════════════ */
export default function App(){
  const [expenses,setExpenses] = useState(()=>LS.get("spendly_expenses",SEED));
  const [budgets, setBudgets]  = useState(()=>LS.get("spendly_budgets",DEFAULT_BUDGETS));
  const [tab,     setTab]      = useState("dashboard");
  const [modal,   setModal]    = useState(null);        // null | "add" | expense-obj
  const [budgetModal,setBudgetModal] = useState(false);
  const [confirm, setConfirm]  = useState(null);        // expense to confirm-delete
  const [filterCat,setFilter]  = useState("all");
  const [search,  setSearch]   = useState("");
  const [sortBy,  setSort]     = useState("date");
  const [viewMonth,setViewMonth]= useState(()=>{
    const stored = LS.get("spendly_expenses", SEED);
    const months = [...new Set(stored.map(e=>yymm(e.date)))].sort().reverse();
    return months[0] || yymm(new Date().toISOString());
  });
  const [toasts,  setToasts]   = useState([]);

  // Persist on change
  useEffect(()=>{ LS.set("spendly_expenses",expenses); },[expenses]);
  useEffect(()=>{ LS.set("spendly_budgets",budgets); },[budgets]);

  const toast = (msg,type="success") => {
    const id=Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
  };

  const addOrEdit = useCallback((exp)=>{
    setExpenses(prev=>{
      const exists=prev.find(e=>e.id===exp.id);
      if(exists){ toast("Expense updated"); return prev.map(e=>e.id===exp.id?exp:e); }
      toast("Expense added");
      return [exp,...prev];
    });
  },[]);

  const requestDelete = (exp) => setConfirm(exp);
  const confirmDelete = () => {
    setExpenses(p=>p.filter(e=>e.id!==confirm.id));
    toast("Expense deleted","error");
    setConfirm(null);
  };

  /* ── Month navigation ── */
  const allMonths = [...new Set(expenses.map(e=>yymm(e.date)))].sort().reverse();
  const prevMonth = () => {
    const idx=allMonths.indexOf(viewMonth);
    if(idx<allMonths.length-1) setViewMonth(allMonths[idx+1]);
  };
  const nextMonth = () => {
    const idx=allMonths.indexOf(viewMonth);
    if(idx>0) setViewMonth(allMonths[idx-1]);
  };

  /* ── Derived ── */
  const monthExp  = expenses.filter(e=>yymm(e.date)===viewMonth);
  const prevMonthKey = allMonths[allMonths.indexOf(viewMonth)+1];
  const prevExp   = prevMonthKey ? expenses.filter(e=>yymm(e.date)===prevMonthKey) : [];
  const mTotal    = monthExp.reduce((a,e)=>a+e.amount,0);
  const pTotal    = prevExp.reduce((a,e)=>a+e.amount,0);
  const mDelta    = pTotal>0 ? (((mTotal-pTotal)/pTotal)*100) : null;
  const avgTx     = monthExp.length>0 ? mTotal/monthExp.length : 0;

  const byCat = CATS.map(c=>({
    ...c,value:monthExp.filter(e=>e.cat===c.id).reduce((a,e)=>a+e.amount,0)
  })).filter(c=>c.value>0);
  const topCat = [...byCat].sort((a,b)=>b.value-a.value)[0];

  // Daily spend chart for current month
  const dayMap={};
  monthExp.forEach(e=>{ dayMap[e.date]=(dayMap[e.date]||0)+e.amount; });
  const dailyData = Object.entries(dayMap)
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([date,amount])=>({name:fdt(date),amount}));

  // Expense list with filters
  const filtered = expenses
    .filter(e=>filterCat==="all"||e.cat===filterCat)
    .filter(e=>e.desc.toLowerCase().includes(search.toLowerCase())||
               (e.note||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sortBy==="date"?b.date.localeCompare(a.date):b.amount-a.amount);

  const TABS=[
    {id:"dashboard",label:"Dashboard",icon:"◈"},
    {id:"expenses", label:"Expenses", icon:"≡"},
    {id:"budget",   label:"Budget",   icon:"◎"},
    {id:"insights", label:"AI Insights",icon:"✦"},
  ];

  return(
    <div style={{minHeight:"100vh",background:"var(--bg)",fontFamily:"var(--font)"}}>
      <GS/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:"radial-gradient(ellipse 70% 40% at 50% 0%,rgba(0,229,160,.04) 0%,transparent 60%)"}}/>

      <div style={{position:"relative",zIndex:1,maxWidth:920,margin:"0 auto",padding:"0 16px 90px"}}>

        {/* ── TOP BAR ── */}
        <div className="fu" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 0 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:42,height:42,borderRadius:12,background:"var(--gr)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,
              boxShadow:"0 4px 18px rgba(0,229,160,.4)"}}>💸</div>
            <div>
              <div style={{fontWeight:800,fontSize:22,letterSpacing:-.5,lineHeight:1}}>Spendly</div>
              <div style={{fontSize:10.5,color:"var(--tx3)",fontFamily:"var(--mono)",letterSpacing:1.5,marginTop:2}}>SMART EXPENSE TRACKER</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button className="btn-ghost" style={{fontSize:11.5,display:"flex",alignItems:"center",gap:6}}
              onClick={()=>exportCSV(expenses)} title="Export all expenses as CSV">
              ⬇ Export CSV
            </button>
            <button className="btn-cta" onClick={()=>setModal("add")}>
              <span style={{fontSize:18,lineHeight:1,marginTop:-1}}>+</span> Add Expense
            </button>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="fu" style={{display:"flex",gap:3,marginBottom:22,
          background:"var(--s1)",border:"1.5px solid var(--b1)",borderRadius:14,padding:"5px",
          animationDelay:".05s"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,padding:"9px 10px",borderRadius:10,fontSize:13,fontWeight:600,
              display:"flex",alignItems:"center",justifyContent:"center",gap:6,
              background:tab===t.id?"var(--s3)":"transparent",
              color:tab===t.id?"var(--tx)":"var(--tx3)",
              border:`1.5px solid ${tab===t.id?"var(--b2)":"transparent"}`,
              transition:"all .15s",letterSpacing:.1,
            }}>
              <span style={{fontSize:15}}>{t.icon}</span>
              <span>{t.label}</span>
              {t.id==="insights"&&<span style={{fontSize:9,fontFamily:"var(--mono)",color:"var(--gr)",
                background:"rgba(0,229,160,.12)",padding:"1px 6px",borderRadius:99,letterSpacing:1}}>AI</span>}
            </button>
          ))}
        </div>

        {/* ── MONTH NAVIGATOR (dashboard & budget) ── */}
        {(tab==="dashboard"||tab==="budget")&&(
          <div className="fu" style={{display:"flex",alignItems:"center",justifyContent:"center",
            gap:12,marginBottom:18,animationDelay:".08s"}}>
            <button className="btn-icon" onClick={prevMonth}
              style={{opacity:allMonths.indexOf(viewMonth)<allMonths.length-1?1:.3}}>←</button>
            <div style={{fontWeight:700,fontSize:15,letterSpacing:.2,minWidth:160,textAlign:"center"}}>
              {monthLabel(viewMonth)}
            </div>
            <button className="btn-icon" onClick={nextMonth}
              style={{opacity:allMonths.indexOf(viewMonth)>0?1:.3}}>→</button>
          </div>
        )}

        {/* ════════ DASHBOARD ════════ */}
        {tab==="dashboard"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
              <StatCard label="THIS MONTH" value={$(mTotal)}
                sub={`${monthExp.length} transactions`} accent="var(--gr)"
                trend={mDelta!==null?`${Math.abs(mDelta).toFixed(0)}%`:null}
                trendGood={mDelta!==null&&mDelta<0} delay={.1}/>
              <StatCard label="AVG TRANSACTION" value={$(avgTx)} sub="per expense" delay={.15}/>
              <StatCard label="TOP CATEGORY" value={topCat?.label||"—"}
                sub={topCat?$(topCat.value):""} accent={topCat?.color} delay={.2}/>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1.25fr 1fr",gap:14,marginBottom:18}}>
              <div className="card fu" style={{animationDelay:".25s"}}>
                <div style={{fontSize:10.5,color:"var(--tx3)",letterSpacing:1.8,fontFamily:"var(--mono)",marginBottom:16}}>
                  DAILY SPENDING
                </div>
                {dailyData.length>0?(
                  <ResponsiveContainer width="100%" height={170}>
                    <AreaChart data={dailyData} margin={{top:4,right:4,bottom:0,left:-22}}>
                      <defs>
                        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E5A0" stopOpacity={.28}/>
                          <stop offset="100%" stopColor="#00E5A0" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:"#454C62",fontFamily:"var(--mono)"}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10,fill:"#454C62",fontFamily:"var(--mono)"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
                      <Tooltip content={<CTip/>}/>
                      <Area type="monotone" dataKey="amount" stroke="#00E5A0" strokeWidth={2.5}
                        fill="url(#ag)" dot={false}
                        activeDot={{r:4,fill:"#00E5A0",stroke:"#0B0D14",strokeWidth:2}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                ):(
                  <div style={{height:170,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--tx3)",fontSize:13,fontFamily:"var(--mono)"}}>
                    No data for this month
                  </div>
                )}
              </div>
              <div className="card fu" style={{animationDelay:".3s",display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",gap:12}}>
                <div style={{fontSize:10.5,color:"var(--tx3)",letterSpacing:1.8,fontFamily:"var(--mono)",alignSelf:"flex-start"}}>
                  BREAKDOWN
                </div>
                {byCat.length>0
                  ?<Donut segs={byCat} total={mTotal} size={186}/>
                  :<div style={{height:186,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--tx3)",fontSize:13,fontFamily:"var(--mono)"}}>No data</div>
                }
              </div>
            </div>

            <div className="card fu" style={{animationDelay:".35s",marginBottom:18}}>
              <div style={{fontSize:10.5,color:"var(--tx3)",letterSpacing:1.8,fontFamily:"var(--mono)",marginBottom:16}}>
                CATEGORY OVERVIEW
              </div>
              {byCat.length>0?(
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  {[...byCat].sort((a,b)=>b.value-a.value).map(c=>{
                    const pct=mTotal>0?(c.value/mTotal)*100:0;
                    return(
                      <div key={c.id}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                          <div style={{display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:500}}>
                            <span>{c.emoji}</span><span>{c.label}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--tx2)"}}>{$(c.value)}</span>
                            <span style={{fontFamily:"var(--mono)",fontSize:11.5,color:c.color,width:34,textAlign:"right"}}>{pct.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="ptrack">
                          <div className="pfill" style={{width:`${pct}%`,background:c.color}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ):(
                <div style={{textAlign:"center",padding:"24px 0",color:"var(--tx3)",fontSize:13,fontFamily:"var(--mono)"}}>
                  No expenses for {monthLabel(viewMonth)}
                </div>
              )}
            </div>

            <div className="card fu" style={{animationDelay:".4s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:10.5,color:"var(--tx3)",letterSpacing:1.8,fontFamily:"var(--mono)"}}>RECENT TRANSACTIONS</div>
                <button className="btn-ghost" style={{fontSize:11}} onClick={()=>setTab("expenses")}>View all →</button>
              </div>
              {monthExp.length>0
                ?monthExp.slice(0,6).map((e,i)=><ExpRow key={e.id} exp={e} onDelete={requestDelete} onEdit={setModal} idx={i}/>)
                :<div style={{textAlign:"center",padding:"24px 0",color:"var(--tx3)",fontSize:13,fontFamily:"var(--mono)"}}>
                  No transactions for {monthLabel(viewMonth)}
                </div>
              }
            </div>
          </>
        )}

        {/* ════════ EXPENSES ════════ */}
        {tab==="expenses"&&(
          <div className="card fu">
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <input placeholder="🔍  Search by name or note…" value={search}
                onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:180}}/>
              <select value={filterCat} onChange={e=>setFilter(e.target.value)} style={{width:"auto",minWidth:150}}>
                <option value="all">All Categories</option>
                {CATS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
              <select value={sortBy} onChange={e=>setSort(e.target.value)} style={{width:"auto",minWidth:120}}>
                <option value="date">Sort: Newest</option>
                <option value="amount">Sort: Highest</option>
              </select>
            </div>

            {/* Filter chips */}
            <div style={{display:"flex",gap:7,marginBottom:18,flexWrap:"wrap"}}>
              {["all",...CATS.map(c=>c.id)].map(id=>{
                const c=c$(id);
                const count=id==="all"?expenses.length:expenses.filter(e=>e.cat===id).length;
                if(id!=="all"&&count===0) return null;
                const on=filterCat===id;
                return(
                  <button key={id} onClick={()=>setFilter(id)} style={{
                    padding:"5px 12px",borderRadius:99,fontSize:11,fontFamily:"var(--mono)",
                    background:on?(id==="all"?"rgba(0,229,160,.12)":cbg(c)):"var(--s3)",
                    border:`1.5px solid ${on?(id==="all"?"rgba(0,229,160,.3)":cbdr(c)):"var(--b1)"}`,
                    color:on?(id==="all"?"var(--gr)":c.color):"var(--tx3)",transition:"all .15s",
                  }}>
                    {id==="all"?"All":`${c.emoji} ${c.label.split(" ")[0]}`} ({count})
                  </button>
                );
              })}
            </div>

            {filtered.length===0?(
              <div style={{textAlign:"center",padding:"48px 0",color:"var(--tx3)"}}>
                <div style={{fontSize:38,marginBottom:12}}>🔍</div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:6,color:"var(--tx2)"}}>No transactions found</div>
                <div style={{fontSize:12,fontFamily:"var(--mono)"}}>Try adjusting your search or filters</div>
              </div>
            ):filtered.map((e,i)=><ExpRow key={e.id} exp={e} onDelete={requestDelete} onEdit={setModal} idx={i}/>)}

            <div style={{marginTop:16,paddingTop:16,borderTop:"1.5px solid var(--b1)",
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"var(--tx3)",fontFamily:"var(--mono)"}}>{filtered.length} transactions</span>
              <span style={{fontFamily:"var(--mono)",fontWeight:700,fontSize:15,color:"var(--gr)"}}>
                {$(filtered.reduce((a,e)=>a+e.amount,0))}
              </span>
            </div>
          </div>
        )}

        {/* ════════ BUDGET ════════ */}
        {tab==="budget"&&(
          <BudgetTab expenses={monthExp} budgets={budgets} onEditBudgets={()=>setBudgetModal(true)}/>
        )}

        {/* ════════ AI INSIGHTS ════════ */}
        {tab==="insights"&&(
          <div className="fu"><AIPanel expenses={expenses}/></div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal&&(
        <ExpModal initial={modal==="add"?null:modal} onSave={addOrEdit} onClose={()=>setModal(null)}/>
      )}
      {budgetModal&&(
        <BudgetModal budgets={budgets} onSave={setBudgets} onClose={()=>setBudgetModal(false)}/>
      )}
      {confirm&&(
        <ConfirmDialog
          msg={`"${confirm.desc}" — ${$(confirm.amount)}`}
          onConfirm={confirmDelete}
          onCancel={()=>setConfirm(null)}
        />
      )}

      {/* ── TOASTS ── */}
      <div style={{position:"fixed",bottom:84,right:16,zIndex:9999,
        display:"flex",flexDirection:"column",gap:8,alignItems:"flex-end"}}>
        {toasts.map(t=>(
          <Toast key={t.id} msg={t.msg} type={t.type}
            onDone={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}/>
        ))}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,
        background:"rgba(6,8,16,.97)",backdropFilter:"blur(20px)",
        borderTop:"1.5px solid var(--b1)",zIndex:100,display:"flex",justifyContent:"center"}}>
        <div style={{width:"100%",maxWidth:920,display:"flex"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,padding:"11px 8px 13px",background:"transparent",
              color:tab===t.id?"var(--gr)":"var(--tx3)",
              fontSize:10.5,fontFamily:"var(--font)",fontWeight:600,
              display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              transition:"color .15s",letterSpacing:.5,
              borderTop:`2px solid ${tab===t.id?"var(--gr)":"transparent"}`,
            }}>
              <span style={{fontSize:17}}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
