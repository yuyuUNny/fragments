const { Fragment } = require('../../model/fragment');
const markdownIt = require('markdown-it');
const md = markdownIt();

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    let { id } = req.params;

    // extract extension if exists
    const parts = id.split('.');
    const hasExt = parts.length > 1;

    const ext = hasExt ? parts.pop() : null;
    id = hasExt ? parts.join('.') : id;

    // fetch metadata
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json({
        status: 'error',
        message: `Fragment '${id}' not found`
      });
    }

    // fetch the fragment's raw binary data
    const data = await fragment.getData();

    if (ext) {
      // Markdown → HTML
      if (ext === 'html') {
        if (fragment.type !== 'text/markdown') {
          return res.status(415).json({
            status: 'error',
            message: `Cannot convert '${fragment.type}' to HTML`
          });
        }

        const markdownText = data.toString();
        const html = md.render(markdownText);

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
      }

      // Unsupported extension
      return res.status(415).json({
        status: 'error',
        message: `Unsupported extension '.${ext}'`
      });
    }

    // no extension -> raw data
    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve fragment data'
    });
  }
};
