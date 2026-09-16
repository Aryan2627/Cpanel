const fs = require('fs');

const transcript_path = "C:\\Users\\aryan\\.gemini\\antigravity\\brain\\d6f119dd-6934-47aa-bf96-768fa56e32a4\\.system_generated\\logs\\transcript.jsonl";

const lines = fs.readFileSync(transcript_path, 'utf-8').split('\n');
for (let line of lines) {
    if (!line.trim()) continue;
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT') {
        const content = data.content || '';
        if (content.includes('train the model')) {
            console.log("Found match length:", content.length);
            const match = content.match(/id,user_message,assistant_response,category[\s\S]+/);
            if (match) {
                let csv = match[0];
                csv = csv.replace(/<\/USER_REQUEST>[\s\S]*/, '').trim();
                fs.writeFileSync('dataset.csv', csv, 'utf-8');
                console.log('Saved to dataset.csv!');
            }
        }
    }
}