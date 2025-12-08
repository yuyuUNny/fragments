// src/routes/api/get-by-id-info.js
const Fragment = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const ownerId = req.user;

    // try to get the fragment
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json({
        status: 'error',
        message: `Fragment with id '${id}' not found`
      });
    }

    // fragment exists → return metadata
    res.status(200).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          type: fragment.type,
          size: fragment.size,
          created: fragment.created,
          updated: fragment.updated
        }
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Unable to fetch fragment metadata'
    });
  }
};
