const fs=require('node:fs');const ts=require('typescript');const assert=require('node:assert/strict');
const source=fs.readFileSync('src/utils/simulation.ts','utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const mod={exports:{}};new Function('require','exports',code)((p)=>require(p.replace('../../data/','../data/')),mod.exports);
const {countries,defaults,simulate}=mod.exports;
let count=0;
for(const c of countries){
 assert.equal(c.status,'illustrative');assert(c.salary>0);assert(c.budget.reduce((s,x)=>s+x.share,0)<=1);assert.equal(new Set(c.budget.map(b=>b.id)).size,c.budget.length);
 for(const x of [...c.employer,...c.employee])assert(x.rate>=0&&x.rate<=1);
 assert(c.employee.reduce((s,x)=>s+x.rate,0)<1);
 for(const b of c.budget)for(const k of ['share','vat','supplierLaborShare','supplierTaxWedge'])assert(b[k]>=0&&b[k]<=1);
 for(const key of ['incomeTaxRate','socialTaxRate','allowanceRate','otherExpenseShare'])assert(c.rentalTax[key]>=0&&c.rentalTax[key]<=1);
 for(const s of c.sources)assert(new URL(s.url).protocol==='https:');
 for(const input of [defaults(c),{...defaults(c),salary:0},{...defaults(c),salary:100},{...defaults(c),owner:true},{...defaults(c),supplier:false},{...defaults(c),housing:0,spending:{}}]){
 const r=simulate(c,input);assert(Math.abs(r.cost-r.government-r.consumed-r.savings)<.0001);assert(r.consumed>=0);assert(r.government>=0);assert(r.net>=0);assert(r.ratio>=0&&r.ratio<=1);count++;
 }
 const a=simulate(c,defaults(c)),b=simulate(c,{...defaults(c),supplier:false});assert(a.government>=b.government);assert(a.consumed<=b.consumed);
}
console.log(`Validated ${countries.length} country files and ${count} conserved scenarios.`);
// Rental attribution: property tax must not be deducted twice under an allowance.
const fr=countries.find(c=>c.id==='fr');
const rental={...defaults(fr),salary:200000,housing:1000,rentalPropertyTax:1000,rentalExpenses:2000,rentalIncomeRate:30,rentalSocialRate:17.2};
const housing=i=>simulate(fr,i).budget.find(b=>b.id==='housing');
const expense=housing({...rental,rentalMethod:'expenses'});
assert.equal(expense.taxableRent,9000);assert.equal(expense.landlordIncomeTax,2700);assert(Math.abs(expense.landlordSocialTax-1548)<1e-6);assert.equal(expense.landlordTax,5248);
const allowance=housing({...rental,rentalMethod:'allowance',rentalAllowance:30});
assert.equal(allowance.taxableRent,8400);assert(Math.abs(allowance.landlordTax-(1000+8400*.3+8400*.172))<1e-6);
assert.equal(housing({...rental,rentalEnabled:false}).landlordTax,0);
assert.equal(housing({...rental,owner:true}).landlordTax,0);
assert.equal(housing({...rental,housing:0}).landlordTax,0);
for(const i of [{...rental,salary:100},{...rental,rentalPropertyTax:1e8},{...rental,rentalMethod:'allowance',rentalAllowance:0,rentalIncomeRate:100,rentalSocialRate:100}]){
 const r=simulate(fr,i),h=r.budget.find(b=>b.id==='housing');assert(h.value>=0);assert(h.landlordTax<=h.amount);assert(Math.abs(r.cost-r.government-r.consumed-r.savings)<1e-6);
}
const taxed=simulate(fr,rental),untaxed=simulate(fr,{...rental,rentalEnabled:false});
assert(Math.abs(taxed.government-untaxed.government-expense.landlordTax)<1e-6);
assert(Math.abs(untaxed.consumed-taxed.consumed-expense.landlordTax)<1e-6);
console.log('Rental actual-expense, allowance, disabled, owner, zero-rent, overspending and capped-tax scenarios passed.');
