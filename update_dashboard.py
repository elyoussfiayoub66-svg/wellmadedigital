import os

replacements = {
    'rounded-full': 'rounded-xl',
    'bg-slate-100': 'bg-brand-bg',
    'bg-indigo-100': 'bg-brand-bg',
    'text-indigo-700': 'text-brand-text',
    'bg-purple-100': 'bg-brand-bg',
    'text-purple-700': 'text-brand-text',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(r'C:\Users\AYOUB\Desktop\webgobuilder\app'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))
