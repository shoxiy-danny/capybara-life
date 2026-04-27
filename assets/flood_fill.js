/**
 * Flood-fill transparency script for PNG images
 * Makes white background transparent using flood fill algorithm
 */

const { Jimp } = require('/home/danny/Projects/music-studio/node_modules/jimp/dist/commonjs');
const fs = require('fs');

const TOLERANCE = 16; // How different a color can be from pure white to be filled

async function floodFillTransparent(inputPath, outputPath) {
  const image = await Jimp.read(inputPath);
  const { width, height, data } = image.bitmap;

  // Create a visited array
  const visited = new Uint8Array(width * height);

  // BGRA format in bitmap.data
  function getPixelOffset(x, y) {
    return (y * width + x) * 4;
  }

  function isBackground(offset) {
    const b = data[offset];
    const g = data[offset + 1];
    const r = data[offset + 2];
    const a = data[offset + 3];
    if (a === 0) return false;
    const dr = Math.abs(r - 255);
    const dg = Math.abs(g - 255);
    const db = Math.abs(b - 255);
    return dr <= TOLERANCE && dg <= TOLERANCE && db <= TOLERANCE;
  }

  function setTransparent(offset) {
    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 0;
  }

  // Simple flood fill using BFS
  const queue = [[0, 0]];
  let processed = 0;

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const idx = y * width + x;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    if (visited[idx]) continue;

    const offset = getPixelOffset(x, y);
    if (!isBackground(offset)) continue;

    visited[idx] = 1;
    setTransparent(offset);
    processed++;

    queue.push([x + 1, y]);
    queue.push([x - 1, y]);
    queue.push([x, y + 1]);
    queue.push([x, y - 1]);
  }

  console.log(`Processed ${processed} pixels`);

  // Write using callback
  await new Promise((resolve, reject) => {
    image.write(outputPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log(`Created: ${outputPath}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node flood_fill.js <input.png> <output.png>');
    process.exit(1);
  }
  const [input, output] = args;
  await floodFillTransparent(input, output);
}

main().catch(console.error);
