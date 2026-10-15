import React,{useEffect,useState}from'react';import{createRoot}from'react-dom/client';import JSZip from'jszip';import{Sparkles,Flame,Home,FolderKanban,Crown,User,Plus,ArrowRight,Check,Copy,RefreshCw,WandSparkles,LayoutTemplate,PenTool,Monitor,Tablet,Smartphone,Download,Undo2,Redo2,Code2,Palette,Layers,ShieldCheck,Zap,Globe2,MousePointer2,ChevronDown,X}from'lucide-react';import{auth,db,configured,googleProvider}from'./firebase';import{createUserWithEmailAndPassword,signInWithEmailAndPassword,signInWithPopup,onAuthStateChanged,signOut,updateProfile}from'firebase/auth';import{doc,getDoc,setDoc,collection,addDoc,serverTimestamp,getDocs}from'firebase/firestore';import{enhanceBlazePrompt,generateBlazeWebsite}from'./blaze-ai';import'./styles.css';
const defaults={brand:'Blaze Web Builder',heroText:'Create striking, responsive websites with AI-guided prompts, premium templates and a visual editor.',startingPoints:40,dailyPoints:10,generationCost:40,countdownMinutes:10,cardMessage:'Card payments coming soon',bankName:'SET IN ADMIN',accountName:'SET IN ADMIN',accountNumber:'SET IN ADMIN',notice:'New accounts receive 40 points. Your first website is on us.',plans:[{id:'spark',name:'Spark',price:1000,features:['Unlimited generation','5 active projects','Premium templates','ZIP export']},{id:'ignite',name:'Ignite',price:3000,features:['Everything in Spark','12 projects','Advanced design controls','Premium sections']},{id:'blaze',name:'Blaze',price:5000,popular:true,features:['Everything in Ignite','30 projects','Animations','Custom code blocks']},{id:'inferno',name:'Inferno',price:7500,features:['Everything in Blaze','60 projects','Client mode','Brand kits']},{id:'nova',name:'Nova',price:10000,features:['Everything in Inferno','Unlimited projects','Maximum access','Priority tools']} ]};
const templates=[['Aurora','Fashion','linear-gradient(135deg,#ff4fd8,#6d28d9)'],['Orbit','Technology','linear-gradient(135deg,#18e6ff,#5b21b6)'],['Noir','Portfolio','linear-gradient(135deg,#0f172a,#d946ef)'],['Savor','Restaurant','linear-gradient(135deg,#ff8a00,#7c3aed)'],['Pulse','Fitness','linear-gradient(135deg,#22c55e,#06b6d4)'],['Luxe','Business','linear-gradient(135deg,#a78bfa,#f5d0fe)']];
function App(){const[user,setUser]=useState(null),[profile,setProfile]=useState(null),[cfg,setCfg]=useState(defaults),[view,setView]=useState('home'),[authOpen,setAuthOpen]=useState(false),[wizard,setWizard]=useState(false),[payPlan,setPayPlan]=useState(null),[projects,setProjects]=useState([]),[editing,setEditing]=useState(null);
useEffect(()=>{if(!configured)return;getDoc(doc(db,'config','public')).then(s=>s.exists()&&setCfg({...defaults,...s.data()}));return onAuthStateChanged(auth,async u=>{setUser(u);if(!u){setProfile(null);return}const ref=doc(db,'users',u.uid),snap=await getDoc(ref);let p;if(!snap.exists()){p={email:u.email,displayName:u.displayName||'',points:cfg.startingPoints,plan:'free',role:'user',createdAt:serverTimestamp(),lastDailyClaim:new Date().toISOString().slice(0,10)};await setDoc(ref,p)}else p=snap.data();setProfile(p);const ps=await getDocs(collection(db,'users',u.uid,'projects'));setProjects(ps.docs.map(d=>({id:d.id,...d.data()})))});},[cfg.startingPoints]);
const openCreate=()=>user?setWizard(true):setAuthOpen(true);const createProject=async data=>{if(profile?.plan==='free'&&(profile.points||0)<cfg.generationCost)return alert(`You need ${cfg.generationCost} points.`);const p={...data,createdAt:Date.now(),updatedAt:Date.now()};let id=String(Date.now());if(configured){const r=await addDoc(collection(db,'users',user.uid,'projects'),p);id=r.id;if(profile.plan==='free'){const np=(profile.points||0)-cfg.generationCost;await setDoc(doc(db,'users',user.uid),{points:np},{merge:true});setProfile({...profile,points:np})}}const pp={id,...p};setProjects(x=>[...x,pp]);setEditing(pp);setWizard(false);setView('editor')};const save=async p=>{setEditing(p);setProjects(x=>x.map(q=>q.id===p.id?p:q));if(configured&&user)await setDoc(doc(db,'users',user.uid,'projects',p.id),p,{merge:true})};
if(view==='editor'&&editing)return <Editor project={editing} save={save} back={()=>setView('sites')}/>;
return <div className="app"><div className="ambient a1"/><div className="ambient a2"/><header className="top"><button className="brand bare" onClick={()=>setView('home')}><span className="logo"><Flame/></span><span>{cfg.brand}</span></button><div className="desktopNav"><button onClick={()=>setView('home')}>Home</button><button onClick={()=>setView('sites')}>My Sites</button><button onClick={()=>document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Features</button><button onClick={()=>setView('pricing')}>Pricing</button></div><div className="row"><span className="points">{profile?profile.plan==='free'?`🔥 ${profile.points??0}`:'♾ Unlimited':''}</span>{user?<button className="btn small" onClick={()=>signOut(auth)}>Sign out</button>:<button className="btn small primary" onClick={()=>setAuthOpen(true)}>Sign in</button>}</div></header>
{view==='home'&&<HomePage cfg={cfg} openCreate={openCreate} setView={setView}/>} {view==='sites'&&<Sites projects={projects} openCreate={openCreate} edit={p=>{setEditing(p);setView('editor')}}/>} {view==='pricing'&&<Pricing cfg={cfg} choose={p=>user?setPayPlan(p):setAuthOpen(true)}/>} {view==='account'&&<Account profile={profile} projects={projects}/>}<Bottom view={view} setView={setView} create={openCreate}/>{authOpen&&<Auth close={()=>setAuthOpen(false)}/>} {wizard&&<Wizard cfg={cfg} profile={profile} close={()=>setWizard(false)} finish={createProject}/>} {payPlan&&<Payment plan={payPlan} cfg={cfg} close={()=>setPayPlan(null)} submit={async data=>{await addDoc(collection(db,'payments'),{...data,userId:user.uid,userEmail:user.email,status:'pending',createdAt:serverTimestamp()});setPayPlan(null);alert('Payment submitted. Your plan stays unchanged until admin approval.')}}/>}</div>}
function HomePage({cfg,openCreate,setView}){return <><main className="wrap"><section className="hero"><div className="heroCopy"><span className="eyebrow"><Sparkles size={15}/> AI-guided website creation</span><h1>Turn your <span className="gradient">spark</span> into a website people remember.</h1><p>{cfg.heroText}</p><div className="actions"><button className="btn primary pulse" onClick={openCreate}><WandSparkles size={18}/> Create with Blaze <ArrowRight size={17}/></button><button className="btn glass" onClick={()=>document.getElementById('templates')?.scrollIntoView({behavior:'smooth'})}>Explore templates</button></div><div className="trust"><span><Check/>40 points included</span><span><Check/>No card required</span><span><Check/>GitHub-ready ZIP</span></div></div><BuilderDemo openCreate={openCreate}/></section><div className="marquee"><div>AI PROMPT ENHANCER ✦ RESPONSIVE DESIGN ✦ PREMIUM TEMPLATES ✦ VISUAL EDITOR ✦ CLEAN CODE EXPORT ✦</div></div><section className="section intro"><span className="kicker">BUILT DIFFERENT</span><h2>One platform. Three powerful ways to create.</h2><div className="grid three">{[[WandSparkles,'Describe it','Turn a raw idea into a professional build prompt.'],[LayoutTemplate,'Template it','Begin with polished layouts for real industries.'],[PenTool,'Shape it','Fine-tune content, colors and devices visually.']].map(([I,t,d],i)=><button className="featureCard" key={t} onClick={openCreate}><span className="num">0{i+1}</span><div className="icon"><I/></div><h3>{t}</h3><p>{d}</p><span className="link">Open creator <ArrowRight size={14}/></span></button>)}</div></section><section id="templates" className="section"><div className="sectionHead"><div><span className="kicker">TEMPLATE GALAXY</span><h2>Start sharp. Make it yours.</h2></div><button className="btn glass" onClick={openCreate}>Browse all</button></div><div className="templateGrid">{templates.map(([n,c,b])=><button className="template" key={n} onClick={openCreate}><div className="templateVisual" style={{background:b}}><div className="miniNav"/><div className="miniTitle"/><div className="miniText"/><span>Use template</span></div><h3>{n}</h3><p>{c}</p></button>)}</div></section><section id="features" className="section bento"><div className="bentoBig"><span className="kicker">BLAZE AI FLOW</span><h2>From rough thought to professional website structure.</h2><p>Describe what you want. Blaze builds a detailed prompt, lets you refine it, then creates a responsive project you can edit and export.</p><div className="flow"><span>Idea</span><ArrowRight/><span>Prompt</span><ArrowRight/><span>Website</span><ArrowRight/><span>ZIP</span></div></div>{[[Globe2,'Responsive by default','Desktop, tablet and mobile previews.'],[Code2,'Own the output','Export HTML, CSS and a GitHub guide.'],[ShieldCheck,'Protected accounts','Firebase-backed identity and project storage.'],[Zap,'Points that reward return','40 to create, 10 free points daily.']].map(([I,t,d])=><div className="bentoSmall" key={t}><I/><h3>{t}</h3><p>{d}</p></div>)}</section><section className="section spotlight"><div><span className="kicker">YOUR CREATIVE COMMAND CENTER</span><h2>Build visually. Export confidently.</h2><p>Switch devices, adjust brand color, reshape copy and keep every project ready for GitHub.</p><button className="btn primary" onClick={openCreate}>Launch creator</button></div><div className="deviceStack"><div className="screen s1">DESKTOP</div><div className="screen s2">TABLET</div><div className="screen s3">MOBILE</div></div></section><section className="section pointsSection"><div><span className="kicker">BLAZE POINTS</span><h2>Your first website starts free.</h2></div><div className="pointCards"><div><strong>40</strong><span>Starting points</span></div><div><strong>40</strong><span>Points per creation</span></div><div><strong>+10</strong><span>Daily free points</span></div><div><strong>∞</strong><span>All paid plans</span></div></div></section><section className="section finalCta"><div className="ctaGlow"/><span className="eyebrow">Your next website is waiting</span><h2>Describe it. Refine it. Blaze it.</h2><p>No coding required. No card required to begin.</p><button className="btn primary pulse" onClick={openCreate}>Create my website <ArrowRight size={18}/></button></section></main><footer><div className="wrap footerGrid"><div><div className="brand"><span className="logo"><Flame/></span>{cfg.brand}</div><p>Turn your spark into something extraordinary.</p></div><div><b>Product</b><button onClick={openCreate}>Create</button><button onClick={()=>setView('pricing')}>Pricing</button></div><div><b>Resources</b><button onClick={()=>document.getElementById('features')?.scrollIntoView()}>Features</button><button onClick={()=>document.getElementById('templates')?.scrollIntoView()}>Templates</button></div></div></footer></>}
function BuilderDemo({openCreate}){return <div className="demo"><div className="demoTop"><i/><i/><i/><span>blaze.creator</span></div><div className="demoBody"><div className="demoSide"><span/><span/><span/><span/></div><div className="demoPage"><div className="neonBadge">LIVE PREVIEW</div><h3>Design beyond ordinary.</h3><p>Fast, responsive, unmistakably yours.</p><button onClick={openCreate}>Build this style</button><div className="demoStats"><span>98<br/><small>Performance</small></span><span>100%<br/><small>Responsive</small></span></div></div></div></div>}
function Wizard({cfg,profile,close,finish}){const[step,setStep]=useState(0),[method,setMethod]=useState('ai'),[form,setForm]=useState({name:'',category:'Business',idea:'',audience:'Everyone',style:'Premium neon',color:'#8b5cf6',pages:['Home','About','Services','Contact']}),[prompt,setPrompt]=useState(''),[busy,setBusy]=useState(false);const enhance=async()=>{
if(!form.name||!form.idea)return alert('Add a website name and describe the idea first.');
setBusy(true);
try{
const result=await enhanceBlazePrompt({
name:form.name,
category:form.category,
idea:form.idea,
audience:form.audience,
style:form.style,
color:form.color,
pages:form.pages,
templateName:typeof selectedTemplate!=="undefined"?(selectedTemplate?.name||null):null,
imageCount:typeof images!=="undefined"?images.length:0
});
setPrompt(result);
setStep(2);
}catch(error){
console.error('Blaze prompt enhancement failed:',error);
alert('Blaze AI could not enhance the prompt: '+error.message);
}finally{
setBusy(false);
}
};const toggle=p=>setForm({...form,pages:form.pages.includes(p)?form.pages.filter(x=>x!==p):[...form.pages,p]});const generate=async()=>{
if(!prompt.trim())return alert('Create or paste a professional prompt first.');
setBusy(true);
try{
const website=await generateBlazeWebsite({
name:form.name,
category:form.category,
idea:form.idea,
audience:form.audience,
style:form.style,
color:form.color,
pages:form.pages,
templateName:typeof selectedTemplate!=="undefined"?(selectedTemplate?.name||null):null
},prompt);

await finish({
name:form.name,
title:website.title||form.name,
subtitle:website.subtitle||form.idea,
prompt,
category:form.category,
theme:form.color,
style:form.style,
pages:form.pages,
generatedHtml:website.html||'',
generatedCss:website.css||'',
generatedJavascript:website.javascript||'',
});
}catch(error){
console.error('Blaze website generation failed:',error);
alert('Blaze AI could not generate the website: '+error.message);
}finally{
setBusy(false);
}
};return <div className="modal"><div className="wizard"><div className="wizardTop"><div><small>CREATE WITH BLAZE</small><h2>{['Choose your path','Describe the vision','Refine the prompt','Ready to generate'][step]}</h2></div><button className="close" onClick={close}><X/></button></div><div className="steps">{[0,1,2,3].map(n=><span className={step>=n?'on':''} key={n}/>)}</div>{step===0&&<div className="methodGrid">{[[WandSparkles,'AI guided','Describe your idea and build a professional prompt.','ai'],[LayoutTemplate,'Template','Choose a polished foundation and customize it.','template'],[PenTool,'Blank canvas','Start simple and shape every detail.','blank']].map(([I,t,d,id])=><button className={`method ${method===id?'selected':''}`} onClick={()=>setMethod(id)} key={id}><I/><h3>{t}</h3><p>{d}</p></button>)}<button className="btn primary wide" onClick={()=>setStep(1)}>Continue <ArrowRight/></button></div>}{step===1&&<div className="formGrid"><label>Website name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Divine Cakes"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['Business','Portfolio','Restaurant','School','Church','Technology','Fashion','Event','Personal'].map(x=><option>{x}</option>)}</select></label><label className="full">Describe your idea<textarea rows="5" value={form.idea} onChange={e=>setForm({...form,idea:e.target.value})} placeholder="What do you offer, who is it for, and what should the website achieve?"/></label><label>Target audience<input value={form.audience} onChange={e=>setForm({...form,audience:e.target.value})}/></label><label>Visual style<select value={form.style} onChange={e=>setForm({...form,style:e.target.value})}>{['Premium neon','Elegant minimal','Bold editorial','Warm organic','Professional corporate','Futuristic tech'].map(x=><option>{x}</option>)}</select></label><label>Primary color<input type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})}/></label><div className="full"><b>Pages</b><div className="chips">{['Home','About','Services','Gallery','Pricing','Blog','FAQ','Contact'].map(p=><button className={form.pages.includes(p)?'active':''} onClick={()=>toggle(p)}>{p}</button>)}</div></div><button className="btn primary full" onClick={enhance}>{busy?<RefreshCw className="spin"/>:<Sparkles/>} Turn my idea into a professional prompt</button></div>}{step===2&&<div><div className="promptBox"><div className="promptHead"><b>Blaze professional prompt</b><div><button onClick={()=>navigator.clipboard.writeText(prompt)}><Copy/> Copy</button><button onClick={enhance}><RefreshCw/> Regenerate</button></div></div><textarea rows="12" value={prompt} onChange={e=>setPrompt(e.target.value)}/></div><div className="wizardActions"><button className="btn" onClick={()=>setStep(1)}>Back</button><button className="btn primary" onClick={()=>setStep(3)}>Use this prompt <ArrowRight/></button></div></div>}{step===3&&<div className="review"><div className="orb"><WandSparkles/></div><h2>{form.name}</h2><p>{prompt.slice(0,220)}…</p><div className="cost"><span>Generation cost</span><b>{cfg.generationCost} points</b></div><div className="cost"><span>Your balance</span><b>{profile?.plan==='free'?`${profile?.points??0} points`:'Unlimited'}</b></div><button className="btn primary wide" onClick={generate}>{busy?<RefreshCw className="spin"/>:<Flame/>} Generate my website</button><small>Points are deducted only after the project is created.</small></div>}</div></div>}
function Sites({projects,openCreate,edit}){return <main className="wrap dashboard"><div className="sectionHead"><div><span className="kicker">PROJECTS</span><h1>My websites</h1></div><button className="btn primary" onClick={openCreate}><Plus/>New website</button></div><div className="templateGrid">{projects.map(p=><div className="projectCard" key={p.id}><div className="projectVisual" style={{background:`linear-gradient(135deg,#0d0715,${p.theme})`}}><h3>{p.title}</h3><span>{p.category}</span></div><h3>{p.name}</h3><p>{p.subtitle}</p><div className="actions"><button className="btn primary" onClick={()=>edit(p)}>Edit</button><button className="btn" onClick={()=>exportSite(p)}><Download/>ZIP</button></div></div>)}</div>{!projects.length&&<div className="empty"><WandSparkles/><h2>No projects yet</h2><p>Describe your first idea and Blaze will build the foundation.</p><button className="btn primary" onClick={openCreate}>Create now</button></div>}</main>}
function Pricing({cfg,choose}){return <main className="wrap dashboard"><span className="kicker">PLANS</span><h1>Choose your Blaze</h1><p className="lead">Every paid plan includes unlimited website generation.</p><div className="plans">{cfg.plans.map(p=><div className={`planCard ${p.popular?'popular':''}`} key={p.id}>{p.popular&&<span className="badge">MOST POPULAR</span>}<h3>{p.name}</h3><div className="price">₦{Number(p.price).toLocaleString()}<small>/month</small></div>{p.features.map(f=><p className="planFeature"><Check/>{f}</p>)}<button className="btn primary wide" onClick={()=>choose(p)}>Choose {p.name}</button></div>)}</div></main>}
function Account({profile,projects}){return <main className="wrap dashboard"><span className="kicker">ACCOUNT</span><h1>Your creative profile</h1><div className="stats"><div><span>Current plan</span><b>{profile?.plan||'Free'}</b></div><div><span>Points</span><b>{profile?.plan==='free'?profile?.points??0:'∞'}</b></div><div><span>Websites</span><b>{projects.length}</b></div><div><span>Status</span><b>Active</b></div></div></main>}
function Bottom({view,setView,create}){return <nav className="bottom"><button className={view==='home'?'active':''} onClick={()=>setView('home')}><Home/><span>Home</span></button><button className={view==='sites'?'active':''} onClick={()=>setView('sites')}><FolderKanban/><span>My Sites</span></button><button className="create" onClick={create}><Plus/><span>Create</span></button><button className={view==='account'?'active':''} onClick={()=>setView('account')}><User/><span>Account</span></button><button className="upgrade" onClick={()=>setView('pricing')}><Crown/><span>Upgrade</span></button></nav>}
function Auth({close}){const[mode,setMode]=useState('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState('');const go=async()=>{try{if(mode==='signup'){const c=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(c.user,{displayName:name})}else await signInWithEmailAndPassword(auth,email,password);close()}catch(e){alert(e.message)}};return <div className="modal"><div className="authBox"><button className="close" onClick={close}><X/></button><span className="logo big"><Flame/></span><h2>{mode==='login'?'Welcome back':'Create your Blaze account'}</h2>{mode==='signup'&&<input placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>}<input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn primary wide" onClick={go}>{mode==='login'?'Sign in':'Create account'}</button><button className="btn wide" onClick={()=>signInWithPopup(auth,googleProvider).then(close)}>Continue with Google</button><button className="bare switch" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'New here? Create account':'Already have an account? Sign in'}</button></div></div>}
function Payment({plan,cfg,close,submit}){const[secs,setSecs]=useState(cfg.countdownMinutes*60),[bank,setBank]=useState(''),[sender,setSender]=useState(''),[ref,setRef]=useState('');useEffect(()=>{const i=setInterval(()=>setSecs(s=>Math.max(0,s-1)),1000);return()=>clearInterval(i)},[]);return <div className="modal"><div className="authBox"><button className="close" onClick={close}><X/></button><h2>Complete transfer</h2><div className="timer">⏱ {String(Math.floor(secs/60)).padStart(2,'0')}:{String(secs%60).padStart(2,'0')}</div><div className="bankCard"><small>PAY EXACTLY</small><strong>₦{Number(plan.price).toLocaleString()}</strong><p>{cfg.bankName}<br/><b>{cfg.accountNumber}</b><br/>{cfg.accountName}</p></div><input placeholder="Exact bank used to send" value={bank} onChange={e=>setBank(e.target.value)}/><input placeholder="Sender's exact account name" value={sender} onChange={e=>setSender(e.target.value)}/><input placeholder="Transaction reference / ID" value={ref} onChange={e=>setRef(e.target.value)}/><button className="btn primary wide" disabled={!bank||!sender||!ref} onClick={()=>submit({planId:plan.id,planName:plan.name,amount:plan.price,senderBank:bank,senderName:sender,transactionReference:ref})}>I have paid</button><small>Admin approval is required before activation.</small></div></div>}
function Editor({project,save,back}){
const[p,setP]=useState(project);
const[device,setDevice]=useState('desktop');

const change=(k,v)=>{
const n={...p,[k]:v,updatedAt:Date.now()};
setP(n);
save(n);
};

const html=String(p.generatedHtml||'').trim();
const css=String(p.generatedCss||'');
const javascript=String(p.generatedJavascript||'');

let previewDocument='';

if(html){
if(/<html[\s>]/i.test(html)){
previewDocument=html;

previewDocument=previewDocument.replace(
/<\/head>/i,
`<style>${css}</style></head>`
);

if(javascript){
previewDocument=previewDocument.replace(
/<\/body>/i,
`<script>${javascript}<\/script></body>`
);
}
}else{
previewDocument=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}</style>
</head>
<body>
${html}
${javascript?`<script>${javascript}<\/script>`:''}
</body>
</html>`;
}
}else{
previewDocument=`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{
margin:0;
min-height:100vh;
display:grid;
place-items:center;
background:#090511;
color:white;
font-family:Arial,sans-serif;
}
main{text-align:center;padding:30px}
</style>
</head>
<body>
<main>
<h1>${p.title||p.name}</h1>
<p>No AI website code is stored in this older project.</p>
</main>
</body>
</html>`;
}

return <div className="editorApp">
<header className="editorTop">
<div className="brand">
<span className="logo"><Flame/></span>
Blaze AI Preview
</div>

<div className="row">
<button className="btn small" onClick={back}>Exit</button>

{[[Monitor,'desktop'],[Tablet,'tablet'],[Smartphone,'mobile']]
.map(([I,d])=>
<button
key={d}
className={`iconBtn ${device===d?'active':''}`}
onClick={()=>setDevice(d)}
>
<I/>
</button>
)}

<button
className="btn primary small"
onClick={()=>exportSite(p)}
>
<Download/> Export AI ZIP
</button>
</div>
</header>

<div className="editorLayout">
<aside className="editorPanel">
<h3>AI Website</h3>
<p>Gemini-generated HTML, CSS and JavaScript are rendered directly.</p>

{p.pages?.map(page=>
<button key={page}>
<Layers/>{page}
</button>
)}
</aside>

<main className="canvas">
<div className={`sitePreview ${device}`}>
<iframe
title={`${p.name} AI website preview`}
srcDoc={previewDocument}
sandbox="allow-scripts allow-forms allow-modals allow-popups"
style={{
width:'100%',
height:'100%',
minHeight:'78vh',
border:'0',
background:'#fff',
borderRadius:'14px'
}}
/>
</div>
</main>

<aside className="editorPanel">
<h3>Project settings</h3>

<label>
Project
<input
value={p.name||''}
onChange={e=>change('name',e.target.value)}
/>
</label>

<label>
Headline
<input
value={p.title||''}
onChange={e=>change('title',e.target.value)}
/>
</label>

<label>
Description
<textarea
rows="5"
value={p.subtitle||''}
onChange={e=>change('subtitle',e.target.value)}
/>
</label>

<div className="editorTemplateTag">
<Code2/> Real AI code preview
</div>
</aside>
</div>
</div>
}
async function exportSite(p){
if(p.generatedHtml&&p.generatedCss){
const aiZip=new JSZip();
const htmlContent=String(p.generatedHtml).trim();
const cssContent=String(p.generatedCss||'');
const jsContent=String(p.generatedJavascript||'');

let finalHtml;

if(/<html[\s>]/i.test(htmlContent)){
finalHtml=htmlContent;

if(!/css\/style\.css/i.test(finalHtml)){
finalHtml=finalHtml.replace(
/<\/head>/i,
'<link rel="stylesheet" href="css/style.css"></head>'
);
}

if(jsContent&&!/js\/script\.js/i.test(finalHtml)){
finalHtml=finalHtml.replace(
/<\/body>/i,
'<script src="js/script.js"></script></body>'
);
}
}else{
finalHtml=
'<!doctype html>'+
'<html lang="en">'+
'<head>'+
'<meta charset="utf-8">'+
'<meta name="viewport" content="width=device-width,initial-scale=1">'+
'<meta name="description" content="'+
String(p.subtitle||p.name||'AI-generated website')
.replace(/"/g,'&quot;')+
'">'+
'<title>'+
String(p.name||'Blaze Website')
.replace(/</g,'&lt;')
.replace(/>/g,'&gt;')+
'</title>'+
'<link rel="stylesheet" href="css/style.css">'+
'</head>'+
'<body>'+
htmlContent+
(jsContent?'<script src="js/script.js"></script>':'')+
'</body>'+
'</html>';
}

aiZip.file('index.html',finalHtml);
aiZip.file('css/style.css',cssContent);

if(jsContent){
aiZip.file('js/script.js',jsContent);
}

aiZip.file(
'README.md',
'# '+(p.name||'Blaze Website')+
'\n\nThis website was generated by Blaze AI.'+
'\n\nOpen index.html to preview the website.'+
'\n\nUpload all files and folders together when publishing.'
);

const aiBlob=await aiZip.generateAsync({type:'blob'});
const aiLink=document.createElement('a');

aiLink.href=URL.createObjectURL(aiBlob);
aiLink.download=String(p.name||'blaze-website')
.toLowerCase()
.replace(/[^a-z0-9]+/g,'-')
.replace(/^-|-$/g,'')+'.zip';

aiLink.click();

setTimeout(()=>{
URL.revokeObjectURL(aiLink.href);
},1000);

return;
}

const zip=new JSZip();zip.file('index.html',`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${p.name}</title><link rel="stylesheet" href="css/style.css"></head><body><main><section class="hero"><small>${p.category}</small><h1>${p.title}</h1><p>${p.subtitle}</p><a href="#about">Get started</a></section><section id="about"><h2>Built to stand out.</h2><p>${p.prompt||''}</p></section></main></body></html>`);zip.file('css/style.css',`*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#08050d;color:#fff}.hero{min-height:82vh;padding:10vw;display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 80% 10%,${p.theme}88,transparent 35%),#090511}.hero h1{font-size:clamp(50px,9vw,110px);max-width:1000px;margin:15px 0}.hero p{font-size:20px;max-width:650px;line-height:1.7}.hero a{color:#fff;background:${p.theme};padding:14px 20px;border-radius:12px;text-decoration:none;width:max-content;font-weight:bold}section{padding:8vw}#about{background:#fff;color:#17111f}#about h2{font-size:44px}`);zip.file('README.md',`# ${p.name}\nGitHub-ready website exported from Blaze Web Builder.\n\nPush with GitHub Desktop or: git init; git add .; git commit -m "Initial site"; git branch -M main; git remote add origin YOUR_URL; git push -u origin main.`);const blob=await zip.generateAsync({type:'blob'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.zip`;a.click();URL.revokeObjectURL(a.href)}
createRoot(document.getElementById('root')).render(<App/>);