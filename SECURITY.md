# Security and privacy

The application has no backend, tracking, accounts or remote calculation calls. Inputs are held in memory. Clicking a source opens an external site. Sharing is an explicit user action. Full simulation exports contain personal inputs; public KPI cards contain only country, ratio and methodology labels.

At bootstrap, `npm audit` reported 8 dependency findings (5 low, 3 high), propagated from `deepmerge` and `zod` through Expo tooling. npm's proposed automatic resolution downgraded Expo to SDK 51; it was not applied. Review upstream Expo dependency updates before production deployment. No audit waiver or assertion of exploitability is made here.
