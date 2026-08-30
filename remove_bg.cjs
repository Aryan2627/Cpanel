const sharp = require('sharp');
const path = require('path');

async function removeBlack() {
  const inputPath = 'C:/Users/aryan/.gemini/antigravity/brain/d6f119dd-6934-47aa-bf96-768fa56e32a4/.user_uploaded/media_1788093135503.png';
  const outputPath = path.join(__dirname, 'logo_transparent.png');
  
  try {
    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      // If pixel is very dark, make it transparent
      if (r < 50 && g < 50 && b < 50) {
        data[i+3] = 0; // Set alpha to 0
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);
    
    console.log("Successfully removed black background and saved to " + outputPath);
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

removeBlack();
