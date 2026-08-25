from pathlib import Path
import subprocess

source = Path('/home/ubuntu/sistemi-genit-cloud')
export = Path('/home/ubuntu/biobes')
ignore = {'.git', 'node_modules', 'dist', '.manus', '.manus-logs'}

def files(root):
    out = set()
    for p in root.rglob('*'):
        if not p.is_file():
            continue
        rel = p.relative_to(root)
        if any(part in ignore for part in rel.parts):
            continue
        out.add(rel.as_posix())
    return out

def tracked_remote():
    text = subprocess.check_output(['git','-C',str(export),'ls-tree','-r','--name-only','github/main'], text=True)
    return {line.strip() for line in text.splitlines() if line.strip()}

src = files(source)
tracked = tracked_remote()
missing = sorted(src - tracked)
extra = sorted(tracked - files(export))
print('SOURCE_FILES', len(src))
print('REMOTE_TRACKED_FILES', len(tracked))
print('MISSING_FROM_REMOTE', len(missing))
for p in missing: print('MISSING', p)
print('REMOTE_NOT_LOCAL', len(extra))
for p in extra: print('REMOTE_ONLY', p)
print('MISSING_SOURCE_CANDIDATES')
for p in missing:
    lower = p.lower()
    if any(x in lower for x in ('node_modules','dist','.env','.log','.xlsx','.jpg','.png','.webp','.db','.sqlite','payroll','pagat','audit','korrik','real')):
        print('FILTERED_OR_SENSITIVE', p)
    else:
        print('SOURCE_CANDIDATE', p)
