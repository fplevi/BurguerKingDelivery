Add-Type -AssemblyName System.Drawing
$fonts=New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Bold.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/Flame-Regular.ttf')
$fonts.AddFontFile('D:/Projetos/BurguerKingNewSite/prototype/Assets/fonts/FlameSans-Regular.ttf')
$entries=@(
@('nav','Acompanhamentos','Flame Sans',16),@('section','Escolha seu acompanhamento','Flame Bold',46),
@('title01','Batata','Flame Bold',86),@('title02','Frita','Flame Bold',90),@('title11','Onion','Flame Bold',86),@('title12','Rings','Flame Bold',90),@('title21','BK','Flame Bold',86),@('title22','Chicken','Flame Bold',90),
@('desc0','Batatas douradas e crocantes para acompanhar.','Flame Sans',17),@('desc1','Anéis de cebola empanados e crocantes.','Flame Sans',17),@('desc2','Pedaços de frango empanados e crocantes.','Flame Sans',17),
@('name0','Esferas do Dragão','Flame',21),@('name0b','de Pepperoni','Flame',21),@('name1','Batata Frita','Flame',21),@('name2','Balde de Batata','Flame',21),@('name3','Onion Rings','Flame',21),@('name4','BK Chicken','Flame',21),@('name5','Molhão Baconese','Flame',21),@('name6','Cebola Crispy','Flame',21),@('name7','Molhão Maionese','Flame',21),@('name7b','Cítrica','Flame',21),
@('portion','Porção individual','Flame Sans',16),@('quantity','Quantidade','Flame Sans',14),@('consult','Consultar preço','Flame Bold',30),@('one','1','Flame Sans',17),@('total','Total do pedido','Flame Sans',17),@('selected','Selecionado','Flame Sans',13)
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
$result | ConvertTo-Json -Depth 5 -Compress | Set-Content -Encoding utf8 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/sides-outlines.json'






