// src/routes/api/post.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    // Validate content type
    const contentType = req.get('Content-Type');
    if (!contentType) {
      return res.status(400).json(createErrorResponse(400, 'Content-Type header is required'));
    }

    // Check if content type is supported
    if (!Fragment.isSupportedType(contentType)) {
      return res
        .status(415)
        .json(createErrorResponse(415, `Content type ${contentType} is not supported`));
    }

    // Validate body exists
    if (!req.body || req.body.length === 0) {
      return res.status(400).json(createErrorResponse(400, 'Fragment data is required'));
    }

    // Create the fragment
    const ownerId = req.user;
    const fragment = new Fragment({
      ownerId,
      type: contentType
    });

    // Save the fragment data
    await fragment.setData(req.body);
    await fragment.save();

    // Return success response with fragment data
    res.status(201).json(
      createSuccessResponse({
        fragment
      })
    );
  } catch (err) {
    res.status(500).json(createErrorResponse(500, 'Failed to create fragment'));
  }
};
