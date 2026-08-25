from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

source = Path('/home/ubuntu/upload')
images = sorted([p for p in source.iterdir() if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'} and ('pasted_file' in p.name or 'Screenshot' in p.name)])
thumb_width, thumb_height = 240, 170
label_height = 28
columns = 4
rows = (len(images) + columns - 1) // columns
sheet = Image.new('RGB', (columns * thumb_width, rows * (thumb_height + label_height)), 'white')
draw = ImageDraw.Draw(sheet)
for idx, path in enumerate(images):
    try:
        image = Image.open(path).convert('RGB')
        image.thumbnail((thumb_width - 10, thumb_height - 10))
        x = (idx % columns) * thumb_width + (thumb_width - image.width) // 2
        y = (idx // columns) * (thumb_height + label_height) + (thumb_height - image.height) // 2
        sheet.paste(image, (x, y))
        label = f'{idx + 1}: {path.name[:32]}'
        draw.text(((idx % columns) * thumb_width + 5, (idx // columns) * (thumb_height + label_height) + thumb_height + 4), label, fill='black')
    except Exception as exc:
        draw.text(((idx % columns) * thumb_width + 5, (idx // columns) * (thumb_height + label_height) + 5), f'{path.name}: {exc}', fill='red')
out = Path('/home/ubuntu/sistemi-genit-cloud/reference-invoice-contact-sheet.jpg')
sheet.save(out, quality=90)
print(out)
print('\n'.join(f'{idx + 1}\t{path}' for idx, path in enumerate(images)))
