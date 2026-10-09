Add-Type -AssemblyName System.Drawing
$fonts=New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Bold.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Regular.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/FlameSans-Regular.ttf')
$entries=@(
@('titleMain','Batata','Flame Bold',92),@('titleClassic','Clássica','Flame Bold',90),@('titleCheddar','Cheddar','Flame Bold',82),@('titleBacon','& Bacon','Flame Bold',84),@('titleFurious','Furiosa','Flame Bold',92),
@('descA1','Batatas douradas, crocantes por fora','Flame Sans',18),@('descA2','e macias por dentro. Do jeito que você gosta.','Flame Sans',18),
@('descB1','Batatas crocantes com cheddar cremoso','Flame Sans',18),@('descB2','e pedacinhos de bacon. Uma combinação irresistível.','Flame Sans',17),
@('descC1','Cheddar, bacon e jalapeño sobre batatas','Flame Sans',18),@('descC2','crocantes. Mais sabor com um toque de pimenta.','Flame Sans',17),
@('section','Escolha sua batata','Flame Bold',54),@('sizeLabel','Escolha o tamanho','Flame Sans',14),@('portion','Porção M','Flame Sans',14),@('individual','Individual','Flame Sans',14),@('quantity','Quantidade','Flame Sans',12),@('one','1','Flame Sans',18),
@('nameA','Batata Clássica','Flame',22),@('nameB','Cheddar & Bacon','Flame',22),@('nameC','Batata Furiosa','Flame',22),
@('priceA','R$ 14,90','Flame Bold',36),@('priceB','R$ 21,90','Flame Bold',36),@('priceC','R$ 23,90','Flame Bold',36),
@('totalA','R$ 14,90','Flame Bold',61),@('totalB','R$ 21,90','Flame Bold',61),@('totalC','R$ 23,90','Flame Bold',61),
@('flavorA','Crocante e dourada','Flame Sans',22),@('flavorB','Cheddar cremoso + bacon','Flame Sans',22),@('flavorC','Toque de jalapeño','Flame Sans',22)
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
$result | ConvertTo-Json -Depth 5 -Compress | Set-Content -Encoding utf8 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/fries-outlines.json'




