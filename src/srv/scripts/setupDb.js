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
  db.createCollection('sensors_readings');
  db.createView('sensors_readings_full', 'sensors_readings', [{$lookup: {from: 'sensors', localField: 'sensorId', foreignField: '_id', as: 'sensor'}}])
  db.createView('sensors_with_readings', 'sensors', [{$lookup: {from: 'sensors_readings', localField: '_id', foreignField: 'sensorId', as: 'readings'}}])
  db.createView('sensors_with_reading', 'sensors', [{$lookup: {from: "sensors_readings", let: {sid: "$_id"}, pipeline: [{$sort: {timestamp: -1}}, {$limit: 1}, {$match: {$expr: {$eq: ["$$sid", "$sensorId"]}}}], as: "lastReading"}}])
  db.createView('homes_with_tokens', 'homes', [{$lookup: {from: 'tokens', localField: 'tokens', foreignField: '_id', as: 'tokens'}}])

  return 'Done!';
}

setup().then(console.log).catch(console.error).finally(() => client.close());
