from pymongo import MongoClient
import csv

def convert_string_into_array(string):
    idx=0
    puzzle = []
    for i in range(9):
        temp = []
        for j in range(9):
            if(string[idx] == '.'):
                temp.append(0)
            else:
                temp.append(int(string[idx]))
            idx+=1
        puzzle.append(temp)
    return puzzle

def parse_csv_to_json(csv_file_path,  collections, level):
    puzzles = []
    with open(csv_file_path, 'r', newline='', encoding='utf-16') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:            
            if len(row) == 4:  # Ensure each row has three values
                unsolved, solved, time, nill = row
                unsolvedsudoku =  convert_string_into_array(unsolved)
                solvedsudoku = convert_string_into_array(solved)
                puzzles = {
                    "difficulty level":level,
                    "unsolved": unsolvedsudoku,
                    "solved": solvedsudoku,
                    "time": float(time)
                }
                collections.insert_one(puzzles)
    print("added Succesfully") 


easy_puzzles_path = "puzzleGeneration\sudoku_puzzles_easy.csv"
medium_puzzles_path = "puzzleGeneration\sudoku_puzzles_medium.csv"
hard_puzzles_path = "puzzleGeneration\sudoku_puzzles_hard.csv"


connection_string = "mongodb+srv://erraakash11:bWZT5xzD24Z2k0Xg@sudoku-puzzles-db.rypn7rp.mongodb.net/?retryWrites=true&w=majority&appName=sudoku-puzzles-db"
client = MongoClient(connection_string)
db = client['sudoku-puzzle-quest-puzzles-db']


easy_puzzles_collection = db['easy-puzzle-collection']
medium_puzzles_collection = db['medium-puzzle-collection']
hard_puzzles_collection = db['hard-puzzle-collection']



#parse_csv_to_json(easy_puzzles_path, easy_puzzles_collection, "Easy")
#parse_csv_to_json(medium_puzzles_path, medium_puzzles_collection, "Medium")
#parse_csv_to_json(hard_puzzles_path, hard_puzzles_collection, "Hard")








