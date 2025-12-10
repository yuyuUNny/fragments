// src/routes/api/post.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const contentType = req.get('Content-Type');

    console.log('=== POST /fragments ===');
    console.log('Raw Content-Type header:', contentType);
    console.log('Is supported?', Fragment.isSupportedType(contentType));
    console.log('Body type:', typeof req.body);
    console.log('Is Buffer?', Buffer.isBuffer(req.body));
    console.log('Body length:', req.body?.length);
    console.log('======================');

    if (!contentType || !Fragment.isSupportedType(contentType)) {
      return res
        .status(415)
        .json(createErrorResponse(415, `Content type ${contentType} is not supported`));
    }

    const data = req.body;

    if (!data || (Buffer.isBuffer(data) && data.length === 0)) {
      return res.status(400).json(createErrorResponse(400, 'Fragment data is required'));
    }

    const fragment = new Fragment({
      ownerId,
      type: contentType
    });

    await fragment.setData(data);
    await fragment.save();

    res.setHeader('Location', `http://localhost:8080/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    console.error('POST /fragments error:', err);
    res.status(500).json(createErrorResponse(500, 'Failed to create fragment'));
  }
};
