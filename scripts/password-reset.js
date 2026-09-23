import { createStore } from '../server/store.js';
import { issuePasswordReset } from '../server/auth.js';

const email=process.argv[2];
if(!email){
  console.error('Usage: npm.cmd run password:reset -- your@email.com');
  process.exitCode=1;
}else{
  const store=createStore(process.env.DATABASE_PATH);
  try{
    const token=issuePasswordReset(store,email);
    console.log('Open the local site and choose Forgot password. Recovery code (15 minutes, single use):');
    console.log(token);
    console.log('Keep this code private. Enter your new password only in the site.');
  }catch(error){console.error(error.message);process.exitCode=1;}
  finally{store.close();}
}
