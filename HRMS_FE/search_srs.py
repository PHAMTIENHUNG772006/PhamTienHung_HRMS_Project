from pathlib import Path
import re
text = Path('srs_extracted.txt').read_text(encoding='utf-8', errors='ignore')
patterns = [
    r'11\s*module',
    r'MỤC LỤC',
    r'YÊU CẦU CHỨC NĂNG',
    r'Phần 3',
    r'PHẦN 2',
    r'PHẦN 3',
    r'PHẦN 4',
    r'Nghiệp vụ',
    r'Quản lý',
    r'Use Case',
    r'ERD',
]
for pat in patterns:
    for m in re.finditer(pat, text, flags=re.IGNORECASE):
        start = max(0, m.start() - 200)
        end = min(len(text), m.end() + 500)
        snippet = text[start:end]
        print(f'=== PATTERN: {pat} ===')
        print(snippet)
        print('\n')
        break

print('--- module-like words ---')
for w in ['Nhân sự', 'Phòng ban', 'Tuyển dụng', 'Chấm công', 'Nghỉ phép', 'Bảng lương', 'Payroll', 'Quản lý nhân sự', 'Đánh giá', 'KPI', 'Hồ sơ']:
    if w.lower() in text.lower():
        idx = text.lower().index(w.lower())
        print(w, '->', text[idx:idx+200])
