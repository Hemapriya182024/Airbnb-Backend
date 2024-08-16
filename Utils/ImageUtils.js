const axios = require('axios');
const fs = require('fs');

const downloadImage = async (url, filename) => {
  const response = await axios({
    url,
    responseType: 'stream',
  });
  return new Promise((resolve, reject) => {
    response.data.pipe(fs.createWriteStream('uploads/' + filename))
      .on('finish', () => resolve())
      .on('error', (e) => reject(e));
  });
};

module.exports = { downloadImage };
