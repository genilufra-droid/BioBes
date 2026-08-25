from pathlib import Path
import json
import openpyxl

path = Path('/home/ubuntu/upload/07.PAGATMUAJIKORRIK2026.xlsx')
wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
ws = wb['PAGAT KORRIK 2026']
source = []
for row_number, row in enumerate(ws.iter_rows(min_row=3, values_only=True), start=3):
    vals = list(row)
    if not vals or vals[0] in (None, '') or 'total' in ' '.join(str(v or '') for v in vals[:3]).lower():
        continue
    source.append({'row': row_number, 'number': str(vals[0]).strip(), 'name': ' '.join(str(v or '').strip() for v in vals[1:3]).strip()})
print(json.dumps({'count': len(source), 'rows': source}, ensure_ascii=False, indent=2))
