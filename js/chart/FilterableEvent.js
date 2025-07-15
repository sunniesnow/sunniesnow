Sunniesnow.FilterableEvent = class FilterableEvent extends Sunniesnow.Event {
	assignFilters(filters, offset) {
		filters ??= [];
		this.filterEvents = filters.map(data => Sunniesnow.FilterEvent.from(data, offset));
		Sunniesnow.Utils.compactify(this.filterEvents);
		this.filterEvents.sort((a, b) => a.time - b.time);
	}

	filtersAt(time) {
		const result = this.filterEvents.filter(e => e.time <= time && time < e.endTime()).map(e => {
			e.update(time);
			return e.actualFilter();
		});
		Sunniesnow.Utils.compactify(result);
		return result;
	}

	filtersAtRelative(relativeTime) {
		return this.filtersAt(this.time + relativeTime);
	}
};
