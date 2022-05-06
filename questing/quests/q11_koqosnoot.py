from questing.quest import Quest

from cyclonedds.qos import Qos, Policy, BasePolicy
from cyclonedds.util import duration

class KoqosnootQuest(Quest):
    def __init__(self, journal, seed) -> None:
        super().__init__(
            journal=journal,
            seed=seed,
            name="koqosnoot"
        )
        self._checkers["policy-0"] = self._check_policy_0
        self._checkers["policy-1"] = self._check_policy_1
        self._checkers["koqosnoot-0"] = self._check_koqosnoot_0
        self._checkers["koqosnoot-1"] = self._check_koqosnoot_1
        self._checkers["koqosnoot-2"] = self._check_koqosnoot_2

    def _check_policy_0(self, value):
        assert value == Policy.Ownership.Exclusive or value == Policy.Ownership.Shared

    def _check_policy_1(self, value):
        assert value == Policy.Liveliness.Automatic(duration(days=2))

    def _check_koqosnoot_0(self, value):
        assert value == Qos(
            Policy.Reliability.Reliable(duration(milliseconds=250)),
            Policy.History.KeepAll
        )

    def _check_koqosnoot_1(self, value):
        assert isinstance(value, Qos)
        assert len(value) == 4

    def _check_koqosnoot_2(self, value):
        assert isinstance(value, Qos)
        assert len(value) == 5
