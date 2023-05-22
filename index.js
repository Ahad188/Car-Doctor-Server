const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
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
// jwt function
     const verifyJwt =(req,res,next)=>{
          console.log('Heating the jwt function');
          console.log(req.headers.authorization);
          const authorization = req.headers.authorization
           if(!authorization){
               return res.status(401).send({error:true, message:"un authorization"})
           }
           const token = authorization.split(' ')[1]
           console.log("token in side jwd",token);
           jwt.verify(token, process.env.ACCESS_TOKEN,(error,decoded)=>{
               if(error){
                    return res.status(404).send({error:true, message:"un authorization"})
               }
               req.decoded = decoded;
               next()
           })
     }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const carCollections = client.db('CarDoctorDb').collection('services')
    const bookingCollection = client.db('CarDoctorDb').collection('bookings')
     // jwt routes
     app.post('/jwt',(req,res)=>{
          const user = req.body;
          console.log(user);
          const token = jwt.sign(user, process.env.ACCESS_TOKEN,{expiresIn:'1h'})
          res.send({token})
     })

     // service routes
    app.get('/services', async(req,res)=>{
     const sort = req.query.sort
     const search = req.query.search;
     console.log(search);
     // const query = {};
            // const query = { price: {$gte: 50, $lte:150}};
            // db.InspirationalWomen.find({first_name: { $regex: /Harriet/i} })
            const query = {title: { $regex: search, $options: 'i'}}
     // const query = {};
     const options = {
          // sort matched documents in descending order by rating
          sort: { "price": sort === 'asc' ? 1 : -1 },
          
           
        };
     const courser = carCollections.find(query,options)
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
    // bookings routes

    app.get('/bookings', verifyJwt,async(req,res)=>{
     const decoded = req.decoded;
     if(decoded.email !== req.query.email){
          return res.status(403).send({error:1, message:"Forbidden Access"})
     }
     // console.log(req.query.email);
     console.log(req.headers);
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
//     update routes
    app.patch('/bookings/:id', async(req,res)=>{
     const id = req.params.id;
     const filter = {_id: new ObjectId(id)}
     const updateBooking = req.body;
     console.log(updateBooking);
     const updateDoc ={
          $set:{
               status: updateBooking.status
          }
     }

     const result = await bookingCollection.updateOne(filter,updateDoc)
     res.send(result)
    })
// delete routes
    app.delete('/bookings/:id',async(req,res)=>{
     const id = req.params.id;
     const query = {_id : new ObjectId(id)}
     const result = await bookingCollection.deleteOne(query)
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

 