// Archivo: scripts/generate-icons.js

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateIcons() {
  const sizes = [192, 512];
  const sourceLogo = join(__dirname, '../public/logo-dark.png');
  
  try {
    for (const size of sizes) {
      await sharp(sourceLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toFile(join(__dirname, `../public/icons/icon-${size}x${size}.png`));
      
      console.log(`✓ Generado icon-${size}x${size}.png`);
    }
    console.log('¡Iconos generados exitosamente!');
  } catch (error) {
    console.error('Error generando iconos:', error);
  }
}

generateIcons();