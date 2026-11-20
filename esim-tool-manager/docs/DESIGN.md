# Design

```
cli.py ──> registry.py (tools.json)  : detect tools + versions
   │──> installer.py ─> platform_utils.py : choose apt/brew/choco, build commands
   │──> config.py                     : write paths and env vars
   │──> doctor.py                     : regex rules -> fixes
   └──> logger.py                     : ~/.esim-tm/actions.log
```

- **Data-driven:** adding a tool means editing `tools.json` only, with no code changes.
- **Safe:** `--dry-run` prints every command before running anything.
- **No dependencies:** standard library only, so it runs on a fresh machine.
