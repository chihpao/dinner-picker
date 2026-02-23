import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImage = path.join(process.cwd(), 'public', 'pwa-512x512.png');
const publicDir = path.resolve('public');

const sizes = [64, 192, 512];

async function generateIcons() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  try {
    const originalBuffer = fs.readFileSync(sourceImage);
    const s = sharp(originalBuffer);

    // Generate specific sized icons
    for (const size of sizes) {
      await s.clone()
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .toFile(path.join(publicDir, `pwa-${size}x${size}.png`));
      console.log(`Generated pwa-${size}x${size}.png`);
    }

    // Maskable (usually with a safe area, we use contain with a padding background, or just cover)
    await s.clone()
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));
    console.log(`Generated maskable-icon-512x512.png`);

    // Apple touch icon
    await s.clone()
      .resize(180, 180, { fit: 'cover' })
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log(`Generated apple-touch-icon.png`);

    // Favicon (just copy the 64 or 32)
    await s.clone()
      .resize(32, 32)
      .toFile(path.join(publicDir, 'favicon.png'));
    console.log(`Generated favicon.png`);

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
