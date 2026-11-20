"""Tool registry: which tools eSim needs and how to find their versions."""
import json
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

REGISTRY_FILE = Path(__file__).with_name("tools.json")


@dataclass
class ToolStatus:
    name: str
    installed: bool
    version: str | None
    min_version: str
    required: bool
    path: str | None

    @property
    def ok(self) -> bool:
        return self.installed and (self.version is None or
                                   parse(self.version) >= parse(self.min_version))


def parse(v: str) -> tuple[int, ...]:
    return tuple(int(x) for x in re.findall(r"\d+", v)[:3])


def load(path: Path = REGISTRY_FILE) -> dict:
    return json.loads(path.read_text())


def check(name: str, spec: dict) -> ToolStatus:
    exe = spec["version_cmd"][0]
    path = shutil.which(exe)
    version = None
    if path:
        try:
            out = subprocess.run(spec["version_cmd"], capture_output=True,
                                 text=True, timeout=10)
            m = re.search(spec["version_regex"], out.stdout + out.stderr)
            version = m.group(1) if m else None
        except (OSError, subprocess.TimeoutExpired):
            pass
    return ToolStatus(name, bool(path), version, spec["min_version"],
                      spec.get("required", False), path)


def check_all(registry: dict | None = None) -> list[ToolStatus]:
    registry = registry or load()
    return [check(n, s) for n, s in registry.items()]
