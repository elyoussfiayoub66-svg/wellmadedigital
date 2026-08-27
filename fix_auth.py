import os

for root, dirs, files in os.walk(r'C:\Users\AYOUB\Desktop\webgobuilder'):
    if 'node_modules' in root or '.next' in root or '.git' in root:
        continue
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            
            # Auth cards
            new_content = new_content.replace('bg-brand-surface p-8 rounded-xl ', 'bg-brand-surface p-8 rounded-[10px] border border-brand-border ')
            
            # Form inputs
            new_content = new_content.replace('className="w-full border-brand-border rounded-lg p-3 border focus:ring-brand-accent/20 focus:border-brand-accent"', 'className="w-full bg-brand-bg text-brand-text border-brand-border rounded-lg p-3 border focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all placeholder:text-brand-muted"')
            
            # Buttons (auth)
            new_content = new_content.replace('rounded-xl hover:bg-brand-accent transition-colors disabled:opacity-70', 'rounded-lg hover:opacity-90 transition-all disabled:opacity-70')
            
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
