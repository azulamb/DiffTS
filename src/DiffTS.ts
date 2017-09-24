module DiffTS
{
	export enum DiffType
	{
		DELETE = -1,
		EQUAL  = 0,
		INSERT = 1,
	}
	export interface DiffData
	{
		type: DiffType,
		data: DiffItem,
	}

	export class DiffItem
	{
		public size() { return 0; }
		public subItem( start: number, end?: number ) { return new DiffItem(); }
		public get( index: number ) { return <any>null; }
		public getAll() { return <any>null; }
		public indexOf( value: any ) { return -1; }
	}

	export class StringLines extends DiffItem
	{
		private lines: string[];

		constructor( texts: string | string[] )
		{
			super();
			if ( typeof texts === 'string' )
			{
				this.lines = texts.split( /\r\n|\r|\n/ );
			} else
			{
				this.lines = texts;
			}
		}

		public size() { return this.lines.length; }

		public subItem( start: number, end?: number )
		{
			if ( end === undefined ) { end = this.size(); }
			const lines: string[] = [];
			for ( ; start < end ; ++start ) { lines.push( this.lines[ start ] ); }
			return new StringLines( lines );
		}

		public get( index: number ) { return this.lines[ index ]; }
		public getAll() { return this.lines; }

		public indexOf( value: any )
		{
			for ( let i = 0 ; i < this.size() ; ++i )
			{
				if ( this.lines[ i ] === value ) { return i; }
			}
			return -1;
		}
	}

	export class Diff
	{
		constructor()
		{

		}

		public diff( item1: DiffItem, item2: DiffItem )
		{
			const diffs: DiffData[] = [];

			const commonPrefixLength = this.commonPrefix( item1, item2 );
			if ( 0 < commonPrefixLength )
			{
				diffs.push( { type: DiffType.EQUAL, data: item1.subItem( 0, commonPrefixLength ) } );
				item1 = item1.subItem( commonPrefixLength );
				item2 = item2.subItem( commonPrefixLength );
			}

			const commonSuffixLength = this.commonSuffix( item1, item2 );
			let suffix: DiffData | null = null;

			if ( 0 < commonSuffixLength )
			{
				suffix = { type: DiffType.EQUAL, data: item1.subItem( item1.size() - commonSuffixLength ) };
				item1 = item1.subItem( 0, item1.size() - commonSuffixLength );
				item2 = item2.subItem( 0, item2.size() - commonSuffixLength );
			}

			const list = this._diff( item1, item2  );
			list.forEach( ( item ) =>
			{
				diffs.push( item );
			} );

			if ( suffix ) { diffs.push( suffix ); }
			return diffs;
		}

		private commonPrefix( item1: DiffItem, item2: DiffItem )
		{
			let i = 0;
			const length = Math.min( item1.size(), item2.size() );
			for ( ; i < length ; ++i )
			{
				if ( item1.get( i ) !== item2.get( i ) ) { break; }
			}
			return i;
		}

		private commonSuffix( item1: DiffItem, item2: DiffItem )
		{
			let i = 0;
			const length = Math.min( item1.size(), item2.size() );
			const max1 = item1.size() - 1;
			const max2 = item2.size() - 1;

			for ( ; i < length ; ++i )
			{
				if ( item1.get( max1 - i ) !== item2.get( max2 - i ) ) { break; }
			}

			return i;
		}

		private _diff( item1: DiffItem, item2: DiffItem ): DiffData[]
		{
			const diff: DiffData[] = [];

			if ( item1.size() === 0 )
			{
				if ( item2.size() == 0 ) { return []; }
				return [ { type: DiffType.INSERT, data: item2 } ];
			}
			if ( item2.size() === 0 )
			{
				return [ { type: DiffType.DELETE, data: item1 } ];
			}

			for ( let start  = 0 ; start < item1.size() ; ++start )
			{
				const index = item2.indexOf( item1.get( start ) );
				if ( index < 0 ) { continue; }
				const length = this.commonLength( item1, start, item2, index );

				diff.push( { type: DiffType.DELETE, data: item1.subItem( 0, start ) } );
				diff.push( { type: DiffType.INSERT, data: item2.subItem( 0, index ) } );
				diff.push( { type: DiffType.EQUAL, data: item1.subItem( start, start + length ) } );

				item1 = item1.subItem( start + length );
				item2 = item2.subItem( index + length );
				start = 0;
			}

			if ( 0 < item1.size() ) { diff.push( { type: DiffType.DELETE, data: item1 } ); }
			if ( 0 < item2.size() ) { diff.push( { type: DiffType.INSERT, data: item2 } ); }

			return diff;
		}

		private commonLength( item1: DiffItem, i1: number, item2: DiffItem, i2: number )
		{
			let count = 0;
			const length = Math.min( item1.size() - i1, item2.size() - i2 );

			for ( ; count < length ; ++count )
			{
				if ( item1.get( i1 + count ) !== item2.get( i2 + count ) ) { break; }
			}

			return count;
		}
	}

}
