"use strict";
// Copyright (c) Martin Renou
// Distributed under the terms of the Modified BSD License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer");
const base_1 = require("@jupyter-widgets/base");
const canvas_1 = require("roughjs/bin/canvas");
const version_1 = require("./version");
const utils_1 = require("./utils");
function getContext(canvas) {
    const context = canvas.getContext('2d');
    if (context === null) {
        throw 'Could not create 2d context.';
    }
    return context;
}
function serializeImageData(array) {
    return new DataView(array.buffer.slice(0));
}
function deserializeImageData(dataview) {
    if (dataview === null) {
        return null;
    }
    return new Uint8ClampedArray(dataview.buffer);
}
function createImageFromWidget(image) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the image manually instead of creating an ImageView
        let url;
        const format = image.get('format');
        const value = image.get('value');
        if (format !== 'url') {
            const blob = new Blob([value], { type: `image/${format}` });
            url = URL.createObjectURL(blob);
        }
        else {
            url = new TextDecoder('utf-8').decode(value.buffer);
        }
        const img = new Image();
        return new Promise(resolve => {
            img.onload = () => {
                resolve(img);
            };
            img.src = url;
        });
    });
}
const COMMANDS = [
    'fillRect',
    'strokeRect',
    'fillRects',
    'strokeRects',
    'clearRect',
    'fillArc',
    'fillCircle',
    'strokeArc',
    'strokeCircle',
    'fillArcs',
    'strokeArcs',
    'fillCircles',
    'strokeCircles',
    'strokeLine',
    'beginPath',
    'closePath',
    'stroke',
    'fillPath',
    'fill',
    'moveTo',
    'lineTo',
    'rect',
    'arc',
    'ellipse',
    'arcTo',
    'quadraticCurveTo',
    'bezierCurveTo',
    'fillText',
    'strokeText',
    'setLineDash',
    'drawImage',
    'putImageData',
    'clip',
    'save',
    'restore',
    'translate',
    'rotate',
    'scale',
    'transform',
    'setTransform',
    'resetTransform',
    'set',
    'clear',
    'sleep',
    'fillPolygon',
    'strokePolygon',
    'strokeLines',
    'fillPolygons',
    'strokePolygons',
    'strokeLineSegments',
    'fillStyledRects',
    'strokeStyledRects',
    'fillStyledCircles',
    'strokeStyledCircles',
    'fillStyledArcs',
    'strokeStyledArcs',
    'fillStyledPolygons',
    'strokeStyledPolygons',
    'strokeStyledLineSegments',
    'switchCanvas'
];
class CanvasManagerModel extends base_1.WidgetModel {
    constructor() {
        super(...arguments);
        this.currentProcessing = Promise.resolve();
        this.canvasesToUpdate = [];
    }
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: CanvasManagerModel.model_name, _model_module: CanvasManagerModel.model_module, _model_module_version: CanvasManagerModel.model_module_version });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.on('msg:custom', (command, buffers) => {
            this.currentProcessing = this.currentProcessing.then(() => __awaiter(this, void 0, void 0, function* () {
                yield this.onCommand(command, buffers);
            }));
        });
    }
    onCommand(command, buffers) {
        return __awaiter(this, void 0, void 0, function* () {
            // Retrieve the commands buffer as an object (list of commands)
            const commands = JSON.parse(buffer_1.Buffer.from(utils_1.getTypedArray(buffers[0], command)).toString('utf-8'));
            this.canvasesToUpdate =
                this.currentCanvas !== undefined ? [this.currentCanvas] : [];
            yield this.processCommand(commands, buffers.slice(1, buffers.length));
            for (const canvas of this.canvasesToUpdate) {
                canvas.syncViews();
            }
        });
    }
    processCommand(command, buffers) {
        return __awaiter(this, void 0, void 0, function* () {
            // If it's a list of commands
            if (command instanceof Array && command[0] instanceof Array) {
                let remainingBuffers = buffers;
                for (const subcommand of command) {
                    let subbuffers = [];
                    const nBuffers = subcommand[2];
                    if (nBuffers) {
                        subbuffers = remainingBuffers.slice(0, nBuffers);
                        remainingBuffers = remainingBuffers.slice(nBuffers);
                    }
                    yield this.processCommand(subcommand, subbuffers);
                }
                return;
            }
            const name = COMMANDS[command[0]];
            const args = command[1];
            switch (name) {
                case 'switchCanvas':
                    yield this.switchCanvas(args[0]);
                    this.canvasesToUpdate.push(this.currentCanvas);
                    break;
                case 'sleep':
                    yield this.currentCanvas.sleep(args[0]);
                    break;
                case 'fillRect':
                    this.currentCanvas.fillRect(args[0], args[1], args[2], args[3]);
                    break;
                case 'strokeRect':
                    this.currentCanvas.strokeRect(args[0], args[1], args[2], args[3]);
                    break;
                case 'fillRects':
                    this.currentCanvas.drawRects(args, buffers, this.currentCanvas.fillRect.bind(this.currentCanvas));
                    break;
                case 'strokeRects':
                    this.currentCanvas.drawRects(args, buffers, this.currentCanvas.strokeRect.bind(this.currentCanvas));
                    break;
                case 'fillArc':
                    this.currentCanvas.fillArc(args[0], args[1], args[2], args[3], args[4], args[5]);
                    break;
                case 'strokeArc':
                    this.currentCanvas.strokeArc(args[0], args[1], args[2], args[3], args[4], args[5]);
                    break;
                case 'fillArcs':
                    this.currentCanvas.drawArcs(args, buffers, this.currentCanvas.fillArc.bind(this.currentCanvas));
                    break;
                case 'strokeArcs':
                    this.currentCanvas.drawArcs(args, buffers, this.currentCanvas.strokeArc.bind(this.currentCanvas));
                    break;
                case 'fillCircle':
                    this.currentCanvas.fillCircle(args[0], args[1], args[2]);
                    break;
                case 'strokeCircle':
                    this.currentCanvas.strokeCircle(args[0], args[1], args[2]);
                    break;
                case 'fillCircles':
                    this.currentCanvas.drawCircles(args, buffers, this.currentCanvas.fillCircle.bind(this.currentCanvas));
                    break;
                case 'strokeCircles':
                    this.currentCanvas.drawCircles(args, buffers, this.currentCanvas.strokeCircle.bind(this.currentCanvas));
                    break;
                case 'strokeLine':
                    this.currentCanvas.strokeLine(args, buffers);
                    break;
                case 'strokeLines':
                    this.currentCanvas.strokeLines(args, buffers);
                    break;
                case 'fillPolygon':
                    this.currentCanvas.fillPolygon(args, buffers);
                    break;
                case 'strokePolygon':
                    this.currentCanvas.strokePolygon(args, buffers);
                    break;
                case 'fillPath':
                    yield this.currentCanvas.fillPath(args, buffers);
                    break;
                case 'drawImage':
                    yield this.currentCanvas.drawImage(args, buffers);
                    break;
                case 'putImageData':
                    yield this.currentCanvas.putImageData(args, buffers);
                    break;
                case 'set':
                    yield this.currentCanvas.setAttr(args[0], args[1]);
                    break;
                case 'clear':
                    this.currentCanvas.clearCanvas();
                    break;
                case 'fillPolygons':
                    this.currentCanvas.drawPolygonOrLineSegments(args, buffers, true, true);
                    break;
                case 'strokePolygons':
                    this.currentCanvas.drawPolygonOrLineSegments(args, buffers, false, true);
                    break;
                case 'strokeLineSegments':
                    this.currentCanvas.drawPolygonOrLineSegments(args, buffers, false, false);
                    break;
                case 'fillStyledRects':
                    this.currentCanvas.drawStyledRects(args, buffers, true);
                    break;
                case 'strokeStyledRects':
                    this.currentCanvas.drawStyledRects(args, buffers, false);
                    break;
                case 'fillStyledCircles':
                    this.currentCanvas.drawStyledCircles(args, buffers, true);
                    break;
                case 'strokeStyledCircles':
                    this.currentCanvas.drawStyledCircles(args, buffers, false);
                    break;
                case 'fillStyledArcs':
                    this.currentCanvas.drawStyledArcs(args, buffers, true);
                    break;
                case 'strokeStyledArcs':
                    this.currentCanvas.drawStyledArcs(args, buffers, false);
                    break;
                case 'fillStyledPolygons':
                    this.currentCanvas.drawStyledPolygonOrLineSegments(args, buffers, true, true);
                    break;
                case 'strokeStyledPolygons':
                    this.currentCanvas.drawStyledPolygonOrLineSegments(args, buffers, false, true);
                    break;
                case 'strokeStyledLineSegments':
                    this.currentCanvas.drawStyledPolygonOrLineSegments(args, buffers, false, false);
                    break;
                default:
                    this.currentCanvas.executeCommand(name, args);
                    break;
            }
        });
    }
    switchCanvas(serializedCanvas) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentCanvas = yield base_1.unpack_models(serializedCanvas, this.widget_manager);
        });
    }
}
exports.CanvasManagerModel = CanvasManagerModel;
CanvasManagerModel.model_name = 'CanvasManagerModel';
CanvasManagerModel.model_module = version_1.MODULE_NAME;
CanvasManagerModel.model_module_version = version_1.MODULE_VERSION;
class Path2DModel extends base_1.WidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: Path2DModel.model_name, _model_module: Path2DModel.model_module, _model_module_version: Path2DModel.model_module_version, value: '' });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.value = new Path2D(this.get('value'));
    }
}
exports.Path2DModel = Path2DModel;
Path2DModel.model_name = 'Path2DModel';
Path2DModel.model_module = version_1.MODULE_NAME;
Path2DModel.model_module_version = version_1.MODULE_VERSION;
class PatternModel extends base_1.WidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: PatternModel.model_name, _model_module: PatternModel.model_module, _model_module_version: PatternModel.model_module_version, image: '', repetition: 'repeat' });
    }
    initialize(attributes, options) {
        const _super = Object.create(null, {
            initialize: { get: () => super.initialize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.initialize.call(this, attributes, options);
            const image = this.get('image');
            let patternSource = undefined;
            if (image instanceof CanvasModel || image instanceof MultiCanvasModel) {
                patternSource = image.canvas;
            }
            if (image.get('_model_name') == 'ImageModel') {
                const img = yield createImageFromWidget(image);
                patternSource = img;
            }
            if (patternSource == undefined) {
                throw 'Could not understand the souce for the pattern';
            }
            const pattern = PatternModel.ctx.createPattern(patternSource, this.get('repetition'));
            if (pattern == null) {
                throw 'Could not initialize pattern object';
            }
            this.value = pattern;
        });
    }
}
exports.PatternModel = PatternModel;
PatternModel.serializers = Object.assign(Object.assign({}, base_1.WidgetModel.serializers), { image: { deserialize: base_1.unpack_models } });
PatternModel.model_name = 'PatternModel';
PatternModel.model_module = version_1.MODULE_NAME;
PatternModel.model_module_version = version_1.MODULE_VERSION;
// Global context for creating the gradients
PatternModel.ctx = getContext(document.createElement('canvas'));
class GradientModel extends base_1.WidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_module: GradientModel.model_module, _model_module_version: GradientModel.model_module_version, x0: 0, y0: 0, x1: 0, y1: 0, color_stops: [] });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.createGradient();
        for (const colorStop of this.get('color_stops')) {
            this.value.addColorStop(colorStop[0], colorStop[1]);
        }
    }
    createGradient() {
        this.value = GradientModel.ctx.createLinearGradient(this.get('x0'), this.get('y0'), this.get('x1'), this.get('y1'));
    }
}
GradientModel.model_module = version_1.MODULE_NAME;
GradientModel.model_module_version = version_1.MODULE_VERSION;
// Global context for creating the gradients
GradientModel.ctx = getContext(document.createElement('canvas'));
class LinearGradientModel extends GradientModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: LinearGradientModel.model_name });
    }
}
exports.LinearGradientModel = LinearGradientModel;
LinearGradientModel.model_name = 'LinearGradientModel';
class RadialGradientModel extends GradientModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: RadialGradientModel.model_name, r0: 0, r1: 0 });
    }
    createGradient() {
        this.value = GradientModel.ctx.createRadialGradient(this.get('x0'), this.get('y0'), this.get('r0'), this.get('x1'), this.get('y1'), this.get('r1'));
    }
}
exports.RadialGradientModel = RadialGradientModel;
RadialGradientModel.model_name = 'RadialGradientModel';
class CanvasModel extends base_1.DOMWidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: CanvasModel.model_name, _model_module: CanvasModel.model_module, _model_module_version: CanvasModel.model_module_version, _view_name: CanvasModel.view_name, _view_module: CanvasModel.view_module, _view_module_version: CanvasModel.view_module_version, width: 700, height: 500, sync_image_data: false, image_data: null, _send_client_ready_event: true });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.canvas = document.createElement('canvas');
        this.ctx = getContext(this.canvas);
        this.resizeCanvas();
        this.drawImageData();
        this.on_some_change(['width', 'height'], this.resizeCanvas, this);
        this.on('change:sync_image_data', this.syncImageData.bind(this));
        // this.on('msg:custom', this.onCommand.bind(this));
        if (this.get('_send_client_ready_event')) {
            this.send({ event: 'client_ready' }, {});
        }
    }
    drawImageData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.get('image_data') !== null) {
                const img = yield utils_1.fromBytes(this.get('image_data'));
                this.ctx.drawImage(img, 0, 0);
                this.trigger('new-frame');
            }
        });
    }
    syncViews() {
        return __awaiter(this, void 0, void 0, function* () {
            this.forEachView((view) => {
                view.updateCanvas();
            });
            this.trigger('new-frame');
            this.syncImageData();
        });
    }
    sleep(time) {
        return __awaiter(this, void 0, void 0, function* () {
            this.forEachView((view) => {
                view.updateCanvas();
            });
            this.trigger('new-frame');
            this.syncImageData();
            yield new Promise(resolve => setTimeout(resolve, time));
        });
    }
    fillRect(x, y, width, height) {
        this.ctx.fillRect(x, y, width, height);
    }
    strokeRect(x, y, width, height) {
        this.ctx.strokeRect(x, y, width, height);
    }
    drawRects(args, buffers, callback) {
        const x = utils_1.getArg(args[0], buffers);
        const y = utils_1.getArg(args[1], buffers);
        const width = utils_1.getArg(args[2], buffers);
        const height = utils_1.getArg(args[3], buffers);
        const numberRects = Math.min(x.length, y.length, width.length, height.length);
        for (let idx = 0; idx < numberRects; ++idx) {
            callback(x.getItem(idx), y.getItem(idx), width.getItem(idx), height.getItem(idx));
        }
    }
    drawStyledRects(args, buffers, fill) {
        const x = utils_1.getArg(args[0], buffers);
        const y = utils_1.getArg(args[1], buffers);
        const width = utils_1.getArg(args[2], buffers);
        const height = utils_1.getArg(args[3], buffers);
        const colors = utils_1.getArg(args[4], buffers);
        const alpha = utils_1.getArg(args[5], buffers);
        const numberRects = Math.min(x.length, y.length, width.length, height.length);
        this.ctx.save();
        for (let idx = 0; idx < numberRects; ++idx) {
            // get color for this circle
            const ci = 3 * idx;
            const color = `rgba(${colors.getItem(ci)}, ${colors.getItem(ci + 1)}, ${colors.getItem(ci + 2)}, ${alpha.getItem(idx)})`;
            this.setStyle(color, fill);
            if (fill) {
                this.fillRect(x.getItem(idx), y.getItem(idx), width.getItem(idx), height.getItem(idx));
            }
            else {
                this.strokeRect(x.getItem(idx), y.getItem(idx), width.getItem(idx), height.getItem(idx));
            }
        }
        this.ctx.restore();
    }
    fillArc(x, y, radius, startAngle, endAngle, anticlockwise) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y); // Move to center
        this.ctx.lineTo(x + radius * Math.cos(startAngle), y + radius * Math.sin(startAngle)); // Line to beginning of the arc
        this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        this.ctx.lineTo(x, y); // Line to center
        this.ctx.fill();
        this.ctx.closePath();
    }
    strokeArc(x, y, radius, startAngle, endAngle, anticlockwise) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    drawArcs(args, buffers, callback) {
        const x = utils_1.getArg(args[0], buffers);
        const y = utils_1.getArg(args[1], buffers);
        const radius = utils_1.getArg(args[2], buffers);
        const startAngle = utils_1.getArg(args[3], buffers);
        const endAngle = utils_1.getArg(args[4], buffers);
        const anticlockwise = utils_1.getArg(args[5], buffers);
        const numberArcs = Math.min(x.length, y.length, radius.length, startAngle.length, endAngle.length);
        for (let idx = 0; idx < numberArcs; ++idx) {
            callback(x.getItem(idx), y.getItem(idx), radius.getItem(idx), startAngle.getItem(idx), endAngle.getItem(idx), anticlockwise.getItem(idx));
        }
    }
    fillCircle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();
    }
    strokeCircle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    drawCircles(args, buffers, callback) {
        const x = utils_1.getArg(args[0], buffers);
        const y = utils_1.getArg(args[1], buffers);
        const radius = utils_1.getArg(args[2], buffers);
        const numberCircles = Math.min(x.length, y.length, radius.length);
        for (let idx = 0; idx < numberCircles; ++idx) {
            callback(x.getItem(idx), y.getItem(idx), radius.getItem(idx));
        }
    }
    setStyle(style, fill) {
        if (fill) {
            this.ctx.fillStyle = style;
        }
        else {
            this.ctx.strokeStyle = style;
        }
    }
    drawStyledCircles(args, buffers, fill) {
        const x = utils_1.getArg(args[0], buffers);
        const y = utils_1.getArg(args[1], buffers);
        const radius = utils_1.getArg(args[2], buffers);
        const colors = utils_1.getArg(args[3], buffers);
        const alpha = utils_1.getArg(args[4], buffers);
        const numberCircles = Math.min(x.length, y.length, radius.length);
        this.ctx.save();
        for (let idx = 0; idx < numberCircles; ++idx) {
            // get color for this circle
            const ci = 3 * idx;
            const color = `rgba(${colors.getItem(ci)}, ${colors.getItem(ci + 1)}, ${colors.getItem(ci + 2)}, ${alpha.getItem(idx)})`;
            this.setStyle(color, fill);
            if (fill) {
                this.fillCircle(x.getItem(idx), y.getItem(idx), radius.getItem(idx));
            }
            else {
                this.strokeCircle(x.getItem(idx), y.getItem(idx), radius.getItem(idx));
            }
        }
        this.ctx.restore();
    }
    drawStyledArcs(args, buffers, fill) {
        const x = utils_1.getArg(args[0], buffers);
        const y = utils_1.getArg(args[1], buffers);
        const radius = utils_1.getArg(args[2], buffers);
        const startAngle = utils_1.getArg(args[3], buffers);
        const endAngle = utils_1.getArg(args[4], buffers);
        const anticlockwise = utils_1.getArg(args[5], buffers);
        const colors = utils_1.getArg(args[6], buffers);
        const alpha = utils_1.getArg(args[7], buffers);
        const numberArcs = Math.min(x.length, y.length, radius.length, startAngle.length, endAngle.length);
        this.ctx.save();
        for (let idx = 0; idx < numberArcs; ++idx) {
            // get color for this circle
            const ci = 3 * idx;
            const color = `rgba(${colors.getItem(ci)}, ${colors.getItem(ci + 1)}, ${colors.getItem(ci + 2)}, ${alpha.getItem(idx)})`;
            this.setStyle(color, fill);
            if (fill) {
                this.fillArc(x.getItem(idx), y.getItem(idx), radius.getItem(idx), startAngle.getItem(idx), endAngle.getItem(idx), anticlockwise.getItem(idx));
            }
            else {
                this.strokeArc(x.getItem(idx), y.getItem(idx), radius.getItem(idx), startAngle.getItem(idx), endAngle.getItem(idx), anticlockwise.getItem(idx));
            }
        }
        this.ctx.restore();
    }
    drawStyledPolygonOrLineSegments(args, buffers, fill, close) {
        const numPolygons = args[0];
        const points = utils_1.getArg(args[1], buffers);
        const sizes = utils_1.getArg(args[2], buffers);
        const colors = utils_1.getArg(args[3], buffers);
        const alpha = utils_1.getArg(args[4], buffers);
        this.ctx.save();
        let start = 0;
        for (let idx = 0; idx < numPolygons; ++idx) {
            // get color for this circle
            const ci = 3 * idx;
            const color = `rgba(${colors.getItem(ci)}, ${colors.getItem(ci + 1)}, ${colors.getItem(ci + 2)}, ${alpha.getItem(idx)})`;
            this.setStyle(color, fill);
            // start / stop in the points array fr this polygon
            const size = sizes.getItem(idx) * 2;
            const stop = start + size;
            // Move to the first point, then create lines between points
            this.ctx.beginPath();
            this.ctx.moveTo(points.getItem(start), points.getItem(start + 1));
            // draw all points of the polygon (except start)
            for (let idp = start + 2; idp < stop; idp += 2) {
                this.ctx.lineTo(points.getItem(idp), points.getItem(idp + 1));
            }
            start = stop;
            if (close) {
                this.ctx.closePath();
            }
            fill ? this.ctx.fill() : this.ctx.stroke();
        }
        this.ctx.restore();
    }
    drawPolygonOrLineSegments(args, buffers, fill, close) {
        const numPolygons = args[0];
        const points = utils_1.getArg(args[1], buffers);
        const sizes = utils_1.getArg(args[2], buffers);
        let start = 0;
        for (let idx = 0; idx < numPolygons; ++idx) {
            // start / stop in the points array fr this polygon
            const size = sizes.getItem(idx) * 2;
            const stop = start + size;
            // Move to the first point, then create lines between points
            this.ctx.beginPath();
            this.ctx.moveTo(points.getItem(start), points.getItem(start + 1));
            // draw all points of the polygon (except start)
            for (let idp = start + 2; idp < stop; idp += 2) {
                this.ctx.lineTo(points.getItem(idp), points.getItem(idp + 1));
            }
            start = stop;
            if (close) {
                this.ctx.closePath();
            }
            fill ? this.ctx.fill() : this.ctx.stroke();
        }
    }
    strokeLine(args, buffers) {
        this.ctx.beginPath();
        this.ctx.moveTo(args[0], args[1]);
        this.ctx.lineTo(args[2], args[3]);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    strokeLines(args, buffers) {
        this.ctx.beginPath();
        const points = utils_1.getArg(args[0], buffers);
        // Move to the first point, then create lines between points
        this.ctx.moveTo(points.getItem(0), points.getItem(1));
        for (let idx = 2; idx < points.length; idx += 2) {
            this.ctx.lineTo(points.getItem(idx), points.getItem(idx + 1));
        }
        this.ctx.stroke();
        this.ctx.closePath();
    }
    fillPolygon(args, buffers) {
        this.ctx.beginPath();
        const points = utils_1.getArg(args[0], buffers);
        // Move to the first point, then create lines between points
        this.ctx.moveTo(points.getItem(0), points.getItem(1));
        for (let idx = 2; idx < points.length; idx += 2) {
            this.ctx.lineTo(points.getItem(idx), points.getItem(idx + 1));
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    strokePolygon(args, buffers) {
        this.ctx.beginPath();
        const points = utils_1.getArg(args[0], buffers);
        // Move to the first point, then create lines between points
        this.ctx.moveTo(points.getItem(0), points.getItem(1));
        for (let idx = 2; idx < points.length; idx += 2) {
            this.ctx.lineTo(points.getItem(idx), points.getItem(idx + 1));
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }
    fillPath(args, buffers) {
        return __awaiter(this, void 0, void 0, function* () {
            const [serializedPath] = args;
            const path = yield base_1.unpack_models(serializedPath, this.widget_manager);
            this.ctx.fill(path.value);
        });
    }
    drawImage(args, buffers) {
        return __awaiter(this, void 0, void 0, function* () {
            const [serializedImage, x, y, width, height] = args;
            const image = yield base_1.unpack_models(serializedImage, this.widget_manager);
            if (image instanceof CanvasModel || image instanceof MultiCanvasModel) {
                this._drawImage(image.canvas, x, y, width, height);
                return;
            }
            if (image.get('_model_name') == 'ImageModel') {
                const img = yield createImageFromWidget(image);
                this._drawImage(img, x, y, width, height);
            }
        });
    }
    _drawImage(image, x, y, width, height) {
        if (width === undefined || height === undefined) {
            this.ctx.drawImage(image, x, y);
        }
        else {
            this.ctx.drawImage(image, x, y, width, height);
        }
    }
    putImageData(args, buffers) {
        return __awaiter(this, void 0, void 0, function* () {
            const [x, y] = args;
            const image = yield utils_1.bufferToImage(buffers[0]);
            this._drawImage(image, x, y);
        });
    }
    setAttr(attr, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof value === 'string' && value.startsWith('IPY')) {
                const widgetModel = yield base_1.unpack_models(value, this.widget_manager);
                value = widgetModel.value;
            }
            this.ctx[CanvasModel.ATTRS[attr]] = value;
        });
    }
    clearCanvas() {
        this.forEachView((view) => {
            view.clear();
        });
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    executeCommand(name, args = []) {
        this.ctx[name](...args);
    }
    forEachView(callback) {
        for (const view_id in this.views) {
            this.views[view_id].then((view) => {
                callback(view);
            });
        }
    }
    resizeCanvas() {
        this.canvas.setAttribute('width', this.get('width'));
        this.canvas.setAttribute('height', this.get('height'));
    }
    syncImageData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.get('sync_image_data')) {
                return;
            }
            const bytes = yield utils_1.toBytes(this.canvas);
            this.set('image_data', bytes);
            this.save_changes();
        });
    }
}
exports.CanvasModel = CanvasModel;
CanvasModel.serializers = Object.assign(Object.assign({}, base_1.DOMWidgetModel.serializers), { image_data: {
        serialize: serializeImageData,
        deserialize: deserializeImageData
    } });
