const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

//root api
app.get('/', (req, res) => {
    res.send('Home');
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8xmqa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
       await client.connect();
        const productCollection = client.db("hikeServe").collection("product");
        const userCollection = client.db('hikeServe').collection('user');



        //auth
        app.post('/login', async(req,res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d',
            });
            res.send({accessToken});
        })


       //load data
       app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
       })

       //load specific product
       app.get('/inventory/:id', async (req, res) => {
           const id = req.params.id;
           const query = {_id: ObjectId(id)};
           const result = await productCollection.findOne(query);
           res.send(result);
       })

       //update quantity
       app.put('/inventory/:id', async(req, res) => {
           const id = req.params.id;
           const upQuantity = req.body.quantity;
           const query = {_id: ObjectId(`${id}`)};
           const options = {upsert : true};
           const updateDoc = {
               $set: {
                   quantity: upQuantity
               }
           }
           const result = await productCollection.updateOne(query, updateDoc, options);
           res.send(result);
       })


       //add item
       app.post('/item', async(req, res) => {
           const newProduct = req.body;
           console.log(newProduct);
           const result = await productCollection.insertOne(newProduct);
           res.send(result);
       })

       //delete data 
       app.delete('/inventory/:id', async(req, res) => {
           const id = req.params.id;
           const query = {_id: ObjectId(id)};
           const result = await productCollection.deleteOne(query);
           res.send(result);
       })

       //get order
       app.get('/myitem', async(req,res) => {
           const email = req.query.email;
           const query = {email};
           const cursor = productCollection.find(query);
           const result = await cursor.toArray();
           res.send(result);
       })
    }
    finally{

    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log('CRUD Activate', port);
})