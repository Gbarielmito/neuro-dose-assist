# Repository Maintenance Protocol & Governance

> [!URGENT]
> **READ THIS FIRST**: The single most critical rule of this repository is: **IF YOU DO NOT PUSH YOUR CHANGES, THEY DO NOT EXIST.**
>
> **ALWAYS** run `git push` immediately after committing. No exceptions.

## 1. Governance & Roles

### Maintainers

- **Core Team**: Responsible for "Official" skills and merging PRs.
- **Review Policy**: All PRs must pass the [Quality Bar](../docs/QUALITY_BAR.md) checks.

### Code of Conduct

All contributors must adhere to the [Code of Conduct](../CODE_OF_CONDUCT.md).

## 2. Analysis & Planning (Planner Role)

1. **Check Duplicates**: `grep -r "search_term" skills_index.json`
2. **Consult Quality Bar**: Review `docs/QUALITY_BAR.md` to ensure the plan meets the "Validated" criteria.
3. **Risk Assessment**: Determine if the skill is `safe`, `critical`, or `offensive`. (See [Security Guardrails](../docs/SECURITY_GUARDRAILS.md))

## 3. Implementation Workflow (Executor Role)

1. **Create Skill**: Follow the standard folder structure `skills/<kebab-name>/`.
2. **SKILL.md**: MUST header to the Quality Bar standard.

   ```yaml
   ---
   name: my-skill
   description: clear description
   risk: safe
   source: self
   ---
   ```

3. **Security Check**: If `risk: offensive`, add the "Authorized Use Only" disclaimer.

## 4. Validation Chain (MANDATORY)

Run validation before committing:

```bash
python3 scripts/validate_skills.py
python3 scripts/generate_index.py
python3 scripts/update_readme.py
```

> [!NOTE]
> **Transition Period**: We are currently in a "Soft Launch" phase. Legacy skills may trigger warnings.
> **New skills MUST have zero warnings.**

## 5. Documentation & Credits

- [ ] **SOURCE.md**: Update the master source list if importing external skills.
- [ ] **README.md**: Ensure credits are added in the `Credits` section.

## 6. Finalization (The "Antigravity" Standard)

- [ ] **Git Add**: `git add .`
- [ ] **Commit**: `git commit -m "feat: add [skill-name] skill"`
- [ ] **PUSH NOW**: `git push` (Do not wait).
