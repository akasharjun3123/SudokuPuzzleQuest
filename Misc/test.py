from pymongo import MongoClient

connection_string = "mongodb+srv://erraakash11:bWZT5xzD24Z2k0Xg@sudoku-puzzles-db.rypn7rp.mongodb.net/?retryWrites=true&w=majority&appName=sudoku-puzzles-db"
client = MongoClient(connection_string)
db = client['sudoku-puzzle-quest-puzzles-db']

easy_puzzles_collection = db['easy-puzzle-collection']
medium_puzzles_collection = db['medium-puzzle-collection']
hard_puzzles_collection = db['hard-puzzle-collection']

