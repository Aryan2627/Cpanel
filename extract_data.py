import json
import re

transcript_path = r"C:\Users\aryan\.gemini\antigravity\brain\d6f119dd-6934-47aa-bf96-768fa56e32a4\.system_generated\logs\transcript_full.jsonl"

csv_content = None
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT' and data.get('source') == 'USER_EXPLICIT':
            content = data.get('content', '')
            if 'train the model on these 3 file data set' in content:
                # Extract everything after the prompt text
                parts = content.split('train the model on these 3 file data set')
                if len(parts) > 1:
                    csv_content = parts[-1].strip()
                    # It might be in the '<USER_REQUEST>' block
                    # Let's remove any XML tags from the end if they exist
                    csv_content = re.sub(r'</USER_REQUEST>.*', '', csv_content, flags=re.DOTALL).strip()

if csv_content:
    with open('dataset.csv', 'w', encoding='utf-8') as f:
        f.write(csv_content)
    print(f"Successfully extracted dataset to dataset.csv ({len(csv_content.splitlines())} lines)")
else:
    print("Could not find the dataset in the transcript.")