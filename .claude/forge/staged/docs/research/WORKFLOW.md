# Research Workflow — Stàged (`--temper` mode)

**Generated:** 2026-03-06
**Mode:** Verify — stress-test claims, flag low-confidence assumptions
**Research Areas:** 7

---

## Instructions

1. Open each prompt file in `prompts/`
2. Run the prompt on the **recommended platform** (platform strengths below)
3. Paste the full response into the corresponding file in `responses/<topic>/responses/<platform>.md`
4. When all responses are collected, trigger synthesis: tell Claude "run temper synthesis for Stàged research"

## Platform Strengths

| Platform | Best For |
|----------|----------|
| **Gemini (Deep Research)** | Market data, competitive landscape, pricing research, case studies |
| **ChatGPT** | API architecture, system design, protocol comparisons, legal reasoning |
| **GitHub Copilot** | SDK patterns, implementation specifics, library comparisons, dev tooling |
| **Claude** | Long-form synthesis, nuanced legal/ethical analysis, structured reasoning |
| **Grok** | Real-time web/X data, current events, trending product discussions, live pricing |
| **BigPickle** | Platform-specific strengths — use per your configuration |
| **Raptor Mini** | Fast, lightweight lookups — good for spot-checking specific facts quickly |
| **MiniMax** | Broad knowledge synthesis — useful secondary cross-check on market/tech topics |

## Response Directory

```
research/responses/
  01-market-validation/responses/     ← gemini.md (primary), grok.md, chatgpt.md, claude.md, bigpickle.md, raptormini.md, minimax.md
  02-fulfillment-apis/responses/      ← chatgpt.md (primary), grok.md, gemini.md, claude.md, bigpickle.md, raptormini.md, minimax.md
  03-competitive-landscape/responses/ ← gemini.md (primary), grok.md, chatgpt.md, claude.md, bigpickle.md, raptormini.md, minimax.md
  04-pwa-feasibility/responses/       ← chatgpt.md (primary), copilot.md, claude.md, bigpickle.md, raptormini.md, minimax.md, grok.md
  05-nutrition-apis/responses/        ← copilot.md (primary), chatgpt.md, claude.md, bigpickle.md, raptormini.md, minimax.md, grok.md
  06-monetization-benchmarks/responses/ ← gemini.md (primary), grok.md, chatgpt.md, claude.md, bigpickle.md, raptormini.md, minimax.md
  07-recipe-content-legality/responses/ ← claude.md (primary), chatgpt.md, gemini.md, bigpickle.md, grok.md, raptormini.md, minimax.md
```

## Temper Mode

All responses will be cross-verified:
- Claims corroborated by multiple models → high confidence
- Claims from only one model, no source cited → flagged for validation
- Consensus across models that contradicts the business brief → surfaced as assumption risk
- Output: `synthesis/temper-audit.md` with full confidence scoring table
