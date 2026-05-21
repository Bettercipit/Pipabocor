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
        
    # User requested size 12px explicitly
    # Change any text-xs or text-sm that we modified back to text-[12px]
    content = content.replace("text-xs ", "text-[12px] ")
    content = content.replace('"text-xs"', '"text-[12px]"')
    content = content.replace("text-sm ", "text-[12px] ")
    content = content.replace('"text-sm"', '"text-[12px]"')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Font sizes updated to 12px.")
