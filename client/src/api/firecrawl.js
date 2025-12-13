const API_URL = process.env.REACT_APP_API_URL

export async function scrape(url) {
  try {
    const response = await fetch(`${API_URL}/scrape-recipe`, {
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