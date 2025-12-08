// src/routes/api/delete-by-id.js
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const id = req.params.id;

  try {
    const fragment = await Fragment.byId(ownerId, id);

    // delete the fragment
    await fragment.delete();

    res.status(200).json({
      status: 'ok',
      fragment: { id }
    });
  } catch (err) {
    logger.error(err);
    res.status(404).json({
      status: 'error',
      message: 'Fragment not found'
    });
  }
};
