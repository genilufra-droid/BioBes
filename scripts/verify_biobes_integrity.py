#!/usr/bin/env python3
"""Compare a local project tree with a GitHub branch using file lists and SHA-256."""
from __future__ import annotations
import argparse, hashlib, subprocess
from pathlib import Path

DEFAULT_IGNORE = {'.git', 'node_modules', 'dist', '.manus', '.manus-logs', 'todo.md'}
SOURCE_EXTENSIONS = {'.ts', '.tsx', '.mts', '.cts', '.mjs', '.cjs', '.js', '.jsx', '.py', '.sh', '.css', '.html'}

def local_files(root: Path, ignores: set[str]) -> set[str]:
    result = set()
    for path in root.rglob('*'):
        if path.is_file():
            rel = path.relative_to(root)
            if not any(part in ignores for part in rel.parts):
                result.add(rel.as_posix())
    return result

def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()

def remote_sha256(repo: Path, branch: str, item: str) -> str:
    process = subprocess.run(['git', '-C', str(repo), 'show', f'github/{branch}:{item}'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=True)
    return hashlib.sha256(process.stdout).hexdigest()

def remote_files(repo: str, branch: str) -> set[str]:
    output = subprocess.check_output(['git', '-C', repo, 'ls-tree', '-r', '--name-only', f'github/{branch}'], text=True)
    return {line.strip() for line in output.splitlines() if line.strip()}

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', default='.')
    parser.add_argument('--export', default='/home/ubuntu/biobes')
    parser.add_argument('--branch', default='main')
    parser.add_argument('--allow', action='append', default=[])
    args = parser.parse_args()
    source = Path(args.source).resolve()
    export = Path(args.export).resolve()
    ignores = DEFAULT_IGNORE | set(args.allow)
    local = local_files(source, ignores)
    remote = remote_files(str(export), args.branch)
    missing = sorted(local - remote)
    extra = sorted(remote - local)
    print(f'LOCAL_FILES={len(local)}')
    print(f'REMOTE_FILES={len(remote)}')
    missing_source = [item for item in missing if Path(item).suffix in SOURCE_EXTENSIONS]
    missing_non_source = [item for item in missing if Path(item).suffix not in SOURCE_EXTENSIONS]
    print(f'MISSING_FROM_REMOTE={len(missing)}')
    print(f'MISSING_SOURCE_CODE={len(missing_source)}')
    print(f'MISSING_NON_SOURCE={len(missing_non_source)}')
    for item in missing: print(f'MISSING {item}')
    print(f'REMOTE_ONLY={len(extra)}')
    for item in extra: print(f'REMOTE_ONLY {item}')
    comparable = sorted((local & remote) - {'package.json', 'pnpm-lock.yaml'})
    mismatches = []
    for item in comparable:
        local_hash = sha256(source / item)
        try:
            remote_hash = remote_sha256(export, args.branch, item)
        except subprocess.CalledProcessError:
            mismatches.append(item)
            continue
        if local_hash != remote_hash:
            mismatches.append(item)
    print(f'HASH_MISMATCH={len(mismatches)}')
    for item in mismatches: print(f'HASH_MISMATCH {item}')
    return 1 if missing_source or mismatches else 0

if __name__ == '__main__':
    raise SystemExit(main())
