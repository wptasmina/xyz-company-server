const express = require("express");
const cors = require("cors");
require("dotenv").config()

const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000


//middleware
app.use(express.json())
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster-1.fmah5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {

    await client.connect();

    // HR-Collection
    const hrCollection = client.db("Join-Asset").collection("hr_account");

     //! Assets Collection
     const assetsCollection = client.db("JoinAsset").collection("assets");

    //! Employee Collection
    const employeeCollection = client
      .db("Join-Asset")
      .collection("employee_account");


    // //! Requested Assets Collection
    const requestedAssetsCollection = client
      .db("Join-Asset")
      .collection("requested_Assets");

      // Get HR data using HR email
      app.get("/hr-account/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const result = await hrCollection.findOne(query);
        res.send(result);
      });
  
      /// Post HR data
    app.post("/hr-account", async (req, res) => {
      const account = req.body;
      const query = { email: account.email };
      const existingAccount = await hrAccountCollection.findOne(query);
      if (existingAccount) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await hrCollection.insertOne(account);
      res.send(result);
    });

    //! Employee Account Related API

    // Get Employee data using Employee email
    app.get("/employee-account/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await employeeCollection.findOne(query);
      res.send(result);
    });

    // Get Employee data using employee_status
    app.get("/employee-account", async (req, res) => {
      // Query to fetch only employees with employee_status: false
      const query = { employee_status: false };
      // Fetch data from the database
      const employees = await employeeCollection.find(query).toArray();
      // Send the result
      res.send(employees);
    });

    // Get Employee data using hr_email
    app.get("/employee-accounts/:email", async (req, res) => {
      const email = req.params.email;
      // Query to fetch only employees with employee_status: false
      const query = { hr_email: email };
      // Fetch data from the database
      const employees = await employeeCollection.find(query).toArray();
      // Send the result
      res.send(employees);
    });

    // Post Employee data
    app.post("/employee-account", async (req, res) => {
      const account = req.body;
      const query = { email: account.email };
      const existingAccount = await employeeCollection.findOne(query);
      if (existingAccount) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await employeeCollection.insertOne(account);
      res.send(result);
    });


        // Patch Employee data
        app.patch("/employee-account/:id", async (req, res) => {
          const id = req.params.id; // Extract the ID from the URL
          const updateData = req.body; // Data to update
    
          // Perform the update
          const result = await employeeCollection.updateMany(
            { _id: new ObjectId(id) },
            { $set: updateData }
          );
    
          res.send(result);
        });
    
        //! Get all account by email and find only role
        app.get("/user/:email", async (req, res) => {
          const email = req.params.email;
    
          const user =
            (await hrAccountCollection.findOne({ email: email })) ||
            (await employeeCollection.findOne({ email: email }));
    
          if (user) {
            res.json({ role: user.role });
          } else {
            res.status(404).json({ message: "User not found" });
          }
        });
    
        //! Get all Users account
        app.get("/user", async (req, res) => {
          try {
            // Fetch data from both collections in parallel
            const [hrData, employeeData] = await Promise.all([
              hrAccountCollection.find().toArray(),
              employeeAccountCollection.find().toArray(),
            ]);
    
            // Combine the data from both collections
            const result = {
              hr: hrData,
              employees: employeeData,
            };
    
            res.send(result); // Send the combined data
          } catch (error) {
            console.error("Error fetching HR and Employee data:", error);
            res.status(500).send({ message: "Failed to fetch data" });
          }
        });
    
        //! Assets Related APi
    
        // Post Assets data
        app.post("/assets", async (req, res) => {
          const asset = req.body;
          const result = await assetsCollection.insertOne(asset);
          res.send(result);
        });
    
  
    // app.get('/employees', async(req, res)=>{
    //   const result = await employeeCollection.find().toArray();
    //   res.send(result)
    // })

    // app.post('/employees', async(req, res)=>{
    //   const newAddEmployees = req.body;
    //   const result = await employeeCollection.insertOne(newAddEmployees)
    //   res.status(201).send(result);
    // });
  

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("Data page site")
})

app.listen(port, ()=>{
    console.log('server running...')
})
