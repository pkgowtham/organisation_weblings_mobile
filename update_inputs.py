import os
import re

directory = 'app/(protected)/(eOffice)'

files_to_modify = []
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            files_to_modify.append(os.path.join(root, file))

updated_files = 0
for file_path in files_to_modify:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # We look for <Input ... label="Description" ... />
    # Since it might span multiple lines, we'll use a more robust regex or just split and find
    
    # Find all <Input ... /> tags
    # We can match <Input followed by anything up to /> (non-greedy)
    # This might fail if there's /> inside a string, but usually rare in these simple inputs.
    
    def replacer(match):
        tag_content = match.group(0)
        if re.search(r'label="Description"', tag_content, re.IGNORECASE):
            tag = tag_content.replace('<Input', '<TextField')
            return tag
        return tag_content
    
    new_content = re.sub(r'<Input[\s\S]*?/>', replacer, content)
    
    if new_content != content:
        # Check if TextField import exists
        if 'import TextField' not in new_content:
            # Find last import
            imports = list(re.finditer(r'^import\s+.*?;\s*$', new_content, re.MULTILINE))
            if imports:
                last_import = imports[-1]
                insert_pos = last_import.end()
                new_content = new_content[:insert_pos] + '\nimport TextField from "@/components/ui/textField";' + new_content[insert_pos:]
            else:
                # Fallback to after first line
                new_content = new_content.replace('\n', '\nimport TextField from "@/components/ui/textField";\n', 1)
        
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
        updated_files += 1

print(f"Total updated: {updated_files}")
