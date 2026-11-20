"""Install and upgrade tools through the system package manager."""
import subprocess

from . import platform_utils as pu
from .logger import get_logger


def run(cmd: list[str], dry_run: bool) -> bool:
    log = get_logger()
    log.info("RUN %s%s", " ".join(cmd), " (dry-run)" if dry_run else "")
    print(("[dry-run] " if dry_run else "$ ") + " ".join(cmd))
    if dry_run:
        return True
    result = subprocess.run(cmd)
    if result.returncode != 0:
        log.error("FAILED %s (exit %s)", cmd, result.returncode)
    return result.returncode == 0


def _package(name: str, spec: dict, pm: str) -> str | None:
    return spec.get("packages", {}).get(pm)


def install(name: str, spec: dict, dry_run: bool = False, upgrade: bool = False) -> bool:
    pm = pu.package_manager()
    if not pm:
        print(f"No supported package manager found on {pu.os_name()}.")
        return False
    pkg = _package(name, spec, pm)
    if not pkg:
        print(f"{name}: no package defined for {pm}; install it manually.")
        return False
    cmd = (pu.upgrade_command if upgrade else pu.install_command)(pm, pkg)
    return run(cmd, dry_run)
