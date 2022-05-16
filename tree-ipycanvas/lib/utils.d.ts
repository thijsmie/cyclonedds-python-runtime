export declare function getTypedArray(dataview: any, metadata: any): Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
export declare abstract class Arg {
    abstract getItem(idx: number): any;
    length: number;
}
export declare function getArg(metadata: any, buffers: any): Arg;
export declare function toBlob(canvas: HTMLCanvasElement): Promise<Blob>;
export declare function toBytes(canvas: HTMLCanvasElement): Promise<Uint8ClampedArray>;
export declare function fromBytes(array: Uint8ClampedArray): Promise<HTMLImageElement>;
export declare function bufferToImage(buffer: any): Promise<HTMLImageElement>;
