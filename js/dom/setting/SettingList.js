Sunniesnow.SettingList = class SettingList extends Sunniesnow.Setting {
	postInit() {
		this.items = [];
		this.readTemplate();
		this.populateButtons();
		this.refresh();
	}

	readTemplate() {
		this.template = this.collection.getElementById(this.element.dataset.listTemplate);
		this.template.style.display = 'none';
		this.template.querySelectorAll('input, select, textarea, [data-type]').forEach(el => {
			this.collection.mapElementIdToSetting.set(el.id, this);
		});
		this.collection.mapElementIdToSetting.set(this.template.id, this);
		this.lastElement = this.template;
	}

	newButton(idInfix, onclick, index) {
		const button = document.createElement('button');
		button.id = `${this.id}${this.idSuffix}-${idInfix}${index != null ? `-${index}` : ''}`;
		button.type = 'button';
		button.addEventListener('click', onclick);
		return button;
	}

	populateButtons() {
		const buttonsContainer = this.collection.getElementById(this.element.dataset.listButtons);
		this.addButton = this.newButton('add', () => this.addItem());
		this.clearButton = this.newButton('clear', () => this.clearItems());
		buttonsContainer.appendChild(this.addButton);
		buttonsContainer.appendChild(this.clearButton);
	}

	modifyAttributes(element, index, oldIndex = null) {
		if (element instanceof Sunniesnow.SettingCollection) {
			element.idSuffix = `${this.idSuffix}-${index}`;
			element = element.element;
		}
		const oldSuffix = oldIndex == null ? /-$/ : new RegExp(`-${oldIndex}$`);
		const newSuffix = `-${index}`;
		for (const attr of element.getAttributeNames()) {
			const oldAttribute = element.getAttribute(attr);
			if (oldSuffix.test(oldAttribute)) {
				element.setAttribute(attr, oldAttribute.replace(oldSuffix, newSuffix));
			}
		}
		for (const child of element.children) {
			this.modifyAttributes(child, index, oldIndex);
		}
	}

	addItem() {
		return this.newItem(this.items.length);
	}

	insertItem(item) {
		const index = this.items.indexOf(item);
		if (index === -1) {
			throw new Error('Item not found');
		}
		return this.newItem(index);
	}

	newItem(index) {
		const itemElement = this.template.cloneNode(true);
		itemElement.style.display = '';
		if (index < this.items.length) {
			for (let i = this.items.length - 1; i >= index; i--) {
				this.modifyAttributes(this.items[i].element, i + 1, i);
			}
			this.modifyAttributes(itemElement, index);
			this.element.insertBefore(itemElement, this.items[index].element);
			this.items.splice(index, 0, null);
		} else {
			index = this.items.length;
			this.modifyAttributes(itemElement, index);
			if (this.lastElement.nextSibling) {
				this.element.insertBefore(itemElement, this.lastElement.nextSibling);
			} else {
				this.element.appendChild(itemElement);
			}
		}
		const item = new Sunniesnow.SettingCollection(this.collection, itemElement, `${this.idSuffix}-${index}`);
		const buttonsContainer = itemElement.querySelector('#' + itemElement.dataset.listItemButtons);
		item.moveUpButton = this.newButton('move-up', () => this.moveItemUp(item), index);
		item.moveDownButton = this.newButton('move-down', () => this.moveItemDown(item), index);
		item.insertButton = this.newButton('insert', () => this.insertItem(item), index);
		item.removeButton = this.newButton('remove', () => this.removeItem(item), index);
		buttonsContainer.appendChild(item.moveUpButton);
		buttonsContainer.appendChild(item.moveDownButton);
		buttonsContainer.appendChild(item.insertButton);
		buttonsContainer.appendChild(item.removeButton);
		this.items[index] = item;
		this.refresh();
		if (itemElement.dataset.i18n && Sunniesnow.I18n.lang) {
			Sunniesnow.I18n.apply(itemElement);
		}
		return item;
	}

	refresh() {
		this.lastElement = this.items[this.items.length - 1]?.element || this.template;
		this.clearButton.disabled = this.items.length === 0;
		for (let i = 0; i < this.items.length; i++) {
			const item = this.items[i];
			item.moveUpButton.disabled = i === 0;
			item.moveDownButton.disabled = i === this.items.length - 1;
		}
	}

	moveItemUp(item) {
		const index = this.items.indexOf(item);
		if (index === -1) {
			throw new Error('Item not found');
		}
		if (index === 0) {
			throw new Error('Cannot move up');
		}
		this.element.insertBefore(item.element, this.items[index - 1].element);
		this.items[index] = this.items[index - 1];
		this.items[index - 1] = item;
		this.modifyAttributes(item, this.items.length, index);
		this.modifyAttributes(this.items[index], index, index - 1);
		this.modifyAttributes(item, index - 1, this.items.length);
		this.refresh();
	}

	moveItemDown(item) {
		const index = this.items.indexOf(item);
		if (index === -1) {
			throw new Error('Item not found');
		}
		if (index === this.items.length - 1) {
			throw new Error('Cannot move down');
		}
		this.element.insertBefore(this.items[index + 1].element, item.element);
		this.items[index] = this.items[index + 1];
		this.items[index + 1] = item;
		this.modifyAttributes(item, this.items.length, index);
		this.modifyAttributes(this.items[index], index, index + 1);
		this.modifyAttributes(item, index + 1, this.items.length);
		this.refresh();
	}

	clearItems() {
		for (const item of this.items) {
			item.element.remove();
		}
		this.items = [];
		this.refresh();
	}

	removeItem(item) {
		const index = this.items.indexOf(item);
		if (index === -1) {
			throw new Error('Item not found');
		}
		item.element.remove();
		this.items.splice(index, 1);
		for (let i = index; i < this.items.length; i++) {
			this.modifyAttributes(this.items[i], i, i + 1);
		}
		this.refresh();
	}

	value() {
		return this.items.map(item => item.value());
	}

	async get() {
		return Promise.all(this.items.map(item => item.get()));
	}

	set(value) {
		this.clearItems();
		while (this.items.length < value.length) {
			this.addItem();
		}
		value.forEach((v, i) => this.items[i].set(v));
		this.refresh();
	}

	async save() {
		return Promise.all(this.items.map(item => item.save()));
	}

	load(value) {
		if (!value) {
			return;
		}
		this.clearItems();
		while (this.items.length < value.length) {
			this.addItem();
		}
		value.forEach((v, i) => this.items[i].load(v));
		this.refresh();
	}
};
