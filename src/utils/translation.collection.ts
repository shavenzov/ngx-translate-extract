import * as deepExtend from 'deep-extend';

export interface TranslationData {
	value: string;
	context: string;
	reference?: string;
	comment?: string;
}

export interface TranslationType {
	[key: string]: {
		[key: string]: TranslationData
	};
}

export class TranslationCollection {

	public static assign( values: TranslationType, key: string, data: TranslationData ): TranslationType {
		if ( values[ data.context ] ) {
			values[ data.context ][ key ] = data;
		} else {
			values[ data.context ] = { [ key ]: data };
		}

		return values;
	}

	public values: TranslationType = {};

	public constructor(values: TranslationType = {}) {
		this.values = values;
	}

	public add(key: string, data: TranslationData ): TranslationCollection {
		return new TranslationCollection( deepExtend( this.values, TranslationCollection.assign( {}, key, data ) ) );
	}

	public addKeys( keys: string[], data: TranslationData[] ): TranslationCollection {
		const values = keys.reduce((results, key, i) => {
			return TranslationCollection.assign( results, key, data[i] );
		}, {} as TranslationType);
		return new TranslationCollection( deepExtend( this.values, values ) );
	}

	public remove(key: string): TranslationCollection {
		return this.filter(k => key !== k);
	}

	public forEach(callback: (key?: string, data?: TranslationData) => void): TranslationCollection {
		Object.keys(this.values).forEach( contextKey => {
			Object.keys( this.values[ contextKey ] ).forEach( key => {
			callback.call( this, key, this.values[contextKey][key] );
		} ); } );
		return this;
	}

	public filter(callback: (key?: string, data?: TranslationData) => boolean): TranslationCollection {
		let values: TranslationType = {};
		this.forEach((key: string, data: TranslationData) => {
			if (callback.call(this, key, data)) {
				TranslationCollection.assign( values, key, data );
			}
		});
		return new TranslationCollection(values);
	}

	public map(callback: (key?: string, data?: TranslationData) => TranslationData): TranslationCollection {
		const values: TranslationType = {};

		this.forEach((key: string, data: TranslationData) => {
			TranslationCollection.assign( values, key, callback.call(this, key, data) );
		});

		return new TranslationCollection(values);
	}

	public union(collection: TranslationCollection): TranslationCollection {
		return new TranslationCollection( deepExtend( this.values, collection.values ) );
	}

	public intersect(collection: TranslationCollection): TranslationCollection {

		const values: TranslationType = {};
		this.filter( (key, data) => collection.has(key, data.context))
			.forEach((key: string, data: TranslationData) => {
				TranslationCollection.assign( values, key, data);
			});

		return new TranslationCollection(values);
	}

	public has(key: string, context: string = ''): boolean {
		return this.values[context] ? this.values[context].hasOwnProperty(key) : false;
	}

	public get(key: string, context: string = ''): TranslationData {
		return this.values[context] ? this.values[context][key] : null;
	}

	public keys( context: string ): string[] {
		return Object.keys(this.values[context]);
	}

	public count( context: string ): number {
		return this.values[context] ? Object.keys(this.values[context]).length : 0;
	}

	public isEmpty( context: string ): boolean {
		return this.values[context] ?  Object.keys(this.values[context]).length === 0 : true;
	}

	public sort(compareFn?: (a: string, b: string) => number): TranslationCollection {
		let values: TranslationType = {};

		Object.keys( this.values ).forEach( contextKey => {
			this.keys( contextKey ).sort(compareFn).forEach((key) => {
				TranslationCollection.assign( values, key, this.values[contextKey][key] );
			});
		} );

		return new TranslationCollection(values);
	}
}
