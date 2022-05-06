class _StopExecution(Exception):
    def _render_traceback_(self):
        pass

    def __str__(self):
        return ""

    __repr__ = __str__