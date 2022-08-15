const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
// this is middleware function start////
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.BS_USER}:${process.env.BS_PASSWORD}@cluster0.wnhxcgw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {

    await client.connect();
    const productCollection = client.db('booksStock').collection('product');
   
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
  
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    
 

    // WORK TO POST FUNCTION//
    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    
   
  
   

 
    // Delete Product///
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result);

    })
  }
  finally {

  }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Running books stock server");
})
app.listen(port, () => {
  console.log('Listening to port');
})


