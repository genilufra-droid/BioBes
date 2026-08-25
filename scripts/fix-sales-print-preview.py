from pathlib import Path

path = Path('/home/ubuntu/sistemi-genit-cloud/client/src/pages/SalesInvoices.tsx')
lines = path.read_text().splitlines()
replacement = '  const printPreview = () => { if (!referenceInvoice || !printReferenceInvoice(referenceInvoice)) toast.error("Print Preview u bllokua."); };'
changed = False
for index, line in enumerate(lines):
    if '  const printPreview = () =>' in line:
        lines[index] = replacement
        changed = True
        break
if not changed:
    raise SystemExit('printPreview line not found')
path.write_text('\n'.join(lines) + '\n')
