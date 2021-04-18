const express = require('express');
const port = 5000;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
var cors = require('cors')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express()
// Middle wares 
app.use(cors())
app.use(bodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mymds.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
    const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
    // perform actions on the collection object

    // Add Services 

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        console.log(title, description,price,file);
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, description, price, image })
            .then(result => {
                res.send(result.insertedCount > 0);
                console.log(result.insertedCount);
            })
            .catch(error => { console.log(error.message); })
    })

    // Get Services 

    app.get('/services', (req, res) => {
        serviceCollection.find({})
          .toArray((err, documents) => {
            res.send(documents);
          })
      });

    //   deleteService
    app.delete('/deleteService/:id', (req, res) => {
        serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
          .then(result => {
            res.send(result.deletedCount > 0);
            console.log(result.deletedCount);
          })
      })

});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})