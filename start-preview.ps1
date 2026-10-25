Start-Process -WindowStyle Hidden node -ArgumentList 'node_modules\astro\astro.js','preview','--port','4322' -WorkingDirectory 'D:\zcodework\tiger-blog' -RedirectStandardOutput 'D:\zcodework\tiger-blog\preview.log' -RedirectStandardError 'D:\zcodework\tiger-blog\preview.err.log'
Write-Output 'preview started'
