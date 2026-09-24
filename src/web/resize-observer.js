// The ResizeObserver that the web build injects into every module that uses it (the
// `inject` option of esbuild in scripts/build-web.mjs). This keeps the polyfill off the
// global object, unlike `globalThis.ResizeObserver ??= ResizeObserver`.
import {ResizeObserver as Polyfill} from '@juggle/resize-observer';

export const ResizeObserver = globalThis.ResizeObserver ?? Polyfill;
