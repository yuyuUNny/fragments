// src/model/data/aws/index.js
const s3Client = require('./s3Client');
const logger = require('../../../logger.js');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Write a fragment's metadata to memory db. Returns a Promise<void>
async function writeFragment(fragment) {
  if (!fragment || !fragment.ownerId || !fragment.id) {
    throw new Error('Fragment must include ownerId and id');
  }
  const serialized = JSON.stringify(fragment);
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${fragment.ownerId}/${fragment.id}.json`,
    Body: serialized,
    ContentType: 'application/json',
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
  } catch (err) {
    console.error('Error writing metadata:', err);
    throw new Error('Unable to write fragment metadata');
  }
}

// Read a fragment's metadata from memory db. Returns a Promise<Object>
async function readFragment(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}.json`,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(params));

    const body = await streamToBuffer(data.Body);
    return JSON.parse(body.toString());
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return null;
    }
    console.error('Error reading metadata:', err);
    throw new Error('Unable to read fragment metadata');
  }
}

// Writes a fragment's data to an S3 Object in a Bucket
async function writeFragmentData(ownerId, id, data) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    // Use our client to send the command
    await s3Client.send(command);
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    // As the data streams in, we'll collect it into an array.
    const chunks = [];

    // When there's data, add the chunk to our chunks list
    stream.on('data', (chunk) => chunks.push(chunk));
    // When there's an error, reject the Promise
    stream.on('error', reject);
    // When the stream is done, resolve with a new Buffer of our chunks
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Reads a fragment's data from S3 and returns (Promise<Buffer>)
async function readFragmentData(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    // Convert the ReadableStream to a Buffer
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
async function listFragments(ownerId, expand = false) {
  // placeholder until DynamoDB implementation
  return [];
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
async function deleteFragment(ownerId, id) {
  if (!ownerId || !id) {
    throw new Error('ownerId and id are required');
  }

  try {
    // Delete metadata
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${ownerId}/${id}.json`,
      })
    );
    // Delete raw data
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${ownerId}/${id}`,
      })
    );
  } catch (err) {
    console.error('Error deleting fragment:', err);
    throw new Error('Unable to delete fragment');
  }
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
