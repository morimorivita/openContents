-- ============================================================
-- ファイル  : create_TBL_PSLIB.sql
-- 目的      : psLib.json を読み込み MAINDB.dbo.TBL_PSLIB を作成する
-- 対象環境  : SQL Server 2025 Express
-- 文字コード: UTF-8（CODEPAGE='65001' で対応）
-- 作成日    : 2026-03-28
-- ============================================================
 
 
-- ============================================================
-- ■ STEP 0: OPENROWSET(BULK ...) の前提設定について
-- ============================================================
-- OPENROWSET の BULK 形式はファイルを直接読み込む機能です。
-- SQL Server サービスアカウントに対して、読み込むファイルへの
-- 「読み取り」権限が必要です。
--
-- もし「Ad Hoc Distributed Queries が無効」というエラーが出た場合は
-- 以下のブロックのコメントを外して先に実行してください。
-- （Express版でも sp_configure は使用できます）
-- ============================================================
 
/*
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'Ad Hoc Distributed Queries', 1;
RECONFIGURE;
*/
 
 
-- ============================================================
-- ■ STEP 1: 作業データベースを MAINDB に切り替える
-- ============================================================
-- 以降の DDL / DML はすべてこのデータベース上で実行されます。
-- ============================================================
USE MAINDB;
GO
 
 
-- ============================================================
-- ■ STEP 2: TBL_PSLIB が既に存在する場合は削除する
-- ============================================================
-- 再実行時に「オブジェクトが既に存在する」エラーを防ぐため、
-- 存在チェックをしてから DROP します。
-- ============================================================
IF OBJECT_ID(N'dbo.TBL_PSLIB', N'U') IS NOT NULL
BEGIN
    DROP TABLE dbo.TBL_PSLIB;
    PRINT 'TBL_PSLIB を削除しました。';
END
GO
 
 
-- ============================================================
-- ■ STEP 3: TBL_PSLIB テーブルを新規作成する
-- ============================================================
-- JSON の各キーに対応するカラムを定義します。
--
-- 【型の選定方針】
--   - no           : 連番なので INT
--   - count        : 数値なので INT
--   - platform     : 'PS5'/'PS4'/'Vita' 等の短い文字列
--   - enhanced     : '◯' または '' の 1 文字フラグ
--   - ps_plus      : '◯' または '' の 1 文字フラグ
--   - price        : '6,380円' / '未定' など文字列のまま保持
--   - release_date : '2026年6月25日(木)' など日本語形式のまま保持
--   - description  : 長い説明文のため NVARCHAR(MAX)
--   - notes        : 長い備考のため NVARCHAR(MAX)
--   - title        : 長いタイトルに備えて NVARCHAR(500)
--
-- 【NULL許容の方針】
--   - no, platform, title は必須項目とし NOT NULL
--   - その他は空文字が入る場合があるため NULL 許容
--
-- 【主キー】
--   - no は JSON 上で 1〜550 の連番になっており一意のため
--     単独主キーとして使用します。
-- ============================================================
CREATE TABLE dbo.TBL_PSLIB (
    no           INT            NOT NULL,   -- 通し番号（1始まりの連番）
    platform     NVARCHAR(20)   NOT NULL,   -- プラットフォーム（PS5 / PS4 / Vita 等）
    enhanced     NVARCHAR(5)    NOT NULL    -- PS Pro Enhanced 対応フラグ（◯ or 空文字）
                                DEFAULT N'',
    title        NVARCHAR(500)  NOT NULL,   -- ゲームタイトル（日本語・英語混在）
    count        INT            NOT NULL    -- カウント（データ上は常に 1）
                                DEFAULT 1,
    notes_titles NVARCHAR(500)  NULL,       -- タイトルのメモ書き（ダブルクォート付き等）
    publisher    NVARCHAR(200)  NULL,       -- パブリッシャー（販売元）
    developer    NVARCHAR(200)  NULL,       -- デベロッパー（開発元）
    genre        NVARCHAR(100)  NULL,       -- ジャンル
    price        NVARCHAR(50)   NULL,       -- 価格（文字列。「未定」も含むため文字列型）
    release_date NVARCHAR(50)   NULL,       -- 発売日（日本語形式の文字列）
    description  NVARCHAR(MAX)  NULL,       -- ゲーム説明文（長文）
    url          NVARCHAR(500)  NULL,       -- 公式サイト URL
    notes        NVARCHAR(MAX)  NULL,       -- 備考（長文になる場合あり）
    ps_plus      NVARCHAR(5)    NULL,       -- PS Plus 対応フラグ（◯ or 空文字）
    package      NVARCHAR(100)  NULL,       -- パッケージ情報
 
    -- no を主キーとする（JSON データ上で 1〜550 の一意な連番）
    CONSTRAINT PK_TBL_PSLIB PRIMARY KEY CLUSTERED (no,count)
);
GO
PRINT 'TBL_PSLIB を作成しました。';
GO
 