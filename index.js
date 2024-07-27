require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb://localhost:27017`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  await client.connect();
  try {
    const todoCollaction = client.db('todoApp').collection('todos');


    app.get('/tasks', async (req, res) => {
      let query = {}
      let sorting = {}
      console.log(req.query.priority)
      // if (req.query.priority) {
      //   query = { priority: { $regex: req.query.priority, $options: 'i' } }
      // }

      const sortingValue = {
        High: -1,
        Medium: -1,
        Low: 1
      }

      for (const iterator of Object.keys(sortingValue)) {
        if (iterator === req.query.priority) {
          sorting = { priorityCode: sortingValue[req.query.priority] }
        }
      }

       
      const tasks = await todoCollaction.find(query).sort(sorting).toArray();
      res.send({ status: true, data: tasks });
    });


    app.post('/task', async (req, res) => {

      let data = req.body
      const priorityCodes = {
        High: 3,
        Medium: 2,
        Low:1
      }

      for (const iterator of Object.keys(priorityCodes)) {
        if (iterator === req.body.priority) {
          data = { ...req.body, priorityCode: priorityCodes[req.body.priority]}
        }
      }

      const result = await todoCollaction.insertOne(data);
      res.send(result);
    });

    app.get('/task/:id', async (req, res) => {
      const id = req.params.id;
      const result = await todoCollaction.findOne({ _id: ObjectId(id) });
      // console.log(result);
      res.send(result);
    });


    app.delete('/task/:id', async (req, res) => {
      const id = req.params.id;
      const result = await todoCollaction.deleteOne({ _id: ObjectId(id) });
      // res.send(result);
    });

    // status update
    app.put('/task/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const task = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          isCompleted: task.isCompleted,
          title: task.title,
          description: task.description,
          priority: task.priority,
        },
      };
      const options = { upsert: true };
      const result = await todoCollaction.updateOne(filter, updateDoc, options);
      res.json(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
