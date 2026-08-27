import os

filepath = r'C:\Users\AYOUB\Desktop\webgobuilder\app\page.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix text colors that became black instead of white
content = content.replace("color: '#0E0E0F'", "color: '#F7F5F0'")

# Fix rgba tints
content = content.replace('rgba(47,74,60,', 'rgba(255,255,255,') # dark green to white tints
content = content.replace('rgba(244,239,230,', 'rgba(247,245,240,') # cream to off-white tints
content = content.replace('rgba(201,123,74,', 'rgba(194,73,107,') # old accent to new accent (rose)

# Fix specific gradients
content = content.replace('linear-gradient(135deg,#0E0E0F,#C2496B)', 'linear-gradient(135deg,#1A1A1B,#C2496B)')
content = content.replace('linear-gradient(135deg,#C2496B,#0E0E0F)', 'linear-gradient(135deg,#C2496B,#1A1A1B)')
content = content.replace('linear-gradient(135deg,#F7F5F0,#0E0E0F)', 'linear-gradient(135deg,#C8A464,#1A1A1B)')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("page.jsx fixed!")
