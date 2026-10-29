import type {Country} from './simulation';
// Reallocate the same government receipts; do not create household income or subtract benefits from taxes.
export function publicAllocation(c:Country, receipts:number){
 const f=c.publicFinance.transactions;
 const groups=[
  {id:'cash',label:c.publicFinance.cashComparable?'Cash social benefits':'Social benefits · US reporting',amount:f.cashBenefits,color:'#6f9e8d'},
  {id:'kind',label:'Purchased social services',amount:f.purchasedSocialServices,color:'#96b4ab'},
  {id:'operations',label:'Public-service running costs',amount:f.employeeCompensation+f.goodsAndServices,color:'#9aa8c1'},
  {id:'interest',label:'Debt interest',amount:f.interest,color:'#c6ad86'},
  {id:'other',label:'Investment & other spending',amount:f.expenditure-f.cashBenefits-f.purchasedSocialServices-f.employeeCompensation-f.goodsAndServices-f.interest,color:'#b4b5a1'},
 ];
 return groups.map(g=>({...g,share:g.amount/f.expenditure,value:Math.max(0,receipts)*g.amount/f.expenditure}));
}
export function financing(c:Country){
 const {revenue,expenditure}=c.publicFinance.transactions;
 return {revenueShare:revenue/expenditure,deficitShare:Math.max(0,expenditure-revenue)/expenditure,surplusShare:Math.max(0,revenue-expenditure)/expenditure};
}
// Redistribution includes recorded social benefits in cash and purchased benefits in kind.
// The remaining public expenditure is not synonymous with administrative overhead.
export function finalOutcomes(c:Country, receipts:number, consumed:number){
 const allocation=publicAllocation(c,receipts);
 return [
  {id:'consumed',label:'Value consumed',value:consumed,color:'#315e51'},
  {id:'redistributed',label:'Value redistributed',value:allocation.filter(g=>g.id==='cash'||g.id==='kind').reduce((s,g)=>s+g.value,0),color:'#6f9e8d'},
  {id:'expenses',label:'Government expenses',value:allocation.filter(g=>g.id!=='cash'&&g.id!=='kind').reduce((s,g)=>s+g.value,0),color:'#9aa8c1'},
 ];
}
