import React, {useState} from 'react';
import {View,Text} from 'react-native';
import Svg,{Path,Rect,Text as SvgText,TSpan} from 'react-native-svg';
import {Country,Simulation,money} from '../utils/simulation';
import {translate, type Language} from '../i18n';
import {publicAllocation,finalOutcomes} from '../utils/public-finance';
type Node={id:string;label:string;value:number;col:number;color:string;y?:number};
type Edge={from:string;to:string;value:number;color:string};
const mint='#a0c6b0',rose='#cf9d8b',ink='#315e51',sand='#d7ccac';
export function Sankey({s,c,language,redistribution=false}:{s:Simulation;c:Country;language:Language;redistribution?:boolean}){
 const [chartWidth,setChartWidth]=useState(900);
 const t=(text:string)=>translate(language,text);
 const [detail,setDetail]=useState(t('Tap a flow to inspect its annual amount'));
 const nodes:Node[]=[{id:'cost',label:'Employer cost',value:s.cost,col:0,color:ink},{id:'gross',label:'Gross salary',value:s.salary,col:1,color:mint},...s.employer.map((x,i)=>({id:'er'+i,label:x.label,value:x.value,col:1,color:rose})),{id:'net',label:'Take-home pay',value:s.net,col:2,color:mint},...s.employee.map((x,i)=>({id:'ee'+i,label:x.label,value:x.value,col:2,color:rose})),...s.budget.map(x=>({id:x.id,label:x.label,value:x.amount,col:3,color:mint})),{id:'gov',label:'Government',value:s.government,col:4,color:rose},{id:'value',label:'Consumed value',value:s.consumed,col:4,color:ink}];
 if(s.savings>.01){nodes.push({id:'saved',label:'Unspent / savings',value:s.savings,col:3,color:sand},{id:'savings',label:'Retained wealth',value:s.savings,col:redistribution?6:4,color:sand});}
 const allocation=redistribution?publicAllocation(c,s.government):[];
 nodes.push(...allocation.filter(g=>g.value>.01).map(g=>({id:'public-'+g.id,label:g.label,value:g.value,col:5,color:g.color})));
 const outcomes=redistribution?finalOutcomes(c,s.government,s.consumed):[];
 nodes.push(...outcomes.map(g=>({id:'final-'+g.id,label:g.label,value:g.value,col:6,color:g.color})));
 const edges:Edge[]=[{from:'cost',to:'gross',value:s.salary,color:mint},...s.employer.map((x,i)=>({from:'cost',to:'er'+i,value:x.value,color:rose})),{from:'gross',to:'net',value:s.net,color:mint},...s.employee.map((x,i)=>({from:'gross',to:'ee'+i,value:x.value,color:rose})),...s.employer.map((x,i)=>({from:'er'+i,to:'gov',value:x.value,color:rose})),...s.employee.map((x,i)=>({from:'ee'+i,to:'gov',value:x.value,color:rose})),...s.budget.flatMap(x=>[{from:'net',to:x.id,value:x.amount,color:mint},{from:x.id,to:'gov',value:x.tax,color:rose},{from:x.id,to:'value',value:x.value,color:mint}])];
 if(s.savings>.01)edges.push({from:'net',to:'saved',value:s.savings,color:sand},{from:'saved',to:'savings',value:s.savings,color:sand});
 edges.push(...allocation.filter(g=>g.value>.01).map(g=>({from:'gov',to:'public-'+g.id,value:g.value,color:g.color})));
 if(redistribution){edges.push({from:'value',to:'final-consumed',value:s.consumed,color:ink});edges.push(...allocation.filter(g=>g.value>.01).map(g=>({from:'public-'+g.id,to:g.id==='cash'||g.id==='kind'?'final-redistributed':'final-expenses',value:g.value,color:g.color})));}
 // Keep the private-consumption lane above the public-finance lane throughout.
 const rank=(n:Node)=>n.id==='value'?0:n.id==='gov'?1:n.id==='savings'?2:0;
 const columns=redistribution?7:5;
 const step=(chartWidth-158)/(columns-1);
 const xs=Array.from({length:columns},(_,i)=>18+i*step);
 const k=340/(s.cost||1);
 const displayLabel=(label:string)=>t(({'Employee social contributions':'Employee contributions','Income tax · effective estimate':'Income tax','Public-service running costs':'Public services','Purchased social services':'Benefits in kind','Investment & other spending':'Investment & other','Social benefits · US reporting':'Social benefits (US)'} as Record<string,string>)[label]??label);
 const wrap=(text:string,limit:number)=>{const words=text.split(' ');const lines:string[]=[];let line='';for(const word of words){if(line&&line.length+word.length+1>limit){lines.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)lines.push(line);return lines;};
 const top=110,gap=64,publicTop=top+s.consumed*k+54;
 for(let col=0;col<(redistribution?7:5);col++){
  const group=nodes.filter(n=>n.col===col);
  if(col===4)group.sort((a,b)=>rank(a)-rank(b));
  const height=group.reduce((sum,n)=>sum+n.value*k,0)+Math.max(0,group.length-1)*gap;
  let y=top+(500-height)/2;
  if(col===4||col===6)y=top;
  if(col===5)y=publicTop;
  for(const n of group){n.y=y;y+=n.value*k+gap;}
 }
 if(redistribution){
  const value=nodes.find(n=>n.id==='value')!,gov=nodes.find(n=>n.id==='gov')!;
  value.y=top;gov.y=publicTop;
  const saved=nodes.find(n=>n.id==='savings');
  if(saved){saved.y=Math.max(...nodes.filter(n=>n.col===5).map(n=>n.y!+n.value*k))+gap;const unspent=nodes.find(n=>n.id==='saved');if(unspent)unspent.y=saved.y;}
  const finalConsumed=nodes.find(n=>n.id==='final-consumed')!;
  const finalRedistributed=nodes.find(n=>n.id==='final-redistributed')!;
  const finalExpenses=nodes.find(n=>n.id==='final-expenses')!;
  finalConsumed.y=top;finalRedistributed.y=publicTop;
  // Mirror the gap between the two public groups in the detail column.
  finalExpenses.y=publicTop+finalRedistributed.value*k+gap*2;
 }
 // Order ribbons independently at both ends by their opposite node's position.
 // This avoids twists caused by using the order in which edges were constructed.
 const byId=new Map(nodes.map(n=>[n.id,n]));
 const sourceY=new Map<Edge,number>(),targetY=new Map<Edge,number>();
 for(const n of nodes){
  let out=n.y!,incoming=n.y!;
  for(const e of edges.filter(e=>e.from===n.id).sort((a,b)=>byId.get(a.to)!.y!-byId.get(b.to)!.y!)){sourceY.set(e,out);out+=e.value*k;}
  for(const e of edges.filter(e=>e.to===n.id).sort((a,b)=>byId.get(a.from)!.y!-byId.get(b.from)!.y!)){targetY.set(e,incoming);incoming+=e.value*k;}
 }
 const chartHeight=Math.max(660,...nodes.map(n=>n.y!+n.value*k+40));
 return <View onLayout={e=>setChartWidth(Math.max(640,e.nativeEvent.layout.width))}><Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} accessibilityLabel={t("Annual money flows from employer cost through payroll and spending to government, consumed value and savings")}>
 {['01  PRODUCED','02  PAYROLL','03  IN YOUR BANK','04  YOUR BUDGET','05  DESTINATION',...(redistribution?['06  PUBLIC USE','07  FINAL OUTCOMES']:[])].map((label,i)=><SvgText key={label} x={xs[i]} y={28} fontSize={9} fill="#89918b" letterSpacing={.5}>{wrap(t(label),Math.max(10,Math.floor(step/6))).map((line,j)=><TSpan key={j} x={xs[i]} dy={j?13:0}>{line}</TSpan>)}</SvgText>)}
 {edges.filter(e=>e.value>.01).map((e,i)=>{const a=nodes.find(n=>n.id===e.from)!,b=nodes.find(n=>n.id===e.to)!;const x=xs[a.col]+9,z=xs[b.col],y=sourceY.get(e)!,v=targetY.get(e)!,h=e.value*k;const mid=(x+z)/2;return <Path key={i} d={`M${x},${y} C${mid},${y} ${mid},${v} ${z},${v} L${z},${v+h} C${mid},${v+h} ${mid},${y+h} ${x},${y+h} Z`} fill={e.color} opacity={e.from==='value'?.55:.33} onPress={()=>setDetail(`${t(a.label)} → ${t(b.label)}: ${money(e.value,c,language)} / ${t('year')}`)}/>;})}
 {nodes.map(n=>{
  const labelX=xs[n.col]+13;
  const labelWidth=n.col===columns-1?132:step-18;
  const lines=wrap(displayLabel(n.label),Math.max(11,Math.floor(labelWidth/5.5)));
  const labelTop=n.y!-(lines.length+1)*12-8;
  return <React.Fragment key={n.id}>
   <Rect x={xs[n.col]} y={n.y} width={9} height={Math.max(.3,n.value*k)} rx={2} fill={n.color} onPress={()=>setDetail(`${t(n.label)}: ${money(n.value,c,language)} / ${t('year')}`)}/>
   <Rect x={labelX-3} y={labelTop-2} width={labelWidth} height={(lines.length+1)*12+5} rx={3} fill="#fcfcf8" opacity={.94}/>
   <SvgText x={labelX} y={labelTop+9} fontSize={n.col===columns-1?11:10} fontWeight={n.col===columns-1?'600':'400'} fill="#46564e">{lines.map((line,j)=><TSpan key={j} x={labelX} dy={j?12:0}>{line}</TSpan>)}</SvgText>
   <SvgText x={labelX} y={labelTop+9+lines.length*12} fontSize={10} fontWeight="600" fill="#263f34">{money(n.value,c,language)}</SvgText>
  </React.Fragment>;
 })}
 </Svg>{redistribution&&<Text style={{color:'#77837b',fontSize:11,lineHeight:17,paddingHorizontal:26,paddingBottom:8}}>{t('Redistributed value includes recorded social benefits in cash and purchased benefits in kind. Government expenses include services, investment and interest, not just administration. Savings are retained wealth in the final column; they are not consumption.')}</Text>}<Text style={{color:'#77837b',fontSize:11,paddingHorizontal:26}}>{detail}</Text></View>;
}
