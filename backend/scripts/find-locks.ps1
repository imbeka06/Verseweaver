$ErrorActionPreference = 'SilentlyContinue'
Get-Process node | ForEach-Object {
  $id = $_.Id
  $mods = $_.Modules | Where-Object { $_.ModuleName -like '*lightningcss*' -or $_.ModuleName -like '*query_engine*' -or $_.ModuleName -like '*vite*' }
  if ($mods) {
    [PSCustomObject]@{
      Id        = $id
      StartTime = $_.StartTime
      Modules   = ($mods.ModuleName -join ', ')
    }
  }
} | Format-Table -AutoSize
