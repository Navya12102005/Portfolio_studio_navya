"""Detect the operating system and the available package manager."""
import platform
import shutil

MANAGERS = {
    "Linux": ["apt"],
    "Darwin": ["brew"],
    "Windows": ["choco", "winget"],
}


def os_name() -> str:
    return platform.system()


def package_manager() -> str | None:
    for pm in MANAGERS.get(os_name(), []):
        if shutil.which(pm if pm != "apt" else "apt-get"):
            return pm
    return None


def install_command(pm: str, package: str) -> list[str]:
    return {
        "apt": ["sudo", "apt-get", "install", "-y", package],
        "brew": ["brew", "install", package],
        "choco": ["choco", "install", "-y", package],
        "winget": ["winget", "install", "-e", "--id", package],
    }[pm]


def upgrade_command(pm: str, package: str) -> list[str]:
    return {
        "apt": ["sudo", "apt-get", "install", "--only-upgrade", "-y", package],
        "brew": ["brew", "upgrade", package],
        "choco": ["choco", "upgrade", "-y", package],
        "winget": ["winget", "upgrade", "-e", "--id", package],
    }[pm]
