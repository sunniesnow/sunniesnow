import {createRequire} from 'node:module';
import * as PIXI from '@pixi/node';

const require = createRequire(import.meta.url);

export {PIXI, require};
