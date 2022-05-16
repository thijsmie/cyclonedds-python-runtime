"use strict";
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
function getTypedArray(dataview, metadata) {
    switch (metadata.dtype) {
        case 'int8':
            return new Int8Array(dataview.buffer);
            break;
        case 'uint8':
            return new Uint8Array(dataview.buffer);
            break;
        case 'int16':
            return new Int16Array(dataview.buffer);
            break;
        case 'uint16':
            return new Uint16Array(dataview.buffer);
            break;
        case 'int32':
            return new Int32Array(dataview.buffer);
            break;
        case 'uint32':
            return new Uint32Array(dataview.buffer);
            break;
        case 'float32':
            return new Float32Array(dataview.buffer);
            break;
        case 'float64':
            return new Float64Array(dataview.buffer);
            break;
        default:
            throw 'Unknown dtype ' + metadata.dtype;
            break;
    }
}
exports.getTypedArray = getTypedArray;
var Scalar;
(function (Scalar) {
    function isScalar(x) {
        return (x === null ||
            typeof x === 'boolean' ||
            typeof x === 'number' ||
            typeof x === 'string');
    }
    Scalar.isScalar = isScalar;
})(Scalar || (Scalar = {}));
// Buffered argument
class Arg {
}
exports.Arg = Arg;
class ScalarArg extends Arg {
    constructor(value) {
        super();
        this.value = value;
        this.length = Infinity;
    }
    getItem(idx) {
        return this.value;
    }
}
class BufferArg extends Arg {
    constructor(bufferMetadata, buffer) {
        super();
        this.value = getTypedArray(buffer, bufferMetadata);
        this.length = this.value.length;
    }
    getItem(idx) {
        return this.value[idx];
    }
}
function getArg(metadata, buffers) {
    if (Scalar.isScalar(metadata)) {
        return new ScalarArg(metadata);
    }
    if (metadata['idx'] !== undefined) {
        return new BufferArg(metadata, buffers[metadata['idx']]);
    }
    throw 'Could not process argument ' + metadata;
}
exports.getArg = getArg;
function toBlob(canvas) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob == null) {
                    return reject('Unable to create blob');
                }
                resolve(blob);
            });
        });
    });
}
exports.toBlob = toBlob;
function toBytes(canvas) {
    return __awaiter(this, void 0, void 0, function* () {
        const blob = yield toBlob(canvas);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result == 'string' || reader.result == null) {
                    return reject('Unable to read blob');
                }
                const bytes = new Uint8ClampedArray(reader.result);
                resolve(bytes);
            };
            reader.readAsArrayBuffer(blob);
        });
    });
}
exports.toBytes = toBytes;
function fromBytes(array) {
    return __awaiter(this, void 0, void 0, function* () {
        const blob = new Blob([array]);
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.src = URL.createObjectURL(blob);
        });
    });
}
exports.fromBytes = fromBytes;
function bufferToImage(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        let url;
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        url = URL.createObjectURL(blob);
        const img = new Image();
        return new Promise(resolve => {
            img.onload = () => {
                resolve(img);
            };
            img.src = url;
        });
    });
}
exports.bufferToImage = bufferToImage;
//# sourceMappingURL=utils.js.map