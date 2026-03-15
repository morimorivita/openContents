# 【nginx】導入・インストール・活用ガイドブック

<span style="font-size:1.2em">📚</span> 本ガイドブックは、<b>***nginx***</b> をWindows 11環境で導入し、AIエージェント開発やWebサイト制作におけるCORSエラーの解決、さらには継続的なWebサーバー運用までを網羅的にサポートするために設計されています。開発効率を最大化し、安定したサーバー環境を構築するためのノウハウをご紹介します。

---

## 目次

1. [nginxの概要と特性](#nginxの概要と特性)
2. [nginxの入手方法と前提条件](#nginxの入手方法と前提条件)
3. [nginxのインストール・セットアップ手順](#nginxのインストールセットアップ手順)
4. [nginx設定ファイル（nginx.conf）の読み方](#nginx設定ファイルnginxconfの読み方)
5. [実践：AIエージェント開発での活用と連携](#実践aiエージェント開発での活用と連携)
6. [Windows起動時の自動起動設定](#windows起動時の自動起動設定)
7. [よくある質問とトラブルシューティング](#よくある質問とトラブルシューティング)
8. [なぜ nginx は「インストーラー」を用意しないのか？](#なぜ-nginx-はインストーラーを用意しないのか)

---

## nginxの概要と特性

### 概要・説明

nginx（エンジンエックス）は、高速な処理能力とリソース消費の少なさを武器にする、世界で最も利用されている<b>***オープンソースのWebサーバー/リバースプロキシ***</b>です。

特に、静的コンテンツ（HTML, CSS, JS, 画像など）の配信能力に優れており、大量の同時接続を効率的に処理できるように設計されています。

### 主な特性・特徴

| 特性 / 特徴 | 説明 |
|-------------|------|
| **軽量・高速** | メモリ消費が極めて少なく、大量の静的配信に最適です。 |
| **リバースプロキシ** | 他のサーバー（Node.js, Tomcat等）の前に立ち、リクエストを配送できます。 |
| **ロードバランサ** | 負荷分散機能を持っており、システムの可用性を高めます。 |
| **安定性** | 長時間の稼働でもパフォーマンスが低下しにくい設計です。 |

### 主な使用用途

- <b>***静的サイトの公開***</b>：ポート80/443で外部にサイトを公開するメインサーバーとして。
- <b>***CORSエラーの回避***</b>：プロキシ機能を使って、ドメイン/ポートを統合しブラウザ制限を回避します。
- <b>***SSL/TLSの終端***</b>：HTTPS化の処理をnginxで一括管理し、背後のアプリ負荷を軽減します。

### `serve` パッケージとの使い分け

同じくローカルサーバーとして利用できる `serve`（Node.js）との使い分けは以下のとおりです：

| 比較項目 | serve（Node.js） | nginx |
|---|---|---|
| **起動の手軽さ** | コマンド1行で即起動 | ZIPを展開して設定が必要 |
| **設定の柔軟性** | 限定的 | 非常に豊富（プロキシ、ヘッダー操作等） |
| **継続稼働** | PowerShellを閉じると停止 | バックグラウンドで稼働し続ける |
| **自動起動** | 非対応 | Windows起動時に自動起動が可能 |
| **リバースプロキシ** | 非対応 | 対応 |
| **推奨シーン** | 数分間の動作確認 | 継続的な開発・本番運用 |

> **使い分けの目安**：一時的にファイルを確認したいだけなら `serve`、AIバックエンドとの連携や継続的な開発環境には `nginx` を推奨します。

### 公式情報・リンク

- <b>***公式サイト***</b>：https://nginx.org/
- <b>***Windows向けドキュメント***</b>：https://nginx.org/en/docs/windows.html

---

## nginxの入手方法と前提条件

### 入手元・ダウンロード先

Windows版nginxは、インストール版ではなく、実行ファイルを含むZIP形式で提供されます。

#### ステップ：公式サイトからのダウンロード

1. 公式ダウンロードページ（https://nginx.org/en/download.html）へアクセスします。
2. **"Mainline version"**（最新機能）または **"Stable version"**（安定版）を選択します。通常は最新のMainline版（例：`nginx/Windows-1.29.5`）を推奨します。
3. `nginx/Windows-x.xx.x` というリンクをクリックし、ZIPファイルをダウンロードします。

### 事前確認事項

#### ポートの競合確認

nginxはデフォルトでポート **80** を使用します。起動前に、ポート80が他のアプリケーションで使われていないか確認しましょう。

```powershell
# ポート80を使用しているプロセスを確認
netstat -ano | findstr :80
```

<b>***出力例（ポートが空いている場合）***</b>：

```
（何も表示されない）
```

<b>***出力例（ポートが使用中の場合）***</b>：

```
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       4
```

右端の数字がPID（プロセスID）です。PIDが `4` の場合は「System」プロセス（IISなど）の可能性があります。競合が確認された場合は、後述のnginx.confでポートを変更して対処します。

- <b>***OS バージョン***</b>：Windows 11（64bit推奨）
- <b>***管理者権限***</b>：インストール（展開）先のフォルダによっては必要です。
- <b>***ポートの競合***</b>：デフォルトでポート **80** を使用します。IISやApacheが動作している場合は停止するか設定変更が必要です。

---

## nginxのインストール・セットアップ手順

### 手動インストールと起動（推奨）

#### ステップ 1：ファイルの展開

1. ダウンロードしたZIPファイルを右クリックし、「すべて展開」を選択します。
2. 展開先として `C:\nginx` などのシンプルなパスを指定することを推奨します。

> **注意**：パスに日本語・スペースが含まれないようにしてください（例：`C:\Users\山田\nginx` は不可）。`C:\nginx` が最もシンプルで推奨です。

展開後のフォルダ構成は以下のようになります：

```
C:\nginx\
├── nginx.exe              ← nginxの本体（実行ファイル）
├── conf\
│   └── nginx.conf         ← メイン設定ファイル（ここを編集する）
├── html\
│   ├── index.html         ← デフォルトのトップページ
│   └── 50x.html           ← エラーページ
├── logs\
│   ├── access.log         ← アクセスログ
│   └── error.log          ← エラーログ
└── temp\                  ← 一時ファイル置き場
```

ここで重要なのは以下の2つです：
- **`conf\nginx.conf`**：サーバーの動作を定義する設定ファイル
- **`html\`フォルダ**：公開するWebファイル（HTML/CSS/JS）を置く場所

#### ステップ 2：基本設定の変更（ポート競合がある場合）

ポート80が使用中の場合、`C:\nginx\conf\nginx.conf` を開き、`listen 80;` の行を別のポートに変更します。

> **注意**：設定ファイル（nginx.conf）を編集する際は、BOMなしUTF-8で保存できるエディタ（VS Codeなど）を推奨します。Windowsのメモ帳（Notepad）だと環境によってBOM付きUTF-8で保存されてしまい、nginxが設定ファイルを読み込めなくなるケースがあります。

変更前：
```nginx
listen       80;
```

変更後（例：ポート8080に変更）：
```nginx
listen       8080;
```

設定ファイル全体の読み方は「[nginx設定ファイル（nginx.conf）の読み方](#nginx設定ファイルnginxconfの読み方)」セクションで詳しく解説します。

#### ステップ 3：起動と動作確認

**PowerShell** を管理者権限で開き、以下のコマンドを実行します。
> **ヒント**：通常は標準ユーザー権限で問題ありませんが、ポート80（特権ポート）を使用する場合や、展開場所によっては管理者権限が必要になります。

```powershell
# nginxのディレクトリへ移動
cd C:\nginx

# nginx の設定ファイルに文法エラーがないか確認（起動前に必ず実行推奨）
.\nginx -t
```

<b>***出力例（正常な場合）***</b>：

```
nginx: the configuration file C:\nginx/conf/nginx.conf syntax is ok
nginx: configuration file C:\nginx/conf/nginx.conf test is successful
```

文法チェックが通ったら起動します：

```powershell
# nginx を起動
start nginx
```

起動後は、コマンドプロンプトには何も表示されずにプロンプトが戻ってきます。これは正常です（nginxがバックグラウンドで動作し始めた状態です）。

> **注意**：必ず `start nginx` を使いましょう。直接 `.\nginx` とだけ打つとPowerShellウィンドウが操作不能になり、慌てて `Ctrl+C` を押すとプロセスが不安定になることがあります。

#### ステップ 4：ブラウザで動作確認

ブラウザのアドレスバーに以下を入力します：

- ポート80のまま変更していない場合：`http://localhost/`
- ポートを変更した場合（例：8080）：`http://localhost:8080/`

以下のような画面が表示されれば成功です：

```
Welcome to nginx!

If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.
...
```

#### ステップ 5：管理コマンド一覧

nginx の日常的な操作コマンドをまとめます。いずれも `C:\nginx` フォルダで実行してください。

```powershell
# 設定ファイルの文法チェック（変更後は必ずこれを先に実行）
.\nginx -t

# 設定を反映（nginxを停止せずに設定だけ再読み込み）
.\nginx -s reload

# 即時終了（処理中のリクエストを無視して停止）
.\nginx -s stop

# 正常終了（処理中のリクエストを完了してから停止）
.\nginx -s quit
```

> **ヒント**：設定ファイルを編集したあとは、必ず `.\nginx -t` で文法チェックをしてから `.\nginx -s reload` を実行する習慣をつけましょう。文法エラーがある状態で `reload` すると、nginxが停止してしまう場合があります。

#### nginx が起動しているか確認する方法

```powershell
# nginx プロセスが動いているか確認
tasklist | findstr nginx
```

<b>***出力例（起動中の場合）***</b>：

```
nginx.exe                     5432 Console                    1      8,192 K
nginx.exe                     5488 Console                    1      8,576 K
```

nginx は通常2つのプロセスを起動します（マスタープロセスとワーカープロセス）。これは正常な状態です。

<b>***出力例（停止中の場合）***</b>：

```
（何も表示されない）
```

---

## nginx設定ファイル（nginx.conf）の読み方

設定ファイルは nginx の動作をすべて制御する重要なファイルです。初期状態の `C:\nginx\conf\nginx.conf` を読み解きながら、各設定の意味を説明します。

### 設定ファイルの基本構造

nginx.conf は「ブロック」という単位で構成されています。

```nginx
# ブロックの外側：グローバル設定
worker_processes  1;

# events ブロック：接続処理の設定
events {
    worker_connections  1024;
}

# http ブロック：HTTP通信の設定（最も重要）
http {
    # server ブロック：バーチャルホスト1つ分の設定
    server {
        listen       80;          # 待ち受けるポート番号
        server_name  localhost;   # サーバーのホスト名

        # location ブロック：URLパスごとの設定
        location / {
            root   html;          # 公開するフォルダのパス
            index  index.html;    # デフォルトで開くファイル名
        }
    }
}
```

### 各設定項目の意味

| 設定キー | 意味 | 変更が必要なシーン |
|---|---|---|
| `worker_processes 1;` | nginx が使うCPUコア数 | 通常はそのままでOK |
| `worker_connections 1024;` | 同時に処理できる接続数 | 大量アクセス時に増やす |
| `listen 80;` | 待ち受けるポート番号 | ポート競合があるとき |
| `server_name localhost;` | このサーバーのホスト名 | 独自ドメインを使うとき |
| `root html;` | 公開フォルダのパス | 自分のプロジェクトを公開するとき |
| `index index.html;` | デフォルトで開くファイル | トップページのファイル名が違うとき |

### よく使う設定パターン

#### パターン①：自分のプロジェクトフォルダを公開する

`html` フォルダ以外の任意のフォルダを公開したい場合：

```nginx
server {
    listen       8080;
    server_name  localhost;

    location / {
        # 公開したいフォルダの絶対パスを指定
        # ※ パスの区切りはバックスラッシュ(\)ではなくスラッシュ(/)を使う
        root   C:/Users/MyUser/Documents/my-project;
        index  index.html;
        
        # フォルダ内のファイル一覧を表示する（省略可）
        autoindex on;
    }
}
```

> **注意**：Windowsのパス区切り文字は `\`（バックスラッシュ）ですが、nginx.conf では必ず `/`（スラッシュ）を使ってください。`C:\nginx` ではなく `C:/nginx` と書きます。

#### パターン②：複数のフォルダを別々のURLで公開する

```nginx
server {
    listen       8080;
    server_name  localhost;

    # http://localhost:8080/ → Webサイト本体
    location / {
        root   C:/Users/MyUser/Documents/my-website;
        index  index.html;
    }

    # http://localhost:8080/docs/ → ドキュメントフォルダ
    location /docs/ {
        alias  C:/Users/MyUser/Documents/docs/;
        autoindex on;
    }
}
```

#### パターン③：バックエンドAPIへのリバースプロキシ

フロントエンド（HTML/JS）からバックエンドAPI（Node.js等）へのリクエストをnginxで中継する場合：

```nginx
server {
    listen       8080;
    server_name  localhost;

    # 静的ファイル（HTML/CSS/JS）を配信
    location / {
        root   C:/Users/MyUser/Documents/my-app/frontend;
        index  index.html;
    }

    # /api/ へのリクエストをNode.js（ポート3000）に転送
    location /api/ {
        proxy_pass         http://localhost:3000/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}
```

この設定により、ブラウザからは `http://localhost:8080/api/users` のような形でAPIを呼び出せます。CORS問題も発生しません（同一オリジンになるため）。

---

## 実践：AIエージェント開発での活用と連携

### シーン1：JSONデータを読み込むHTMLページのCORSエラーを解決する

#### CORSエラーが起きる状況

以下のようなファイル構成のプロジェクトがあるとします：

```
C:\Users\MyUser\Documents\my-project\
├── index.html
├── style.css
└── data\
    └── products.json
```

**index.html**（一部）：
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>商品ダッシュボード</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>商品一覧</h1>
  <ul id="product-list"></ul>
  <script>
    fetch('data/products.json')
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById('product-list');
        data.products.forEach(p => {
          const item = document.createElement('li');
          item.textContent = `${p.name}：${p.price}円`;
          list.appendChild(item);
        });
      });
  </script>
</body>
</html>
```

**data/products.json**：
```json
{
  "products": [
    { "id": 1, "name": "りんご",   "price": 150 },
    { "id": 2, "name": "バナナ",   "price": 80  },
    { "id": 3, "name": "オレンジ", "price": 120 }
  ]
}
```

`index.html` をダブルクリックで開くと、ブラウザの開発者ツール（F12）に次のエラーが表示されます：

```
Access to fetch at 'file:///C:/Users/MyUser/Documents/my-project/data/products.json'
from origin 'null' has been blocked by CORS policy:
Cross origin requests are only supported for protocol schemes:
http, data, isolated-app, chrome-extension, chrome-untrusted, https, chrome.
```

#### nginxで解決する手順

**1. nginx.conf を編集する**

`C:\nginx\conf\nginx.conf` を開き、`server` ブロック内の `location /` を以下のように変更します：

```nginx
server {
    listen       8080;
    server_name  localhost;

    location / {
        root   C:/Users/MyUser/Documents/my-project;
        index  index.html;
    }
}
```

**2. 設定ファイルを確認・反映する**

```powershell
cd C:\nginx

# 文法チェック
.\nginx -t
```

<b>***出力例（正常な場合）***</b>：

```
nginx: the configuration file C:\nginx/conf/nginx.conf syntax is ok
nginx: configuration file C:\nginx/conf/nginx.conf test is successful
```

```powershell
# nginx が既に起動中なら設定を再読み込み
.\nginx -s reload

# nginx がまだ起動していなければ新規起動
start nginx
```

**3. ブラウザで確認する**

`http://localhost:8080/` にアクセスします。`data/products.json` が正常に読み込まれ、商品一覧が表示されます。CORSエラーは発生しません。

---

### シーン2：複数ページ構成のWebサイトを開発する

以下のようなWebサイトを nginx で一括公開する例です：

```
C:\Users\MyUser\Documents\my-website\
├── index.html         ← トップページ
├── about.html         ← 会社概要
├── contact.html       ← お問い合わせ
├── css\
│   └── style.css
├── js\
│   └── main.js
├── images\
│   └── logo.png
└── data\
    └── news.json      ← お知らせデータ
```

**nginx.conf 設定例**：

```nginx
server {
    listen       8080;
    server_name  localhost;

    # プロジェクトのルートフォルダを公開
    location / {
        root   C:/Users/MyUser/Documents/my-website;
        index  index.html;
    }
}
```

設定反映後、ブラウザから各ページへのアクセス：

| アクセスURL | 表示されるページ |
|---|---|
| `http://localhost:8080/` | トップページ（index.html） |
| `http://localhost:8080/about.html` | 会社概要ページ |
| `http://localhost:8080/contact.html` | お問い合わせページ |
| `http://localhost:8080/css/style.css` | スタイルシート |
| `http://localhost:8080/data/news.json` | ニュースデータ（JSON） |

---

### シーン3：AIエージェント開発環境の構築（フロント＋バックエンド連携）

フロントエンド（HTML/JS）と、AIバックエンド（Node.js や Python の API サーバー）を組み合わせた開発環境の構成例です。

#### 構成イメージ

```
ブラウザ
  │
  │ http://localhost:8080/
  ▼
nginx（ポート8080）
  ├── /         → フロントエンド（HTML/JS）を配信
  └── /api/     → バックエンドAPI（localhost:3000）に転送
                    ↓
              Node.js / Python API サーバー（ポート3000）
```

#### フロントエンド側のサンプル（fetch で API を呼び出す）

```javascript
// フロントエンドの script.js
// /api/ へのリクエストが nginx を経由してバックエンドに届く
fetch('/api/recommend')
  .then(res => res.json())
  .then(data => {
    console.log('AIからの提案:', data.message);
  });
```

#### nginx.conf 設定例

```nginx
server {
    listen       8080;
    server_name  localhost;

    # フロントエンド（HTML/CSS/JS）を配信
    location / {
        root   C:/Users/MyUser/Documents/ai-app/frontend;
        index  index.html;
    }

    # /api/ 以下のリクエストをバックエンドAPIに転送
    location /api/ {
        proxy_pass         http://localhost:3000/;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        
        # タイムアウト設定（AIの処理が長い場合は増やす）
        proxy_read_timeout 120s;
    }
}
```

> **ポイント**：この構成により、ブラウザからは `http://localhost:8080/api/recommend` というひとつのオリジンでアクセスするため、CORSエラーが発生しません。フロントとバックが別ポートで動いていても、nginxがまとめてくれます。

---

### シーン4：アクセスログでリクエスト状況を確認する

nginx は `C:\nginx\logs\access.log` にアクセス記録を残します。

```powershell
# 最新20行のアクセスログを表示
Get-Content C:\nginx\logs\access.log -Tail 20
```

<b>***出力例***</b>：

```
127.0.0.1 - - [12/Mar/2026:14:30:01 +0900] "GET / HTTP/1.1" 200 612 "-" "Mozilla/5.0..."
127.0.0.1 - - [12/Mar/2026:14:30:01 +0900] "GET /css/style.css HTTP/1.1" 200 1024 "-" "..."
127.0.0.1 - - [12/Mar/2026:14:30:02 +0900] "GET /data/products.json HTTP/1.1" 200 256 "-" "..."
```

各フィールドの意味：

| フィールド | 内容 | 例 |
|---|---|---|
| `127.0.0.1` | アクセス元IPアドレス | localhost = 127.0.0.1 |
| `[12/Mar/2026:14:30:01 +0900]` | アクセス日時 | |
| `"GET / HTTP/1.1"` | リクエストの種類とパス | GETメソッドでトップページを要求 |
| `200` | HTTPステータスコード | 200=成功、404=ファイルなし、500=サーバーエラー |
| `612` | レスポンスのバイト数 | |

エラーログは `C:\nginx\logs\error.log` で確認できます：

```powershell
# エラーログを表示
Get-Content C:\nginx\logs\error.log -Tail 20
```

---

## Windows起動時の自動起動設定

nginx は `start nginx` コマンドを実行するたびに手動で起動する必要があります。PCを再起動するたびに起動し直すのは面倒です。Windowsのタスクスケジューラを使って、PC起動時に自動で nginx を起動する設定ができます。

### タスクスケジューラを使った自動起動

#### ステップ 1：タスクスケジューラを開く

1. **Windowsキー**を押して、**「タスクスケジューラ」**と入力し、起動します。
2. 右側の**「タスクの作成」**をクリックします。

#### ステップ 2：全般タブの設定

| 項目 | 設定値 |
|---|---|
| **名前** | `nginx 自動起動`（任意の名前） |
| **セキュリティオプション** | 「ユーザーがログオンしているかどうかにかかわらず実行する」を選択 |
| **最上位の特権で実行する** | チェックを入れる（管理者権限で実行） |

#### ステップ 3：トリガータブの設定

1. **「新規...」**をクリック
2. **「タスクの開始」**を**「スタートアップ時」**に設定
3. **「OK」**をクリック

#### ステップ 4：操作タブの設定

1. **「新規...」**をクリック
2. 以下のように設定します：

| 項目 | 設定値 |
|---|---|
| **操作** | `プログラムの開始` |
| **プログラム/スクリプト** | `C:\nginx\nginx.exe` |
| **開始（オプション）** | `C:\nginx` |

3. **「OK」**をクリック

#### ステップ 5：完了と確認

1. **「OK」**でタスクを保存します（パスワードを求められたらWindowsのパスワードを入力）。
2. PCを再起動して、自動的に nginx が起動するか確認します：

```powershell
tasklist | findstr nginx
```

<b>***出力例（自動起動が成功している場合）***</b>：

```
nginx.exe                     1234 Console                    1      8,192 K
nginx.exe                     1288 Console                    1      8,576 K
```

> **注意**：「ユーザーがログオンしているかどうかにかかわらず実行する」を選択した場合、PC起動時に nginx のコンソール窓は一切表示されず、バックグラウンドで完全に隠れて動作します。本当に動いているか不安になった場合は、必ず上記の `tasklist` コマンドで確認してください。何度もタスクを実行してしまうとプロセスが複数立ち上がってしまいます。

### 自動起動の無効化

自動起動が不要になった場合は、タスクスケジューラで作成したタスクを右クリック →「無効」または「削除」を選択してください。

---

## よくある質問とトラブルシューティング

### Q1. nginxが「(OS 10048): Only one usage of each socket address is normally permitted」というエラーで起動しません。

**A**. ポート80が他のアプリケーション（IIS, Skype, Apacheなど）によって既に使用されています。

**解決方法 1**：nginx.conf でポートを変更する（推奨）

`C:\nginx\conf\nginx.conf` を開き：

```nginx
# 変更前
listen       80;

# 変更後（8080など、空いているポートに変更）
listen       8080;
```

変更後は `.\nginx -s reload`（起動中の場合）または `start nginx` で起動し直します。

**解決方法 2**：競合しているアプリを確認して停止する

```powershell
# ポート80を使用しているプロセスのPIDを確認
netstat -ano | findstr :80

# PIDを指定してプロセス情報を確認
tasklist /FI "PID eq 1234"
```

<b>***出力例***</b>：

```
イメージ名                     PID セッション名     セッション#  メモリ使用量
========================= ======== ================ =========== ============
inetinfo.exe                  1234 Services                   0     12,345 K
```

プロセス名を確認して、不要であれば停止します。

---

### Q2. 設定ファイルを書き換えたのに反映されません。

**A**. 以下の手順で確認・対処してください。

**まず設定ファイルの文法チェックを実行する**：

```powershell
cd C:\nginx
.\nginx -t
```

<b>***出力例（文法エラーがある場合）***</b>：

```
nginx: [emerg] unknown directive "listten" in C:\nginx/conf/nginx.conf:36
nginx: configuration file C:\nginx/conf/nginx.conf test failed
```

エラーが表示された場合は、メッセージの行番号（上記では36行目）を確認し、nginx.conf を修正してください。

**文法が正しければリロードする**：

```powershell
.\nginx -s reload
```

**それでも反映されない場合は完全に再起動する**：

```powershell
# 1. 停止
.\nginx -s stop

# 2. プロセスが残っていないか確認
tasklist | findstr nginx

# 3. プロセスが残っている場合は強制終了（管理者権限が必要）
taskkill /IM nginx.exe /F

# 4. 再起動
start nginx
```

---

### Q3. ブラウザで `http://localhost/` を開くと「接続できません」と表示されます。

**A**. nginx が起動していない可能性が高いです。以下を順番に確認してください。

```powershell
# nginx が起動しているか確認
tasklist | findstr nginx
```

何も表示されない場合は nginx が停止しています：

```powershell
cd C:\nginx

# 文法チェックしてから起動
.\nginx -t
start nginx
```

起動後にブラウザで再度アクセスしてください。

---

### Q4. 設定ファイルのパスを変えたら「404 Not Found」が表示されます。

**A**. `root` ディレクティブのパス指定に誤りがある可能性があります。

よくあるミスと正しい書き方：

```nginx
# ❌ 誤り：バックスラッシュを使っている
root   C:\Users\MyUser\Documents\my-project;

# ❌ 誤り：末尾にバックスラッシュがある
root   C:/Users/MyUser/Documents/my-project/;

# ✅ 正しい：スラッシュを使い、末尾なし
root   C:/Users/MyUser/Documents/my-project;
```

フォルダが実際に存在するか確認する方法：

```powershell
# フォルダが存在するか確認
Test-Path "C:\Users\MyUser\Documents\my-project"
```

<b>***出力例（存在する場合）***</b>：

```
True
```

`False` が返った場合は、パスが間違っているかフォルダが存在しません。正しいパスを指定し直してください。

---

### Q5. アクセスはできるが、JSONファイルが読み込めません（まだCORSエラーが出ます）。

**A**. `file://` プロトコルでページを開いている可能性があります。ブラウザのアドレスバーを確認してください。

- `file:///C:/...` → nginx を使っていません。`http://localhost:8080/` でアクセスしてください
- `http://localhost:8080/` → nginx 経由で正しくアクセスできています

nginx 経由でアクセスしているのにまだCORSエラーが出る場合は、エラーログを確認します：

```powershell
Get-Content C:\nginx\logs\error.log -Tail 20
```

---

### Q6. serveパッケージとの使い分けはどうすればいいですか？

**A**. `serve` はコマンド一行で起動できるため、数分程度の動作確認には非常に便利です。しかし、AIエージェントの開発など、継続的にサーバーを立ち上げ、プロキシ設定やパスの書き換えが必要な場合は、最初から <b>***nginx***</b> を導入することを強く推奨します。

| シーン | 推奨ツール |
|---|---|
| ちょっとHTMLを開いて確認したい | `serve` |
| JSON読み込みのCORSエラーを一時的に解消したい | `serve` |
| バックエンドAPIと組み合わせて開発している | `nginx` |
| PC起動時に自動でサーバーを立ち上げたい | `nginx` |
| 本番に近い環境でテストしたい | `nginx` |

---

### Q7. nginx を完全にアンインストールするにはどうすればいいですか？

**A**. nginx はレジストリへの書き込みを行わないため、フォルダを削除するだけでアンインストール完了です。

```powershell
# 1. まず nginx を停止する
cd C:\nginx
.\nginx -s stop

# 2. プロセスが停止したか確認
tasklist | findstr nginx
# → 何も表示されればOK

# 3. フォルダを削除する
Remove-Item -Recurse -Force C:\nginx
```

タスクスケジューラに自動起動を登録していた場合は、タスクスケジューラからも削除してください。

---

## なぜ nginx は「インストーラー」を用意しないのか？

有名なソフトなのに、なぜいまだに `ZIP` 展開の `exe` 直叩きという「硬派」なスタイルを貫いているのか。そこにはサーバー向けソフトウェア特有の文化があります。

### 1. 「ポータビリティ（移植性）」の重視

nginx は、**Windows レジストリを一切汚さない**設計になっています（本ドキュメントのQ7「アンインストール」の項目からもわかるとおり、フォルダを削除するだけで完全にアンインストール完了です）。

| 方式 | 特徴 |
|---|---|
| **インストーラー（.msiなど）** | OSの深い場所に設定を書き込み、アンインストールもOS経由で行う |
| **nginx方式** | フォルダを移動したり、まるごとコピーしたりするだけで別のサーバーへ引っ越しが可能 |

この「シンプルさ」が、インフラエンジニアには好まれます。

### 2. 「サーバー管理」の標準的な作法

サーバー用のミドルウェア（Apache, Redis, PostgreSQL のバイナリ版など）の世界では、特に Linux/Unix 環境において「インストーラーを使わずにバイナリを直接配置する」ことが標準的な作法となっているケースが多いです。

- 複数のバージョンを同じサーバー内で共存させたり、特定のディレクトリ配下だけで動作させたりする制御がしやすいためです。
- パッケージマネージャー（`apt`, `yum` など）が使えない環境や、バージョンを厳密に固定したい本番環境では、バイナリ直接配置が特に重宝されます。

### 3. Windows 版は「メインではない」という側面も

nginx はもともと Linux/Unix 環境で最大のパフォーマンスを発揮するように設計されています。Windows 版の位置付けは、公式が明示的に認めています：

> **公式 GitHub（nginx/nginx）の記述**：
> "Note that the current implementation of NGINX for Windows is at the **Proof-of-Concept** stage and should only be used for **development and testing purposes**."
>（意訳：Windows版の現在の実装は概念実証段階であり、開発・テスト目的のみでの使用が推奨されます）

さらに、公式の Windows 向けドキュメント（nginx.org）でも「**ベータバージョン**」と明記されており、接続処理方式が `select()` / `poll()` のみに限定されているため、Linux 版と比較して高いパフォーマンスや拡張性は期待できません。

このような位置付けから、インストーラーを開発・維持するコストをかけるよりも、軽量なバイナリ（ZIP）提供にとどめているという背景があります。

> **まとめると**：nginx の ZIP 配布は「手抜き」ではなく、レジストリを汚さないポータブル設計・サーバー業界の文化・Windows 版の開発用途という3つの理由が重なった、合理的な選択です。

---

## まとめ

本ガイドブックでは、<b>***nginx***</b> の導入と活用について網羅的に解説しました。Windows環境でのセットアップはZIPを展開して起動するだけの非常にシンプルなものです。

### 最初の一歩：60秒での実行

```powershell
# 1. ZIPを C:\nginx に展開済みとして、設定を確認
cd C:\nginx
.\nginx -t

# 2. 起動
start nginx

# 3. ブラウザで確認
# → http://localhost/ にアクセスして "Welcome to nginx!" が表示されれば成功
```

この手順で、<b>***CORSエラーから解放***</b>され、本物のWebサーバー環境での開発が可能になります。

### 導入のメリット

- <span style="font-size:1.2em">⚡</span> **開発効率の向上**：CORSエラーに悩む時間をゼロにします。
- <span style="font-size:1.2em">🛡️</span> **安定した環境**：評判の良いnginxによる堅牢なサーバー構成。
- <span style="font-size:1.2em">🔄</span> **柔軟な連携**：TomcatやバックエンドAPIとのシームレスな統合。

---

## 参考リンク一覧

| リンク | 詳細 |
|--------|------|
| [nginx 公式ダウンロード](https://nginx.org/en/download.html) | Windows版のZIP本体 |
| [nginx Windows版ドキュメント](https://nginx.org/en/docs/windows.html) | 公式の使い方案内 |
| [nginx 設定ディレクティブ一覧](https://nginx.org/en/docs/dirindex.html) | 設定キーワードの全リファレンス |
| [MDN - CORS（Cross-Origin Resource Sharing）](https://developer.mozilla.org/ja/docs/Glossary/CORS) | CORSの詳細解説（日本語） |

---

**更新日時**：2026年 03月 12日

<b>***本ガイドブックが、あなたのAIエージェント開発をよりスムーズに進める一助となれば幸いです。もし設定ファイルの詳細や、より複雑なリバースプロキシ構成について知りたい場合は、いつでもご相談ください！***</b>
