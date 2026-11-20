"""Write tool paths into an eSim config file and a shell env script."""
import json
import os

from .logger import HOME, get_logger
from .registry import ToolStatus

CONFIG_FILE = HOME / "config.json"
ENV_FILE = HOME / "env.sh"


def write(statuses: list[ToolStatus]) -> None:
    found = {s.name: s.path for s in statuses if s.path}
    HOME.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps({"tools": found}, indent=2))
    dirs = sorted({os.path.dirname(p) for p in found.values()})
    ENV_FILE.write_text(
        "# Source this file: source ~/.esim-tm/env.sh\n"
        f'export PATH="{":".join(dirs)}:$PATH"\n'
        + (f'export SPICE_LIB_DIR="{os.path.dirname(found["ngspice"])}/../share/ngspice"\n'
           if "ngspice" in found else ""))
    get_logger().info("Wrote config for %d tools", len(found))
