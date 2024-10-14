import { srv } from "./srv/server.js";
import { camCli } from "./client/client.js";

const run = async () => {
  await srv();
  await camCli();
} 

run();
