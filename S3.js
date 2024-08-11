// s3.js
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const uploadToS3 = (filePath, fileName, mimeType) => {
  const fileStream = fs.createReadStream(filePath);

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Body: fileStream,
    Key: fileName,
    ContentType: mimeType
  };

  return s3.upload(uploadParams).promise().then((data) => {
    fs.unlinkSync(filePath);
    return data.Location;
  }).catch((err) => {
    console.error('Error uploading file to S3:', err);
    throw err;
  });
};

module.exports = uploadToS3;
