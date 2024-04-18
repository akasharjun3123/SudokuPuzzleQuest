const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

require('dotenv').config();
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;
const port = process.env.PORT || 3000;

const app = express()
app.use(cors());

const uri = `mongodb+srv://${dbUser}:${dbPass}@sudoku-puzzles-db.rypn7rp.mongodb.net/?retryWrites=true&w=majority&appName=sudoku-puzzles-db`;

MongoClient.connect(uri).then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
})
.catch(error => {
    console.error('Error connecting to MongoDB:', error);
});

app.use(express.json());

app.get('/api/data', async (req, res) => {
    try {
        
        const data = await getAllData();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
app.get('/api/data/:level', async (req, res) => {
    try {
        const level = req.params.level.toLowerCase();
        const data = await getRandomDocument(`${level}-puzzle-collection`);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});




// Function to fetch all data from all collections
async function getAllData() {
    try {
        const collections = await db.listCollections().toArray();
        const allData = {};
        for (const collection of collections) {
            const collectionName = collection.name;
            console.log('Fetching data from collection:', collectionName);
            const collectionData = await db.collection(collectionName).find({}).toArray();
            console.log('Fetched', collectionData.length, 'documents from collection:', collectionName);
            allData[collectionName] = collectionData;
        }
        return allData;
    } catch (error) {
        console.error('Error fetching data from collections:', error);
        return null;
    }
}




async function getRandomDocument(collectionName) {
    const collection = db.collection(collectionName);
    const pipeline = [
        { $sample: { size: 1 } } // Retrieve one random document
    ];
    const randomDocument = await collection.aggregate(pipeline).toArray();
    return randomDocument[0];
}



async function getPuzzleDataMongo(getLevel){
    
    try{
        await client.connect();
        const randomDoc = await getRandomDocument(`${getLevel.toLowerCase()}-puzzle-collection`);
        sudokuId = randomDoc._id
        unsolvedSudoku =  randomDoc["unsolved"]
        solvedSudoku =  randomDoc["solved"]
        //const copyArray = unsolvedsudoku.map(row => [...row])
        console.log("This current puzzle data is of "+getLevel+" Level with ID of "+sudokuId)
        console.log("Unsolved Sudoku: ")
        console.log(unsolvedSudoku)
        console.log("Solved Sudoku: ")
        console.log(solvedSudoku)
        mainFunction(copyArray, unsolvedSudoku, solvedSudoku)
    }catch (e){
        console.error(e)
    }finally{
        await client.close()
    }
    
}
