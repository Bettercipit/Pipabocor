import os

files_to_update = [
    r"c:\xampp\htdocs\Machine Learning\deteksi_pipa_bocor\app\page.tsx",
    r"c:\xampp\htdocs\Machine Learning\deteksi_pipa_bocor\components\StatusCards.tsx",
    r"c:\xampp\htdocs\Machine Learning\deteksi_pipa_bocor\components\LeakHistoryTable.tsx",
    r"c:\xampp\htdocs\Machine Learning\deteksi_pipa_bocor\components\FlowChart.tsx"
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace the tiny text classes
    content = content.replace("text-[9px]", "text-xs")
    content = content.replace("text-[10px]", "text-sm")
    content = content.replace("text-[11px]", "text-sm")
    # Carefully replace text-xs to text-sm if needed, but text-xs might be okay. Let's just do text-xs -> text-sm
    content = content.replace("text-xs ", "text-sm ")
    content = content.replace('"text-xs"', '"text-sm"')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Font sizes updated.")
