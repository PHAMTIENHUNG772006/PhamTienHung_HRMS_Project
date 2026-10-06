from pathlib import Path
import re

text = Path('srs_extracted.txt').read_text(encoding='utf-8', errors='ignore')
for key in ['Module 1:', 'Module 2:', 'Module 3:', 'Module 4:', 'Module 5:', 'Module 6:', 'Module 7:', 'Module 8:', 'Module 9:', 'Module 10:', 'Module 11:']:
    idx = text.find(key)
    if idx == -1:
        print(f'{key} not found')
    else:
        snippet = text[max(0, idx-120):idx+220]
        print('===', key, '===')
        print(snippet)
        print()

print('=== All Module occurrences ===')
for m in re.finditer(r'Module\s*\d+\s*:\s*', text, flags=re.IGNORECASE):
    snippet = text[max(0, m.start()-120):m.start()+200]
    print(snippet)
    print('---')
