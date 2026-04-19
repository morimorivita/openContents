# ============================================================
# generate_insert_psLib.ps1
# psLib.json から UTF-8 対応の INSERT SQL を生成するスクリプト
# ============================================================

###$jsonPath = "C:\nginx\openContents\psLib\psLib.json"
###$sqlPath  = "C:\nginx\openContents\psLib\insert_psLib.sql"

$jsonPath = Join-Path $PSScriptRoot "psLib.json"
$sqlPath  = Join-Path $PSScriptRoot "insert_psLib.sql"

# ① .NET の UTF8Encoding で正確に読み込む（PowerShell の Get-Content より確実）
$json = [System.IO.File]::ReadAllText($jsonPath, [System.Text.Encoding]::UTF8)
$data = $json | ConvertFrom-Json
Write-Host "読み込み完了: $($data.Count) 件"

# ② SQL インジェクション対策：単一引用符をエスケープする関数
function esc($s) {
    if ($null -eq $s) { return "" }
    return $s.ToString() -replace "'", "''"
}

# ③ SQL 行を蓄積するリスト
$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add("USE MAINDB;")
$lines.Add("GO")
$lines.Add("SET NOCOUNT ON;  -- 「○ 行処理されました」を非表示にして高速化")
$lines.Add("")

foreach ($r in $data) {
    $sql  = "INSERT INTO dbo.TBL_PSLIB "
    $sql += "(no,platform,enhanced,title,count,notes_titles,"
    $sql += "publisher,developer,genre,price,release_date,"
    $sql += "description,url,notes,ps_plus,package) VALUES ("
    $sql += "$($r.no),"
    $sql += "N'$(esc $r.platform)',"
    $sql += "N'$(esc $r.enhanced)',"
    $sql += "N'$(esc $r.title)',"
    $sql += "$($r.count),"
    $sql += "N'$(esc $r.notes_titles)',"
    $sql += "N'$(esc $r.publisher)',"
    $sql += "N'$(esc $r.developer)',"
    $sql += "N'$(esc $r.genre)',"
    $sql += "N'$(esc $r.price)',"
    $sql += "N'$(esc $r.release_date)',"
    $sql += "N'$(esc $r.description)',"
    $sql += "N'$(esc $r.url)',"
    $sql += "N'$(esc $r.notes)',"
    $sql += "N'$(esc $r.ps_plus)',"
    $sql += "N'$(esc $r.package)');"
    $lines.Add($sql)
}

$lines.Add("")
$lines.Add("SET NOCOUNT OFF;")
$lines.Add("SELECT COUNT(*) AS 挿入件数 FROM dbo.TBL_PSLIB;")

# ④ BOM付き UTF-8 で出力（SSMS での文字化けを防ぐ）
$utf8bom = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllLines($sqlPath, $lines, $utf8bom)

Write-Host "SQL ファイルを出力しました: $sqlPath"
Write-Host "$($data.Count) 件分の INSERT 文を生成しました。"