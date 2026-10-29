# Contributing

Country experts and economists are welcome. Open an issue before changing the methodology. Small corrections to a country's JSON can be submitted directly through GitHub's file editor.

1. Find the country in `data/countries/`.
2. Update a number, keeping JSON punctuation intact. Rates are fractions: 20% is `0.20`. Salary is annual local currency. Budget shares are fractions of estimated net income; the remainder defaults to savings.
3. Include the official source URL, reference year, population, unit, and the reason for the change in your pull request. Never label a mean as a median or net income as gross income.
4. Update `version`, `reviewedAt`, and `salaryNote`. Keep `status` illustrative until all assumptions have been reviewed. A source link is not proof of every number in a file.
5. Explain whether a change is observed data, statutory law, an effective estimate, or a scenario assumption. Do not silently replace one with another.

`employer` and `employee` are arrays of named contributions as fractions of gross salary. `vat` on each budget item is the tax-exclusive statutory rate. `supplierLaborShare` is the assumed fraction of the price excluding VAT paying supplier labor costs; `supplierTaxWedge` is the government fraction of those labor costs. The housing category has no supplier taxes by default. `propertyTaxRate` is an illustrative annual fraction of home value.

Budget amounts, rent and owner house value are editable in the application. For more detailed country-specific rules, propose an extension to the declarative format with worked examples and an official source. Do not place executable code in data files.

Before submitting, run `npm test` and `npm run typecheck`. The validator checks rates, source URLs, identifiers and total default budget allocation. Simulation tests check conservation, zero income, overspending and owner mode.

`rentalTax` stores editable landlord scenario defaults. Annual property tax is allocated to the simulated dwelling, not a second tenant expense. `otherExpenseShare` initializes deductible expenses from starting annual rent; `incomeTaxRate`, `socialTaxRate`, and `allowanceRate` are fractions. These are scenario defaults, not statutory rules or observed medians. `status: unconfigured` means unknown; zero must not be presented as evidence of tax exemption. Add official sources and explain the landlord profile before supplying defaults.
