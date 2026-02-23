import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImage = 'C:\\Users\\S00133\\.gemini\\antigravity\\brain\\5e635d11-f910-4b78-a534-39bebd73e83f\\bento_fullbleed_icon_1771818784631.png';
const publicDir = path.resolve('public');

async function processIcon() {
    const originalBuffer = fs.readFileSync(sourceImage);

    try {
        // 1. Remove the white corners so only the circle is left
        // AI generated a circular plate but it might have white corners in the PNG.
        const width = 512;
        const height = 512;
        const circleSvg = `<svg width="${width}" height="${height}"><circle cx="${width / 2}" cy="${height / 2}" r="${width / 2}" fill="white"/></svg>`;
        const roundedCorners = Buffer.from(circleSvg);

        // Creates a strictly circular image with transparent corners
        const baseIcon = await sharp(originalBuffer)
            .resize(512, 512, { fit: 'cover' })
            .composite([{
                input: roundedCorners,
                blend: 'dest-in' // Keeps only the content inside the circle, makes everything outside transparent
            }])
            .png()
            .toBuffer();

        // Generate normal PWA sizes (transparent background outside the circle)
        const sizes = [64, 192, 512];
        for (const size of sizes) {
            await sharp(baseIcon)
                .resize(size, size, { kernel: sharp.kernel.lanczos3, fit: 'contain' })
                .toFile(path.join(publicDir, `pwa-${size}x${size}.png`));
            console.log(`Generated normal pwa-${size}x${size}.png`);
        }

        // Create a padded inner content for maskable and apple-touch icons
        const paddedInner = await sharp(baseIcon)
            .resize(470, 470, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .toBuffer();

        // Maskable icon must be a solid square (no transparency for PWA standard maskable)
        // We put the circular icon on a flat white background so Android can safely crop it however it wants
        await sharp({
            create: {
                width: 512,
                height: 512,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
            .composite([
                { input: paddedInner, blend: 'over' } // Slightly padded maskable
            ])
            .png()
            .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));
        console.log(`Generated maskable-icon-512x512.png`);

        // Apple touch icon (Apple prefers solid square without transparency)
        const touchBase = await sharp({
            create: {
                width: 512,
                height: 512,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
            .composite([
                { input: paddedInner, blend: 'over' }
            ])
            .png()
            .toBuffer();

        await sharp(touchBase)
            .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
            .toFile(path.join(publicDir, 'apple-touch-icon.png'));
        console.log(`Generated apple-touch-icon.png`);

        // Favicon (transparent circular)
        await sharp(baseIcon)
            .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
            .toFile(path.join(publicDir, 'favicon.png'));
        console.log(`Generated circular favicon.png`);

    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

processIcon();
