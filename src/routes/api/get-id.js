const { createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    let id = req.params.id;

    // Parse extension
    let ext = null;
    if (id.includes('.')) {
      const parts = id.split('.');
      id = parts[0];
      ext = parts[1];
    }

    // Look up fragment
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const data = await fragment.getData();

    // markdown → html or text
    if (ext) {
      if (fragment.type === 'text/markdown' && ext === 'html') {
        res.set('Content-Type', 'text/html');
        return res.status(200).send(md.render(data.toString()));
      }

      if (fragment.type === 'text/markdown' && ext === 'txt') {
        res.set('Content-Type', 'text/plain');
        return res.status(200).send(data);
      }

      return res
        .status(415)
        .json(createErrorResponse(415, `Cannot convert ${fragment.type} to .${ext}`));
    }

    // No conversion → raw data
    res.set('Content-Type', fragment.type);
    return res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).json(createErrorResponse(500, 'Failed to get fragment'));
  }
};
