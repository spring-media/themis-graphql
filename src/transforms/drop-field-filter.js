const { visit, Kind } = require('graphql');

class DropFieldFilter {
	constructor (path) {
		this.path = path;
	}

	transformRequest (originalRequest) {
		const document = originalRequest.document;
		const fieldPath = [];
		const field = this.path.pop();
		const ourPath = JSON.stringify(this.path);
		const newDocument = visit(document, {
			[Kind.FIELD]: {
				enter: node => {
					fieldPath.push(node.name.value);
					if (ourPath === JSON.stringify(fieldPath)) {
						return {
							...node,
							selectionSet: {
								...node.selectionSet,
								selections: node.selectionSet.selections
									.filter(selection => (selection.name.value !== field)),
							},
						};
					}
					return node;
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

module.exports = DropFieldFilter;