CanvasModel.ATTRS = [
    'fillStyle',
    'strokeStyle',
    'globalAlpha',
    'font',
    'textAlign',
    'textBaseline',
    'direction',
    'globalCompositeOperation',
    'lineWidth',
    'lineCap',
    'lineJoin',
    'miterLimit',
    'lineDashOffset',
    'shadowOffsetX',
    'shadowOffsetY',
    'shadowBlur',
    'shadowColor',
    'filter'
];
CanvasModel.model_name = 'CanvasModel';
CanvasModel.model_module = version_1.MODULE_NAME;
CanvasModel.model_module_version = version_1.MODULE_VERSION;
CanvasModel.view_name = 'CanvasView';
CanvasModel.view_module = version_1.MODULE_NAME;
CanvasModel.view_module_version = version_1.MODULE_VERSION;
class RoughCanvasModel extends CanvasModel {
    constructor() {
        super(...arguments);
        this.roughFillStyle = 'hachure';
        this.roughness = 1;
        this.bowing = 1;
    }
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: RoughCanvasModel.model_name });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.roughCanvas = new canvas_1.RoughCanvas(this.canvas);
    }
    fillRect(x, y, width, height) {
        this.roughCanvas.rectangle(x, y, width, height, this.getRoughFillStyle());
    }
    strokeRect(x, y, width, height) {
        this.roughCanvas.rectangle(x, y, width, height, this.getRoughStrokeStyle());
    }
    fillCircle(x, y, radius) {
        this.roughCanvas.circle(x, y, 2 * radius, this.getRoughFillStyle());
    }
    strokeCircle(x, y, radius) {
        this.roughCanvas.circle(x, y, 2 * radius, this.getRoughStrokeStyle());
    }
    strokeLine(args, buffers) {
        this.roughCanvas.line(args[0], args[1], args[2], args[3], this.getRoughStrokeStyle());
    }
    strokeLines(args, buffers) {
        const points = utils_1.getArg(args[0], buffers);
        const polygon = [];
        for (let idx = 0; idx < points.length; idx += 2) {
            polygon.push([points.getItem(idx), points.getItem(idx + 1)]);
        }
        this.roughCanvas.linearPath(polygon, this.getRoughStrokeStyle());
    }
    fillPath(args, buffers) {
        return __awaiter(this, void 0, void 0, function* () {
            const [serializedPath] = args;
            const path = yield base_1.unpack_models(serializedPath, this.widget_manager);
            this.roughCanvas.path(path.get('value'), this.getRoughFillStyle());
        });
    }
    fillArc(x, y, radius, startAngle, endAngle, anticlockwise) {
        const ellipseSize = 2 * radius;
        // The following is needed because roughjs does not allow a clockwise draw
        const start = anticlockwise ? endAngle : startAngle;
        const end = anticlockwise ? startAngle + 2 * Math.PI : endAngle;
        this.roughCanvas.arc(x, y, ellipseSize, ellipseSize, start, end, true, this.getRoughFillStyle());
    }
    strokeArc(x, y, radius, startAngle, endAngle, anticlockwise) {
        const ellipseSize = 2 * radius;
        // The following is needed because roughjs does not allow a clockwise draw
        const start = anticlockwise ? endAngle : startAngle;
        const end = anticlockwise ? startAngle + 2 * Math.PI : endAngle;
        this.roughCanvas.arc(x, y, ellipseSize, ellipseSize, start, end, false, this.getRoughStrokeStyle());
    }
    fillPolygon(args, buffers) {
        const points = utils_1.getArg(args[0], buffers);
        const polygon = [];
        for (let idx = 0; idx < points.length; idx += 2) {
            polygon.push([points.getItem(idx), points.getItem(idx + 1)]);
        }
        this.roughCanvas.polygon(polygon, this.getRoughFillStyle());
    }
    strokePolygon(args, buffers) {
        const points = utils_1.getArg(args[0], buffers);
        const polygon = [];
        for (let idx = 0; idx < points.length; idx += 2) {
            polygon.push([points.getItem(idx), points.getItem(idx + 1)]);
        }
        this.roughCanvas.polygon(polygon, this.getRoughStrokeStyle());
    }
    setAttr(attr, value) {
        const _super = Object.create(null, {
            setAttr: { get: () => super.setAttr }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (RoughCanvasModel.ROUGH_ATTRS[attr]) {
                this[RoughCanvasModel.ROUGH_ATTRS[attr]] = value;
                return;
            }
            yield _super.setAttr.call(this, attr, value);
        });
    }
    getRoughFillStyle() {
        const fill = this.ctx.fillStyle;
        const lineWidth = this.ctx.lineWidth;
        return {
            fill,
            fillStyle: this.roughFillStyle,
            fillWeight: lineWidth / 2,
            hachureGap: lineWidth * 4,
            curveStepCount: 18,
            strokeWidth: 0.001,
            roughness: this.roughness,
            bowing: this.bowing
        };
    }
    getRoughStrokeStyle() {
        const stroke = this.ctx.strokeStyle;
        const lineWidth = this.ctx.lineWidth;
        return {
            stroke,
            strokeWidth: lineWidth,
            roughness: this.roughness,
            bowing: this.bowing,
            curveStepCount: 18
        };
    }
}
exports.RoughCanvasModel = RoughCanvasModel;
RoughCanvasModel.ROUGH_ATTRS = new Array(100).concat([
    'roughFillStyle',
    'roughness',
    'bowing'
]);
RoughCanvasModel.model_name = 'RoughCanvasModel';
class CanvasView extends base_1.DOMWidgetView {
    render() {
        this.ctx = getContext(this.el);
        this.resizeCanvas();
        this.model.on_some_change(['width', 'height'], this.resizeCanvas, this);
        this.el.addEventListener('mousemove', {
            handleEvent: this.onMouseMove.bind(this)
        });
        this.el.addEventListener('mousedown', {
            handleEvent: this.onMouseDown.bind(this)
        });
        this.el.addEventListener('mouseup', {
            handleEvent: this.onMouseUp.bind(this)
        });
        this.el.addEventListener('mouseout', {
            handleEvent: this.onMouseOut.bind(this)
        });
        this.el.addEventListener('touchstart', {
            handleEvent: this.onTouchStart.bind(this)
        });
        this.el.addEventListener('touchend', {
            handleEvent: this.onTouchEnd.bind(this)
        });
        this.el.addEventListener('touchmove', {
            handleEvent: this.onTouchMove.bind(this)
        });
        this.el.addEventListener('touchcancel', {
            handleEvent: this.onTouchCancel.bind(this)
        });
        this.el.addEventListener('keydown', {
            handleEvent: this.onKeyDown.bind(this)
        });
        this.el.setAttribute('tabindex', '0');
        this.updateCanvas();
    }
    clear() {
        this.ctx.clearRect(0, 0, this.el.width, this.el.height);
    }
    updateCanvas() {
        this.clear();
        this.ctx.drawImage(this.model.canvas, 0, 0);
    }
    resizeCanvas() {
        this.el.setAttribute('width', this.model.get('width'));
        this.el.setAttribute('height', this.model.get('height'));
    }
    onMouseMove(event) {
        this.model.send(Object.assign({ event: 'mouse_move' }, this.getCoordinates(event)), {});
    }
    onMouseDown(event) {
        // Bring focus to the canvas element, so keyboard events can be triggered
        this.el.focus();
        this.model.send(Object.assign({ event: 'mouse_down' }, this.getCoordinates(event)), {});
    }
    onMouseUp(event) {
        this.model.send(Object.assign({ event: 'mouse_up' }, this.getCoordinates(event)), {});
    }
    onMouseOut(event) {
        this.model.send(Object.assign({ event: 'mouse_out' }, this.getCoordinates(event)), {});
    }
    onTouchStart(event) {
        const touches = Array.from(event.touches);
        this.model.send({
            event: 'touch_start',
            touches: touches.map(this.getCoordinates.bind(this))
        }, {});
    }
    onTouchEnd(event) {
        const touches = Array.from(event.touches);
        this.model.send({
            event: 'touch_end',
            touches: touches.map(this.getCoordinates.bind(this))
        }, {});
    }
    onTouchMove(event) {
        const touches = Array.from(event.touches);
        this.model.send({
            event: 'touch_move',
            touches: touches.map(this.getCoordinates.bind(this))
        }, {});
    }
    onTouchCancel(event) {
        const touches = Array.from(event.touches);
        this.model.send({
            event: 'touch_cancel',
            touches: touches.map(this.getCoordinates.bind(this))
        }, {});
    }
    onKeyDown(event) {
        event.preventDefault();
        event.stopPropagation();
        this.model.send({
            event: 'key_down',
            key: event.key,
            shift_key: event.shiftKey,
            ctrl_key: event.ctrlKey,
            meta_key: event.metaKey
        }, {});
    }
    getCoordinates(event) {
        const rect = this.el.getBoundingClientRect();
        const x = (this.el.width * (event.clientX - rect.left)) / rect.width;
        const y = (this.el.height * (event.clientY - rect.top)) / rect.height;
        return { x, y };
    }
    get tagName() {
        return 'canvas';
    }
}
exports.CanvasView = CanvasView;
class MultiCanvasModel extends base_1.DOMWidgetModel {
    defaults() {
        return Object.assign(Object.assign({}, super.defaults()), { _model_name: MultiCanvasModel.model_name, _model_module: MultiCanvasModel.model_module, _model_module_version: MultiCanvasModel.model_module_version, _view_name: MultiCanvasModel.view_name, _view_module: MultiCanvasModel.view_module, _view_module_version: MultiCanvasModel.view_module_version, _canvases: [], sync_image_data: false, image_data: null, width: 700, height: 500 });
    }
    initialize(attributes, options) {
        super.initialize(attributes, options);
        this.canvas = document.createElement('canvas');
        this.ctx = getContext(this.canvas);
        this.resizeCanvas();
        this.on_some_change(['width', 'height'], this.resizeCanvas, this);
        this.on('change:_canvases', this.updateCanvasModels.bind(this));
        this.on('change:sync_image_data', this.syncImageData.bind(this));
        this.updateCanvasModels();
    }
    get canvasModels() {
        return this.get('_canvases');
    }
    updateCanvasModels() {
        // TODO: Remove old listeners
        for (const canvasModel of this.canvasModels) {
            canvasModel.on('new-frame', this.updateCanvas, this);
        }
        this.updateCanvas();
    }
    updateCanvas() {
        this.ctx.clearRect(0, 0, this.get('width'), this.get('height'));
        for (const canvasModel of this.canvasModels) {
            this.ctx.drawImage(canvasModel.canvas, 0, 0);
        }
        this.forEachView((view) => {
            view.updateCanvas();
        });
        this.syncImageData();
    }
    resizeCanvas() {
        this.canvas.setAttribute('width', this.get('width'));
        this.canvas.setAttribute('height', this.get('height'));
    }
    syncImageData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.get('sync_image_data')) {
                return;
            }
            const bytes = yield utils_1.toBytes(this.canvas);
            this.set('image_data', bytes);
            this.save_changes();
        });
    }
    forEachView(callback) {
        for (const view_id in this.views) {
            this.views[view_id].then((view) => {
                callback(view);
            });
        }
    }
}
exports.MultiCanvasModel = MultiCanvasModel;
MultiCanvasModel.serializers = Object.assign(Object.assign({}, base_1.DOMWidgetModel.serializers), { _canvases: { deserialize: base_1.unpack_models }, image_data: {
        serialize: (bytes) => {
            return new DataView(bytes.buffer.slice(0));
        }
    } });
MultiCanvasModel.model_name = 'MultiCanvasModel';
MultiCanvasModel.model_module = version_1.MODULE_NAME;
MultiCanvasModel.model_module_version = version_1.MODULE_VERSION;
MultiCanvasModel.view_name = 'MultiCanvasView';
MultiCanvasModel.view_module = version_1.MODULE_NAME;
MultiCanvasModel.view_module_version = version_1.MODULE_VERSION;
class MultiCanvasView extends CanvasView {
}
exports.MultiCanvasView = MultiCanvasView;
//# sourceMappingURL=widget.js.map