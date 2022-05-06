import random
import sys
from .exc import _StopExecution
from .quests.q01_domain_participant import DomainParticipantQuest
from .quests.q02_remain_on_topic import RemainOnTopicQuest
from .quests.q03_taken_fishy_story import TakenFishyStoryQuest
from .quests.q04_grow_the_fish_supply import GrowTheFishSupplyQuest
from .quests.q05_land_ahoy import LandAhoyQuest
from .quests.q11_koqosnoot import KoqosnootQuest
from .quests.q12_hey_listen import HeyListenQuest


class Journal:
    _debug_mode = True
    _questscls_ch1 = [
        DomainParticipantQuest,
        RemainOnTopicQuest,
        TakenFishyStoryQuest,
        GrowTheFishSupplyQuest,
        LandAhoyQuest
    ]
    _questscls_ch2 = [
        KoqosnootQuest,
        HeyListenQuest,
    ]

    def __init__(self, seed=None, chapter=1):
        self._seed = seed or random.randrange(sys.maxsize)
        self._randomizer = random.Random(self._seed)
        self._quest_index = 0
        quest_cls = [None, self._questscls_ch1, self._questscls_ch2][chapter]
        self._quests = [cls(self, self._randomizer.randrange(sys.maxsize)) for cls in quest_cls]

    @property
    def seed(self):
        return self._seed

    def quest(self, name):
        for i, quest in enumerate(self._quests):
            if quest._name == name:
                quest.journal = self
                return quest
            if not quest._solved:
                print(f"You did not finish previous quest {quest._name} yet!")
                raise _StopExecution
        print(f"Arrr I do not know what you are talking about! There be no such thing as the {name} quest!")
        raise _StopExecution