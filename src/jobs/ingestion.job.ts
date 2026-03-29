import { fetchMarketData } from '../services/market.service';
import { fetchLatestNews } from '../services/news.service';
import {
  getActiveMarkets,
  insertMarketTick,
  upsertMarketMetricsLatest,
  insertNewsRaw,
  logSystemRun,
  completeSystemRun
} from '../db/actions';

export const runIngestionJob = async () => {
  const runId = await logSystemRun('ingestion', 'running');

  try {
    const markets = await getActiveMarkets();

    for (const market of markets) {
      console.log(`[Ingestion] Processing market: ${market.symbol}`);

      // 1. Fetch & Store Market Data
      try {
        const marketData = await fetchMarketData(market.symbol);

        await insertMarketTick({
          market_id: market.id,
          timestamp: new Date().toISOString(),
          open: marketData.price, // Fallback since proxy uses latest
          high: marketData.high,
          low: marketData.low,
          close: marketData.price,
          volume: marketData.volume
        });

        await upsertMarketMetricsLatest({
          market_id: market.id,
          index_price: marketData.price,
          percent_change: marketData.changePercent,
          day_high: marketData.high,
          day_low: marketData.low,
          volume: marketData.volume,
          volatility_index: 0
        });
      } catch (err: any) {
        console.error(`[Ingestion] Error fetching market data for ${market.symbol}:`, err.message);
      }

      // 2. Fetch & Store News Data
      try {
        const query = `${market.name} OR ${market.symbol}`;
        const newsArticles = await fetchLatestNews(query);

        for (const article of newsArticles) {
          await insertNewsRaw({
            market_id: market.id,
            title: article.title,
            source: article.source,
            url: article.url,
            content_raw: article.content_raw,
            published_at: article.published_at || new Date().toISOString()
          });
        }
      } catch (err: any) {
        console.error(`[Ingestion] Error fetching news for ${market.symbol}:`, err.message);
      }
    }

    await completeSystemRun(runId, 'completed');
    console.log('[Ingestion] Complete.');
  } catch (err: any) {
    await completeSystemRun(runId, 'failed', err.message);
    throw err;
  }
};
