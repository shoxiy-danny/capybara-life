const { Jimp } = require('jimp');
const TOLERANCE = 10;

async function processGazebo(inputPath, outputPath) {
  const image = await Jimp.read(inputPath);
  const { width, height, data } = image.bitmap;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function getOffset(x, y) { return (y * width + x) * 4; }

  function isWhiteish(offset) {
    if (data[offset + 3] === 0) return false;
    return data[offset] > 240 && data[offset + 1] > 240 && data[offset + 2] > 240;
  }

  function setTransparent(offset) {
    data[offset] = 0; data[offset + 1] = 0;
    data[offset + 2] = 0; data[offset + 3] = 0;
  }

  // Start from center of image
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  queue.push([centerX, centerY]);

  let processed = 0;
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    const offset = getOffset(x, y);
    if (!isWhiteish(offset)) continue;
    visited[idx] = 1;
    setTransparent(offset);
    processed++;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  console.log('Processed ' + processed + ' pixels from center');
  await image.write(outputPath);
}

processGazebo('gazebo.png', 'gazebo_temp.png')
  .then(() => console.log('Done'))
  .catch(err => console.error(err));
