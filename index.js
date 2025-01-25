const express = require("express");
const cors = require("cors");
require("dotenv").config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
     const assetsCollection = client.db("Join-Asset").collection("assets");

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
      const existingAccount = await hrCollection.findOne(query);
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
            (await hrCollection.findOne({ email: email })) ||
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
              hrCollection.find().toArray(),
              employeeCollection.find().toArray(),
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
    
  
    
        // Get Requested Asset
        app.get("/requested-assets", async (req, res) => {
          const email = req.query.email; // HR email
          if (!email) {
            return res.status(400).send("HR email is required");
          }
    
          const { requester_email, requester_name } = req.query;
    
          // Build the search query with hr_email as the base condition
          let searchQuery = { hr_email: email };
    
          // Add additional search filters if provided
          if (requester_email) {
            searchQuery.requester_email = {
              $regex: requester_email,
              $options: "i", // Case-insensitive match
            };
          }
          if (requester_name) {
            searchQuery.requester_name = {
              $regex: requester_name,
              $options: "i", // Case-insensitive match
            };
          }
    
          try {
            // Fetch requested assets based on the search query
            const result = await requestedAssetsCollection
              .find(searchQuery)
              .toArray();
    
            // Enrich results with asset details
            for (const request of result) {
              const query1 = { _id: new ObjectId(request.asset_id) };
              const asset = await assetsCollection.findOne(query1);
              if (asset) {
                request.asset_name = asset.product_name;
                request.asset_type = asset.product_type;
              }
            }
    
            res.send(result);
          } catch (error) {
            console.error("Error fetching requested assets:", error);
            res.status(500).send("Internal Server Error");
          }
        });
    
      

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
