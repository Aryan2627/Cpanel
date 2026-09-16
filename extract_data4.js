const fs = require('fs');
const transcript_path = "C:\\Users\\aryan\\.gemini\\antigravity\\brain\\d6f119dd-6934-47aa-bf96-768fa56e32a4\\.system_generated\\logs\\transcript_full.jsonl";

const text = fs.readFileSync(transcript_path, 'utf-8');
const match = text.match(/id,user_message,assistant_response,category\\n1,What should I eat[\\s\\S]*?(?=","thinking":)/);

if (match) {
    let raw = match[0].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    fs.writeFileSync('src/data/conversations.csv', raw, 'utf-8');
    console.log('Saved to src/data/conversations.csv! Lines: ' + raw.split('\n').length);
} else {
    console.log("Not found with Regex 1. Trying Regex 2...");
    const altMatch = text.match(/id,user_message,assistant_response,category[\\s\\S]*?(?=","thinking"|","tool_calls")/);
    if (altMatch) {
        let raw = altMatch[0].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        fs.writeFileSync('src/data/conversations.csv', raw, 'utf-8');
        console.log('Saved! Lines: ' + raw.split('\n').length);
    } else {
        console.log("Still not found.");
    }
}