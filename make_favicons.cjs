const sharp = require('sharp');
const fs = require('fs');

async function generateFavicons() {
  const sourcePath = 'C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/logo_transparent.png';
  
  // 1. Proc Favicon (Next.js)
  await sharp(sourcePath).resize(64, 64).png().toFile('C:/Users/aryan/.gemini/antigravity/scratch/Proc/src/app/icon.png');
  if (fs.existsSync('C:/Users/aryan/.gemini/antigravity/scratch/Proc/src/app/favicon.ico')) {
      fs.unlinkSync('C:/Users/aryan/.gemini/antigravity/scratch/Proc/src/app/favicon.ico');
  }

  // 2. Cpanel Favicon (Next.js)
  await sharp(sourcePath).resize(64, 64).png().toFile('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/icon.png');
  if (fs.existsSync('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/icon.svg')) {
      fs.unlinkSync('C:/Users/aryan/.gemini/antigravity/scratch/procurement-portal/src/app/icon.svg');
  }

  // 3. Csupplier Favicon (Vite)
  await sharp(sourcePath).resize(64, 64).png().toFile('C:/Users/aryan/.gemini/antigravity/scratch/csupplier/public/favicon.png');
  
  // Update Csupplier index.html
  let indexHtml = fs.readFileSync('C:/Users/aryan/.gemini/antigravity/scratch/csupplier/index.html', 'utf8');
  indexHtml = indexHtml.replace(/<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/, '<link rel="icon" type="image/png" href="/favicon.png" />');
  fs.writeFileSync('C:/Users/aryan/.gemini/antigravity/scratch/csupplier/index.html', indexHtml, 'utf8');
  
  console.log("Favicons successfully generated and replaced for all 3 repos!");
}

generateFavicons();
