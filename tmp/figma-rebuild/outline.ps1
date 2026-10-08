Add-Type -AssemblyName System.Drawing
$fonts=New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile('C:/Users/fplev/Downloads/Flame-Bold.ttf')
$fonts.AddFontFile('C:/Users/fplev/Downloads/Flame-Regular.ttf')
$fonts.AddFontFile('C:/Users/fplev/Downloads/FlameSans-Regular.ttf')
$entries=@(
@('h1','Seu próximo','Flame Bold',80),@('h2','favorito','Flame Bold',80),@('h3','está aqui.','Flame Bold',80),
@('section','Escolha seu hambúrguer','Flame Bold',60),
@('body1','Os sabores do Burger King','Flame Sans',24),@('body2','na sua casa, do seu jeito.','Flame Sans',24),
@('cta','Peça agora','Flame Sans',28),@('add','Adicionar','Flame Sans',17),
@('nav1','Batatas','Flame Sans',16),@('nav2','Bebidas','Flame Sans',16),@('nav3','Sobremesas','Flame Sans',16),
@('delivery','Entregar em:','Flame Sans',16),@('address','Asa Norte, Brasília - DF','Flame Sans',16),
@('n0','Whopper Clássico','Flame',22),@('n1','Bacon Cheddar Duplo','Flame',22),@('n2','Chicken Crispy','Flame',22),@('n3','Barbecue Melt','Flame',22),
@('n4','Mega Onion Burger','Flame',22),@('n5','Furioso Jalapeño','Flame',22),@('n6','Salad Grill','Flame',22),@('n7','Stacker Especial','Flame',22),
@('p0','R$ 31,90','Flame Bold',28),@('p1','R$ 36,90','Flame Bold',28),@('p2','R$ 29,90','Flame Bold',28),@('p3','R$ 33,90','Flame Bold',28),
@('p4','R$ 34,90','Flame Bold',28),@('p5','R$ 32,90','Flame Bold',28),@('p6','R$ 28,90','Flame Bold',28),@('p7','R$ 37,90','Flame Bold',28)
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
$result | ConvertTo-Json -Depth 5 -Compress | Set-Content -Encoding utf8 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/outlines.json'
Get-Content -Raw -LiteralPath 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/outlines.json'
