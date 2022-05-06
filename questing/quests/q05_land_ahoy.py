from questing.quest import Quest
from questing.types import Island
from questing.mapdraw import MapDraw
from cyclonedds.sub import DataReader
from cyclonedds.pub import DataWriter
from cyclonedds.domain import DomainParticipant
from cyclonedds.topic import Topic
from cyclonedds.core import Listener
from cyclonedds.util import duration

from dataclasses import is_dataclass, fields

from IPython.display import display, Markdown
import random
import math


class LandAhoyQuest(Quest):
    def __init__(self, journal, seed) -> None:
        super().__init__(
            journal=journal,
            seed=seed,
            name="land-ahoy"
        )
        self._checkers["island"] = self._check_island
        self._checkers["writer-written"] = self._check_writer_written
        self._checkers["the-disposed-atolls"] = self._check_the_disposed_atolls
        self._w = 720
        self._h = 480
        self._samples = self._gen_islands()

    def _gen_islands(self):
        islands = []
        rnd_gen = random.Random(self._seed)

        n = ["Partecipante", "Pubblicare", "Sottoscrivi", "", "Leggere", "Scrivi", "Smaltire", ]
        for i in range(7):
            if i == 3:
                continue

            xo = -self._w / 3. + i / 6 * 2 * self._w / 3.
            yo = -self._h / 3. + i / 6 * 2 * self._h / 3.
            ang = 2 * math.pi * (i + rnd_gen.random() * 0.1 - 0.05) / 6.
            dis = 15 + rnd_gen.choice([-1, 1]) * 20 * rnd_gen.random()
            islands.append(Island(
                xo + dis * math.cos(ang),
                yo + dis * math.sin(ang),
                4 + 2 * (5 - abs(i - 5)),
                n[i]
            ))

        return islands

    def start(self):
        super().start()
        self._dp = DomainParticipant()
        self._topic = Topic(self._dp, "DisposedAtolls", Island)
        self._dr = DataReader(self._dp, self._topic)

    def finish(self, no_out=False):
        super().finish(no_out)
        if self._solved:
            display(MapDraw(islands=self._samples + [self._user_sample], w=self._w, h=self._h).draw())

    def _check_island(self, value):
        assert is_dataclass(value)
        fields_ = fields(value)
        assert fields_[0].type == float
        assert fields_[1].type == float
        assert fields_[2].type == float
        assert fields_[3].type == str
        self._user_x_attr = fields_[0].name
        self._user_y_attr = fields_[1].name
        self._user_s_attr = fields_[2].name
        self._user_n_attr = fields_[3].name

    def _check_writer_written(self, value):
        samp = self._dr.read(N=100)
        assert len(samp) == 1
        self._user_sample = samp[0]
        assert self._user_sample.X ** 2 + self._user_sample.Y ** 2 <= 10 ** 2
        assert 1 <= self._user_sample.size <= 10
        self._dr = None

        writer = DataWriter(self._dp, self._topic)

        for sample in self._samples:
            writer.write_dispose(sample)

    def _check_the_disposed_atolls(self, value):
        assert type(value) in [tuple, list]
        assert len(value) == len(self._samples) + 1
        got = [False] * len(self._samples)
        for s in value:
            converted = Island(
                X=getattr(s, self._user_x_attr),
                Y=getattr(s, self._user_y_attr),
                size=getattr(s, self._user_s_attr),
                name=getattr(s, self._user_n_attr)
            )
            for i, n in enumerate(self._samples):
                if n == converted:
                    assert not got[i]
                    got[i] = True
                    break
        assert all(got)