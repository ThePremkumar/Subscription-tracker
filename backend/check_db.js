const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://user1:admin1234@cluster0.zox2c.mongodb.net/subscription-tracker?retryWrites=true&w=majority&appName=Cluster0');
  
  const docs = await mongoose.connection.db.collection('subscriptions').find({ name: 'Mobile Recharge' }).toArray();
  console.log(JSON.stringify(docs, null, 2));
  process.exit(0);
}

check().catch(console.error);
