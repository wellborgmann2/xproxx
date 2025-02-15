const http = require('http');
const https = require('https');
const { URL } = require('url');

module.exports = async (req, res) => {
  // Obtenha o URL de streaming da query string
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const streamingUrl = new URL(url);
    
    // Certifique-se de que a URL fornecida seja HTTP ou HTTPS
    if (streamingUrl.protocol !== 'http:' && streamingUrl.protocol !== 'https:') {
      return res.status(400).send('Only HTTP and HTTPS URLs are allowed');
    }

    // Se for HTTP, use o módulo http. Se for HTTPS, use o módulo https.
    const protocol = streamingUrl.protocol === 'http:' ? http : https;

    protocol.get(url, (streamRes) => {
      // Defina o cabeçalho de tipo de conteúdo do proxy
      res.setHeader('Content-Type', streamRes.headers['content-type']);
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Transmita os dados do stream
      streamRes.pipe(res);
    }).on('error', (err) => {
      console.error(err);
      res.status(500).send('Error while fetching the stream');
    });

  } catch (error) {
    console.error(error);
    res.status(400).send('Invalid URL');
  }
};
