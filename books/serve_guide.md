# Node.js serve パッケージ導入・インストール・活用ガイドブック

<span style="font-size:1.2em">📚</span> 本ガイドブックは、Node.js および serve パッケージを初めて利用される方から、すでに利用中の方まで、幅広くご活用いただけるよう設計されています。CORS エラーによる HTML ファイルの直接開きができない問題を解決し、開発効率を大幅に改善するための実践的な手順をご紹介します。

---

## 目次

1. [Node.js について](#node.js-について)
2. [serve パッケージについて](#serve-パッケージについて)
3. [Node Version Manager (NVM) とは](#node-version-manager-nvm-とは)
4. [NVM の入手方法](#nvm-の入手方法)
5. [NVM のインストール方法](#nvm-のインストール方法)
6. [NVM を使用した Node.js のインストール](#nvm-を使用した-nodejs-のインストール)
7. [serve パッケージの入手とインストール](#serve-パッケージの入手とインストール)
8. [serve パッケージの実際の利用シーン](#serve-パッケージの実際の利用シーン)
9. [よくある質問と トラブルシューティング](#よくある質問とトラブルシューティング)

---

## Node.js について

### Node.js とは

Node.js は、JavaScript をサーバーサイド（パソコンやサーバーコンピュータ上）で実行するための<b>***オープンソースのランタイム環境***</b>です。通常、JavaScript はブラウザ上でのみ動作しますが、Node.js を使用することで、JavaScript でバックエンドアプリケーション、CLI ツール、ローカル開発サーバーなどを構築することができます。

2009 年に Ryan Dahl 氏によって開発され、現在では世界中の開発者に利用されている、非常に人気の高いプラットフォームです。

### Node.js の主な特性

| 特性 | 説明 |
|------|------|
| **非同期処理** | ファイル I/O やネットワーク通信を効率的に処理でき、複数のリクエストを同時に扱える |
| **シングルスレッド** | 一つのスレッドで動作するため、実装がシンプルで予測しやすい |
| **npm エコシステム** | 数百万のパッケージが登録された npm（Node Package Manager）により、再利用可能なコンポーネントが豊富 |
| **クロスプラットフォーム** | Windows、macOS、Linux など主要な OS で動作可能 |

### Node.js の使用用途

- <b>***Web サーバーの構築***</b>：Express や Hapi などのフレームワークを使用した API サーバーの開発
- <b>***スタティック Web サーバー***</b>：本ガイドで紹介する serve パッケージなど、簡単な Web サーバーの実行
- <b>***ビルドツール***</b>：Webpack、Gulp、Grunt などの開発ツールの実行
- <b>***コマンドラインツール***</b>：自動化スクリプトやデータ処理ツール
- <b>***リアルタイムアプリケーション***</b>：WebSocket を使用したチャットアプリやゲームサーバー

### Node.js のバージョン戦略

Node.js には複数のバージョンリリース系統があります：

- <b>***Current（最新版）***</b>：最新の機能が含まれているが、6 ヶ月でサポート終了
- <b>***LTS（Long Term Support）***</b>：長期間サポートされる安定版。3 年間のサポート期間を持つ

開発環境では最新版を使用し、本番環境では LTS バージョンを使用することが推奨される慣習です。

---

## serve パッケージについて

### serve パッケージとは

`serve` は、Node.js 用の極めてシンプルで高速なスタティック Web サーバーパッケージです。複雑な設定なしに、ローカルの任意のフォルダをすぐに Web サーバー化できるため、<b>***開発効率の向上***</b>に非常に有効です。

### serve パッケージが解決する問題

HTML ファイルを Windows エクスプローラーでダブルクリックしたり、ブラウザに直接ドラッグ&ドロップしたりすると、`file://` プロトコルで読み込まれます。このプロトコルでは、**CORS（Cross-Origin Resource Sharing）セキュリティ制限**により、JSON ファイルなどの外部リソースの読み込みが自動的にブロックされます。

#### CORS エラーが発生する具体的な状況

たとえば、以下のような HTML + JSON の構成で開発をしているとします：

```
my-project/
├── index.html
└── data.json
```

`index.html` の中で JavaScript を使って `data.json` を読み込もうとすると：

```html
<!-- index.html の一部 -->
<script>
  fetch('data.json')
    .then(response => response.json())
    .then(data => console.log(data));
</script>
```

このファイルを `file://` プロトコルで開いた場合、ブラウザの開発者ツール（F12）には次のようなエラーが表示されます：

```
Access to fetch at 'file:///C:/my-project/data.json' from origin 'null'
has been blocked by CORS policy: Cross origin requests are only supported
for protocol schemes: http, data, isolated-app, chrome-extension,
chrome-untrusted, https, chrome.
```

このエラーは `serve` を使って HTTP サーバー経由でアクセスすることで解消できます。

**serve を使用することで：**

1. HTTP プロトコルで HTML ファイルをサーブするため CORS 制限が適用されない
2. 複雑なサーバー設定は不要で、一行のコマンドで実行可能
3. ローカルマシンのネットワーク IP アドレス経由でリモートアクセスも可能

### serve の主な特徴

| 特徴 | 詳細 |
|------|------|
| **設定不要** | JSON や設定ファイルが不要で、コマンドラインで実行可能 |
| **高速** | Node.js のネイティブモジュールを使用した最小限の実装 |
| **圧縮対応** | gzip 圧縮により、ネットワーク転送量を削減 |
| **SSL/TLS 対応** | HTTPS でのサーブも可能（証明書生成は別途必要） |
| **ポートカスタマイズ** | 任意のポート番号で実行可能 |
| **ブラウザキャッシュ対応** |適切な HTTP ヘッダー設定により、効率的なブラウザキャッシュをサポート |

### serve の公式情報

- <b>***公式 GitHub リポジトリ***</b>：https://github.com/vercel/serve
- <b>***npm パッケージページ***</b>：https://www.npmjs.com/package/serve
- <b>***ドキュメント***</b>：https://github.com/vercel/serve#readme

---

## Node Version Manager (NVM) とは

### NVM の役割

複数のバージョンの Node.js を同一マシン上にインストールし、プロジェクトごとに使い分ける必要が生じることがあります。NVM（<b>***Node Version Manager***</b>）は、このような複数バージョンの管理を簡単に行うためのツールです。

### NVM が必要な理由

- <b>***バージョン互換性***</b>：異なるプロジェクトが異なる Node.js バージョンに依存している場合がある
- <b>***LTS と最新版の共存***</b>：本番サーバーでは LTS 版を使用し、開発環境では最新版を試したいケースがある
- <b>***簡単な切り替え***</b>：グローバルインストールではなく、シェル単位でバージョンを切り替え可能
- <b>***アンインストールの容易さ***</b>：不要なバージョンを簡単に削除できる
- <b>***権限問題の回避***</b>：ユーザーレベルでの管理により、sudo コマンドが不要な場合が多い

### Windows での NVM 選択肢

Windows の場合、いくつかの NVM 実装が存在します：

| NVM 実装 | 説明 | 特徴 |
|---------|------|------|
| **nvm-windows** | Windows 専用の NVM 実装 | GUI インストーラー利用可能、最も推奨 |
| **nvm（PowerShell 版）** | PowerShell スクリプトベースの実装 | PowerShell のみで動作 |
| **fnm** | Rust で実装された軽量な NVM | クロスプラットフォーム対応 |

<b>***本ガイドでは nvm-windows を推奨***</b>します。最も安定しており、GUI インストーラーにより初心者にも分かりやすいためです。

---

## NVM の入手方法

### nvm-windows の入手

#### 公式リポジトリからのダウンロード

nvm-windows の最新版は、GitHub リポジトリから直接ダウンロードできます。

<b>***公式 GitHub リポジトリ***</b>：  
https://github.com/coreybutler/nvm-windows

#### ダウンロード手順

1. 上記の GitHub ページにアクセスします
2. 右側の **"Releases"** セクションを探し、最新版をクリックします
3. **"Assets"** セクションで、以下のファイルを探します：
   - `nvm-setup.exe`（推奨：GUI インストーラー）
   - `nvm-noinstall.zip`（ポータブル版：設定が必要）

4. `nvm-setup.exe` をダウンロードして実行します

#### 代替：Chocolatey を使用したインストール

Windows パッケージマネージャー「Chocolatey」がインストール済みの場合：

```powershell
choco install nvm
```

#### 代替：PowerShell インストールスクリプト

PowerShell を管理者権限で実行し、以下のコマンドで自動ダウンロード・インストール：

```powershell
# nvm-windows の最新版をダウンロード・インストール
$nvmLatestUrl = "https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe"
$outputPath = "$env:TEMP\nvm-setup.exe"
Invoke-WebRequest -Uri $nvmLatestUrl -OutFile $outputPath
Start-Process -FilePath $outputPath -Wait
Remove-Item -Path $outputPath
```

### 入手前の確認事項

- <b>***OS バージョン***</b>：Windows 7 以上のバージョンが必要です（Windows 10/11 は完全対応）
- <b>***管理者権限***</b>：インストール時に管理者権限が必要です
- <b>***ウイルス対策ソフト***</b>：稀にセキュリティソフトがダウンロードをブロックする場合があります。その場合は一時的に無効化してください

---

## NVM のインストール方法

### GUI インストーラーを使用した方法（推奨）

#### ステップ 1：インストーラーの起動

1. ダウンロードした `nvm-setup.exe` をダブルクリックで実行
2. ユーザーアカウント制御（UAC）ダイアログで **"はい"** を選択

#### ステップ 2：インストールウィザードの実行

1. 言語設定：**"English"** または **"日本語"** を選択
2. **"Next"** ボタンをクリック
3. ライセンス同意画面で **"I agree to the License Agreement"** にチェック
4. **"Next"** ボタンをクリック

#### ステップ 3：インストール先の指定

<b>***デフォルト設定値***</b>：`C:\Users\[ユーザー名]\AppData\Roaming\nvm`

- 通常はデフォルト値で問題ありません
- ドライブ容量が限定されている場合は、変更することも可能です
- **"Next"** ボタンをクリック

#### ステップ 4：symlink フォルダの指定

<b>***symlink フォルダ***</b>：Node.js がインストールされるフォルダ

<b>***推奨値***</b>：`C:\Program Files\nodejs`

- ここで指定した場所に、実際の Node.js インストールがリンクされます
- **"Next"** ボタンをクリック

#### ステップ 5：インストール完了

1. インストール中、複数のファイルがダウンロード・展開されます
2. 完了後、**"Finish"** ボタンをクリック

### インストール完了後の確認

PowerShell または コマンドプロンプトで、新しいウィンドウを開きます：

```powershell
# NVM のバージョン確認
nvm -v
```

<b>***出力例***</b>：

```
1.1.11
```

`nvm -v` でバージョンが表示されれば、インストール成功です。

### トラブルシューティング：NVM が認識されない場合

この問題は、PATH 環境変数が更新されていない場合に発生することがあります。

#### 解決方法 1：PC の再起動

新しいシェルウィンドウを開き、PATH が再読み込みされます。問題が解決しない場合は以下を試してください。

#### 解決方法 2：PATH 手動設定

1. **"Windows キー + R"** で **「ファイル名を指定して実行」** を開く
2. `systempropertiesadvanced` と入力
3. **"環境変数"** ボタンをクリック
4. **"システム環境変数"** セクションで **"Path"** を選択し、**"編集"** をクリック
5. 以下の 2 つのパス（必要に応じて）を確認・追加：
   - `C:\Users\[ユーザー名]\AppData\Roaming\nvm`
   - `C:\Program Files\nodejs`
6. **"OK"** ボタンをクリックし、新しいシェルウィンドウを開く

---

## NVM を使用した Node.js のインストール

### ステップ 1：利用可能なバージョンの一覧表示

#### すべての利用可能な Node.js バージョンを表示

```powershell
nvm list available
```

<b>***出力例***</b>：

```
|   LATEST    |     LTS     |
|-------------|-------------|
|   22.x.x    |   20.11.1   |
|   21.x.x    |   18.19.0   |
|   20.11.1   |   16.20.0   |
...
```

#### すでにインストール済みのバージョンを確認

```powershell
nvm list
```

<b>***出力例（複数インストール済みの場合）***</b>：

```
  * 22.2.0 (Currently using 64-bit executable)
    20.11.1
    18.19.0
```

`*` の付いたバージョンが現在使用中のバージョンです。

### ステップ 2：Node.js のインストール

#### 最新版（Current）のインストール例

```powershell
nvm install latest
```

<b>***出力例***</b>：

```
Downloading node.js version 22.2.0 (64-bit)...
Extracting node and npm...
Complete
npm v10.7.0 installed successfully.
```

#### 特定バージョンのインストール例

LTS 版（例：20.11.1）をインストール：

```powershell
nvm install 20.11.1
```

バージョン指定時は、`nvm list available` の出力から正確なバージョン番号をコピーしてください。

#### 複数バージョンのインストール例

開発環境用に最新版、本番リファレンス用に LTS をインストール：

```powershell
# 最新版のインストール
nvm install latest

# LTS 版（20.x）のインストール
nvm install 20.11.1
```

### ステップ 3：バージョンの切り替え

#### 使用するバージョンの指定

```powershell
# 最新版の使用
nvm use latest

# LTS 版（20.x）の使用
nvm use 20.11.1

# バージョン番号の一部指定も可能
nvm use 20  # 最新の 20.x.x を自動選択
```

<b>***出力例***</b>：

```
Now using node v20.11.1 (64-bit)
```

### ステップ 4：インストール完了の確認

```powershell
node --version
npm --version
```

<b>***出力例***</b>：

```
v20.11.1
9.8.1
```

Node.js（`node`）と npm（`npm`）のバージョンが表示されれば、インストール成功です。

### 推奨される複数バージョンの管理戦略

#### シナリオ例：開発環境では最新版、参考用に LTS をインポート

1. **最新版（Current）をインストール**
   ```powershell
   nvm install latest
   ```
   - 最新の言語機能やパフォーマンス改善を試験的に利用

2. **LTS 版（Long Term Support）をインストール**
   ```powershell
   nvm install lts
   ```
   - 本番環境同等の安定性で検証

3. **デフォルト版の設定**
   ```powershell
   nvm use latest
   ```
   - 普段は最新版を使用し、必要に応じて LTS に切り替え

#### バージョン切り替え時の注意

- <b>***グローバルパッケージの独立***</b>：`npm install -g` でインストールされたパッケージは、バージョン別に管理されます。各バージョンで必要なツールを個別にインストールしてください
- <b>***プロジェクトローカルパッケージ***</b>：各プロジェクトの `node_modules` フォルダは、使用する Node.js バージョンに依存します。`.nvmrc` ファイルで自動バージョン切り替えを設定することも可能です

### 設定ファイル `.nvmrc` による自動バージョン切り替え

#### `.nvmrc` ファイルの作成

プロジェクトフォルダに `.nvmrc` ファイルを作成し、そのプロジェクトで使用する Node.js バージョンを指定します。ファイルの中身はバージョン番号のみを記述します：

```
20.11.1
```

たとえば、以下のようなプロジェクト構成のルートに置きます：

```
my-project/
├── .nvmrc          ← ここに「20.11.1」とだけ書く
├── index.html
├── data.json
└── style.css
```

#### 自動バージョン切り替えと使用

```powershell
# プロジェクトフォルダに移動
cd my-project

# .nvmrc で指定されたバージョンに自動切り替え
nvm use
```

<b>***出力例***</b>：

```
Now using node v20.11.1 (64-bit)
```

このように設定すれば、フォルダ移動後に `nvm use` を実行するだけで、プロジェクトに対応したバージョンへ自動的に切り替わります。

---

## serve パッケージの入手とインストール

### serve パッケージの入手方法

serve パッケージは、npm（Node Package Manager）経由で入手します。Node.js をインストールすれば、npm は自動で含まれています。したがって、<b>***別途ダウンロードは不要***</b>です。

### serve 2 つのインストール方法

serve には 2 つの利用方法があります。プロジェクトの規模や用途に応じて選択してください。

#### 方法 1：グローバルインストール（推奨）

全プロジェクト共通で使用する場合、またはコマンドラインツールとして使用する場合：

```powershell
npm install -g serve
```

<b>***メリット***</b>:
- インストール後、すぐにどのフォルダからでも `serve` コマンドが実行可能
- ディスク容量の節約（1 つのコピーで複数プロジェクトで共有）
- Node.js バージョン更新時に一度のインストールで済む

<b>***デメリット***</b>:
- 複数バージョンの Node.js を使い分ける場合、各バージョンで個別インストールが必要

#### 方法 2：ローカルインストール

特定プロジェクトのみで使用する場合：

```powershell
# プロジェクトフォルダに移動
cd my-project

# 現在位置にインストール
npm install serve
```

<b>***メリット***</b>:
- プロジェクト別に独立した環境を構築
- `package.json` で依存関係管理が可能
- 複数バージョンの Node.js でも問題なし

<b>***デメリット***</b>:
- 各プロジェクトで個別にインストールが必要
- ディスク容量を多く消費

### 推奨事項

<b>***個人開発環境やローカル開発では方法 1（グローバルインストール）を推奨***</b>します。ローカル開発サーバーとしての用途が主であり、個別の厳密なバージョン管理の必要性が低いためです。

### グローバルインストールの詳細手順

#### ステップ 1：PowerShell を管理者権限で起動

1. Windows キーを押して、"PowerShell" と入力
2. **"Windows PowerShell"** 右クリック
3. **"管理者として実行"** を選択

#### ステップ 2：serve のインストール

```powershell
npm install -g serve
```

<b>***インストール完了時の出力例***</b>：

```
added 89 packages in 5s

12 packages are looking for funding
  run `npm fund` for details
```

#### ステップ 3：インストール確認

```powershell
serve --version
```

<b>***出力例***</b>：

```
14.2.3
```

serve のバージョンが表示されれば、インストール成功です。

### アップグレード方法

serve を最新版に更新：

```powershell
npm install -g serve@latest
```

### アンインストール方法

serve が不要になった場合：

```powershell
npm uninstall -g serve
```

---

## serve パッケージの実際の利用シーン

### 基本的な使い方：開発フォルダの Web サーバー化

#### シーン 1：ローカル開発でのブラウザ確認

まず、具体的なプロジェクトを例に説明します。以下のようなフォルダ構成があるとします：

```
C:\Users\MyUser\Documents\my-html-project\
├── index.html
├── style.css
├── script.js
└── data\
    └── products.json
```

各ファイルの内容例：

**index.html**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>商品一覧</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>商品一覧</h1>
  <ul id="product-list"></ul>
  <script src="script.js"></script>
</body>
</html>
```

**data/products.json**
```json
{
  "products": [
    { "id": 1, "name": "りんご",   "price": 150 },
    { "id": 2, "name": "バナナ",   "price": 80  },
    { "id": 3, "name": "オレンジ", "price": 120 }
  ]
}
```

**script.js**
```javascript
// data/products.json を読み込んでリスト表示する
fetch('data/products.json')
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById('product-list');
    data.products.forEach(product => {
      const item = document.createElement('li');
      item.textContent = `${product.name}：${product.price}円`;
      list.appendChild(item);
    });
  })
  .catch(error => {
    console.error('読み込みエラー:', error);
  });
```

このプロジェクトを serve で起動する手順：

```powershell
# 1. プロジェクトフォルダに移動
cd C:\Users\MyUser\Documents\my-html-project

# 2. カレントフォルダを Web サーバーのルートとして起動
serve . -l 8000
```

<b>***出力例***</b>：

```
   ╔════════════════════════════════════════╗
   ║   Accepting connections at:            ║
   ║   http://localhost:8000                ║
   ║   http://192.168.1.100:8000            ║
   ║                                        ║
   ║   Press Ctrl-C to stop the server      ║
   ╚════════════════════════════════════════╝
```

#### ブラウザでの確認

1. ブラウザのアドレスバーに `http://localhost:8000` と入力
2. **Enter キー**を押す
3. `index.html` が表示され、`data/products.json` のデータが読み込まれた商品一覧が表示されます
4. `file://` で開いたときと違い、CORS エラーが発生しません

#### ネットワークアクセス：他のマシンから確認

同一ネットワーク上の別マシン（タブレットやスマートフォンなど）から確認：

```
http://192.168.1.100:8000
```

（IP アドレスは出力の `###.###.###.###` を使用）

#### サーバー停止

```
Ctrl + C キーを押す
```

---

### 実践的な使用シーン

#### シーン 2：複数 HTML ページを持つ Web サイトの確認

複数のページで構成されるサイトを開発する場合も、serve を使えば一発で全ページを確認できます。

**フォルダ構成例：**

```
C:\Users\MyUser\Documents\my-website\
├── index.html          ← トップページ
├── about.html          ← 会社概要ページ
├── contact.html        ← お問い合わせページ
├── css\
│   └── style.css
├── js\
│   └── main.js
└── images\
    └── logo.png
```

```powershell
# プロジェクトフォルダに移動して起動
cd C:\Users\MyUser\Documents\my-website
serve . -l 8000
```

ブラウザから各ページへのアクセス方法：

| アクセス URL | 表示されるページ |
|---|---|
| `http://localhost:8000` または `http://localhost:8000/index.html` | トップページ |
| `http://localhost:8000/about.html` | 会社概要ページ |
| `http://localhost:8000/contact.html` | お問い合わせページ |

ファイル一覧（ディレクトリ表示）も自動的に有効になるため、`index.html` が存在しないフォルダにアクセスすると、ファイルの一覧が表示されます。

---

#### シーン 3：AI エージェント（Claude など）との HTML 画面の共有

HTML + JSON の組み合わせで動的な画面を作成した場合、AI エージェントと画面内容を共有したいことがあります。

**問題**：`file://` でのアクセスではファイル I/O の制限により CORS エラーが発生

**解決方法**：serve で Web サーバーを立ち上げ、AI エージェントと URL を共有

```powershell
# Web サーバー起動
serve C:\Users\MyUser\Documents\dashboard -l 8000
```

起動後に表示される URL：

```
   ╔════════════════════════════════════════╗
   ║   Accepting connections at:            ║
   ║   http://localhost:8000                ║
   ║   http://192.168.1.100:8000            ║
   ╚════════════════════════════════════════╝
```

AI エージェントに以下の URL を共有して、画面内容をコピーしてもらうことができます：

```
http://localhost:8000
```

または、AI エージェントが外部ネットワークからアクセスできる場合：

```
http://192.168.1.100:8000
```

---

### 継続的な公開の是非

#### シーン 4：長期的な Web サーバー公開 - セキュリティと方針

##### インターネットへの継続公開について

<b>***推奨しません***</b>。以下の理由があります：

1. <b>***セキュリティリスク***</b>
   - ローカルフォルダ全体が HTTP で公開される
   - プライベート情報やソースコード、設定ファイルが漏洩する可能性
   - DDoS 攻撃やスキャンの対象になりやすい

2. <b>***`serve` の設計思想***</b>
   - `serve` は<b>***ローカル開発用***</b>の軽量サーバーとして設計
   - 本番環境での使用は想定されていない
   - セキュリティアップデート等の対応が遅い場合がある

3. <b>***パフォーマンス***</b>
   - 複数ユーザーの同時アクセスに最適化されていない
   - 大規模トラフィックでの安定性が保証されていない

##### ローカルネットワーク内での一時的な共有

<b>***許容できます***</b>。同一ネットワーク上の信頼済みデバイスのみからのアクセスです：

```powershell
# ローカルネットワーク経由での公開
serve . -l 8000
# 192.168.x.x などのプライベート IP でアクセス

# スマートフォンやタブレットにて確認
# http://192.168.1.100:8000
```

##### インターネット向けの継続公開の場合

本格的に Web サーバーとして公開する場合は、<b>***以下の選択肢***</b>を検討してください：

| ツール/サービス | 説明 | 価格 |
|---------|------|------|
| **Apache** | オープンソースの企業グレード Web サーバー | 無料 |
| **Nginx** | 軽量で高速な Web サーバー | 無料 |
| **AWS S3** | Amazon クラウドストレージ + 静的サイトホスティング | 月数ドル～ |
| **Vercel** | Node.js/React アプリケーションのホスティング | 無料〜 |
| **Netlify** | 静的サイト/SPA ホスティング | 無料〜 |
| **GitHub Pages** | GitHub リポジトリからの静的サイトホスティング | 無料 |

---

### コマンドラインオプション：よく使われるパラメータ

serve コマンドの実行時に、以下のオプションでカスタマイズが可能：

#### ポート番号の指定

```powershell
# ポート 3000 で実行
serve . -l 3000

# ポート指定なし（デフォルト 3000）
serve .
```

#### 特定フォルダの指定

```powershell
# 絶対パスでの指定
serve C:\Projects\my-app -l 8000

# 相対パスでの指定（カレントフォルダからの相対位置）
serve ./dist -l 8000

# 親フォルダの指定
serve .. -l 8000
```

#### 単一ページアプリケーション（SPA）モード

React、Vue.js などの SPA で使用時、すべてのリクエストを `index.html` にリダイレクト：

```powershell
serve . -l 8000 --spa
```

#### HTTPS での実行

自己署名証明書での HTTPS 実行：

```powershell
serve . -l 8000 --ssl-cert cert.pem --ssl-key key.pem
```

（証明書の生成については、別途 OpenSSL などで対応）

#### 圧縮の無効化

ネットワーク転送量の削減ではなく、デバッグの容易さを優先する場合：

```powershell
serve . -l 8000 --no-gzip
```

---

### トラブルシューティング：serve 実行時の各種エラー

#### エラー：「serve コマンドが見つからない」

```
'serve' は、内部コマンドまたは外部コマンド、
操作可能なプログラムまたはバッチ ファイルとして認識されていません。
```

**原因**：serve がグローバルインストールされていない

**解決**：

```powershell
# グローバルインストール（管理者権限）
npm install -g serve

# バージョン確認
serve --version
```

---

#### エラー：「ポートが既に使用されている」

```
Error: listen EADDRINUSE: address already in use :::8000
```

**原因**：指定したポート番号がすでに別のアプリケーションで使用中

**解決方法 1**：別のポートを指定

```powershell
serve . -l 9000
```

**解決方法 2**：既存プロセスを終了（ポート 8000 使用中の場合）

```powershell
# Windows で ポート 8000 を使用しているプロセスを表示
netstat -ano | findstr :8000
```

<b>***出力例***</b>：

```
  TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING       12345
```

右端の数字（`12345`）が PID（プロセス ID）です。このプロセスを終了させます：

```powershell
# PID を指定して強制終了（管理者権限が必要）
taskkill /PID 12345 /F
```

<b>***出力例***</b>：

```
成功: PID 12345 のプロセスは終了しました。
```

その後、再度 serve を起動してください：

```powershell
serve . -l 8000
```

---

#### エラー：「ファイルまたはフォルダが見つからない」

```
Error: ENOENT: no such file or directory, stat 'C:\path\to\folder'
```

**原因**：指定したパスが存在しないか、タイプミスがある

**解決方法 1**：カレントフォルダを確認する

```powershell
# 現在いるフォルダのパスを確認
Get-Location
```

<b>***出力例***</b>：

```
Path
----
C:\Users\MyUser\Documents
```

**解決方法 2**：対象フォルダが実際に存在するか確認する

```powershell
# フォルダが存在するか確認（True が返れば存在する）
Test-Path "C:\Users\MyUser\Documents\my-project"
```

<b>***出力例（存在する場合）***</b>：

```
True
```

<b>***出力例（存在しない場合）***</b>：

```
False
```

**解決方法 3**：フォルダ内のファイル一覧を確認する

```powershell
# フォルダの中身を確認
dir C:\Users\MyUser\Documents\my-project
```

<b>***出力例***</b>：

```
    ディレクトリ: C:\Users\MyUser\Documents\my-project

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----       2026/03/10     12:00                data
-a----       2026/03/10     12:00           1024 index.html
-a----       2026/03/10     12:00            256 style.css
-a----       2026/03/10     12:00            512 script.js
```

**解決方法 4**：正しいパスを使って serve を起動し直す

```powershell
# パスを正確に指定して起動
serve "C:\Users\MyUser\Documents\my-project" -l 8000

# または、正しいフォルダに移動してから起動
cd "C:\Users\MyUser\Documents\my-project"
serve . -l 8000
```

> **ヒント**：フォルダ名やパスにスペースが含まれる場合は、ダブルクォーテーション（`"`）で囲んでください。
> 例：`serve "C:\Users\My User\Documents\my project" -l 8000`

---

## よくある質問と トラブルシューティング

### Q1. Node.js と npm はどう違うのですか？

**A**. Node.js はJavaScript の実行環境であり、npm はパッケージ（ライブラリ）を管理するツールです。Node.js をインストールすれば npm も自動で含まれます。

### Q2. NVM が必要ですか？直接 Node.js をインストールできませんか？

**A**. 直接インストールすることも可能です。しかし以下の理由で NVM の使用を推奨します：
- 複数バージョンを簡単に管理・切り替え可能
- 不要なバージョンをクリーンアップしやすい
- アップグレード時に設定が保持される

### Q3. serve をインストールしたが、コマンドが実行できません。

**A**. 多くの原因が想定されます。以下を順に確認してください：
1. PowerShell を管理者権限で実行したか
2. `npm install -g serve` でグローバルインストールしたか
3. インストール後、新しい PowerShell ウィンドウを開いたか
4. `serve --version` でバージョンが表示されるか

上記でも不可の場合、PATH 環境変数の手動設定（前述の「トラブルシューティング」参照）を試してください。

### Q4. `localhost:8000` にブラウザからアクセスできません。

**A**. 以下を確認してください：
1. serve のコマンドを実行後、「HTTP://localhost:8000」と表示されているか確認
2. ファイアウォールが serve をブロックしていないか確認
3. 別のアプリケーションがポート 8000 を使用していないか確認（前述の netstat コマンド参照）

### Q5. JSON ファイルを読み込みしても CORS エラーが出ます。

**A**. `file://` プロトコルで HTML を開いていないか確認してください。ブラウザのアドレスバーが `file:///C:/...` から始まっている場合は serve 経由で開いていません。必ず `http://localhost:8000` でアクセスしてください。

### Q6. Node.js アップデート後、グローバルインストールした serve が使用できなくなりました。

**A**. Node.js のメジャーバージョン変更時に発生することがあります。改めてインストールしてください：

```powershell
npm install -g serve
```

### Q7. スマートフォンから `192.168.x.x:8000` にアクセスできません。

**A**. 以下を確認してください：
1. Windows ファイアウォールの設定を確認（Port 8000 の許可）
2. スマートフォンが同じ WiFi ネットワークに接続しているか確認
3. Windows マシンの IP アドレスが正しいか確認
   ```powershell
   ipconfig
   ```
   出力の `IPv4 アドレス` の値（例：`192.168.1.100`）を使用してください：
   ```
   イーサネット アダプター イーサネット:
      IPv4 アドレス . . . . . . . . : 192.168.1.100
      サブネット マスク . . . . . . : 255.255.255.0
      デフォルト ゲートウェイ . . . : 192.168.1.1
   ```

### Q8. serve のパフォーマンスが不安です。大規模なプロジェクトでも使用できますか？

**A**. serve は軽量開発用サーバーとしての設計です。本番環境または大規模プロジェクト（毎日複数ユーザーからのアクセス）では、Apache などの企業グレード Web サーバー（前述の「継続的な公開の是非」セクション参照）の使用を強く推奨します。

### Q9. serve でファイルの自動リロードは可能ですか？

**A**. serve には自動リロード機能はありませんが、ブラウザの手動リロード `F5` で最新コンテンツを取得できます。自動リロードが必須の場合は、`live-server` パッケージの使用を検討してください。

```powershell
npm install -g live-server
live-server . --port=8000
```

<b>***live-server の出力例***</b>：

```
Serving "." at http://127.0.0.1:8000
Ready for changes
```

ファイルを保存すると自動的にブラウザが更新されます。

### Q10. Mac/Linux でも同じように使用できますか？

**A**. はい、NVM と serve はクロスプラットフォーム対応です。Mac/Linux での NVM インストールは以下のコマンドで行います（Windows の nvm-windows とは異なります）：

```bash
# Mac/Linux での NVM インストール（ターミナルで実行）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

インストール後、ターミナルを再起動して `nvm --version` で確認してください。serve のインストールと使い方は Windows と同じです。

---

## まとめ

本ガイドブックでは、CORS エラーの解決元として <b>***Node.js の `serve` パッケージを活用***</b> する方法を、初期セットアップから実践的な利用シーンまで、段階的にご説明しました。

### 最初の一歩：30 秒での実行

NVM と serve のインストール後、最も簡単に動作確認するステップ：

```powershell
# 1. プロジェクトフォルダに移動
cd C:\Users\<YourName>\Documents\my-project

# 2. Web サーバー起動
serve . -l 8000

# 3. ブラウザで確認
# http://localhost:8000 にアクセス
```

このたった 3 行のステップで、CORS エラーの問題を完全に解決できます。

### 開発効率の向上

正式なバージョン管理（NVM）と軽量 Web サーバー（serve）を組み合わせることで：

- <span style="font-size:1.2em">⚡</span> セットアップから実行までのリードタイムを短縮
- <span style="font-size:1.2em">🛡️</span> CORS に由来する予期しないバグを未然に防止
- <span style="font-size:1.2em">🔄</span> マシン間（PC とタブレットなど）でのテストが容易

これらのツールは<b>***完全オープンソース***</b>かつ<b>***無料***</b>です。ぜひ本ガイドをご活用ください。

---

## 参考リンク一覧

| リンク | 詳細 |
|--------|------|
| [Node.js 公式ウェブサイト](https://nodejs.org/) | Node.js の最新情報、ダウンロード、ドキュメント |
| [npm 公式サイト](https://www.npmjs.com/) | npm パッケージレジストリ、パッケージ検索等 |
| [nvm-windows GitHub リポジトリ](https://github.com/coreybutler/nvm-windows) | nvm-windows の最新版ダウンロード、ドキュメント |
| [serve GitHub リポジトリ](https://github.com/vercel/serve) | serve パッケージの詳細、使用例、Issue 報告 |
| [serve npm パッケージページ](https://www.npmjs.com/package/serve) | npm 経由での serve 情報、バージョン履歴 |
| [MDN - CORS（Cross-Origin Resource Sharing）](https://developer.mozilla.org/ja/docs/Glossary/CORS) | CORS の詳細解説（日本語） |

---

**更新日時**：2026 年 3 月 12 日

<b>***本ガイドブックは、初心者から中級者まで幅広にご利用いただけるよう、実践的かつ技術的な内容をバランスよく盛り込んでいます。ご不明な点やご質問がございましたら、いつでもお気軽にお声がけください。***</b>
