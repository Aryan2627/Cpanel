const fs = require('fs');

const transcript_path = "C:\\Users\\aryan\\.gemini\\antigravity\\brain\\d6f119dd-6934-47aa-bf96-768fa56e32a4\\.system_generated\\logs\\transcript_full.jsonl";

const lines = fs.readFileSync(transcript_path, 'utf-8').split('\n');
let csv_content = null;

for (let line of lines) {
    if (!line.trim()) continue;
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && data.source === 'USER_EXPLICIT') {
        const content = data.content || '';
        if (content.includes('train the model on these 3 file data set')) {
            const parts = content.split('train the model on these 3 file data set');
            if (parts.length > 1) {
                let text = parts[parts.length - 1].trim();
                text = text.replace(/<\/USER_REQUEST>[\s\S]*/, '').trim();
                csv_content = text;
            }
        }
    }
}

if (csv_content) {
    fs.writeFileSync('dataset.csv', csv_content, 'utf-8');
    console.log("Successfully extracted dataset to dataset.csv (${csv_content.split('\n').length} lines)");
} else {
    console.log('Could not find the dataset in the transcript.');
}