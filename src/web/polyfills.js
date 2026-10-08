import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';

import {ResizeObserver} from '@juggle/resize-observer';

globalThis.ResizeObserver ??= ResizeObserver;
