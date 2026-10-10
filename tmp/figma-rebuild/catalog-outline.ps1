$source = Get-Content 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/sides-outline.ps1' -Raw
$entries = @'
$entries=@(
@('heading','Hambúrgueres','Flame Bold',44),@('intro','Escolha seu favorito e monte seu pedido.','Flame Sans',18),
@('order','Seu pedido','Flame Bold',28),@('detail','Whopper Clássico','Flame Bold',26),
@('desc1','Carne grelhada, queijo, salada e','Flame Sans',16),@('desc2','o sabor clássico do Whopper.','Flame Sans',16),
@('edit','Alterar ingredientes','Flame Sans',16),@('ingredients','Com todos os ingredientes','Flame Sans',14),
@('solo','Só hambúrguer','Flame Sans',17),@('combo','Montar combo','Flame Sans',17),
@('comboDesc','Escolha acompanhamento e bebida','Flame Sans',13),
@('qty','Quantidade','Flame Sans',16),@('one','1','Flame Sans',18),
@('totalLabel','Total do item','Flame Sans',16),@('price','R$ 31,90','Flame Bold',30),
@('add','Adicionar ao carrinho','Flame Sans',17),@('choose','Escolher','Flame Sans',16),
@('selected','Selecionado','Flame Sans',15),@('consult','Ver preço e opções','Flame Sans',14),
@('cardprice','R$ 31,90','Flame Sans',17),@('count','8 opções para escolher','Flame Sans',15)
)
'@
$source=[regex]::Replace($source,'(?s)\$entries=@\(.*?\r?\n\)',[System.Text.RegularExpressions.MatchEvaluator]{param($m) $entries},1)
$source=$source.Replace('sides-outlines.json','catalog-outlines.json')
Invoke-Expression $source
$data=Get-Content 'D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/catalog-outlines.json' -Raw | ConvertFrom-Json
$svg='<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1600" viewBox="0 0 800 1600">'
$y=0
foreach($prop in $data.psobject.Properties){$e=$prop.Value;$svg+='<g id="'+$prop.Name+'" transform="translate(0 '+$y+')"><path fill="#502314" d="'+$e.path+'"/></g>';$y+=65}
$svg+='</svg>'
[IO.File]::WriteAllText('D:/Projetos/BurguerKingNewSite/tmp/figma-rebuild/catalog-type-atlas.svg',$svg)
