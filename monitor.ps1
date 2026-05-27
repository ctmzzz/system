while ($true) {
    try {
        $cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
        $os = Get-CimInstance Win32_OperatingSystem
        $totalMem = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
        $freeMem = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
        $usedMem = $totalMem - $freeMem
        $memPercent = [math]::Round(($usedMem / $totalMem) * 100, 1)
        Write-Output "$cpu,$memPercent,$totalMem,$usedMem,$freeMem"
    } catch {
        Write-Output "ERROR"
    }
    Start-Sleep -Seconds 2
}