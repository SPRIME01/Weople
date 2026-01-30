# general_project_guidelines.md

If there is any conflict, defer to ADRs in `docs/specs/adr.md` as described there.

## When to update `.github/copilot-instructions.md`

Update it whenever any of the following change:

- **Architecture decisions** (ADRs) or new ADRs are added
- **Product intent** (PRD/SDS) changes or new phases are introduced
- **Tooling/workflow** changes (Nx targets, package manager, testing stack)
- **Data/AI/infra** choices shift (LLM routing, embeddings, DB/storage choices)
- **Library boundaries** or dependency rules change
- **Security/compliance** requirements change

If you notice drift between the repo and the instructions, **flag it immediately** and update the file.
