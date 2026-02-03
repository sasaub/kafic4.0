/**
 * Script za generisanje PWA ikona
 * 
 * Instaliraj: npm install --save-dev sharp
 * Pokreni: node scripts/generate-icons.js
 * 
 * Potrebno je da imaš source ikonu (icon-source.png) u public folderu
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const publicDir = path.join(__dirname, '..', 'public');
const sourceIcon = path.join(publicDir, 'icon-source.png');

// Proveri da li postoji source ikona
if (!fs.existsSync(sourceIcon)) {
  console.log('⚠️  Nema icon-source.png u public folderu!');
  console.log('📝 Kreiraj ikonu 512x512px i sačuvaj je kao public/icon-source.png');
  console.log('💡 Možeš koristiti online tool: https://www.favicon-generator.org/');
  process.exit(1);
}

// Generiši ikone
async function generateIcons() {
  console.log('🎨 Generišem PWA ikone...');
  
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'cover',
          background: { r: 43, g: 46, b: 52, alpha: 1 } // #2B2E34
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Kreirana: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Greška pri kreiranju icon-${size}x${size}.png:`, error);
    }
  }
  
  console.log('✨ Gotovo! Ikone su kreirane u public folderu.');
}

generateIcons();
