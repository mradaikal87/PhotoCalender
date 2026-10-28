Add-Type -AssemblyName System.Drawing

function Generate-Icon {
    param(
        [int]$size,
        [string]$outputPath,
        [bool]$isMaskable
    )

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    if ($isMaskable) {
        $p1 = New-Object System.Drawing.PointF 0, 0
        $p2 = New-Object System.Drawing.PointF ([float]$size), ([float]$size)
        $c1 = [System.Drawing.ColorTranslator]::FromHtml("#c2410c")
        $c2 = [System.Drawing.ColorTranslator]::FromHtml("#9a3412")
        $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2
        $g.FillRectangle($bgBrush, 0, 0, $size, $size)
        $bgBrush.Dispose()

        $margin = [int]($size * 0.16)
        $cx = $margin
        $cy = $margin
        $cw = $size - ($margin * 2)
        $ch = $cw
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
        $margin = [int]($size * 0.06)
        $cx = $margin
        $cy = $margin
        $cw = $size - ($margin * 2)
        $ch = $cw

        # Shadow
        $corner = [int]($cw * 0.18)
        $d = $corner * 2
        $sY = $cy + [int]($size * 0.03)
        $shadowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $shadowPath.AddArc($cx, $sY, $d, $d, 180, 90)
        $shadowPath.AddArc(($cx + $cw - $d), $sY, $d, $d, 270, 90)
        $shadowPath.AddArc(($cx + $cw - $d), ($sY + $ch - $d), $d, $d, 0, 90)
        $shadowPath.AddArc($cx, ($sY + $ch - $d), $d, $d, 90, 90)
        $shadowPath.CloseFigure()
        $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 0, 0, 0))
        $g.FillPath($shadowBrush, $shadowPath)
        $shadowBrush.Dispose()
        $shadowPath.Dispose()
    }

    $corner = [int]($cw * 0.18)
    $d = $corner * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc($cx, $cy, $d, $d, 180, 90)
    $path.AddArc(($cx + $cw - $d), $cy, $d, $d, 270, 90)
    $path.AddArc(($cx + $cw - $d), ($cy + $ch - $d), $d, $d, 0, 90)
    $path.AddArc($cx, ($cy + $ch - $d), $d, $d, 90, 90)
    $path.CloseFigure()

    # White card body
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.FillPath($whiteBrush, $path)
    $whiteBrush.Dispose()

    $stroke = [Math]::Max(1, [int]($size * 0.015))
    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#e4e0d6")), $stroke
    $g.DrawPath($pen, $path)
    $pen.Dispose()

    # Clip to card
    $state = $g.Save()
    $g.SetClip($path)

    # Top banner
    $hdrH = [int]($ch * 0.38)
    $bp1 = New-Object System.Drawing.PointF ([float]$cx), ([float]$cy)
    $bp2 = New-Object System.Drawing.PointF ([float]($cx + $cw)), ([float]($cy + $hdrH))
    $bc1 = [System.Drawing.ColorTranslator]::FromHtml("#ea580c")
    $bc2 = [System.Drawing.ColorTranslator]::FromHtml("#c2410c")
    $hdrBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $bp1, $bp2, $bc1, $bc2
    $g.FillRectangle($hdrBrush, $cx, $cy, $cw, $hdrH)
    $hdrBrush.Dispose()

    # Rings / Binder clips
    $clipW = [int]($cw * 0.08)
    $clipH = [int]($ch * 0.14)
    $clipY = $cy - [int]($clipH * 0.3)
    $c1X = $cx + [int]($cw * 0.22)
    $c2X = $cx + [int]($cw * 0.70)
    $ringBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.FillRectangle($ringBrush, $c1X, $clipY, $clipW, $clipH)
    $g.FillRectangle($ringBrush, $c2X, $clipY, $clipW, $clipH)
    $ringBrush.Dispose()

    $fontSize = [float]($hdrH * 0.44)
    $font = [System.Drawing.Font]::new("Arial", [float]$fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textY = [float]($cy + ($hdrH * 0.15))
    $textRect = New-Object System.Drawing.RectangleF ([float]$cx), $textY, ([float]$cw), ([float]($hdrH * 0.85))
    $g.DrawString("2027", $font, $textBrush, $textRect, $sf)
    $font.Dispose()
    $textBrush.Dispose()

    # Calendar dots/grid
    $gridTop = $cy + $hdrH + [int]($ch * 0.12)
    $gridBottom = $cy + $ch - [int]($ch * 0.12)
    $gridLeft = $cx + [int]($cw * 0.16)
    $gridRight = $cx + $cw - [int]($cw * 0.16)
    $cols = 4
    $rows = 3
    $dotSize = [int](($gridRight - $gridLeft) / ($cols * 2.2))

    $primaryDot = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#c2410c"))
    $grayDot = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#e2e8f0"))

    for ($r = 0; $r -lt $rows; $r++) {
        for ($c = 0; $c -lt $cols; $c++) {
            $dx = $gridLeft + [int]($c * (($gridRight - $gridLeft) / ($cols - 1)))
            $dy = $gridTop + [int]($r * (($gridBottom - $gridTop) / ($rows - 1)))
            $brush = if (($r * $cols + $c) -eq 5) { $primaryDot } else { $grayDot }
            $g.FillEllipse($brush, ($dx - [int]($dotSize/2)), ($dy - [int]($dotSize/2)), $dotSize, $dotSize)
        }
    }
    $primaryDot.Dispose()
    $grayDot.Dispose()

    $g.Restore($state)
    $path.Dispose()
    $g.Dispose()

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created $outputPath"
}

$dir = "d:\My personal\ARD-web-site\calendar-2027\calendar-2027\public\icons"
Generate-Icon -size 512 -outputPath "$dir\icon-512x512.png" -isMaskable $false
Generate-Icon -size 192 -outputPath "$dir\icon-192x192.png" -isMaskable $false
Generate-Icon -size 512 -outputPath "$dir\icon-maskable-512x512.png" -isMaskable $true
Generate-Icon -size 192 -outputPath "$dir\icon-maskable-192x192.png" -isMaskable $true
Generate-Icon -size 180 -outputPath "$dir\apple-touch-icon.png" -isMaskable $false
Generate-Icon -size 48 -outputPath "d:\My personal\ARD-web-site\calendar-2027\calendar-2027\public\favicon-48x48.png" -isMaskable $false
