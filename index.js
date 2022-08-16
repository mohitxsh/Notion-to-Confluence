const express = require('express')
const getQuery = require('./notion')
const getQueryDetails = require('./notion_details')
const cors=require("cors");

const PORT = process.env.PORT || 5000

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

const app = express()

app.use(cors(corsOptions))

app.get('/query/:pageId', async (req, res) => {
  const query = await getQuery(req.params.pageId)
  res.json(query)
})

app.get('/query/:pageId/children', async (req, res) => {
  const queryDetails = await getQueryDetails(req.params.pageId)
  res.json(queryDetails)
})

app.listen(PORT, console.log(`Server started on port ${PORT}`))