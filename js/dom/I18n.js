Sunniesnow.I18n = {
	FALLBACK_LANG: 'en-US',

	labelNodes: new Map(),
	sheets: {},

	async init() {
		this.langSelect = Sunniesnow.Settings.s.langSelect;
		const availableLangs = new Set();
		for (const [lang, langName] of Object.entries(await Sunniesnow.ScriptsLoader.json('i18n/languages'))) {
			const element = document.createElement('option');
			element.value = lang;
			element.innerText = langName;
			this.langSelect.element.appendChild(element);
			availableLangs.add(lang);
		}
		this.langSelect.addEventListener('change', event => this.setLang());
		this.setLang(localStorage.getItem('lang') ?? navigator.languages.find(lang => this.availableLangs.has(lang)) ?? this.FALLBACK_LANG);
	},

	setLang(lang) {
		this.lang = lang ?? this.langSelect.get();
		localStorage.setItem('lang', this.lang);
		this.langSelect.set(this.lang);
		this.apply();
	},

	async sheet(name) {
		if (this.sheets[this.lang]?.[name]) {
			return this.sheets[this.lang][name];
		}
		const result = (this.sheets[this.lang] ??= {})[name] = await Sunniesnow.ScriptsLoader.json(`i18n/${name}-${this.lang}`);
		if (this.lang !== this.FALLBACK_LANG) {
			const fallbackSheet = (this.sheets[this.FALLBACK_LANG] ??= {})[name] ??= await Sunniesnow.ScriptsLoader.json(`i18n/${name}-${this.FALLBACK_LANG}`);
			for (const key in fallbackSheet) {
				result[key] = Object.assign({}, fallbackSheet[key], result[key] ?? {})
			}
		}
		return result;
	},

	async apply(element) {
		element ??= document.getElementById('main-wrapper');
		const sheetName = element.dataset.i18n;
		const suffix = element.dataset.i18nSuffix ?? '';
		const sheet = await this.sheet(sheetName);
		for (const [id, contents] of Object.entries(sheet.directReplacements)) {
			element.querySelector(`#${id}${suffix}`).innerHTML = contents;
		}
		if (this.labelNodes.has(element)) {
			for (const child of this.labelNodes.get(element)) {
				child.remove();
			}
		} else {
			this.labelNodes.set(element, []);
		}
		const labelNodes = this.labelNodes.get(element);
		labelNodes.length = 0;
		for (const [id, contents] of Object.entries(sheet.labels)) {
			this.applyLabel(element.querySelector(`#${id}${suffix}`), contents, labelNodes);
		}
		for (const child of element.querySelectorAll('[data-i18n]')) {
			if (child.style.display === 'none') { // list item template
				continue;
			}
			await this.apply(child);
		}
	},

	applyLabel(centralNode, labelContents, outArray) {
		const [before, after] = labelContents instanceof Array ? labelContents : [
			'radio', 'checkbox'
		].includes(centralNode.type) ? ['', labelContents] : [labelContents, ''];
		if (before) {
			const beforeNode = document.createElement('label');
			beforeNode.innerHTML = before;
			beforeNode.setAttribute('for', centralNode.id);
			centralNode.before(beforeNode);
			if (['radio', 'checkbox'].includes(beforeNode.previousElementSibling?.type)) {
				beforeNode.addEventListener('click', event => beforeNode.previousElementSibling.click());
			}
			outArray.push(beforeNode);
		}
		if (after) {
			const afterNode = document.createElement('label');
			afterNode.innerHTML = after;
			afterNode.setAttribute('for', centralNode.id);
			centralNode.after(afterNode);
			outArray.push(afterNode);
		}
	},

};
