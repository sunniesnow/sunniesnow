Sunniesnow.PinnedCoordinates = {

	init() {
		this.span = document.getElementById('pinned-coordinates');
		this.pointToItem = new WeakMap();
		this.itemToPoint = new WeakMap();
		this.input = document.getElementById('pinned-coordinates-input');
		this.input.addEventListener('keydown', event => {
			if (event.key === 'Escape') {
				event.preventDefault();
				this.stopEditting();
				return;
			}
			if (event.key !== 'Enter') {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			const debugBoard = Sunniesnow.game?.debugBoard;
			if (!debugBoard) {
				Sunniesnow.Logs.warn('Debug UI is not available');
				return;
			}
			const string = this.input.value;
			const regex = /^[,\s\(]*([+\-]?\d+(?:\.\d+)?)[,\s]+([+\-]?\d+(?:\.\d+)?)[,\s\)]*$/;
			const match = string.match(regex);
			if (!match) {
				Sunniesnow.Logs.warn('Invalid coordinates');
				return;
			}
			const x = Number(match[1]);
			const y = Number(match[2]);
			if (this.edittingPoint) {
				debugBoard.movePinnedPointTo(this.edittingPoint, x, y);
				this.stopEditting(this.edittingPoint);
			} else {
				debugBoard.pinPointByCoordinates(x, y);
			}
			this.input.value = '';
		});
	},

	add(point) {
		const item = document.createElement('span');
		item.classList.add('pinned-coordinates-item');
		item.addEventListener('contextmenu', event => {
			const ctrlKey = navigator.platform.includes("Mac") ? event.metaKey : event.ctrlKey;
			if (ctrlKey || event.altKey) {
				event.preventDefault();
			}
		});
		item.addEventListener('mousedown', event => {
			const ctrlKey = navigator.platform.includes("Mac") ? event.metaKey : event.ctrlKey;
			if (ctrlKey && event.button === 2) {
				event.preventDefault();
				const point = this.itemToPoint.get(item);
				point.parent.unpinPoint(point);
				return;
			}
			if (event.altKey && event.button === 2) {
				event.preventDefault();
				this.edit(this.itemToPoint.get(item));
			}
		});
		this.span.appendChild(item);
		this.pointToItem.set(point, item);
		this.itemToPoint.set(item, point);
		this.update(point);
	},

	update(point) {
		const item = this.pointToItem.get(point);
		item.innerText = point.text.text + ' ';
	},

	remove(point) {
		if (this.edittingPoint === point) {
			this.stopEditting();
		}
		const item = this.pointToItem.get(point);
		item.remove();
		this.pointToItem.delete(point);
		this.itemToPoint.delete(item);
	},

	removeAll() {
		this.span.innerHTML = '';
	},

	startMoving(point) {
		const item = this.pointToItem.get(point);
		item.classList.add('moving');
	},

	stopMoving(point) {
		const item = this.pointToItem.get(point);
		item.classList.remove('moving');
	},

	edit(point) {
		if (this.edittingPoint) {
			this.stopEditting();
		}
		point.alpha = 1;
		const item = this.pointToItem.get(point);
		item.classList.add('editing');
		this.edittingPoint = point;
		this.input.focus();
	},

	stopEditting() {
		if (!this.edittingPoint) {
			return;
		}
		this.edittingPoint.alpha = 0.5;
		const item = this.pointToItem.get(this.edittingPoint);
		item.classList.remove('editing');
		this.edittingPoint = null;
		this.input.blur();
	},

	clear() {
		this.stopEditting();
		this.span.innerHTML = '';
	}

};
