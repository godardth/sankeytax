import React from 'react';
import {View,Text,Pressable,Linking} from 'react-native';
import {Country,money} from '../utils/simulation';
import {publicAllocation,financing} from '../utils/public-finance';
import {translate,percent,Language} from '../i18n';
export function PublicSpending({country,receipts,language}:{country:Country;receipts:number;language:Language}){
 const t=(s:string)=>translate(language,s),groups=publicAllocation(country,receipts),f=financing(country);
 return <View style={{gap:18,padding:22,borderWidth:1,borderColor:'#dbe2d6',borderRadius:10,backgroundColor:'#edf2e9'}}>
 <Text style={{fontSize:23,color:'#244f40'}}>{t('Taxes are transferred, not erased.')}</Text>
 <Text style={{fontSize:13,lineHeight:21,color:'#526754'}}>{t('Public money pays benefits, services and investment. The private-consumption ratio above is not a measure of everything society receives, nor a measure of government waste.')}</Text>
 <Text style={{fontSize:11,color:'#526754'}}>{t('Government receipts in this simulation')}: {money(receipts,country,language)} · {t('Spending mix')}: {country.publicFinance.year}</Text>
 <View style={{flexDirection:'row',height:18,borderRadius:4,overflow:'hidden'}}>{groups.map(g=><View key={g.id} style={{width:`${g.share*100}%`,backgroundColor:g.color}}/>)}</View>
 {groups.map(g=><View key={g.id} style={{flexDirection:'row',gap:12,alignItems:'center',flexWrap:'wrap'}}><View style={{width:8,height:8,backgroundColor:g.color,borderRadius:4}}/><Text style={{flex:1,minWidth:150,color:'#315e51',fontSize:12}}>{t(g.label)}</Text><Text style={{color:'#315e51',fontVariant:['tabular-nums'],fontSize:12}}>{percent(g.share,language)} · {money(g.value,country,language)}</Text></View>)}
 <Text style={{fontSize:11,lineHeight:18,color:'#637565'}}>{t('Cash benefits include pensions and income support. Running costs cover all public staff and purchases, including frontline services, not just administration. Purchased social services cover market-provided benefits in kind; public hospitals and schools also appear in running costs. The residual includes investment, subsidies and other transfers.')}</Text>
 {!country.publicFinance.cashComparable&&<Text style={{fontSize:11,lineHeight:18,color:'#946a4f'}}>{t('US reporting includes healthcare payments within D62 social benefits. This is not a cash-only estimate. D632 is reported as zero; that does not mean no healthcare or benefits in kind are provided.')}</Text>}
 <Text style={{fontSize:17,color:'#244f40'}}>{t('And the deficit? A source of financing.')}</Text>
 <Text style={{fontSize:12,lineHeight:20,color:'#526754'}}>{t('For every 100 of national public spending')}: {percent(f.revenueShare,language)} {t('from public revenue')} + {percent(f.deficitShare,language)} {t('from net borrowing')}.{f.surplusShare>0?` ${t('Revenue surplus')}: ${percent(f.surplusShare,language)}`:''}</Text>
 <View style={{flexDirection:'row',height:12}}><View style={{flex:Math.min(1,f.revenueShare),backgroundColor:'#8fae9b'}}/><View style={{flex:f.deficitShare,backgroundColor:'#c6ad86'}}/></View>
 <Text style={{fontSize:11,lineHeight:18,color:'#637565'}}>{t('The deficit is spending above revenue, not a destination for your taxes. Interest is already a spending category. Public revenue also includes non-tax income. These national financing shares are context, not additional money taken from your salary.')}</Text>
 <Text style={{fontSize:11,lineHeight:18,color:'#637565'}}>{t('Allocation uses each category’s share of total national spending, applied proportionally to modeled government receipts. It does not trace earmarked taxes or calculate benefits received by your household. Nothing is added to your bank account or counted twice in the KPI.')}</Text>
 <Pressable accessibilityRole="link" onPress={()=>Linking.openURL(country.publicFinance.sourceUrl)}><Text style={{fontSize:12,color:'#244f40',textDecorationLine:'underline'}}>{t('Source: OECD national accounts')} · {country.publicFinance.year} ↗</Text></Pressable>
 <Text style={{fontSize:10,color:'#7d8b79'}}>{t('General government · common 2023 reference year · retrieved 30 October 2026. Historical snapshot, not a claim of latest data. Amounts show spending composition, not the value or effectiveness of services.')}</Text>
 </View>;
}
