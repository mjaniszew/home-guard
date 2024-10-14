import bcrypt from 'bcryptjs';
import minimist from 'minimist';

/** 
 * run this script via "node -p 'your_password'" to hash password
 * run this script via "node -p 'your_password' -c 'hash'" to to compare hash to password
 */

const args = minimist(process.argv);

if (args.c) {
  console.log(bcrypt.compareSync(args.p, args.c));
} else {
  console.log(bcrypt.hashSync(args.p, 8));
}