import axios from 'axios';
import { config } from '../config';

const NEWS_API_BASE = 'https://newsapi.org/v2/everything';

export const fetchLatestNews = async (query: string) => {
  // Ensure we focus on the Indian market setting explicitly
  const contextualQuery = `(${query}) AND (India OR NSE OR BSE OR "Indian Stock")`;
  
  const response = await axios.get(NEWS_API_BASE, {
    params: {
      q: contextualQuery,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 10,
      apiKey: config.NEWS_API_KEY
    }
  });

  if (response.data.status !== 'ok') {
    throw new Error(`Failed to fetch news for ${query}`);
  }

  return response.data.articles.map((article: any) => ({
    title: String(article.title),
    source: String(article.source?.name || 'Unknown'),
    url: String(article.url),
    content_raw: String(article.description || article.content || ''),
    published_at: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString()
  }));
};
