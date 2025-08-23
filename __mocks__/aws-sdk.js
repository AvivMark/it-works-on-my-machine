// Simple manual mock for aws-sdk S3
class S3Mock {
  constructor() {
    this.storage = new Map();
  }

  putObject(params, cb) {
    const { Bucket, Key, Body } = params;
    const key = `${Bucket}/${Key}`;
    this.storage.set(key, Body);
    // simulate async
    setImmediate(() => cb(null, { ETag: 'mock-etag' }));
  }

  getObject(params, cb) {
    const { Bucket, Key } = params;
    const key = `${Bucket}/${Key}`;
    if (!this.storage.has(key)) {
      const err = new Error('NoSuchKey');
      err.code = 'NoSuchKey';
      return setImmediate(() => cb(err));
    }
    const Body = this.storage.get(key);
    setImmediate(() => cb(null, { Body }));
  }
}

module.exports = {
  S3: S3Mock
};
