#!/usr/bin/env python3
from __future__ import annotations
import hashlib, json, sys
from pathlib import Path

IGNORE = {'.git', 'node_modules', 'dist', '.manus', '.manus-logs', 'todo.md', 'SOURCE_MANIFEST.json'}
def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''): h.update(chunk)
    return h.hexdigest()
def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
    files = []
    for path in sorted(root.rglob('*')):
        if path.is_file() and not any(part in IGNORE for part in path.relative_to(root).parts):
            rel = path.relative_to(root).as_posix()
            files.append({'path': rel, 'bytes': path.stat().st_size, 'sha256': digest(path)})
    output = root / 'SOURCE_MANIFEST.json'
    output.write_text(json.dumps({'root': '.', 'fileCount': len(files), 'files': files}, indent=2) + '\n')
    print(f'Wrote {output} with {len(files)} files')
    return 0
if __name__ == '__main__': raise SystemExit(main())
