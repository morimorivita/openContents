# 【Concept】コンポーネント指向と状態管理の基本

📚 本ガイドブックは、モダンWeb開発の中核をなす***コンポーネント指向***と***状態管理（State Management）***の概念を理解し、従来のページ単位の開発から部品単位の開発へと設計思考を転換することを目的としています。jQueryなどを用いた直接的なDOM操作から、データ駆動型の宣言的UIへの変革をマスターしましょう。

---

# 目次
1. [コンポーネント指向とは：UIを部品で考える](#1-コンポーネント指向とはuiを部品で考える)
1. [比較：ページ単位（旧）vs コンポーネント単位（新）](#2-比較ページ単位旧vsコンポーネント単位新)
1. [「状態（State）」のメカニズム：画面が動く仕組み](#3-状態stateのメカニズム画面が動く仕組み)
1. [実践：コンポーネントの分解と実装例](#4-実践コンポーネントの分解と実装例)
1. [副作用（useEffect）：画面の外で起きることを管理する](#5-副作用useeffect画面の外で起きることを管理する)
1. [グローバルな状態管理：Stateをコンポーネントの外で管理する](#6-グローバルな状態管理stateをコンポーネントの外で管理する)
1. [jQuery時代との決定的違いと保守性の向上](#7-jquery時代との決定的違いと保守性の向上)
1. [よくある質問とトラブルシューティング](#8-よくある質問とトラブルシューティング)




---

# 1. コンポーネント指向とは：UIを部品で考える

### 概要・説明

コンポーネント指向とは、Webサイトの画面全体をひとつの大きな塊として捉えるのではなく、再利用可能な***小さな部品（コンポーネント）の組み合わせ***として構成する設計手法です。




例えば、「ヘッダー」「商品カード」「サイドバー」といった単位で部品を作り、それらをパズルを組み立てるように配置していくことで、複雑なUIを効率的に構築できます。




### コンポーネント化の3大メリット

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; min-width: 600px;"><thead><tr style="background: linear-gradient(to right, #39C5BB, #FFC778); color: white;"><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">メリット</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">説明</th></tr></thead><tbody><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>再利用性**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">一度作った部品を別のページや別のプロジェクトで使い回せます。</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>独立性**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">各部品が自己完結しているため、修正が他の場所に影響しにくくなります。</td></tr><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>可読性**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">ファイルが小さく分割されるため、コードの意図が把握しやすくなります。</td></tr></tbody></table>

---

# 2. 比較：ページ単位（旧）vs コンポーネント単位（新）

従来のWeb開発（JSP, ASP, jQuery等）とモダンWeb（React, Next.js等）での設計思想の違いを整理します。






<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; min-width: 600px;"><thead><tr style="background: linear-gradient(to right, #39C5BB, #FFC778); color: white;"><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">比較項目</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">従来のページ単位開発</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">モダンなコンポーネント指向</th></tr></thead><tbody><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>構成単位**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">ページ（HTMLファイル）全体</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">部品（Component）の組み合わせ</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>コード構成**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">HTML / CSS / JS がバラバラ</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">1つのコンポーネントにセットで定義</td></tr><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>UIの作り方**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">命令的（「XXを書き換えろ」）</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">宣言的（「データがXXならこう表示」）</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>更新の仕組み**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">ページ全体の再読み込み / DOM直接操作</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">必要な部品のみが自動的に再描画</td></tr><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>保守性**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">変更の影響範囲が予測しにくい</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">部品内で完結するため修正が容易</td></tr></tbody></table>



### 設計思想のイメージ図


<pre style="color:Green;">
<code>
graph TD
    subgraph "ページ単位 (Traditional)"
        P1[ページ全体] --&gt; H1[HTMLファイル]
        P1 --&gt; C1[CSSファイル]
        P1 --&gt; J1[JSファイル]
        J1 -- "直接操作" --&gt; H1
    end

    subgraph "コンポーネント指向 (Modern)"
        CompA["コンポーネントA&lt;br/&gt;(Header)"] --- CompB["コンポーネントB&lt;br/&gt;(ProductCard)"]
        CompA --- CompC["コンポーネントC&lt;br/&gt;(ProductCard)"]
        CompB --- CompD["コンポーネントD&lt;br/&gt;(Button)"]

        style CompA fill:#f9f,stroke:#333
        style CompB fill:#bbf,stroke:#333
        style CompC fill:#bbf,stroke:#333
        style CompD fill:#bfb,stroke:#333
    end
</code>
</pre>


---

# 3. 「状態（State）」のメカニズム：画面が動く仕組み

モダンWebにおいて、画面の表示内容を決定するのは***状態（State）***と呼ばれるデータです。




### 状態（State）とは

コンポーネントが保持する「変化する内部的なデータ」のことです。




- 「ボタンがクリックされたか？」
- 「検索ボックスに入力された文字は何か？」
- 「APIから取得したデータリスト」

### 自動更新のフロー

モダンWebフレームワーク（React等）では、***「Stateが変わると、UIが自動的にリセット（再描画）される」***という強力な仕組みを持っています。





<pre style="color:Green;">
<code>
sequenceDiagram
    participant U as ユーザー
    participant S as 状態 (State)
    participant V as 仮想DOM (Virtual DOM)
    participant D as 実際の画面 (Real DOM)

    U -&gt;&gt; S: 1. 操作してデータを変更
    S -&gt;&gt; V: 2. 状態の変化を通知
    V -&gt;&gt; V: 3. 新しいUI構造を計算
    V -&gt;&gt; D: 4. 差分だけを適用（最小限の更新）
</code>
</pre>


> ***ポイント***：開発者が「ここの文字を書き換えろ」とDOMに命令する必要はありません。開発者は「このStateならこのUIを表示する」というルール（宣言）を書くだけで、あとはフレームワークが自動で同期してくれます。




---

# 4. 実践：コンポーネントの分解と実装例

具体的に、「お気に入りボタン付きの商品カード」を例に考えてみましょう。




### UIの分解（コンポーネント構成）
1. `App`（最上位）：複数の商品カードを並べる親画面
1. `ProductCard`（中間）：商品情報の枠組み。`name` と `price` をPropsで受け取る
1. `LikeButton`（末端）：お気に入り状態の管理と表示

### コンポーネントの実装（子：LikeButton）

お気に入りボタンの状態管理に注目してください。





<pre style="color:Green;">
<code>
// components/LikeButton.tsx
import { useState } from 'react';

// 子コンポーネント：お気に入りボタン
export function LikeButton() {
  // liked が「状態（State）」、setLiked がそれを更新する関数
  const [liked, setLiked] = useState(false);

  return (
    &lt;button onClick={() =&gt; setLiked(!liked)}&gt;
      {liked ? '❤️ お気に入り済' : '🤍 お気に入りに追加'}
    &lt;/button&gt;
  );
}
</code>
</pre>


### コンポーネントの実装（中間：ProductCard）

Propsで親からデータを受け取り、子コンポーネントを組み合わせます。





<pre style="color:Green;">
<code>
// components/ProductCard.tsx
import { LikeButton } from './LikeButton';

// Propsの型定義（TypeScript）
interface ProductCardProps {
  name: string;
  price: number;
}

// 親コンポーネント：商品カード
export function ProductCard({ name, price }: ProductCardProps) {
  return (
    &lt;div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}&gt;
      &lt;h3&gt;{name}&lt;/h3&gt;
      &lt;p&gt;価格：{price.toLocaleString()}円&lt;/p&gt;
      &lt;LikeButton /&gt;
    &lt;/div&gt;
  );
}
</code>
</pre>


### コンポーネントの呼び出し（最上位：App）

`ProductCard` を実際に画面に並べる側のコードです。ここを見ることで「Props（引数）としてデータを渡す」イメージが掴めます。





<pre style="color:Green;">
<code>
// App.tsx
import { ProductCard } from './components/ProductCard';

// 商品データ（実際はAPIから取得する）
const products = [
  { id: 1, name: 'ノートPC', price: 120000 },
  { id: 2, name: 'キーボード', price: 8000 },
  { id: 3, name: 'マウス', price: 3500 },
];

export default function App() {
  return (
    &lt;div&gt;
      &lt;h1&gt;商品一覧&lt;/h1&gt;
      {products.map((product) =&gt; (
        // Props として name と price を渡している
        &lt;ProductCard key={product.id} name={product.name} price={product.price} /&gt;
      ))}
    &lt;/div&gt;
  );
}
</code>
</pre>


***出力例***：`ProductCard` が3つ並び、それぞれに独立した「🤍 お気に入りに追加」ボタンが表示されます。1つをクリックしても他のボタンには影響しません——なぜなら、それぞれの `LikeButton` が***独自のState***を持っているからです。

---

# 5. 副作用（useEffect）：画面の外で起きることを管理する

### 副作用とは

コンポーネントの「描画（レンダリング）」以外に発生する処理を***副作用（Side Effect）***といいます。代表的なものは以下の3つです。




- ***APIコール***：コンポーネントが表示されたとき、サーバーからデータを取得する
- ***タイマー・インターバル***：定期的に処理を実行する
- ***イベントリスナーの登録・解除***：ウィンドウサイズ変更の検知など

### useEffect の基本形


<pre style="color:Green;">
<code>
// components/OrderList.tsx
import { useState, useEffect } from 'react';

interface Order {
  id: number;
  status: string;
}

export function OrderList() {
  const [orders, setOrders] = useState&lt;Order[]&gt;([]);
  const [loading, setLoading] = useState(true);

  // コンポーネントが「マウント（表示）」されたタイミングで実行される
  useEffect(() =&gt; {
    // APIからデータを取得
    fetch('/api/orders')
      .then((res) =&gt; res.json())
      .then((data: Order[]) =&gt; {
        setOrders(data);
        setLoading(false);
      });
  }, []); // ← [] は「最初の1回だけ実行」を意味する依存配列

  if (loading) return &lt;p&gt;読み込み中...&lt;/p&gt;;

  return (
    &lt;ul&gt;
      {orders.map((order) =&gt; (
        &lt;li key={order.id}&gt;注文 #{order.id} - {order.status}&lt;/li&gt;
      ))}
    &lt;/ul&gt;
  );
}
</code>
</pre>


### useEffect の依存配列

`useEffect` の第2引数（依存配列）の意味を理解することがReact習得の鍵です。




<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; min-width: 600px;"><thead><tr style="background: linear-gradient(to right, #39C5BB, #FFC778); color: white;"><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">依存配列の書き方</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">実行タイミング</th></tr></thead><tbody><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<code>useEffect(() => {...}, [])</code>**</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">マウント時に1回だけ</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<code>useEffect(() => {...}, [userId])</code>**</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;"><code>userId</code> が変わるたびに</td></tr><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<code>useEffect(() => {...})</code>**</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">毎回のレンダリング後（無限ループに注意）</td></tr></tbody></table>

---

# 6. グローバルな状態管理：Stateをコンポーネントの外で管理する

### Props のバケツリレー問題

コンポーネントが深くネストされると、上位のStateを下位のコンポーネントまで渡すために多くの中間コンポーネントがPropsをただ「中継」するだけになります。これを***Props Drilling（バケツリレー）***と呼びます。





<pre style="color:Green;">
<code>
graph TD
    A[App - ユーザー情報State保持] --&gt;|Props| B[Layout]
    B --&gt;|Props| C[Sidebar]
    C --&gt;|Props| D[UserMenu - ここで使いたい]
    style D fill:#fbb,stroke:#333
    style A fill:#bfb,stroke:#333
</code>
</pre>


### 解決策1：React Context API（標準機能）

Reactに組み込まれているグローバルState共有の仕組みです。ログインユーザー情報・テーマカラーなど、アプリ全体で使うデータに適しています。





<pre style="color:Green;">
<code>
// context/UserContext.tsx
import { createContext, useContext, useState } from 'react';

interface User { name: string; role: string; }
const UserContext = createContext&lt;User | null&gt;(null);

// Provider：State の供給源
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState&lt;User&gt;({ name: '森田', role: 'admin' });
  return &lt;UserContext.Provider value={user}&gt;{children}&lt;/UserContext.Provider&gt;;
}

// フック：どのコンポーネントからでも使える
export function useUser() {
  return useContext(UserContext);
}
</code>
</pre>



<pre style="color:Green;">
<code>
// 深くネストされたコンポーネントでもPropsなしでアクセスできる
import { useUser } from '../context/UserContext';

export function UserMenu() {
  const user = useUser();
  return &lt;p&gt;ようこそ、{user?.name} さん&lt;/p&gt;;
}
</code>
</pre>


### 解決策2：外部ライブラリ（Zustand / Redux Toolkit）

アプリ全体の状態が複雑になってきたら、専用の状態管理ライブラリを検討します。




<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; min-width: 600px;"><thead><tr style="background: linear-gradient(to right, #39C5BB, #FFC778); color: white;"><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">ライブラリ</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">特徴</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">向いているケース</th></tr></thead><tbody><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>Zustand**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">シンプル・軽量・学習コストが低い</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">中規模アプリ・まず試す</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>Redux Toolkit**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">厳格なアーキテクチャ・デバッグが強力</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">大規模チーム開発</td></tr><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>React Query / TanStack Query**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">サーバーからのデータ取得・キャッシュ管理に特化</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">APIデータの管理</td></tr></tbody></table>

---

# 7. jQuery時代との決定的違いと保守性の向上

### 1. 命令的プログラミングの限界

jQueryでは「このボタンを押したら、このIDの要素を探して、クラスを削除して、テキストを書き換えて...」という***手順（命令）***を書きます。規模が大きくなると、どのコードがどのHTMLをいじっているのか把握できなくなり、スパゲッティコード化（***保守性の崩壊***）へ繋がります。





<pre style="color:Green;">
<code>
// jQuery（命令型）：処理の手順を細かく命令する
$('#likeButton').on('click', function () {
  const isLiked = $(this).hasClass('liked');
  if (isLiked) {
    $(this).removeClass('liked').text('🤍 お気に入りに追加');
    $('#likeCount').text(parseInt($('#likeCount').text()) - 1);
  } else {
    $(this).addClass('liked').text('❤️ お気に入り済');
    $('#likeCount').text(parseInt($('#likeCount').text()) + 1);
  }
});
</code>
</pre>


### 2. 宣言的UIによる保守性の向上

Reactでは同じ機能を「データ（State）がどういう状態か」だけを定義します。





<pre style="color:Green;">
<code>
// React（宣言型）：データの状態だけを管理する
function LikeButton() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  const handleClick = () =&gt; {
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
  };

  return (
    &lt;button onClick={handleClick}&gt;
      {liked ? '❤️ お気に入り済' : '🤍 お気に入りに追加'} ({count})
    &lt;/button&gt;
  );
}
</code>
</pre>


<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; min-width: 600px;"><thead><tr style="background: linear-gradient(to right, #39C5BB, #FFC778); color: white;"><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">特徴</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">jQuery (直接操作)</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">React等 (状態管理)</th></tr></thead><tbody><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>整合性**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">自分で整合性を保つ必要がある</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">フレームワークが強制的に同期する</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>テスト**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">画面を実際に動かさないと難しい</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">データの変化だけでテストが可能</td></tr><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>開発効率**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">規模に比例して複雑度が爆発</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">規模が大きくても複雑度を抑えられる</td></tr></tbody></table>

---

# 8. よくある質問とトラブルシューティング

### Q1. 全てのボタンをコンポーネントにするべきですか？

**A**. ***再利用性がある***、または***独自の内部状態を持っている***場合はコンポーネント化を推奨します。あまりに細分化しすぎると管理が大変になるため、まずは「再利用したい塊」から始めましょう。




### Q2. 状態（State）が書き換わったのに、画面が更新されません。

**A**. 以下を順に確認してください：
1. **直接代入していないか**：`state = newValue` のように直接代入してはいけません。必ず `setState` などの更新関数を使ってください。
1. **参照型データの更新**：オブジェクトや配列の場合、中身だけを書き換えても検知されません。新しいオブジェクトとして作成（スプレッド構文 `...` など）してセットする必要があります。


<pre style="color:Green;">
<code>
// NG：同じ配列オブジェクトを変更しているためStateが変わったと検知されない
items.push(newItem);
setItems(items);

// OK：新しい配列を作って渡す
setItems([...items, newItem]);
</code>
</pre>


### Q3. 「Props」と「State」の違いは何ですか？



<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; min-width: 600px;"><thead><tr style="background: linear-gradient(to right, #39C5BB, #FFC778); color: white;"><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">項目</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">Props (プロップス)</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">State (ステート)</th></tr></thead><tbody><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>役割**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">親から子への「引数」</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">自分自身の「内部データ」</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>変更権限**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">子から変更することはできない</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">自分自身で自由に変更できる</td></tr><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**<b>イメージ**</b></td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">スマホの「設定情報」(外から来る)</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">スマホの「残バッテリー」(中で変わる)</td></tr></tbody></table>



### Q4. useEffect の依存配列に何を入れればよいか分かりません。

**A**. `useEffect` 内で参照している変数（StateやProps）を依存配列に入れるのが基本ルールです。ESLintの `eslint-plugin-react-hooks` を導入すると、不足している依存配列を自動で警告してくれます。





<pre style="color:Green;">
<code>
# React Hooksのルールを強制するESLintプラグイン
npm install --save-dev eslint-plugin-react-hooks
</code>
</pre>


### Q5. グローバルStateはいつ使えばよいですか？

**A**. 以下の場合にグローバルStateを検討してください。1) 同じデータを3階層以上の深さで複数コンポーネントが参照する場合。2) ログインユーザー情報・テーマ・言語設定など「アプリ全体の設定」を保持する場合。それ以外はローカルState（`useState`）で十分なことが多いです。




---

# まとめ

本ガイドブックでは、モダンWeb開発の心臓部である ***コンポーネント指向*** と ***状態管理*** を解説しました。




### 最初の一歩：思考のアップデート
1. **画面をパーツに分ける**：1つのHTMLとしてではなく、部品の積み重ねとして見る。
1. **命令を捨てる**：要素を捕まえて書き換えるのをやめる。
1. **データを中心に置く**：データ（State）がどう変わるかだけを考え、UIはそれに従わせる。
1. **副作用を分離する**：描画以外の処理（APIコール等）は `useEffect` に切り出す。
1. **グローバルStoreは最後の手段**：まずローカルState、次にContext、最後に外部ライブラリ。

モダンWeb特有の「作り方」をマスターすることで、***メンテナンスしやすく、堅牢で、かつ美しいWebアプリケーション***をAIエージェントと共に爆速で開発できるようになります。




---

# 参考リンク一覧

<table style="width: 100%; border-collapse: collapse; font-family: sans-serif; min-width: 600px;"><thead><tr style="background: linear-gradient(to right, #39C5BB, #FFC778); color: white;"><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">リンク</th><th style="padding: 15px; text-align: left; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.2);">詳細</th></tr></thead><tbody><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**[React 公式ドキュメント（日本語）](https://ja.react.dev/)**</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">useState・useEffect・Contextの真髄を学べます</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**[TanStack Query（React Query）](https://tanstack.com/query/latest)**</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">サーバーデータのフェッチ・キャッシュ管理の定番</td></tr><tr style="background-color: #f9f9f9; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#f9f9f9'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**[Zustand（状態管理）](https://github.com/pmndrs/zustand)**</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">シンプルなグローバルState管理ライブラリ</td></tr><tr style="background-color: #ffffff; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='#f0fcfb'" onmouseout="this.style.backgroundColor='#ffffff'"><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">**[MDN: 状態管理の概念](https://developer.mozilla.org/ja/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started)**</td><td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #444; line-height: 1.6;">技術的な深掘り</td></tr></tbody></table>

---

**更新日時**：2026 年 03 月 21 日



