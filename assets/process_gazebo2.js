const { Jimp } = require('jimp');

async function process(inputPath, outputPath) {
  const image = await Jimp.read(inputPath);
  const { width, height, data } = image.bitmap;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // If nearly white, make transparent
      if (r > 240 && g > 240 && b > 240) {
        data[idx + 3] = 0;
      }
    }
  }
  
  await image.write(outputPath);
  console.log('Done');
}

process('gazebo.png', 'gazebo_temp.png');
