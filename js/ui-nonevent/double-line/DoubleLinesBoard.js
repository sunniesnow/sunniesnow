Sunniesnow.DoubleLinesBoard = class DoubleLinesBoard extends PIXI.Container {

	clear() {
		for (const child of this.children) {
			child.destroy({children: true});
		}
		this.removeChildren();
	}

	add(doubleLine) {
		this.addChild(doubleLine);
	}

	update(delta) {
		for (const child of this.children) {
			if (child.uiEvent.state === 'finished') {
				child.destroy({children: true});
				this.removeChild(child);
			}
		}
	}

};
