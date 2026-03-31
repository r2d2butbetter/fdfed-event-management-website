import re
from pathlib import Path

base = Path('D:/fdfed_project/server')
index_path = base / 'index.js'
swagger_path = base / 'docs' / 'swagger.js'
routes_dir = base / 'routes'
verbs = ['get','post','put','patch','delete','options','head']
verb_re = '|'.join(verbs)

def strip_comments(s):
    out=[]; i=0; n=len(s); state='code'; q=''; tick=chr(96)
    while i<n:
        c=s[i]; nxt=s[i+1] if i+1<n else ''
        if state=='code':
            if c=='/' and nxt=='/': state='line'; i+=2; continue
            if c=='/' and nxt=='*': state='block'; i+=2; continue
            if c in ('"',"'",tick): q=c; state='str'; out.append(c); i+=1; continue
            out.append(c); i+=1; continue
        if state=='line':
            if c=='\n': out.append(c); state='code'
            i+=1; continue
        if state=='block':
            if c=='*' and nxt=='/': state='code'; i+=2; continue
            i+=1; continue
        if state=='str':
            out.append(c)
            if c=='\\' and i+1<n: out.append(s[i+1]); i+=2; continue
            if c==q: state='code'
            i+=1; continue
    return ''.join(out)

def norm(p):
    p=p.strip()
    if not p: return '/'
    if not p.startswith('/'): p='/'+p
    p=re.sub(r'/+','/',p)
    if len(p)>1 and p.endswith('/'): p=p[:-1]
    return p

def join(a,b):
    a=norm(a); b=norm(b)
    if a=='/': return b
    if b=='/': return a
    return norm(a+'/'+b.lstrip('/'))

def canon(p):
    res=[]
    for s in norm(p).split('/'):
        if not s: continue
        if s.startswith(':') or (s.startswith('{') and s.endswith('}')): res.append('{}')
        else: res.append(s)
    return '/'+'/'.join(res)

idx = strip_comments(index_path.read_text(encoding='utf-8'))
imports={m.group(1):m.group(2) for m in re.finditer(r"import\s+(\w+)\s+from\s+['\"]\./routes/([^'\"]+)\.js['\"]", idx)}
mounts={}
for m in re.finditer(r"app\.use\(\s*(['\"])([^'\"]+)\1\s*,\s*(\w+)\s*\)", idx, flags=re.S):
    pref,var=m.group(2),m.group(3)
    if var in imports: mounts.setdefault(imports[var],[]).append(norm(pref))

backend=[]
for m in re.finditer(rf"app\.({verb_re})\(\s*(['\"])([^'\"]+)\2", idx, flags=re.I):
    backend.append((m.group(1).upper(), norm(m.group(3))))

for rf in sorted(routes_dir.glob('*.js')):
    txt=strip_comments(rf.read_text(encoding='utf-8'))
    prefs=mounts.get(rf.stem,[])
    if not prefs: continue
    for m in re.finditer(rf"router\.route\(\s*(['\"])([^'\"]+)\1\s*\)\s*((?:\s*\.\s*(?:{verb_re})\s*\([^)]*\)\s*)+)", txt, flags=re.I|re.S):
        sub=norm(m.group(2)); chain=m.group(3)
        meths=re.findall(rf"\.\s*({verb_re})\s*\(", chain, flags=re.I)
        for me in meths:
            for p in prefs: backend.append((me.upper(), join(p,sub)))
    for m in re.finditer(rf"router\.({verb_re})\(\s*(['\"])([^'\"]+)\2", txt, flags=re.I):
        me,sub=m.group(1).upper(),norm(m.group(3))
        for p in prefs: backend.append((me, join(p,sub)))
backend=sorted(set(backend), key=lambda x:(x[0],x[1]))

sw=strip_comments(swagger_path.read_text(encoding='utf-8'))

def match_brace(t,open_i):
    d=0; i=open_i; n=len(t); ins=None; tick=chr(96)
    while i<n:
        c=t[i]
        if ins:
            if c=='\\': i+=2; continue
            if c==ins: ins=None
            i+=1; continue
        if c in ('"',"'",tick): ins=c; i+=1; continue
        if c=='{': d+=1
        elif c=='}':
            d-=1
            if d==0: return i
        i+=1
    return -1

doc=[]
for m in re.finditer(r"(['\"])(/[^'\"]*)\1\s*:\s*\{", sw, flags=re.S):
    path=norm(m.group(2)); oi=m.end()-1; ci=match_brace(sw,oi)
    if ci==-1: continue
    body=sw[oi+1:ci]
    for vm in re.finditer(r"(['\"]?)(get|post|put|patch|delete|options|head)\1\s*:", body, flags=re.I):
        doc.append((vm.group(2).upper(), path))
doc=sorted(set(doc), key=lambda x:(x[0],x[1]))

bcan={(m,canon(p)) for m,p in backend}
dcan={(m,canon(p)) for m,p in doc}
undoc=[x for x in backend if (x[0],canon(x[1])) not in dcan]
extra=[x for x in doc if (x[0],canon(x[1])) not in bcan]

print('=== UNDOCUMENTED_BACKEND ===')
for m,p in undoc: print(m,p)
print('=== DOCUMENTED_NO_BACKEND ===')
for m,p in extra: print(m,p)
