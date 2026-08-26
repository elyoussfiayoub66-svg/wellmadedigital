import os
import glob

replacements = {
    'bg-slate-900': 'bg-brand-dark',
    'bg-slate-800': 'bg-brand-dark/90',
    'border-slate-800': 'border-brand-text-light/10',
    'border-slate-200': 'border-brand-dark/5',
    'border-slate-100': 'border-brand-dark/5',
    'bg-slate-50': 'bg-brand-bg',
    'bg-gray-50': 'bg-brand-bg',
    'bg-gray-100': 'bg-brand-bg',
    'text-slate-900': 'text-brand-text',
    'text-slate-800': 'text-brand-text',
    'text-slate-700': 'text-brand-text/80',
    'text-slate-600': 'text-brand-text/70',
    'text-slate-500': 'text-brand-text/60',
    'text-slate-400': 'text-brand-text-light/70',
    'bg-blue-600': 'bg-brand-accent',
    'hover:bg-blue-700': 'hover:opacity-90',
    'text-blue-600': 'text-brand-accent',
    'bg-blue-100': 'bg-brand-bg',
    'text-blue-800': 'text-brand-accent',
    'text-white': 'text-brand-text-light',
    'bg-white': 'bg-brand-surface',
    '/1.png': '/assets/logo.png',
    'ScaleUp Admin': 'Wellmade Admin',
    'ScaleUp Agency': 'Wellmade Digital',
    'ScaleUp2026!': 'ScaleUp2026!'
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

for root, _, files in os.walk(r'C:\Users\AYOUB\Desktop\webgobuilder\app\admin'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))
