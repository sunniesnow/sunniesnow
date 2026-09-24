import Sunniesnow from '../../../Sunniesnow.js';
import PIXI from '../../../pixi.js';

Sunniesnow.JudgementLineBase = class JudgementLineBase extends PIXI.Container {

	static async load() {
	}

	constructor() {
		super();
		this.populate();
	}

	populate() {
		this.label = 'judgement-line';
	}

	update(delta) {
	}

};
