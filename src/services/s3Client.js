const AWS = require('aws-sdk');

// Simple wrapper around aws-sdk S3 for the app
const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'us-east-1' });

module.exports = {
  upload: (Bucket, Key, Body) => {
    return new Promise((resolve, reject) => {
      s3.putObject({ Bucket, Key, Body }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  },
  get: (Bucket, Key) => {
    return new Promise((resolve, reject) => {
      s3.getObject({ Bucket, Key }, (err, data) => {
        if (err) return reject(err);
        resolve(data.Body);
      });
    });
  }
};
