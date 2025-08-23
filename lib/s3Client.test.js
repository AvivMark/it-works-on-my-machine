// Use the manual mock in __mocks__/aws-sdk.js
jest.mock('aws-sdk');

const s3Client = require('./s3Client');

describe('s3Client with mocked aws-sdk', () => {
  const Bucket = 'my-bucket';
  const Key = 'test.txt';
  const Body = Buffer.from('hello world');

  test('upload should resolve with metadata', async () => {
    const res = await s3Client.upload(Bucket, Key, Body);
    expect(res).toBeDefined();
    expect(res.ETag).toBe('mock-etag');
  });

  test('get should return uploaded body', async () => {
    const data = await s3Client.get(Bucket, Key);
    expect(Buffer.isBuffer(data)).toBe(true);
    expect(data.toString()).toBe('hello world');
  });

  test('get missing key should reject', async () => {
    await expect(s3Client.get(Bucket, 'missing.txt')).rejects.toThrow('NoSuchKey');
  });
});
