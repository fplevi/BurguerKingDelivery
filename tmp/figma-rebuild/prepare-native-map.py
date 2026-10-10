import json, re
from pathlib import Path
result = {}
for name in ['official-drinks-outlines','sides-outlines','catalog-outlines','combo-outlines','outlines','drinks-outlines','fries-outlines','order-outlines']:
    path = Path(__file__).parent / (name + '.json')
    if not path.exists(): continue
    for entry in json.loads(path.read_text(encoding='utf-8-sig')).values():
        if 'path' not in entry: continue
        tokens = re.findall(r'[A-Za-z]|[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?', entry['path'])
        def normalize(t):
            if t.isalpha(): return t
            n = round(float(t), 3)
            return str(int(n)) if n == int(n) else str(n)
        canonical = ','.join(map(normalize, tokens))
        h = 2166136261
        for char in canonical: h = ((h ^ ord(char)) * 16777619) & 0xffffffff
        result[str(len(tokens)) + ':' + str(h)] = {k: entry[k] for k in ['text','font','size','width','height']}
print(json.dumps(result, ensure_ascii=False))
