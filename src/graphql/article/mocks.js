const casual = require('casual');

/*
 * See:
 * - https://github.com/boo1ean/casual#generators-functions
 * - https://stackoverflow.com/questions/4852017/how-to-initialize-an-arrays-length-in-javascript#comment85445046_28599347 😍
*/

const arrayOf = (length, generator) => Array.from({ length }).map(() => generator());

casual.define('image', () => ({
	renderUrl: '/i/5a93f9923195eb0001099435/2a8a129df812929cf179b2f1854faf14/1/1',
	aspectRatio: casual.random_element([ 'potrait', 'landscape' ]),
	source: casual.sentence,
	height: casual.integer(2000, 4000),
	width: casual.integer(2000, 4000),
	caption: {
		data: {
			blocks: [casual.block('unstyled')],
		},
	},
}));

casual.define('block', fixedType => {
	const type = fixedType || casual.random_element([ 'atomic', 'blockquote', 'unstyled' ]);
	const data = type !== 'atomic' ? {} : casual.image;

	return {
		key: casual.uuid,
		text: casual.sentence,
		type,
		data,
	};
});

const mocks = {
	Lead: () => ({ __typename: 'ImageElement' }),
	ImageElement: () => casual.image,
	JSON: () => ({
		blocks: [casual.block('unstyled')],
	}),
	Article: () => ({
		pageTitle: casual.title,
		kicker: casual.word,
		state: casual.random_element([ 'checkedIn', 'checkedOut' ]),
		modificationDate: casual.date('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
		publicationDate: casual.date('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
		displayDate: casual.date('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
		subcell: casual.coin_flip ? null : {
			data: {
				blocks: arrayOf(casual.integer(1, 2), () => casual.block('unstyled')),
			},
		},
		text: {
			data: {
				blocks: arrayOf(casual.integer(5, 20), casual._block),
			},
		},
	}),
};

module.exports = mocks;
