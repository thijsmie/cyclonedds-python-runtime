from questing.types import Island
from ipycanvas import MultiRoughCanvas, hold_canvas
from IPython.display import Markdown, display, HTML
from random import Random
import random
import math

def gen_polygon(seed, center, scale):
    gen = Random(seed)
    ang = [gen.random() for i in range(10)]
    asum = sum(ang) / (2 * math.pi)
    ang_cumulative = [sum([v for v in ang[0:i]], 0.0) for i in range(1, 10)]
    ang = [a / asum for a in ang_cumulative]
    dist = [scale * (1 + gen.random()) for i in range(len(ang_cumulative))]
    gdist = [d * (1 + gen.random()) / 2.0 for d in dist]
    return [
        (r * math.cos(a) + center[0], r * math.sin(a) + center[1]) for (r,a) in zip(dist, ang)
    ], [
        (r * math.cos(a) + center[0], r * math.sin(a) + center[1]) for (r,a) in zip(gdist, ang)
    ]


class MapDraw:
    LAYER_BACKING = 0
    LAYER_ISLANDS = 1
    LAYER_BOATS = 2
    LAYER_BORDER = 3

    def __init__(self, *, islands=None, boats=None, w=None, h=None):
        self.islands = islands or []
        self.boats = boats or []
        self.w = w or 720
        self.h = h or 480

    def draw_backing(self, canvas):
        canvas.roughness = 0
        canvas.fill_style = "#1271a8"
        canvas.line_width = 2.
        canvas.rough_fill_style = 'solid'
        canvas.fill_rect(0, 0, self.w, self.h)
        canvas.roughness = 3
        canvas.fill_style = "#1c84a0"
        canvas.rough_fill_style = "cross-hatch"
        canvas.fill_rect(0, 0, self.w, self.h)

    def draw_islands(self, canvas):
        canvas.line_width = 1.5
        canvas.roughness = 2

        for island in self.islands:
            poly, gpoly = gen_polygon(island.name, (island.X + self.w/2., island.Y + self.h/2.), island.size)
            canvas.line_width = 1.5
            canvas.fill_style = "#c19149"
            canvas.rough_fill_style = "solid"
            canvas.fill_polygon(poly)
            canvas.fill_style = "#a57c3e"
            canvas.rough_fill_style = "hachure"
            canvas.fill_polygon(poly)
            canvas.line_width = 1.1
            canvas.fill_style = "#267f08"
            canvas.rough_fill_style = "cross-hatch"
            canvas.fill_polygon(gpoly)
            canvas.fill_style = "black"
            canvas.font = "25px \"Dancing Script\""
            canvas.text_baseline = "bottom"
            canvas.text_align = "left"
            canvas.fill_text(
                island.name,
                self.w/2. + island.X + island.size - 4,
                self.h/2. + island.Y - island.size - 6
            )

    def draw_boats(self, canvas):
        canvas.line_width = 1.1
        canvas.roughness = 1.7
        canvas.bowing = 0.6
        h = 20.
        w = 42.
        poly1 = [(w/2,0), (w/3, h/2), (2*w/3, h/2)]
        poly2 = [(0, h/2), (w, h/2), (2*w/3, h), (w/3, h)]
        poly3 = [(w/2,h/2), (w/3, h), (2*w/3, h)]

        for boat in self.boats:
            canvas.fill_style = "#f3f3f5"
            canvas.rough_fill_style = "solid"
            poly1_b = [(p[0]+boat.X, p[1]+boat.Y) for p in poly1]
            poly2_b = [(p[0]+boat.X, p[1]+boat.Y) for p in poly2]
            poly3_b = [(p[0]+boat.X, p[1]+boat.Y) for p in poly3]
            canvas.fill_polygon(poly1_b)
            canvas.fill_polygon(poly2_b)
            canvas.stroke_style = "#999999"
            canvas.stroke_polygon(poly3_b)
            canvas.stroke_style = "#111111"
            canvas.stroke_polygon(poly1_b)
            canvas.stroke_polygon(poly2_b)

        canvas.bowing = 1

    def draw_border(self, canvas):
        canvas.roughness = 0
        canvas.fill_style = "#E9C181"
        canvas.rough_fill_style = "solid"
        for (x,y,w,h) in [(0,0,20,self.h), (0,0,self.w,30), (0,self.h-20,self.w,20), (self.w-20,0,20,self.h)]:
            canvas.fill_rect(x,y,w,h)
        canvas.roughness = 2
        canvas.stroke_style = "#ad3c0f"
        canvas.stroke_rect(20, 30, self.w - 40, self.h - 50)

        canvas.fill_style = "#873110"
        canvas.font = "32px \"Dancing Script\""
        canvas.text_baseline = "middle"
        canvas.text_align = "center"
        canvas.fill_text('The Disposed Atolls', self.w/2, 15)

    def draw(self, canvas=None, draw_backing=True, draw_islands=True, draw_boats=True, draw_border=True):
        display(HTML("<style>@import url(\"https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap\")</style>"))

        canvas = canvas or MultiRoughCanvas(
            n_canvases=self.LAYER_BORDER+1,
            width=self.w,
            height=self.h
        )
        with hold_canvas(canvas):
            if draw_backing:
                self.draw_backing(canvas[self.LAYER_BACKING])

            if draw_islands:
                self.draw_islands(canvas[self.LAYER_ISLANDS])

            if draw_boats:
                self.draw_boats(canvas[self.LAYER_BOATS])

            if draw_border:
                self.draw_border(canvas[self.LAYER_BORDER])

        return canvas