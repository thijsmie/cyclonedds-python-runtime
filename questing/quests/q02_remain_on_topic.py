from questing.quest import Quest
from cyclonedds.topic import Topic

from dataclasses import is_dataclass, fields


class RemainOnTopicQuest(Quest):
    def __init__(self, journal, seed) -> None:
        super().__init__(
            journal=journal,
            seed=seed,
            name="remain-on-topic"
        )
        self._checkers["curious-fish"] = self._check_curious_fish
        self._checkers["followers-topic"] = self._check_followers_topic

    def _check_curious_fish(self, value):
        assert is_dataclass(value)
        fields_ = fields(value)
        assert fields_[0].type.Shimmering.value == 0
        assert fields_[0].type.Matte.value == 1
        assert fields_[0].type.Metallic.value == 2
        assert fields_[1].type == int
        assert fields_[2].type == str

    def _check_followers_topic(self, value):
        assert isinstance(value, Topic)
        assert value.typename == "CuriousFish"
        assert value.name == "followers"
