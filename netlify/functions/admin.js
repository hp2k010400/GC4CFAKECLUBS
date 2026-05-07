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

  const { action, password, content } = body

  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Incorrect password' }) }
  }

  if (action === 'verify') {
    return { statusCode: 200, headers, body: JSON.stringify({ valid: true }) }
  }

  if (action === 'commit') {
    const pat = process.env.GITHUB_PAT
    if (!pat) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured — GITHUB_PAT env var missing' }) }
    }

    const repo = 'hp2k010400/GC4CFAKECLUBS'
    const filePath = 'public/data/fake-data.json'
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`

    try {
      const getRes = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })

      let sha = null
      if (getRes.ok) {
        const fileData = await getRes.json()
        sha = fileData.sha
      }

      const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64')

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update fake indicators via admin panel',
          content: encoded,
          ...(sha ? { sha } : {}),
        }),
      })

      if (!putRes.ok) {
        const err = await putRes.text()
        return { statusCode: 500, headers, body: JSON.stringify({ error: `GitHub API error: ${err}` }) }
      }

      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) }
}
