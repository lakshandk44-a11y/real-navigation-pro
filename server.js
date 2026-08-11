import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const KEY = process.env.TOMTOM_API_KEY;

if (!KEY) console.warn("TOMTOM_API_KEY is not set. Add it to .env before starting.");

app.use(express.json({limit:"1mb"}));
app.use(express.static("public"));

function requireKey(res){
  if(!KEY){res.status(500).json({error:"TOMTOM_API_KEY is not configured on the server."});return false}
  return true;
}

app.get("/api/geocode", async (req,res)=>{
  if(!requireKey(res)) return;
  try{
    const q=String(req.query.q||"").trim();
    if(!q) return res.status(400).json({error:"Missing q"});
    const u=new URL(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(q)}.json`);
    u.searchParams.set("key",KEY); u.searchParams.set("limit","5"); u.searchParams.set("countrySet","LK");
    const r=await fetch(u); const data=await r.json();
    if(!r.ok) return res.status(r.status).json(data);
    res.json(data);
  }catch(e){res.status(502).json({error:e.message})}
});

app.get("/api/route", async (req,res)=>{
  if(!requireKey(res)) return;
  try{
    const origin=String(req.query.origin||"");
    const dest=String(req.query.dest||"");
    if(!origin||!dest) return res.status(400).json({error:"origin and dest are required"});
    const u=new URL(`https://api.tomtom.com/routing/1/calculateRoute/${origin}:${dest}/json`);
    const allowed=["traffic","routeType","maxAlternatives","avoid","travelMode","language","sectionType","routeRepresentation","departAt"];
    for(const k of allowed) if(req.query[k]!=null) u.searchParams.set(k,String(req.query[k]));
    u.searchParams.set("key",KEY);
    u.searchParams.set("traffic",req.query.traffic==="false"?"false":"true");
    u.searchParams.set("routeType",req.query.routeType||"fastest");
    u.searchParams.set("travelMode",req.query.travelMode||"car");
    u.searchParams.set("maxAlternatives",req.query.maxAlternatives||"2");
    u.searchParams.set("sectionType","traffic");
    u.searchParams.set("routeRepresentation","polyline");
    const r=await fetch(u); const data=await r.json();
    if(!r.ok) return res.status(r.status).json(data);
    res.json(data);
  }catch(e){res.status(502).json({error:e.message})}
});

app.get("/api/incidents", async (req,res)=>{
  if(!requireKey(res)) return;
  try{
    const bbox=String(req.query.bbox||"");
    if(!bbox) return res.status(400).json({error:"bbox required: minLon,minLat,maxLon,maxLat"});
    const u=new URL("https://api.tomtom.com/maps/orbis/traffic/incidents/details");
    u.searchParams.set("apiVersion","2");
    u.searchParams.set("bbox",bbox);
    u.searchParams.set("timeValidity","present");
    u.searchParams.set("key",KEY);
    const r=await fetch(u,{headers:{
      "TomTom-Api-Key":KEY,
      "TomTom-Api-Version":"2",
      "Attributes":"incidents(type,geometry(type,coordinates),properties(iconCategory,description,delay,length,roadName))"
    }});
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json(data);
    res.json(data);
  }catch(e){res.status(502).json({error:e.message})}
});

// TomTom Traffic raster overlay proxy. The key never appears in browser code.
app.get("/traffic/:style/:z/:x/:y.png", async (req,res)=>{
  if(!requireKey(res)) return;
  try{
    const {style,z,x,y}=req.params;
    const u=`https://api.tomtom.com/traffic/map/4/tile/flow/${encodeURIComponent(style)}/${z}/${x}/${y}.png?key=${encodeURIComponent(KEY)}&tileSize=256`;
    const r=await fetch(u);
    if(!r.ok){res.status(r.status).end();return}
    res.set("Content-Type","image/png");
    res.set("Cache-Control","public,max-age=30");
    res.send(Buffer.from(await r.arrayBuffer()));
  }catch(e){res.status(502).end()}
});

app.get("/api/health",(req,res)=>res.json({ok:true,tomtomConfigured:Boolean(KEY)}));

app.get("*",(req,res)=>res.sendFile(process.cwd()+"/public/index.html"));
app.listen(PORT,()=>console.log(`Real Navigation Pro: http://localhost:${PORT}`));
