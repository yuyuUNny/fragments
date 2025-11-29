// src/routes/api/delete-by-id.js
const { deleteFragment } = require('../../model/fragments');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const ownerId = req.user;
  const id = req.params.id;

  try {
    await deleteFragment(ownerId, id);
    res.status(200).json({
      status: 'ok',
      fragment: { id },
    });
  } catch (err) {
    logger.error(err);
    res.status(404).json({
      status: 'error',
      message: 'Fragment not found',
    });
  }
};
