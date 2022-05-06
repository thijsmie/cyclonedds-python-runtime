from questing.quest import Quest
from questing.types import CuriousFish, FishType
from cyclonedds.sub import DataReader
from cyclonedds.pub import DataWriter
from cyclonedds.domain import DomainParticipant
from cyclonedds.topic import Topic


class GrowTheFishSupplyQuest(Quest):
    def __init__(self, journal, seed) -> None:
        super().__init__(
            journal=journal,
            seed=seed,
            name="grow-the-fish-supply"
        )
        self._checkers["fish-writer"] = self._check_fish_writer
        self._reader = None

    def start(self):
        self._reader = None
        super().start()

    def _check_fish_writer(self, value):
        assert isinstance(value, DataWriter)
        dp = DomainParticipant()
        self._reader = DataReader(dp, Topic(dp, "followers", CuriousFish))

    def _pre_finish(self):
        assert self._reader.read()
