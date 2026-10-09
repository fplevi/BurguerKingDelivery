Add-Type -AssemblyName System.Drawing
$fonts=New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Bold.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Regular.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/FlameSans-Regular.ttf')
$entries=@(
@('titleA1','Coca-','Flame Bold',92),@('titleA2','Cola','Flame Bold',100),@('titleB1','Guaraná','Flame Bold',86),@('titleB2','gelado','Flame Bold',90),@('titleC1','Suco de','Flame Bold',82),@('titleC2','Laranja','Flame Bold',90),
@('descA1','O sabor clássico, com gelo e muita refrescância.','Flame Sans',18),@('descA2','Perfeito para acompanhar seu pedido.','Flame Sans',18),
@('descB1','Guaraná gelado, leve e cheio de sabor.','Flame Sans',18),@('descB2','Uma combinação perfeita com seu favorito.','Flame Sans',18),
@('descC1','O sabor da laranja em cada gole.','Flame Sans',18),@('descC2','Uma opção refrescante para acompanhar seu pedido.','Flame Sans',17),
@('section','Escolha sua bebida','Flame Bold',54),@('sizeLabel','Escolha o volume','Flame Sans',14),@('volume','500 ml','Flame Sans',14),@('individual','Individual','Flame Sans',14),
@('sizeP','300 ml','Flame Sans',14),@('sizeM','500 ml','Flame Sans',14),@('sizeG','700 ml','Flame Sans',14),
@('nameA','Coca-Cola','Flame',22),@('nameB','Guaraná','Flame',22),@('nameC','Suco de Laranja','Flame',22),
@('priceA','R$ 9,90','Flame Bold',36),@('priceB','R$ 9,90','Flame Bold',36),@('priceC','R$ 12,90','Flame Bold',36),
@('totalA','R$ 9,90','Flame Bold',61),@('totalB','R$ 9,90','Flame Bold',61),@('totalC','R$ 12,90','Flame Bold',61),
@('flavorA','Clássica e refrescante','Flame Sans',22),@('flavorB','Sabor que combina com tudo','Flame Sans',22),@('flavorC','Refrescância em cada gole','Flame Sans',22)
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
$result | ConvertTo-Json -Depth 5 -Compress | Set-Content -Encoding utf8 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/drinks-outlines.json'





