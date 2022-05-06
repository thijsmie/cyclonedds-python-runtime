from cyclonedds.idl import IdlStruct, IdlEnum
from cyclonedds.idl.annotations import key
from dataclasses import dataclass


class FishType(IdlEnum):
    Shimmering = 0
    Matte = 1
    Metallic = 2


@dataclass
class CuriousFish(IdlStruct, typename="CuriousFish"):
    fish_type: FishType
    dorsal_fins: int
    fish_name: str


@dataclass
class Island(IdlStruct, typename="Island"):
    X: float
    Y: float
    size: float
    name: str
    key('name')


@dataclass
class Wave(IdlStruct, typename="Wave"):
    height: int
    volume: float
