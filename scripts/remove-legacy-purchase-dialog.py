from pathlib import Path

path = Path('/home/ubuntu/sistemi-genit-cloud/client/src/pages/PurchaseInvoices.tsx')
text = path.read_text()
marker = '  // @ts-ignore Legacy return retained temporarily after the active document-action shell.'
start = text.find(marker)
end = text.find('\nfunction DetailField', start)
if start < 0 or end < 0:
    raise SystemExit('legacy purchase dialog block not found')
replacement = '  // Pamja legacy u hoq; dialogu aktiv përdor formatin reference të faturës.\n}\n'
path.write_text(text[:start] + replacement + text[end:])
