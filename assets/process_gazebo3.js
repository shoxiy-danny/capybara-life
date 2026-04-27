const { Jimp } = require('jimp');

async function process(inputPath, outputPath) {
  const image = await Jimp.read(inputPath);
  const { width, height, data } = image.bitmap;
  
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Lower threshold for more white coverage
      if (r > 200 && g > 200 && b > 200) {
        data[idx + 3] = 0;
        count++;
      }
    }
  }
  
  console.log('Made ' + count + ' pixels transparent');
  await image.write(outputPath);
}

process('gazebo_backup.png', 'gazebo_temp.png');
