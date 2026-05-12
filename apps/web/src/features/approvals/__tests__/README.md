# Approval feature tests

Bu dizindeki `*.test.ts` dosyalari Node'un yerel test kosucusu ile calistirilir.

```bash
pnpm test:web-approvals
```

`apps/web/package.json` icinde `"type": "module"` ayari vardir; aksi halde Node 22 ESM test dosyalarini yuklerken `ERR_REQUIRE_CYCLE_MODULE` verebilir.
