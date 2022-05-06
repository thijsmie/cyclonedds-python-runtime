from dataclasses import dataclass, field
from typing import List, Dict, Callable, Any
from IPython.display import display, Markdown
from .exc import _StopExecution


class Quest:
    """
    _name: str
    _seed: int
    _journal: object
    _started: bool
    _solved: bool
    _checkers: Dict[str, Callable[[Any], None]]
    _checked: List[bool]
    """

    def __init__(self, *, journal, seed, name):
        self._journal = journal
        self._seed = seed
        self._name = name
        self._checkers = {}
        self._started = False
        self._solved = False
        self._checked = None

    def start(self):
        self._started = True
        self._solved = False
        self._checked = {k: False for k in self._checkers.keys()}

    def finish(self, no_out=False):
        self._started = False
        self._solved = all(self._checked.values())

        if self._solved:
            if hasattr(self, "pre_finish"):
                try:
                    self._pre_finish()
                except:
                    self._solved = False

        if no_out:
            return

        if self._solved:
            display(Markdown(f"<span style=\"color:green\">Quest {self._name} completed.</span>"))
        else:
            display(Markdown(f"<span style=\"color:red\">Quest {self._name} is incomplete.</span>"))

    def check(self, task, item):
        if not self._started:
            return

        if task not in self._checkers:
            display(Markdown("<span style=\"color:red\">No such quest task!</span>"))
        try:
            self._checkers[task](item)
            self._checked[task] = True
        except:
            if self.journal._debug_mode:
                import traceback
                traceback.print_exc()
            display(Markdown(f"<span style=\"color:red\">Check {task} did not succeed.</span>"))
            self._started = False
            self.finish(True)
            raise _StopExecution()

    def __str__(self):
        return f"{self._name} quest"

    __repr__ = __str__
