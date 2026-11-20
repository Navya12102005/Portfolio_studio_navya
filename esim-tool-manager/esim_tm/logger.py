"""Action log stored at ~/.esim-tm/actions.log."""
import logging
from pathlib import Path

HOME = Path.home() / ".esim-tm"
LOG_FILE = HOME / "actions.log"


def get_logger() -> logging.Logger:
    HOME.mkdir(parents=True, exist_ok=True)
    log = logging.getLogger("esim_tm")
    if not log.handlers:
        h = logging.FileHandler(LOG_FILE)
        h.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
        log.addHandler(h)
        log.setLevel(logging.INFO)
    return log
