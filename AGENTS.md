<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: use the `skill` tool to list available skills from `.agents/skills/`, or run `npx @tanstack/intent@latest list`.
- Skill guidance: if one local skill clearly matches the task, use `skill({ name: "<name>" })` to load it from `.agents/skills/`, or run `npx @tanstack/intent@latest load <package>#<skill>` for the Intent CLI fallback.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->
