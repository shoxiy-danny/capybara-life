const { Jimp } = require('/home/danny/Projects/music-studio/node_modules/jimp/dist/commonjs');

const TOLERANCE = 5;

async function floodFillTransparent(inputPath, outputPath) {
  const image = await Jimp.read(inputPath);
  const { width, height, data } = image.bitmap;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function getOffset(x, y) { return (y * width + x) * 4; }

  function isBackground(offset) {
    if (data[offset + 3] === 0) return false;
    return Math.abs(data[offset] - 255) <= TOLERANCE &&
           Math.abs(data[offset + 1] - 255) <= TOLERANCE &&
           Math.abs(data[offset + 2] - 255) <= TOLERANCE;
  }

  function setTransparent(offset) {
    data[offset] = 0; data[offset + 1] = 0;
    data[offset + 2] = 0; data[offset + 3] = 0;
  }

  // Scan all four edges to find starting points
  for (let x = 0; x < width; x++) {
    if (isBackground(getOffset(x, 0))) queue.push([x, 0]);
    if (isBackground(getOffset(x, height - 1))) queue.push([x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    if (isBackground(getOffset(0, y))) queue.push([0, y]);
    if (isBackground(getOffset(width - 1, y))) queue.push([width - 1, y]);
  }

  let processed = 0;
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const idx = y * width + x;
    if (visited[idx]) continue;
    const offset = getOffset(x, y);
    if (!isBackground(offset)) continue;
    visited[idx] = 1;
    setTransparent(offset);
    processed++;
    if (x + 1 < width) queue.push([x + 1, y]);
    if (x - 1 >= 0) queue.push([x - 1, y]);
    if (y + 1 < height) queue.push([x, y + 1]);
    if (y - 1 >= 0) queue.push([x, y - 1]);
  }

  console.log('Processed ' + processed + ' pixels');
  await new Promise((resolve, reject) => {
    image.write(outputPath, (err) => err ? reject(err) : resolve());
  });
}

const [input, output] = process.argv.slice(2);
floodFillTransparent(input, output).catch(console.error);
