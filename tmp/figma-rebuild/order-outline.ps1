Add-Type -AssemblyName System.Drawing
$fonts=New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Bold.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Regular.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/FlameSans-Regular.ttf')
$entries=@(
@('title1','Whopper','Flame Bold',92),@('title2','Clássico','Flame Bold',100),
@('desc1','Pão com gergelim, carne grelhada, queijo derretido,','Flame Sans',18),@('desc2','alface crocante, tomate fresco e molho especial.','Flame Sans',18),
@('delivery','Entregar em','Flame Sans',12),@('address','Av. Paulista, 1578 - Bela Vista','Flame Sans',14),@('navburger','Hambúrgueres','Flame Sans',16),@('cart','Carrinho','Flame Sans',16),
@('price','R$ 31,90','Flame Bold',36),@('combo','Transformar em combo','Flame Sans',14),@('P','P','Flame Sans',16),@('M','M','Flame Sans',16),@('G','G','Flame Sans',16),@('comboM','Combo M:','Flame Sans',14),@('comboPrice','+ R$ 12,00','Flame Sans',14),
@('totalLabel','Total do pedido','Flame Sans',17),@('total','R$ 43,90','Flame Bold',61),@('addCart','Adicionar ao carrinho','Flame Sans',19),@('remove','Remover ingredientes','Flame Sans',22),@('selected','Selecionado','Flame Sans',14)
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
$result | ConvertTo-Json -Depth 5 -Compress | Set-Content -Encoding utf8 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/order-outlines.json'



