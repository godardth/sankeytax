import fr from '../../data/countries/fr.json';
import de from '../../data/countries/de.json';
import us from '../../data/countries/us.json';
import kr from '../../data/countries/kr.json';
export const countries = [fr, us, de, kr];
export type Country = typeof fr;
export type Inputs = {salary: number; owner: boolean; houseValue: number; housing: number; spending: Record<string, number>; supplier: boolean; rentalEnabled:boolean; rentalMethod:'expenses'|'allowance'; rentalPropertyTax:number; rentalExpenses:number; rentalIncomeRate:number; rentalSocialRate:number; rentalAllowance:number};
export function defaults(c: Country): Inputs {
 const net = c.salary * (1-c.employee.reduce((s,x)=>s+x.rate,0));
 return {salary:c.salary,owner:false,houseValue:c.salary*6,housing:Math.round(net*.32/12),spending:Object.fromEntries(c.budget.filter(x=>x.id!=='housing').map(x=>[x.id,Math.round(net*x.share/12)])),supplier:true,rentalEnabled:true,rentalMethod:'expenses',rentalPropertyTax:c.rentalTax.annualPropertyTax,rentalExpenses:Math.round(net*.32*c.rentalTax.otherExpenseShare),rentalIncomeRate:c.rentalTax.incomeTaxRate*100,rentalSocialRate:c.rentalTax.socialTaxRate*100,rentalAllowance:c.rentalTax.allowanceRate*100};
}
export function simulate(c: Country, input: Inputs) {
 const salary = Math.max(0,input.salary);
 const employer=c.employer.map(x=>({...x,value:salary*x.rate}));
 const employee=c.employee.map(x=>({...x,value:salary*x.rate}));
 const payroll=[...employer,...employee];
 const cost=salary+employer.reduce((s,x)=>s+x.value,0);
 const net=Math.max(0,salary-employee.reduce((s,x)=>s+x.value,0));
 const requested=c.budget.map(b=>({...b,requested: b.id==='housing' ? (input.owner?input.houseValue*c.propertyTaxRate:input.housing*12) : (input.spending[b.id]||0)*12}));
 const requestedTotal=requested.reduce((s,x)=>s+x.requested,0);
 const scale=requestedTotal>net && requestedTotal>0?net/requestedTotal:1;
 const clampRate=(n:number)=>Math.min(1,Math.max(0,n/100));
 const budget=requested.map(b=>{
  const amount=Math.max(0,b.requested)*scale;
  const rent=b.id==='housing'&&!input.owner;
  const vat=b.id==='housing'&&input.owner?amount:amount*b.vat/(1+b.vat);
  const supplier=input.supplier?(amount-vat)*b.supplierLaborShare*b.supplierTaxWedge:0;
  // Attribute only taxes funded by the modeled rent; never create negative consumption.
  const propertyTax=rent&&input.rentalEnabled?Math.min(amount,Math.max(0,input.rentalPropertyTax)*scale):0;
  const expenses=rent?Math.max(0,input.rentalExpenses)*scale:0;
  const taxableRent=rent&&input.rentalEnabled?(input.rentalMethod==='allowance'?amount*(1-clampRate(input.rentalAllowance)):Math.max(0,amount-propertyTax-expenses)):0;
  const rawIncome=taxableRent*clampRate(input.rentalIncomeRate),rawSocial=taxableRent*clampRate(input.rentalSocialRate);
  const cap=rawIncome+rawSocial>0?Math.min(1,Math.max(0,amount-propertyTax)/(rawIncome+rawSocial)):1;
  const landlordIncomeTax=rawIncome*cap,landlordSocialTax=rawSocial*cap;
  const landlordTax=propertyTax+landlordIncomeTax+landlordSocialTax;
  return {...b,amount,vat,supplier,propertyTax,taxableRent,landlordIncomeTax,landlordSocialTax,landlordTax,rentalTaxCapped:cap<1,tax:vat+supplier+landlordTax,value:amount-vat-supplier-landlordTax};
 });
 const spent=budget.reduce((s,x)=>s+x.amount,0);
 const savings=Math.max(0,net-spent);
 const government=payroll.reduce((s,x)=>s+x.value,0)+budget.reduce((s,x)=>s+x.tax,0);
 const consumed=budget.reduce((s,x)=>s+x.value,0);
 return {cost,salary,net,employer,employee,payroll,budget,savings,government,consumed,ratio:cost?consumed/cost:0,overBudget:requestedTotal>net,requestedTotal};
}
export type Simulation=ReturnType<typeof simulate>;
export function money(n:number,c:Country,language: 'en' | 'fr' = 'en'){return new Intl.NumberFormat(language==='fr'?'fr-FR':'en-US',{style:'currency',currency:c.currency,maximumFractionDigits:0}).format(n);}
