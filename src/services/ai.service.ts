import OpenAI from 'openai';
import { config } from '../config';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const NewsSentimentSchema = z.object({
  sentiment_label: z.enum(['bullish', 'bearish', 'neutral']),
  sentiment_score: z.number().min(-1).max(1),
  ai_summary: z.string()
});

export const analyzeNewsSentiment = async (title: string, content: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert financial analyst. Analyze the provided news article for stock sentiment.' },
      { role: 'user', content: `Title: ${title}\nContent: ${content}` }
    ],
    response_format: zodResponseFormat(NewsSentimentSchema, 'sentiment_analysis')
  });

  const contentStr = response.choices[0].message.content;
  if (!contentStr) throw new Error('AI returned empty response for news analysis.');
  
  return NewsSentimentSchema.parse(JSON.parse(contentStr));
};

const MarketSummarySchema = z.object({
  summary_text: z.string(),
  sentiment_score: z.number().min(-1).max(1),
  sentiment_label: z.enum(['bullish', 'bearish', 'neutral']),
  risk_level: z.enum(['low', 'medium', 'high'])
});

export const generateMarketSummary = async (marketSymbol: string, newsAnalyses: any[]) => {
  const dataString = JSON.stringify(newsAnalyses);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `You are an expert financial analyst summarizing recent news sentiment for ${marketSymbol}. Output an overarching summary and risk profile based on these recent events.` },
      { role: 'user', content: `Here is the recent news data and individual sentiments:\n${dataString}` }
    ],
    response_format: zodResponseFormat(MarketSummarySchema, 'market_summary')
  });

  const contentStr = response.choices[0].message.content;
  if (!contentStr) throw new Error('AI returned empty response for market summary.');
  
  return MarketSummarySchema.parse(JSON.parse(contentStr));
};

const TradeSignalSchema = z.object({
  signal: z.enum(['BUY', 'SELL', 'HOLD']),
  confidence: z.number().min(0).max(100)
});

export const generateTradeSignal = async (marketSymbol: string, marketSummaryText: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `Based on the summary for ${marketSymbol}, decide whether to BUY, SELL, or HOLD. Provide a confidence score.` },
      { role: 'user', content: `Summary: ${marketSummaryText}` }
    ],
    response_format: zodResponseFormat(TradeSignalSchema, 'trade_signal')
  });

  const contentStr = response.choices[0].message.content;
  if (!contentStr) throw new Error('AI returned empty response for trade signal.');
  
  return TradeSignalSchema.parse(JSON.parse(contentStr));
};
