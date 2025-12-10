// src/routes/api/patch.js
const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;
    const contentType = req.get('Content-Type');

    // Get existing fragment
    const fragment = await Fragment.byId(ownerId, id);

    // Check if content type matches (can't change type with PATCH)
    if (contentType !== fragment.type) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            `Cannot change fragment type from ${fragment.type} to ${contentType}`
          )
        );
    }

    // Update fragment data
    await fragment.setData(req.body);
    await fragment.save();

    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    console.error('PATCH error:', err);
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
