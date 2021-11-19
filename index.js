const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hnyer.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()

        const database = client.db('sunscreen')
        const userCollection = database.collection('user')
        const productsCollection = database.collection('product')
        const orderCollection = database.collection('order')
        const reviewCollection = database.collection('review')

         // get all products 
         app.get('/allProducts', async (req, res) => {
            const cursor = productsCollection.find({})
            const product = await cursor.toArray()
            res.send(product)
        })

          // get specific product with id 
          app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await productsCollection.findOne(query)
            res.send(service)
        })

        // place order 
        app.post('/purchase', async (req, res) => {
            const data = req.body
            const result = await orderCollection.insertOne(data)
            res.send(result)
        })

         
        // my orders 
        app.get('/myOrders', async(req, res)=>{
            const cursor = orderCollection.find({})
            const order = await cursor.toArray()
            res.send(order)
        })

        // delete order 
        app.delete('/myorders/deleteorder/:id', async(req, res) => {
            const orderId = req.params.id
            const query = {_id: ObjectId(orderId)}
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })
  
        
        // taking user review
        app.post('/review/submit', async(req, res) => {
            const data = req.body
            const result = await reviewCollection.insertOne(data)
            res.send(result)
        })

        //get review
        app.get('/showreview', async(req, res) => {
            const cursor = reviewCollection.find({})
            const review = await cursor.toArray()
            res.send(review)
        })

        //delete a single product
        app.delete('/product/delete/:id', async(req, res) => {
            const orderId = req.params.id
            const query = {_id: ObjectId(orderId)}
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        //add a product
        app.post('/addproduct', async(req, res) => {
            const data = req.body 
            const result = await productsCollection.insertOne(data)
            res.send(result)
        })


        // collect user
        app.post('/addUser', async(req, res) => {
            const data = req.body
            const result = await userCollection.insertOne(data)
            res.send(result)
        })


        // send user  for admin login
        app.get('/getuser/:email', async(req, res) => {
            const email = req.params.email
            const query = {email: email}
            const user = await userCollection.findOne(query)
            let isAdmin = false
            if(user?.userStatus === "admin"){
                isAdmin = true
            }
            res.json({admin: isAdmin})
        })


        //make admin
        app.put('/makeadmin/submit',async(req, res)=>{
            const adminEmail = req.body
            const filter = {email: adminEmail.email}
            const option = {upsert: true}
            const updateDoc = {$set:{userStatus: 'admin'}}
            const result = await userCollection.updateOne(filter, updateDoc, option)
            res.json(result)
        })

        

        // update order status 
        app.put('/updateorderstatus/:id', async(req, res)=> {
            console.log('hitting...')
            const id = req.params.id
            const filter = {_id: ObjectId(id)}
            console.log(filter)
            const updateDoc = {$set:{status: 'shipped'}}
            const result = await orderCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir)


// testing 
app.get('/', (req, res) => {
    res.send('Server Running')
})

// Listening Port 

app.listen(port, () => {
    console.log("Server is Running at", port)
})
