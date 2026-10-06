from pathlib import Path
import re

text = Path('srs_extracted.txt').read_text(encoding='utf-8', errors='ignore')

# Search for module headings in the extracted SRS text
patterns = [
    r'Module\s*\d+\s*:\s*([^P]+?)(?=PAGEREF|$)',
    r'\d+\.\d+\s*Module\s*\d+\s*:\s*([^P]+?)(?=PAGEREF|$)',
    r'Phần\s*4:.*?\bMODULES\b',
]

for pat in patterns:
    print('PATTERN:', pat)
    for m in re.finditer(pat, text, flags=re.IGNORECASE):
        title = m.group(1).strip()
        print('- ', title)
    print()

print('--- nearby module list ---')
for m in re.finditer(r'Phần\s*4:.*?Module\s*1:.*?Module\s*2:.*?Module\s*3:', text, flags=re.IGNORECASE|re.DOTALL):
    snippet = text[m.start():m.end()]
    print(snippet[:1000])
    break
