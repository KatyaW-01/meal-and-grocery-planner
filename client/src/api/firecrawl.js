export async function scrape(url) {
  try {
    const response = await fetch('http://127.0.0.1:5555/scrape-recipe', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({url: url})
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error scraping website:', error)
    return null
  }
}