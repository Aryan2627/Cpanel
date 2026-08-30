const sharp = require('sharp');

async function makeTransparent() {
  const { data, info } = await sharp('C:/Users/aryan/.gemini/antigravity/brain/d6f119dd-6934-47aa-bf96-768fa56e32a4/.user_uploaded/media_1788093135503.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    const maxColor = Math.max(r, g, b);
    
    if (maxColor < 20) {
      // Pure black background
      data[i+3] = 0;
    } else {
      // Use the max color intensity as the alpha channel to create a perfectly smooth, anti-aliased edge
      // without capturing any of the "black" darkness.
      let alpha = Math.min(255, maxColor * 1.5);
      data[i+3] = alpha;
      
      // Force the pixel to be bright cyan to completely erase dark edge halos
      // The original logo has very little red, high green and high blue.
      data[i] = 0;   // R
      data[i+1] = 255; // G
      data[i+2] = 255; // B
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile('C:/Users/aryan/.gemini/antigravity/scratch/logo_perfect.png');
    
  console.log("Created perfectly transparent logo.");
}
makeTransparent();
