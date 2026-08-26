import os

replacements = {
    'className="w-6 h-6 object-contain"': 'className="w-8 h-8 object-contain"',
    'className="w-5 h-5 object-contain"': 'className="w-6 h-6 object-contain"',
    'className="h-6 w-auto rounded"': 'className="h-8 w-auto rounded"'
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
