import pdfplumber, sys, re, json

path = r'C:\Users\JAY\OneDrive\Desktop\1 Dec 11.45PM EN [qmaths.in].pdf'

SKIP_LINES = [
    'Join @Qmaths', 'www.qmaths.in', 'Toppers Choice', 'koobkcalB',
    'Roll Number', 'Candidate Name', 'Venue Name', 'Exam Date',
    'Exam Time', 'Subject', 'Combined Graduate Level',
]

def clean(text):
    lines = []
    for line in text.splitlines():
        if any(s in line for s in SKIP_LINES):
            continue
        if line.strip():
            lines.append(line.strip())
    return '\n'.join(lines)

with pdfplumber.open(path) as pdf:
    full = ''
    for page in pdf.pages:
        t = page.extract_text() or ''
        full += clean(t) + '\n'

section_pat = re.compile(r'Section\s*:\s*(.+)')
q_pat = re.compile(
    r'Q\.(\d+)\s*(.*?)\s*Ans\s*(.*?)\s*Question ID\s*:(\S+)\s*Status\s*:(\S+)\s*Chosen Option\s*:(\S+)',
    re.DOTALL
)

section_positions = [(m.start(), m.group(1).strip()) for m in section_pat.finditer(full)]

questions = []

for m in q_pat.finditer(full):
    q_num = int(m.group(1))
    q_text = m.group(2).strip()
    ans_block = m.group(3).strip()
    q_id = m.group(4)
    status = m.group(5)
    chosen = m.group(6)

    pos = m.start()
    sec = ''
    for sp, sn in section_positions:
        if sp <= pos:
            sec = sn

    opts = re.findall(r'(\d)\.(.*?)(?=\d\.|$)', ans_block, re.DOTALL)
    options = {o[0]: o[1].strip() for o in opts}

    questions.append({
        'section': sec,
        'q_num': q_num,
        'question': q_text if q_text else '[IMAGE QUESTION - needs manual entry]',
        'options': options,
        'q_id': q_id,
        'status': status,
        'chosen_option': chosen,
        'has_image': not bool(q_text),
    })

print(f'Parsed {len(questions)} questions')
by_section = {}
for q in questions:
    by_section.setdefault(q['section'], []).append(q['q_num'])
for s, qs in by_section.items():
    print(f'  {s}: {len(qs)} questions (Q{min(qs)}-Q{max(qs)})')

img_qs = [q['q_num'] for q in questions if q['has_image']]
print(f'Image-only questions (no text extracted): {img_qs}')

print()
print('--- Sample parsed Q.2 ---')
q2 = next((q for q in questions if q['q_num'] == 2), None)
if q2:
    print(json.dumps(q2, indent=2, ensure_ascii=False))

# Save full output
with open('pdf_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)
print(f'\nSaved to pdf_questions.json')
