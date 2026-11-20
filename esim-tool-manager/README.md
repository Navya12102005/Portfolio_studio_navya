# eSim Automated Tool Manager

A command-line tool that checks, installs, updates and configures the external tools eSim needs (Ngspice, KiCad, GHDL, Verilator, Python).

## Run
```bash
python3 -m esim_tm list                       # tools, versions, status
python3 -m esim_tm check                      # are required deps OK?
python3 -m esim_tm install --missing --dry-run
python3 -m esim_tm install ngspice            # real install (uses sudo)
python3 -m esim_tm update --dry-run
python3 -m esim_tm configure                  # writes ~/.esim-tm/config.json and env.sh
python3 -m esim_tm doctor install.log         # explain errors in plain English
python3 -m esim_tm log                        # action history
```

## Test
```bash
python3 -m unittest -v
```

## Requirements covered
1. Tool installation (apt / brew / choco, minimum-version checks)
2. Update system
3. Configuration (paths and environment variables)
4. Dependency checker
5. CLI interface and action log
6. Cross-platform package-manager support
