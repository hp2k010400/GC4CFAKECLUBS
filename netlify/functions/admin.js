const https = require('https')

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    }
    const req = https.request(opts, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve({
        ok: res.statusCode >= 200 && res.statusCode < 300,
        status: res.statusCode,
        text: () => data,
        json: () => JSON.parse(data),
      }))
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { action, content } = body

  if (action === 'commit' || action === 'commit-images') {
    const pat = process.env.GITHUB_PAT
    if (!pat) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'GITHUB_PAT env var missing' }) }
    }

    const repo = 'hp2k010400/GC4CFAKECLUBS'
    const filePath = action === 'commit-images' ? 'public/data/fake-images.json' : 'public/data/fake-data.json'
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`
    const ghHeaders = {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'gc4c-fake-guide',
    }

    try {
      const getRes = await request(apiUrl, { headers: ghHeaders })
      let sha = null
      if (getRes.ok) {
        sha = getRes.json().sha
      }

      const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
      const putBody = JSON.stringify({
        message: 'Update via admin panel',
        content: encoded,
        ...(sha ? { sha } : {}),
      })

      const putRes = await request(apiUrl, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      }, putBody)

      if (!putRes.ok) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: `GitHub error: ${putRes.text()}` }) }
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) }
}
