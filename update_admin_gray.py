import os

replacements = {
    'text-gray-900': 'text-brand-text',
    'text-gray-800': 'text-brand-text',
    'text-gray-700': 'text-brand-text/80',
    'text-gray-600': 'text-brand-text/70',
    'text-gray-500': 'text-brand-text/60',
    'text-gray-400': 'text-brand-text-light/70',
    'bg-gray-100': 'bg-brand-bg',
    'bg-gray-50': 'bg-brand-bg',
    'border-gray-100': 'border-brand-dark/5',
    'border-gray-200': 'border-brand-dark/5',
    'border-gray-300': 'border-brand-dark/10',
    'border-gray-800': 'border-brand-text-light/10',
    'rounded-2xl': 'rounded-xl',
    'text-blue-700': 'text-brand-accent',
    'text-green-700': 'text-brand-accent',
    'bg-green-100': 'bg-brand-accent/10',
    'ring-blue-500': 'ring-brand-dark',
    'focus:border-blue-500': 'focus:border-brand-dark',
    'focus:ring-blue-500': 'focus:ring-brand-dark',
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
