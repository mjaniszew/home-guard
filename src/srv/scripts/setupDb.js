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
  db.command({create: 'sensors_readings_full', viewOn: 'sensors_readings', pipeline: [{$lookup: {from: 'sensors', localField: 'sensorId', foreignField: '_id', as: 'sensor'}}]});
  db.command({create: 'sensors_with_reading', viewOn: 'sensors', pipeline: [{$lookup: {from: "sensors_readings", let: {sid: "$_id"}, pipeline: [{$sort: {timestamp: -1}}, {$match: {$expr: {$eq: ["$$sid", "$sensorId"]}}}, {$limit: 1}], as: "lastReading"}}]})
  db.command({create: 'homes_with_tokens', viewOn: 'homes', pipeline: [{$lookup: {from: 'tokens', localField: 'tokens', foreignField: '_id', as: 'tokens'}}]})

  return 'Done!';
}

setup().then(console.log).catch(console.error).finally(() => client.close());
