# DiffTS

TypeScriptで使えるDiff処理を探していたがなかったのと、複数行のテキスト差分と行の文字差分の切り替えなどが面倒だったので、そこら辺の違いを吸収しつつTypeScriptでDiffを出力するライブラリを作ってみた。

なんかそれっぽく動いているが、書いている本人は処理に自信がない。

# 利用方法

## ブラウザ

`dest/browser/diffts.js` を使う。

サンプル: https://hirokimiyaoka.github.io/DiffTS/

```
<script type="text/javascript" src="./diffts.js"></script>
<script type="text/javascript">
function diff( a, b ) {
	var d = new DiffTS.Diff();
	return d.diff( new DiffTS.StringLines( a ),new DiffTS.StringLines( b ) );
}
function clear(){
	var e = document.getElementById( 'result' );
	for ( var i = e.children.length - 1 ; 0 <= i ; --i ) { e.removeChild( e.children[ i ] ); }
	return e;
}
function start() {
	var name = [ 'delete', 'equal', 'insert' ];
	var d = diff( document.getElementById( 'a' ).value, document.getElementById( 'b' ).value );
	var e = clear();
	d.forEach( function( item ) {
		var cname = name[ item.type + 1 ];
		item.data.getAll().forEach( function( line ) {
			var li = document.createElement( 'li' );
			li.classList.add( cname );
			li.textContent = line;
			e.appendChild( li );
		} );
	} );
}
document.addEventListener('DOMContentLoaded',function() {
	document.getElementById( 'start' ).addEventListener( 'click', start,false );
}, false );
</script>
```

## Node.js

`dest/nodejs/diff.ts` を使う。

```
const diffts = require( './dest/nodejs/diffts' );

function print( diffs )
{
	const name = [ '-', '=', '+' ];
	diffs.forEach( function( item )
	{
		console.log( name[ item.type + 1 ], item.data.getAll() );
	} );
}

console.log( diffts );

const d = new diffts.Diff();

const a = d.diff( new diffts.StringLines( 'a\nb\nc' ), new diffts.StringLines( 'a\nB\nc' ) );
print( a );
```

# 自作のDiffの追加

`DiffTS.DiffItem` を継承して各関数を作って、`DiffTS.Diff` の `diff()` メソッドに与えてください。

サンプルとして、複数行が一緒になった文字列2つを比較する場合以下のような実装をします。

ちなみにこれはデフォルトで入っているDiffです。

Sample: `DiffTS.StringLines`

```
	class StringLines extends DiffTS.DiffItem
	{
		private lines: string[];

		// ここは自由に作って。
		constructor( texts: string | string[] )
		{
			super(); // これを忘れずに（特に何かするわけではないが）。
			if ( typeof texts === 'string' )
			{
				this.lines = texts.split( /\r\n|\r|\n/ );
			} else
			{
				this.lines = texts;
			}
		}

		// 中身の要素数。今回は行数。
		public size() { return this.lines.length; }

		// 要素の start 番目から　end 番目までの要素を持った新しい StringLines を返す。
		// end 省略時は末尾までとする。
		public subItem( start: number, end?: number )
		{
			if ( end === undefined ) { end = this.size(); }
			const lines: string[] = [];
			for ( ; start < end ; ++start ) { lines.push( this.lines[ start ] ); }
			return new StringLines( lines );
		}

		// index 番目の要素の値を返す。今回はindex行目の文字列。
		// 値はany扱い。
		public get( index: number ) { return this.lines[ index ]; }

		// 自分の持っているデータすべてを返す。
		// ちなみにDiff内では使わないため、完全に自分のための処理。
		public getAll() { return this.lines; }

		// 受け取った値 value が何番目にあるかを返す。
		// もし存在しない場合は -1 を返す。
		public indexOf( value: any )
		{
			for ( let i = 0 ; i < this.size() ; ++i )
			{
				if ( this.lines[ i ] === value ) { return i; }
			}
			return -1;
		}
	}
```

これらのメソッドを定義すれば、ちゃんとDiffしてくれるはず。

# ビルド方法

TypeScriptをインストール済み前提。

```
npm run build
```

`dest/` 以下に生成物があります。

