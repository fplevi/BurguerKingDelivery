Add-Type -AssemblyName System.Drawing
$fonts=New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Bold.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Regular.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/FlameSans-Regular.ttf')
$entries=@(
@('zero1','Coca-Cola','Flame Bold',74),@('zero2','Zero','Flame Bold',100),@('natural','Natural One','Flame Bold',44),
@('descA1','O sabor clássico, gelado e na lata.','Flame Sans',18),@('descA2','Perfeito para acompanhar seu pedido.','Flame Sans',18),
@('descB1','Todo o sabor de Coca-Cola, zero açúcar.','Flame Sans',18),@('descB2','Gelada para acompanhar seu favorito.','Flame Sans',18),
@('descC1','Suco Natural One de Laranja, 100% natural.','Flame Sans',18),@('descC2','Na garrafa, pronto para refrescar seu dia.','Flame Sans',18),
@('name0','Coca-Cola','Flame',21),@('name1','Coca-Cola Zero','Flame',21),@('name2','Natural One Laranja','Flame',21),@('name3','Natural One Uva','Flame',21),@('name4','Sprite','Flame',21),@('name5','Fanta Laranja','Flame',21),@('name6','Água de Copo','Flame',21),
@('packCan','Lata · 350 ml','Flame Sans',17),@('packBottle','Garrafa · 300 ml','Flame Sans',17),@('packWater','Copo lacrado','Flame Sans',17),@('packLabel','Embalagem','Flame Sans',14),@('unit','1 unidade','Flame Sans',14),@('single','Individual','Flame Sans',14),@('flavorZero','Sabor clássico, zero açúcar','Flame Sans',22)
)
$result=@{}
$ci=[System.Globalization.CultureInfo]::InvariantCulture
foreach($e in $entries){
 $fam=$fonts.Families | Where-Object Name -eq $e[2]
 $path=New-Object System.Drawing.Drawing2D.GraphicsPath
 $path.AddString($e[1],$fam,0,[single]$e[3],[System.Drawing.PointF]::new(0,0),[System.Drawing.StringFormat]::GenericTypographic)
 $bounds=$path.GetBounds(); $points=$path.PathPoints; $types=$path.PathTypes; $d=New-Object System.Text.StringBuilder
 for($i=0;$i -lt $points.Length;$i++){
  $kind=$types[$i] -band 7
  $xy=($points[$i].X-$bounds.X).ToString('0.###',$ci)+','+($points[$i].Y-$bounds.Y).ToString('0.###',$ci)
  if($kind -eq 0){[void]$d.Append('M'+$xy)}
  elseif($kind -eq 1){[void]$d.Append('L'+$xy)}
  elseif($kind -eq 3){
   $xy2=($points[$i+1].X-$bounds.X).ToString('0.###',$ci)+','+($points[$i+1].Y-$bounds.Y).ToString('0.###',$ci)
   $xy3=($points[$i+2].X-$bounds.X).ToString('0.###',$ci)+','+($points[$i+2].Y-$bounds.Y).ToString('0.###',$ci)
   [void]$d.Append('C'+$xy+' '+$xy2+' '+$xy3); $i+=2
  }
  if(($types[$i] -band 128) -ne 0){[void]$d.Append('Z')}
 }
 $result[$e[0]]=@{text=$e[1];font=$e[2];size=$e[3];width=$bounds.Width;height=$bounds.Height;path=$d.ToString()}
 $path.Dispose()
}
$result | ConvertTo-Json -Depth 5 -Compress | Set-Content -Encoding utf8 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/official-drinks-outlines.json'






