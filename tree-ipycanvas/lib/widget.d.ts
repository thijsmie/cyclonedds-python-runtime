import { DOMWidgetModel, DOMWidgetView, WidgetModel, ISerializers, Dict } from '@jupyter-widgets/base';
import { RoughCanvas } from 'roughjs/bin/canvas';
export declare class CanvasManagerModel extends WidgetModel {
    defaults(): {
        _model_name: string;
        _model_module: any;
        _model_module_version: any;
        _view_module: string;
        _view_name: string;
        _view_module_version: string;
        _view_count: number;
    };
    initialize(attributes: any, options: any): void;
    private onCommand;
    private processCommand;
    private switchCanvas;
    private currentCanvas;
    private currentProcessing;
    private canvasesToUpdate;
    static model_name: string;
    static model_module: any;
    static model_module_version: any;
}
export declare class Path2DModel extends WidgetModel {
    defaults(): {
        _model_name: string;
        _model_module: any;
        _model_module_version: any;
        value: string;
        _view_module: string;
        _view_name: string;
        _view_module_version: string;
        _view_count: number;
    };
    initialize(attributes: any, options: any): void;
    value: Path2D;
    static model_name: string;
    static model_module: any;
    static model_module_version: any;
}
export declare class PatternModel extends WidgetModel {
    defaults(): {
        _model_name: string;
        _model_module: any;
        _model_module_version: any;
        image: string;
        repetition: string;
        _view_module: string;
        _view_name: string;
        _view_module_version: string;
        _view_count: number;
    };
    initialize(attributes: any, options: any): Promise<void>;
    static serializers: ISerializers;
    value: CanvasPattern;
    static model_name: string;
    static model_module: any;
    static model_module_version: any;
    static ctx: CanvasRenderingContext2D;
}
declare class GradientModel extends WidgetModel {
    defaults(): {
        _model_module: any;
        _model_module_version: any;
        x0: number;
        y0: number;
        x1: number;
        y1: number;
        color_stops: never[];
        _model_name: string;
        _view_module: string;
        _view_name: string;
        _view_module_version: string;
        _view_count: number;
    };
    initialize(attributes: any, options: any): void;
    protected createGradient(): void;
    value: CanvasGradient;
    static model_module: any;
    static model_module_version: any;
    static ctx: CanvasRenderingContext2D;
}
export declare class LinearGradientModel extends GradientModel {
    defaults(): {
        _model_name: string;
        _model_module: any;
        _model_module_version: any;
        x0: number;
        y0: number;
        x1: number;
        y1: number;
        color_stops: never[];
        _view_module: string;
        _view_name: string;
        _view_module_version: string;
        _view_count: number;
    };
    static model_name: string;
}
export declare class RadialGradientModel extends GradientModel {
    defaults(): {
        _model_name: string;
        r0: number;
        r1: number;
        _model_module: any;
        _model_module_version: any;
        x0: number;
        y0: number;
        x1: number;
        y1: number;
        color_stops: never[];
        _view_module: string;
        _view_name: string;
        _view_module_version: string;
        _view_count: number;
    };
    protected createGradient(): void;
    static model_name: string;
}
export declare class CanvasModel extends DOMWidgetModel {
    defaults(): any;
    static serializers: ISerializers;
    static ATTRS: string[];
    initialize(attributes: any, options: any): void;
    private drawImageData;
    syncViews(): Promise<void>;
    sleep(time: number): Promise<void>;
    fillRect(x: number, y: number, width: number, height: number): void;
    strokeRect(x: number, y: number, width: number, height: number): void;
    drawRects(args: any[], buffers: any, callback: (x: number, y: number, width: number, height: number) => void): void;
    drawStyledRects(args: any[], buffers: any, fill: boolean): void;
    fillArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void;
    strokeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void;
    drawArcs(args: any[], buffers: any, callback: (x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean) => void): void;
    fillCircle(x: number, y: number, radius: number): void;
    strokeCircle(x: number, y: number, radius: number): void;
    drawCircles(args: any[], buffers: any, callback: (x: number, y: number, radius: number) => void): void;
    setStyle(style: any, fill: boolean): void;
    drawStyledCircles(args: any[], buffers: any, fill: boolean): void;
    drawStyledArcs(args: any[], buffers: any, fill: boolean): void;
    drawStyledPolygonOrLineSegments(args: any[], buffers: any, fill: boolean, close: boolean): void;
    drawPolygonOrLineSegments(args: any[], buffers: any, fill: boolean, close: boolean): void;
    strokeLine(args: any[], buffers: any): void;
    strokeLines(args: any[], buffers: any): void;
    fillPolygon(args: any[], buffers: any): void;
    strokePolygon(args: any[], buffers: any): void;
    fillPath(args: any[], buffers: any): Promise<void>;
    drawImage(args: any[], buffers: any): Promise<void>;
    private _drawImage;
    putImageData(args: any[], buffers: any): Promise<void>;
    setAttr(attr: number, value: any): Promise<void>;
    clearCanvas(): void;
    executeCommand(name: string, args?: any[]): void;
    private forEachView;
    private resizeCanvas;
    private syncImageData;
    static model_name: string;
    static model_module: any;
    static model_module_version: any;
    static view_name: string;
    static view_module: any;
    static view_module_version: any;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    views: Dict<Promise<CanvasView>>;
}
export declare class RoughCanvasModel extends CanvasModel {
    static ROUGH_ATTRS: string[];
    defaults(): any;
    initialize(attributes: any, options: any): void;
    fillRect(x: number, y: number, width: number, height: number): void;
    strokeRect(x: number, y: number, width: number, height: number): void;
    fillCircle(x: number, y: number, radius: number): void;
    strokeCircle(x: number, y: number, radius: number): void;
    strokeLine(args: any[], buffers: any): void;
    strokeLines(args: any[], buffers: any): void;
    fillPath(args: any[], buffers: any): Promise<void>;
    fillArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void;
    strokeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void;
    fillPolygon(args: any[], buffers: any): void;
    strokePolygon(args: any[], buffers: any): void;
    setAttr(attr: number, value: any): Promise<void>;
    private getRoughFillStyle;
    private getRoughStrokeStyle;
    static model_name: string;
    roughCanvas: RoughCanvas;
    roughFillStyle: string;
    roughness: number;
    bowing: number;
}
export declare class CanvasView extends DOMWidgetView {
    render(): void;
    clear(): void;
    updateCanvas(): void;
    protected resizeCanvas(): void;
    private onMouseMove;
    private onMouseDown;
    private onMouseUp;
    private onMouseOut;
    private onTouchStart;
    private onTouchEnd;
    private onTouchMove;
    private onTouchCancel;
    private onKeyDown;
    protected getCoordinates(event: MouseEvent | Touch): {
        x: number;
        y: number;
    };
    get tagName(): string;
    el: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    model: CanvasModel | MultiCanvasModel;
}
export declare class MultiCanvasModel extends DOMWidgetModel {
    defaults(): any;
    static serializers: ISerializers;
    initialize(attributes: any, options: any): void;
    get canvasModels(): CanvasModel[];
    private updateCanvasModels;
    private updateCanvas;
    private resizeCanvas;
    private syncImageData;
    private forEachView;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    views: Dict<Promise<MultiCanvasView>>;
    static model_name: string;
    static model_module: any;
    static model_module_version: any;
    static view_name: string;
    static view_module: any;
    static view_module_version: any;
}
export declare class MultiCanvasView extends CanvasView {
    model: MultiCanvasModel;
}
export {};
