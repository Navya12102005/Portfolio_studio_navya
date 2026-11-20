"""Command-line interface: python -m esim_tm <command>."""
import argparse
import sys

from . import __version__, config, doctor, installer, registry
from . import platform_utils as pu
from .logger import LOG_FILE

GREEN, RED, YELLOW, RESET = "\033[32m", "\033[31m", "\033[33m", "\033[0m"


def cmd_list(_):
    print(f"OS: {pu.os_name()}   Package manager: {pu.package_manager() or 'none'}\n")
    print(f"{'TOOL':<11}{'STATUS':<14}{'VERSION':<10}{'MIN':<7}REQUIRED")
    for s in registry.check_all():
        if s.ok:
            st = f"{GREEN}ok{RESET}"
        elif s.installed:
            st = f"{YELLOW}outdated{RESET}"
        else:
            st = f"{RED}missing{RESET}"
        print(f"{s.name:<11}{st:<23}{s.version or '-':<10}{s.min_version:<7}"
              f"{'yes' if s.required else 'no'}")


def cmd_check(_):
    bad = [s for s in registry.check_all() if s.required and not s.ok]
    for s in bad:
        print(f"{RED}✗{RESET} {s.name}: needs >= {s.min_version}, found {s.version or 'nothing'}")
    print(f"{GREEN}All required dependencies satisfied.{RESET}" if not bad
          else f"\nRun: python -m esim_tm install --missing")
    return 1 if bad else 0


def cmd_install(a):
    reg = registry.load()
    names = a.tools or [s.name for s in registry.check_all(reg) if not s.ok] if a.missing \
        else a.tools
    if not names:
        print("Nothing to install.")
        return 0
    ok = all(installer.install(n, reg[n], a.dry_run) for n in names if n in reg)
    return 0 if ok else 1


def cmd_update(a):
    reg = registry.load()
    names = a.tools or [s.name for s in registry.check_all(reg) if s.installed]
    ok = all(installer.install(n, reg[n], a.dry_run, upgrade=True) for n in names)
    return 0 if ok else 1


def cmd_configure(_):
    config.write(registry.check_all())
    print(f"Wrote {config.CONFIG_FILE}\nRun: source {config.ENV_FILE}")


def cmd_doctor(a):
    text = open(a.logfile).read() if a.logfile else sys.stdin.read()
    tips = doctor.diagnose(text)
    print("\n".join(f"• {t}" for t in tips) or "No known problems found.")


def cmd_log(_):
    print(LOG_FILE.read_text() if LOG_FILE.exists() else "No actions logged yet.")


def main(argv=None):
    p = argparse.ArgumentParser(prog="esim-tm", description="eSim Automated Tool Manager")
    p.add_argument("--version", action="version", version=__version__)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list", help="show tools, versions and status").set_defaults(f=cmd_list)
    sub.add_parser("check", help="check required dependencies").set_defaults(f=cmd_check)
    for name, fn in (("install", cmd_install), ("update", cmd_update)):
        sp = sub.add_parser(name, help=f"{name} tools")
        sp.add_argument("tools", nargs="*")
        sp.add_argument("--dry-run", action="store_true", help="print commands only")
        if name == "install":
            sp.add_argument("--missing", action="store_true", help="install all missing tools")
        sp.set_defaults(f=fn)
    sub.add_parser("configure", help="write paths and env vars").set_defaults(f=cmd_configure)
    d = sub.add_parser("doctor", help="explain install errors from a log file or stdin")
    d.add_argument("logfile", nargs="?")
    d.set_defaults(f=cmd_doctor)
    sub.add_parser("log", help="show the action log").set_defaults(f=cmd_log)
    a = p.parse_args(argv)
    return a.f(a) or 0


if __name__ == "__main__":
    sys.exit(main())
