from questing.quest import Quest
from questing.types import CuriousFish, FishType
from cyclonedds.sub import DataReader
from cyclonedds.pub import DataWriter
from cyclonedds.domain import DomainParticipant
from cyclonedds.topic import Topic


class TakenFishyStoryQuest(Quest):
    def __init__(self, journal, seed) -> None:
        super().__init__(
            journal=journal,
            seed=seed,
            name="a-fishy-story"
        )
        self._checkers["fish-reader"] = self._check_fish_reader
        self._checkers["freshly-caught"] = self._check_freshly_caught
        self._sample = CuriousFish(fish_type=FishType.Metallic, dorsal_fins=3, fish_name="Dee")

    def _check_fish_reader(self, value):
        assert isinstance(value, DataReader)
        dp = DomainParticipant()
        DataWriter(dp, Topic(dp, "followers", CuriousFish)).write(self._sample)

    def _check_freshly_caught(self, value):
        assert value.fish_type.value == self._sample.fish_type.value and \
               value.dorsal_fins == self._sample.dorsal_fins and \
               value.fish_name == self._sample.fish_name
