import React, {useState} from 'react';
import {View,Text} from 'react-native';
import Svg,{Path,Rect,Text as SvgText} from 'react-native-svg';
import {Country,Simulation,money} from '../utils/simulation';
import {translate, type Language} from '../i18n';
type Node={id:string;label:string;value:number;col:number;color:string;y?:number};
type Edge={from:string;to:string;value:number;color:string};
const mint='#a0c6b0',rose='#cf9d8b',ink='#315e51',sand='#d7ccac';
export function Sankey({s,c,language}:{s:Simulation;c:Country;language:Language}){
 const t=(text:string)=>translate(language,text);
 const [detail,setDetail]=useState(t('Tap a flow to inspect its annual amount'));
 const nodes:Node[]=[{id:'cost',label:'Employer cost',value:s.cost,col:0,color:ink},{id:'gross',label:'Gross salary',value:s.salary,col:1,color:mint},...s.employer.map((x,i)=>({id:'er'+i,label:x.label,value:x.value,col:1,color:rose})),{id:'net',label:'Take-home pay',value:s.net,col:2,color:mint},...s.employee.map((x,i)=>({id:'ee'+i,label:x.label,value:x.value,col:2,color:rose})),...s.budget.map(x=>({id:x.id,label:x.label,value:x.amount,col:3,color:mint})),{id:'gov',label:'Government',value:s.government,col:4,color:rose},{id:'value',label:'Consumed value',value:s.consumed,col:4,color:ink}];
 if(s.savings>.01){nodes.push({id:'saved',label:'Unspent / savings',value:s.savings,col:3,color:sand},{id:'savings',label:'Retained wealth',value:s.savings,col:4,color:sand});}
 const edges:Edge[]=[{from:'cost',to:'gross',value:s.salary,color:mint},...s.employer.map((x,i)=>({from:'cost',to:'er'+i,value:x.value,color:rose})),{from:'gross',to:'net',value:s.net,color:mint},...s.employee.map((x,i)=>({from:'gross',to:'ee'+i,value:x.value,color:rose})),...s.employer.map((x,i)=>({from:'er'+i,to:'gov',value:x.value,color:rose})),...s.employee.map((x,i)=>({from:'ee'+i,to:'gov',value:x.value,color:rose})),...s.budget.flatMap(x=>[{from:'net',to:x.id,value:x.amount,color:mint},{from:x.id,to:'gov',value:x.tax,color:rose},{from:x.id,to:'value',value:x.value,color:mint}])];
 if(s.savings>.01)edges.push({from:'net',to:'saved',value:s.savings,color:sand},{from:'saved',to:'savings',value:s.savings,color:sand});
 const k=340/(s.cost||1),xs=[30,245,470,705,960],offsets:Record<string,number>={},ins:Record<string,number>={};
 for(let col=0;col<5;col++){const group=nodes.filter(n=>n.col===col);const h=group.reduce((a,n)=>a+n.value*k,0)+Math.max(0,group.length-1)*29;let y=80+(520-h)/2;for(const n of group){n.y=y;y+=n.value*k+29;offsets[n.id]=n.y;ins[n.id]=n.y;}}
 return <View><Svg width="100%" height={620} viewBox="0 0 1130 620" accessibilityLabel={t("Annual money flows from employer cost through payroll and spending to government, consumed value and savings")}>
 {['01  PRODUCED','02  PAYROLL','03  IN YOUR BANK','04  YOUR BUDGET','05  DESTINATION'].map((label,i)=><SvgText key={label} x={xs[i]} y={28} fontSize={10} fill="#89918b" letterSpacing={1.3}>{t(label)}</SvgText>)}
 {edges.filter(e=>e.value>.01).map((e,i)=>{const a=nodes.find(n=>n.id===e.from)!,b=nodes.find(n=>n.id===e.to)!;const x=xs[a.col]+9,z=xs[b.col],y=offsets[a.id],v=ins[b.id],h=e.value*k;offsets[a.id]+=h;ins[b.id]+=h;const mid=(x+z)/2;return <Path key={i} d={`M${x},${y} C${mid},${y} ${mid},${v} ${z},${v} L${z},${v+h} C${mid},${v+h} ${mid},${y+h} ${x},${y+h} Z`} fill={e.color} opacity={.36} onPress={()=>setDetail(`${t(a.label)} → ${t(b.label)}: ${money(e.value,c,language)} / ${t('year')}`)}/>;})}
 {nodes.map(n=><React.Fragment key={n.id}><Rect x={xs[n.col]} y={n.y} width={9} height={Math.max(.3,n.value*k)} rx={2} fill={n.color} onPress={()=>setDetail(`${t(n.label)}: ${money(n.value,c,language)} / ${t('year')}`)}/><SvgText x={xs[n.col]+15} y={n.y!-7} fontSize={10} fill="#46564e">{t(n.label).length>25?t(n.label).slice(0,24)+'…':t(n.label)}</SvgText><SvgText x={xs[n.col]+15} y={n.y!+11} fontSize={11} fontWeight="600" fill="#263f34">{money(n.value,c,language)}</SvgText></React.Fragment>)}
 </Svg><Text style={{color:'#77837b',fontSize:11,paddingHorizontal:26}}>{detail}</Text></View>;
}
