const fs = require('fs');
let content = fs.readFileSync('src/app/client/JarvisAssistant.tsx', 'utf8');

const replacement = `  const processCommand = async (text: string) => {
    setTargetResponse('');
    setDisplayedResponse('');
    
    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      
      const reply = data.reply || 'I encountered an error processing your request.';
      setTargetResponse(reply);
      speak(reply);

      if (data.action) {
        if (data.action.type === 'NAVIGATE' && data.action.payload) {
          setTimeout(() => { router.push(data.action.payload); closeTerminal(); }, 2000);
        } else if (data.action.type === 'UI_EFFECT') {
          if (data.action.payload === 'LOCKDOWN') {
            setIsLockdown(true);
            document.body.style.backgroundColor = '#7f1d1d';
            setTimeout(() => closeTerminal(), 3000);
          } else if (data.action.payload === 'DARK_MODE') {
            document.body.style.backgroundColor = '#0f172a';
            document.body.style.color = '#f8fafc';
            const els = document.querySelectorAll('.app-container, .sidebar, .main-content');
            els.forEach((el: any) => el.style.backgroundColor = '#0f172a');
          } else if (data.action.payload === 'CRASH') {
            setTimeout(() => setShouldCrash(true), 1500);
          }
        }
      }
    } catch (err) {
      console.error(err);
      const errReply = 'I lost connection to the mainframe.';
      setTargetResponse(errReply);
      speak(errReply);
    }
  };`;

// Extract the original function
const startIndex = content.indexOf('  const processCommand = (text: string) => {');
const endIndex = content.indexOf('  const closeTerminal = () => {');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + '\n\n' + content.substring(endIndex);
  fs.writeFileSync('src/app/client/JarvisAssistant.tsx', content);
  console.log('Successfully updated JarvisAssistant.tsx');
} else {
  console.log('Could not find processCommand bounds');
}
