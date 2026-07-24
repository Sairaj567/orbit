# 10 Next Steps

## Current Priority

**Milestone 8.0 — Polish & AI Integration**

With the real-time foundation, study blocks, and the productivity dashboard established, the next logical step is to introduce AI features and Gamification.

### 1. AI Summaries & Semantic Search
- Implement AI summaries for long notes.
- Use vector embeddings for semantic search across tasks, notes, and resources.

## Upcoming Milestones
- **Phase 8: Polish & AI** (AI summaries, semantic search)
- **Phase 9: Gamification** (XP, Levels, Achievements)

## Next
1. **Prisma Schema Expansion**: Add remaining fields for XP and Level calculation engine if needed.
2. **AI Integration**: Connect to an LLM provider (OpenAI / Anthropic) to generate automatic summaries.

## Future
1. WebSockets for real-time multiplayer cursor/status sync.
2. Analytics and Activity feeds backend queues.
3. Gamification XP and Level calculation engine.

## Technical Debt
- Ensure shared types are strictly enforced and avoid code duplication between `web` and `api` before the codebase grows too large.
