# ================================
# 設定
# ================================
$scriptDir = $PSScriptRoot
$jsonPath  = Join-Path $scriptDir "psLib.json"

$connectionString = "Server=localhost\\SVR1;Database=master;User Id=ai;password=ai;"
$tableName = "TBL_PSLIB"

# ================================
# JSON読み込み
# ================================
$jsonText = Get-Content $jsonPath -Raw -Encoding UTF8
$jsonData = $jsonText | ConvertFrom-Json

# ================================
# DataTable作成
# ================================
$dt = New-Object System.Data.DataTable

# 全カラム定義（JSONに完全対応）
$dt.Columns.Add("no",            [int])    | Out-Null
$dt.Columns.Add("platform",      [string]) | Out-Null
$dt.Columns.Add("enhanced",      [string]) | Out-Null
$dt.Columns.Add("title",         [string]) | Out-Null
$dt.Columns.Add("count",         [int])    | Out-Null
$dt.Columns.Add("notes_titles",  [string]) | Out-Null
$dt.Columns.Add("publisher",     [string]) | Out-Null
$dt.Columns.Add("developer",     [string]) | Out-Null
$dt.Columns.Add("genre",         [string]) | Out-Null
$dt.Columns.Add("price",         [string]) | Out-Null
$dt.Columns.Add("release_date",  [string]) | Out-Null
$dt.Columns.Add("description",   [string]) | Out-Null
$dt.Columns.Add("url",           [string]) | Out-Null
$dt.Columns.Add("notes",         [string]) | Out-Null
$dt.Columns.Add("ps_plus",       [string]) | Out-Null
$dt.Columns.Add("package",       [string]) | Out-Null

# ================================
# データ投入
# ================================
foreach ($item in $jsonData) {
    $row = $dt.NewRow()

    $row["no"]           = $item.no
    $row["platform"]     = $item.platform
    $row["enhanced"]     = $item.enhanced
    $row["title"]        = $item.title
    $row["count"]        = $item.count
    $row["notes_titles"] = $item.notes_titles
    $row["publisher"]    = $item.publisher
    $row["developer"]    = $item.developer
    $row["genre"]        = $item.genre
    $row["price"]        = $item.price
    $row["release_date"] = $item.release_date
    $row["description"]  = $item.description
    $row["url"]          = $item.url
    $row["notes"]        = $item.notes
    $row["ps_plus"]      = $item.ps_plus
    $row["package"]      = $item.package

    $dt.Rows.Add($row)
}

# ================================
# SQL ServerへBulk Insert
# ================================
Add-Type -AssemblyName System.Data

$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$connection.Open()

$bulkCopy = New-Object System.Data.SqlClient.SqlBulkCopy($connection)

$bulkCopy.DestinationTableName = $tableName

# カラムマッピング
foreach ($col in $dt.Columns) {
    $bulkCopy.ColumnMappings.Add($col.ColumnName, $col.ColumnName) | Out-Null
}

# パフォーマンス設定（おすすめ）
$bulkCopy.BatchSize = 5000
$bulkCopy.BulkCopyTimeout = 0

# 実行
$bulkCopy.WriteToServer($dt)

$connection.Close()

Write-Host "Bulk Insert 完了！（件数: $($dt.Rows.Count)）"