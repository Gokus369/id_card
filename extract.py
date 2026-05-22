import re

with open('c:/id card/offline-portal.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for the script element. We can find the start tag and end tag of text/babel
import re
match = re.search(r'<script\s+type="text/babel"[^>]*>', content)
if match:
    start_idx = match.end()
    end_idx = content.find('</script>', start_idx)
    if end_idx != -1:
        script_content = content[start_idx:end_idx].strip()
        with open('c:/id card/scratch_script.jsx', 'w', encoding='utf-8') as sf:
            sf.write(script_content)
        print("Successfully extracted JSX script to scratch_script.jsx")
    else:
        print("Could not find closing script tag")
else:
    print("Could not find script of type text/babel")
