import { supabase } from '../db/client';

const indianMarkets = [
  { name: 'Reliance Industries', symbol: 'RELIANCE', exchange: 'BSE', is_active: true },
  { name: 'Tata Consultancy Services', symbol: 'TCS', exchange: 'BSE', is_active: true },
  { name: 'HDFC Bank', symbol: 'HDFCBANK', exchange: 'BSE', is_active: true },
  { name: 'Infosys', symbol: 'INFY', exchange: 'BSE', is_active: true },
  { name: 'State Bank of India', symbol: 'SBIN', exchange: 'BSE', is_active: true },
  { name: 'ICICI Bank', symbol: 'ICICIBANK', exchange: 'BSE', is_active: true }
];

async function seed() {
  console.log('🌱 Seeding Indian Markets to Database...');
  
  for (const market of indianMarkets) {
    const { error } = await supabase.from('markets').insert([market]);
    if (error) {
      // Ignore unique constraint violations if they are already in the DB
      if (error.code === '23505') {
        console.log(`⚠️ ${market.symbol} already exists, skipping.`);
      } else {
        console.error(`❌ Failed to insert ${market.name} (${market.symbol}):`, error.message);
      }
    } else {
      console.log(`✅ Successfully inserted ${market.symbol}`);
    }
  }
  
  console.log('🎉 Seeding complete.');
  process.exit(0);
}

seed();
