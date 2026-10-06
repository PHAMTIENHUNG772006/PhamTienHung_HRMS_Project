import os
import re
import zipfile

path = r'C:\Users\Admin\Desktop\Project Example Holiday\Example Project Holiday\SRS_HRMS_v2.0_ChiTiet.docx'
out_path = r'C:\Users\Admin\Desktop\Project Example Holiday\Example Project Holiday\HRMS_FE\srs_extracted.txt'

if not os.path.exists(path):
    raise FileNotFoundError(f'DOCX file not found: {path}')

with zipfile.ZipFile(path) as z:
    if 'word/document.xml' not in z.namelist():
        raise FileNotFoundError('document.xml not found in docx')
    xml = z.read('word/document.xml')
    if isinstance(xml, bytes):
        xml = xml.decode('utf-8', errors='ignore')

xml = re.sub(r'<w:(?:p|r|t|tbl|tr|tc|pPr|rPr|tcPr|tblPr|tblGrid|sectPr)[^>]*>', ' ', xml)
xml = re.sub(r'</w:(?:p|r|t|tbl|tr|tc|pPr|rPr|tcPr|tblPr|tblGrid|sectPr)>', ' ', xml)
xml = re.sub(r'<[^>]+>', ' ', xml)
text = re.sub(r'\s+', ' ', xml).strip()

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('extracted to', out_path)
