"""Turn common installation errors into plain-English fixes."""
import re

RULES = [
    (r"Unable to locate package (\S+)",
     "apt cannot find '{0}'. Run `sudo apt-get update`, then enable the 'universe' repository."),
    (r"Could not get lock",
     "Another apt process is running. Wait for it to finish, or close Software Updater."),
    (r"externally-managed-environment",
     "Ubuntu 23.04+ blocks system-wide pip. Use a venv: `python3 -m venv .venv`."),
    (r"Permission denied",
     "Re-run the command with sudo, or check the file permissions."),
    (r"llvm.*(not found|unmet)",
     "LLVM version mismatch. Install the version from your distro: `apt-cache search llvm`."),
    (r"No module named '?(\w+)",
     "Python module '{0}' is missing. Install it with `pip install {0}` inside your venv."),
]


def diagnose(text: str) -> list[str]:
    tips = []
    for pattern, tip in RULES:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            tips.append(tip.format(*m.groups()))
    return tips
