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
  
      // Post HR data
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
    
  // Post Assets data
  app.post("/assets", async (req, res) => {
    const asset = req.body;
    const result = await assetsCollection.insertOne(asset);
    res.send(result);
  });      
    

    // Post Requested Asset
        app.post("/requested-asset", async (req, res) => {
          const asset = req.body;
          const result = await requestedAssetsCollection.insertOne(asset);
    
          const id = asset.asset_id;
          const query = { _id: new ObjectId(id) };
          const assets = await assetsCollection.findOne(query);
    
          let count = 0;
          if (assets.request_count) {
            count = assets.request_count + 1;
          } else {
            count = 1;
          }
    
          if (assets.product_quantity) {
            let quantity = Number(assets.product_quantity);
            const updatedQuantity = quantity - 1;
    
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
              $set: {
                request_count: count,
                product_quantity: updatedQuantity, // Update the quantity here
              },
            };
    
            const updateResult = await assetsCollection.updateOne(
              filter,
              updatedDoc
            );
          }
    
          res.send(result);
        });
    
        //Get requested asset using email, search, status filter, and asset_type filter
        app.get("/requested-asset", async (req, res) => {
          const email = req.query.email;
          const searchQuery = req.query.search || ""; // Search query parameter for asset name
          const status = req.query.status; // Status filter parameter
          const assetType = req.query.asset_type; // Asset type filter parameter
          let query = { requester_email: email };
    
          try {
            // Fetch requested assets based on email
            const result = await requestedAssetsCollection.find(query).toArray();
    
            // Fetch asset details and join them with requested assets
            const assetPromises = result.map(async (request) => {
              const assetQuery = { _id: new ObjectId(request.asset_id) }; // Assuming asset_id is an ObjectId
              const asset = await assetsCollection.findOne(assetQuery);
              if (asset) {
                request.asset_name = asset.product_name; // Add product_name from assets collection
                request.asset_type = asset.product_type; // Add product_type from assets collection
              }
              return request;
            });
    
    const assetsWithDetails = await Promise.all(assetPromises);
    // Filter results by asset_name if search query is provided
    let filteredResults = searchQuery
    ? assetsWithDetails.filter((request) =>
        request.asset_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : assetsWithDetails;

  // Further filter by status if provided
  if (status) {
    filteredResults = filteredResults.filter(
      (request) => request.status.toLowerCase() === status.toLowerCase()
    );
  }
            
  // Further filter by asset_type if provided
  if (assetType) {
    filteredResults = filteredResults.filter(
      (request) =>
        request.asset_type &&
        request.asset_type.toLowerCase() === assetType.toLowerCase()
    );
  }

  res.send(filteredResults); // Return the filtered results
} catch (error) {
  console.error("Error fetching requested assets:", error);
  res.status(500).send({ message: "Internal Server Error" });
}
});  
            
    
        //Get requested assets data using email and filter data by status: Pending
        app.get("/requested-asset/pending", async (req, res) => {
          const email = req.query.email;
          const query = { requester_email: email, status: "Pending" };
    
          const result = await requestedAssetsCollection.find(query).toArray();
    
          for (const request of result) {
            query1 = { _id: new ObjectId(request.asset_id) };
            const asset = await assetsCollection.findOne(query1);
            if (asset) {
              request.asset_name = asset.product_name;
            }
          }
          res.send(result);
        });
    
        //Get request asset use request this month
        app.get("/requested-asset/monthly", async (req, res) => {
          const email = req.query.email;
    
          // Define the start and end of the current month
          const currentDate = new Date();
          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          ).toISOString();
          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
          ).toISOString();
    
          // Query to filter by email and request date within the current month
          const query = {
            requester_email: email,
            request_date: { $gte: startOfMonth, $lt: endOfMonth },
          };
    
          // Fetch requests within the date range and sort by request_date (descending)
          const result = await requestedAssetsCollection
            .find(query)
            .sort({ request_date: -1 }) // Sort: most recent first
            .toArray();
    
          // Append asset names to the requests
          for (const request of result) {
            const assetQuery = { _id: new ObjectId(request.asset_id) };
            const asset = await assetsCollection.findOne(assetQuery);
    
            if (asset) {
              request.asset_name = asset.product_name; // Add asset name to the request
            }
          }
    
          // Send the final result
          res.send(result);
        });



    // HR Pending requested asset
        app.get("/requested-assets/pending", async (req, res) => {
          const email = req.query.email; // HR email
          const query = { hr_email: email, status: "Pending" };
    
          const result = await requestedAssetsCollection
            .find(query)
            .limit(5)
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
        });
    
       
    
        //Update Requested Asset
        app.patch("/requested-asset/:id", async (req, res) => {
          const id = req.params.id;
          const updateStatus = req.body;
    
          // Perform the update
          const result = await requestedAssetsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateStatus }
          );
    
          res.send(result);
        });
  
        // Update Asset
        app.patch("/assets/:id", async (req, res) => {
          const asset = req.body;
          const id = req.params.id;
          const result = await assetsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: asset }
          );
          res.send(result);
        });
    
        //Delete Asset
        app.delete("/assets/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await assetsCollection.deleteOne(query);
          res.send(result);
        });


  // Get Assets  sort by filter by product_type
  app.get("/assets", async (req, res) => {
    const { search, sort, product_type } = req.query;

    let filter = {}; 

    if (search) {
      filter.product_name = { $regex: search, $options: "i" }; // 'i' for case-insensitive search
    }

    // If a product_type filter is provided
    if (product_type && product_type !== "all") {
      filter.product_type = product_type;
    }

  // Define the sort
    let sortOption = {};
    if (sort === "asc") {
      sortOption = { product_quantity: 1 }; // Ascending order
    } else if (sort === "desc") {
      sortOption = { product_quantity: -1 }; // Descending order
    }

    try {
      const result = await assetsCollection
        .find(filter) // Apply the filter 
        .sort(sortOption) // Apply sorting by product_quantity
        .toArray();
      res.send(result);
    } catch (error) {
      res
        .status(500)
        .send({ message: "Failed to fetch assets", error: error.message });
    }
  });  
        
    
  // Get Assets sort by request_count an max 5
  app.get("/assets/request-count", async (req, res) => {
    const { limit, sort } = req.query;
  
    const maxItems = limit ? parseInt(limit) : 5;
  
    // default to descending (-1) on request_count
    const sortOrder = sort === "asc" ? 1 : -1; 
  
    try {
      // Fetch and sort assets request_count
      const result = await assetsCollection
        .find()
        .sort({ request_count: sortOrder })
        .limit(maxItems)
        .toArray();
  
      res.send(result);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).send({ error: "Failed to fetch assets." });
    }
  });      

  // Get Assets using _id data
  app.get("/assets/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await assetsCollection.findOne(query);
    res.send(result);
  });          
    
    
// HR Pending requested asset
app.get("/requested-assets/pending", async (req, res) => {
  const email = req.query.email; // HR email
  const query = { hr_email: email, status: "Pending" };

  const result = await requestedAssetsCollection
    .find(query)
    .limit(5)
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
  });      
    
  // Get HR most requested asset
    
   //Update Requested Asset
   app.patch("/requested-asset/:id", async (req, res) => {
    const id = req.params.id;
    const updateStatus = req.body;

    // Perform the update
    const result = await requestedAssetsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateStatus }
    );

    res.send(result);
  });   
  
  
  // Get Requested Asset
  app.get("/requested-assets", async (req, res) => {
    // HR email
    const email = req.query.email; 
    if (!email) {
      return res.status(400).send("HR email is required");
    }

    const { requester_email, requester_name } = req.query;

    // Build the search query with hr-email
    let searchQuery = { hr_email: email };

    // Add additional search filters if provided
    if (requester_email) {
      searchQuery.requester_email = {
        $regex: requester_email,
        $options: "i", 
      };
    }
    if (requester_name) {
      searchQuery.requester_name = {
        $regex: requester_name,
        $options: "i", 
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
