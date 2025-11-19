const { createSuccessResponse } = require('../../response');
const Fragment = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const ownerId = req.user;

    const fragments = await Fragment.byUser(ownerId);
    const result = expand ? fragments.map((f) => f) : fragments.map((f) => f.id);
    res.status(200).json(createSuccessResponse({ fragments: result }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', error: 'Failed to fetch fragments' });
  }
};
