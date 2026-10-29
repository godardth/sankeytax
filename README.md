# SankeyTax

A frontend-only Expo / React Native income-flow explorer for France, the United States, Germany and South Korea. MIT licensed. No account, backend, analytics, or external API requests. Inputs stay in memory and reset on reload.

## Run

```sh
npm install
npm run web
# or npm start, then open in a compatible Expo Go client
```

Web is the primary large-canvas experience. Native shares use the system share sheet. On web, the KPI card downloads as SVG; native shares its SVG text. The private simulation export contains all inputs and must not be confused with the public KPI card.

## Model status

**An exploratory implementation, not a verified tax calculator.** The wage reference points are sourced; payroll effective rates, budget shares, supplier shares and property tax rates are illustrative. This release does not fulfill a claim of latest verified median defaults for every input. Salary sources have different populations and dates. See the in-app methodology and country files before interpreting comparisons.

Employer payroll cost is a proxy for produced value. Consumption is private spending net of modeled taxes; it is not welfare, utility or the value of public services. Savings are a separate destination. Corporate income tax is excluded because company profit cannot be inferred from an employee salary. No currency or purchasing power conversion is performed.

Payroll estimates use flat rates, omitting brackets, caps, credits and household-specific rules. US sales tax is an illustrative local rate. Supplier taxes use one explicitly assumed labor-cost share and effective tax wedge; they are not recursively calculated. Owner mode assumes mortgage-free ownership and models property tax only. It does not estimate housing services, mortgages, acquisition taxes, ; landlord rental taxes are modeled separately as described below.

The engine conserves employer cost across government, consumption and savings. Overspending is scaled proportionally and disclosed. Taxes in consumer prices use the tax-inclusive formula; supplier taxes use the remaining base to avoid VAT double counting.

## Contribute country data

Edit `data/countries/fr.json`, `us.json`, `de.json`, or `kr.json` directly using GitHub's pencil button. No application code changes are needed for changes to an existing country's rates, categories, defaults or sources. See [CONTRIBUTING.md](CONTRIBUTING.md). Adding a country currently also requires registering its import in `src/utils/simulation.ts`.

```sh
npm run typecheck
npm test
npm run build:web
```

## Languages

Use **English / Français** in the header. Language changes preserve simulation inputs and apply to chart labels, country names, sources, explanations, number formatting and public exports. Web remembers the preference in local storage; native keeps it for the current session. English is the default. Translations live in `src/i18n.ts`, separate from economic data. Private JSON exports retain stable English field names for interoperability.

## Rental taxes

Tenant mode attributes property tax and landlord income/social taxes to rent. Expand **Landlord taxes · assumptions** to edit annual property tax, other deductible costs, rates and either actual expenses or a flat allowance. Taxable rent = max(0, rent − property tax − other expenses), or rent × (1 − allowance). The allowance replaces deductions, so property tax is not deducted again. Property tax still flows to government once. Rates apply to taxable rent; attributed total taxes cannot exceed rent. Overspending scales rent and attributable annual expenses together.

France defaults to an **illustrative unfurnished-rental scenario**, not a median: €1,000 annual property tax, other costs initially 20% of default rent, 30% income tax and 17.2% social levies. The optional allowance starts at 30%; eligibility is not checked. Source: https://www.impots.gouv.fr/particulier/location-vide-de-meubles . Other countries have unconfigured zero defaults, explicitly labeled unknown. These values do not assert a tax-free rental market. No losses, credits, depreciation, furnished rental, corporate ownership, other properties or financing-specific rules are modeled. This attributes receipts to government without claiming economic incidence or a landlord profit estimate.
