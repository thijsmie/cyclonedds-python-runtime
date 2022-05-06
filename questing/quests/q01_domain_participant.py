from questing.quest import Quest
from cyclonedds.domain import DomainParticipant


class DomainParticipantQuest(Quest):
    def __init__(self, journal, seed) -> None:
        super().__init__(
            journal=journal,
            seed=seed,
            name="domain-participant"
        )
        self._checkers["domain-participant"] = self._check_participant

    def _check_participant(self, value):
        assert isinstance(value, DomainParticipant)
