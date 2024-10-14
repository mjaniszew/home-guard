import { MongoClient} from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.DB_CONNECTION_URL || 'mongodb://localhost:27017');

const setup = async () => {
  await client.connect();

  const db = client.db(process.env.DB_NAME || 'homeguard');

  db.createCollection('users');
  db.createCollection('homes');
  db.createCollection('tokens');
  db.createCollection('sensors');
  db.createView('homesWithTokens', 'homes', [{$lookup: {from: 'tokens', localField: 'tokens', foreignField: '_id', as: 'tokens'}}])

  return 'Done!';
}

setup().then(console.log).catch(console.error).finally(() => client.close());