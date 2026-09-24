// The i18n data that used to be fetched from json/i18n/*.json at runtime.
// Listing the files here keeps them in the bundle of both the web build and the
// library build, so that no runtime fetch of the site's data directory is needed.
import languages from '../../data/i18n/languages.json';

import cacheEnUS from '../../data/i18n/cache-en-US.json';
import cacheJaJP from '../../data/i18n/cache-ja-JP.json';
import cacheZhCN from '../../data/i18n/cache-zh-CN.json';
import cacheZhTW from '../../data/i18n/cache-zh-TW.json';
import mainEnUS from '../../data/i18n/main-en-US.json';
import mainJaJP from '../../data/i18n/main-ja-JP.json';
import mainZhCN from '../../data/i18n/main-zh-CN.json';
import mainZhTW from '../../data/i18n/main-zh-TW.json';
import pluginEnUS from '../../data/i18n/plugin-en-US.json';
import pluginJaJP from '../../data/i18n/plugin-ja-JP.json';
import pluginZhCN from '../../data/i18n/plugin-zh-CN.json';
import pluginZhTW from '../../data/i18n/plugin-zh-TW.json';

export default {
	languages,
	sheets: {
		'cache-en-US': cacheEnUS,
		'cache-ja-JP': cacheJaJP,
		'cache-zh-CN': cacheZhCN,
		'cache-zh-TW': cacheZhTW,
		'main-en-US': mainEnUS,
		'main-ja-JP': mainJaJP,
		'main-zh-CN': mainZhCN,
		'main-zh-TW': mainZhTW,
		'plugin-en-US': pluginEnUS,
		'plugin-ja-JP': pluginJaJP,
		'plugin-zh-CN': pluginZhCN,
		'plugin-zh-TW': pluginZhTW,
	},
};
