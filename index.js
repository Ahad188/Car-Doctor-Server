const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()
// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejfmzqt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const carCollections = client.db('CarDoctorDb').collection('services')
    const bookingCollection = client.db('CarDoctorDb').collection('bookings')

    app.get('/services', async(req,res)=>{
     const courser = carCollections.find()
     const result = await courser.toArray()
     res.send(result)
    })

    app.get('/services/:id', async(req,res)=>{
     const id = req.params.id;
     const query = {_id : new ObjectId(id)}
     const options = {
          // Include only the `title` and `imdb` fields in each returned document
          projection: {   title: 1, price: 1,service_id:1,img:1 },
        };

     const result = await carCollections.findOne(query,options)
     res.send(result)
    })
//     bookings
    app.get('/bookings',async(req,res)=>{
     console.log(req.query.email);
     let query ={}
     if(req.query?.email){
          query = {email: req.query.email}
     }
     const result = await bookingCollection.find().toArray()
     res.send(result)
    })

    app.post('/bookings',async(req,res)=>{
          const booking = req.body;
          console.log(booking);
          const result = await bookingCollection.insertOne(booking)
          res.send(result)
    })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
//     await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req,res)=>{
     res.send('Doctor cars is running')
})
app.listen(port,()=>{
     console.log(`Cars Doctor server Port:${port}`);
})

// INvoffM557zgaLg3
// CarDoctor