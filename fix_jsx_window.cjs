const fs = require('fs');
let code = fs.readFileSync('src/app/client/JarvisAssistant.tsx', 'utf8');

code = code.replace(
  'top: `${Math.min(position.y + 70, window.innerHeight - 300)}px`,',
  'top: `${typeof window !== "undefined" ? Math.min(position.y + 70, window.innerHeight - 300) : position.y + 70}px`,'
);

code = code.replace(
  'left: isTerminalOpen ? `${Math.min(position.x - 360 > 0 ? position.x - 360 : position.x + 70, window.innerWidth - 380)}px` : \'-1000px\',',
  'left: isTerminalOpen ? `${typeof window !== "undefined" ? Math.min(position.x - 360 > 0 ? position.x - 360 : position.x + 70, window.innerWidth - 380) : position.x - 360}px` : \'-1000px\','
);

fs.writeFileSync('src/app/client/JarvisAssistant.tsx', code, 'utf8');
console.log("Fixed JSX window error");
