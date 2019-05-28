const { visit, Kind } = require('graphql');

class SelectionFilter {
	constructor (path, wrapper) {
		this.path = path;
		this.wrapper = wrapper;
	}

	transformRequest (originalRequest) {
		const document = originalRequest.document;
		const fieldPath = [];
		const ourPath = JSON.stringify(this.path);
		const newDocument = visit(document, {
			[Kind.FIELD]: {
				enter: node => {
					fieldPath.push(node.name.value);
					if (ourPath === JSON.stringify(fieldPath)) {
						const selectionSet = this.wrapper(node.selectionSet);

						return {
							...node,
							selectionSet,
						};
					}
				},
				leave: () => {
					fieldPath.pop();
				},
			},
		});

		return {
			...originalRequest,
			document: newDocument,
		};
	}
}

module.exports = SelectionFilter;
