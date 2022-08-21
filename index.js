const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
// this is middleware function start////
app.use(cors());
app.use(express.json());


// /function of jwt////
function verifyToken(req,res,next){
  const accessHeader = req.headers.authorization;
  if(!accessHeader){
    return res.status(401).send({message: 'UnAuthorized access'});
  }
  const token = accessHeader.split(' ')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN, (err, decoded) =>{
    if(err){
      return res.status(403).send({message: 'Forbidden access'});

    }
    
    req.decoded = decoded;
    next();
  })
  
  
}



const uri = `mongodb+srv://${process.env.BS_USER}:${process.env.BS_PASSWORD}@cluster0.wnhxcgw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {

    await client.connect();
    const productCollection = client.db('booksStock').collection('product');
   const OrderProductCollection = client.db('booksStock').collection('collectOrder');
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

    // Used to collectOrder/////
    app.get('/collectOrder',verifyToken,async(req,res) =>{
     const emailDecoded = req.decoded.email;
      const email = req.query.email;
   if(email === emailDecoded) {
    const query ={email:email};
    const cursor = OrderProductCollection.find(query);
    const myOrders = await cursor.toArray();
    res.send(myOrders);
   }
   else{
    res.status(403).send({message: 'foirbidden access'})
   }
    })
    app.post('/collectOrder',async(req, res) =>{
      const newOrder = req.body;
      const result = await OrderProductCollection.insertOne(newOrder);
      res.send(result);
    });


    // Token related work///
  app.post('/getToken',async(req,res)=>{
    const user = req.body;
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '1d'});
    res.send({accessToken});
  })
   
  
   

 
    // Delete Product///
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result);

    });

app.delete("/collectOrder/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id:ObjectId(id) };
  const result = await OrderProductCollection.deleteOne(query);
  res.send(result);
});



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


