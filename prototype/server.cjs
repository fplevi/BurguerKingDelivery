// Local preview server; node prototype/server.cjs
const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname;
http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const requested=pathname==='/'?'burger-playground.html':pathname.slice(1);
  const file=path.resolve(root,requested);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404);res.end('Not found');return}
    const types={'.html':'text/html; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);
  });
}).listen(4180,'127.0.0.1',()=>console.log('Prototype: http://127.0.0.1:4180'));
