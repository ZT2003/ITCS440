class Square {
    constructor(x, y, cost = 0, parent = null) {
        this.x = x;
        this.y = y;
        this.cost = cost;
        this.heuristic = 0; // Manhattan distance to the goal
        this.parent = parent;
    }
}

// Generate random size maze with obstacles
function generate_maze(rows, cols, obstacles) {
    const maze = [];
    for(let i = 0; i < rows; ++i) {
        maze.push([]);
        for(let j = 0; j < cols; ++j) {
            maze[i].push(" ");
        }
    }
    // Adding obstacles randomly in the maze
    let count = 0;
    while(count < obstacles) {
        const x = Math.floor(Math.random() * rows);
        const y = Math.floor(Math.random() * cols);
        // Check if the square is empty and that is not the start or goal state
        if(maze[x][y] == " " && (x !== 0 || y !== 0) && (x !== cols-1 || y !== rows-1)) {
            maze[x][y] = "X";
            count += 1;
        }
    }
    return maze;
}

// Printing the maze
function print_maze(maze) {
    const div = document.getElementById("maze");
    if (Array.isArray(maze)) {
        maze.forEach((row, rindex) => {
            if (Array.isArray(row)) {
                let printed = "";
                div.innerHTML += "<span class='square number'>" + rindex + "</span>"; 
                row.forEach(col => {
                    if(col === " "){
                        div.innerHTML += "<span class='white square'>-</span>"; // Empty space
                        printed += "- ";
                    }
                    else if(col === "X"){
                        div.innerHTML += "<span class='black square'>X</span>"; // Obstacle
                    }
                    else {
                        div.innerHTML += "<span class='grey square'>" + col + "</span>";
                    }
                    printed += col + " ";
                });
                div.innerHTML += "<br>";
                console.log(printed + "\n");
            }
        });

        // Adding column numbers at the bottom
        div.innerHTML += "<span class='square white number'>-</span>"; 
        maze[0].forEach((col, cindex) => {
            div.innerHTML += "<span class='square number'>" + cindex + "</span>"; 
        });
    } else {
        div.innerHTML = "Invalid maze data!";
        console.log("invalid maze data");
    }
}

// Printing the solution path
function print_solution(maze) {
    const div = document.getElementById("solution");
    if (Array.isArray(maze)) {
        maze.forEach((row, rindex) => {
            if (Array.isArray(row)) {
                let printed = "";
                div.innerHTML += "<span class='square number'>" + rindex + "</span>"; 
                row.forEach(col => {
                    if(col === " ") {
                        div.innerHTML += "<span class='white square'>-</span>";
                        printed += "- ";
                    }
                    else if(col === "X") {
                        div.innerHTML += "<span class='black square'>X</span>";
                    }
                    else if(col === "*") {
                        div.innerHTML += "<span class='green square'>*</span>";
                    }
                    else {
                        div.innerHTML += "<span class='grey square'>" + col + "</span>";
                    }
                    printed += col + " ";
                });
                div.innerHTML += "<br>";
                console.log(printed + "\n");
            }
        });
        div.innerHTML += "<span class='square white number'>-</span>"; 
        maze[0].forEach((col, cindex) => {
            div.innerHTML += "<span class='square number'>" + cindex + "</span>"; 
        });
    } else {
        div.innerHTML = "Invalid maze data!";
        console.log("invalid maze data");
    }
}

// A* algorithm
function a(maze, s, g) {
    let rows = maze.length;
    let cols = maze[0].length;
    const open = []; // Open list to track squares to be evaluated
    const close = []; // Close list to track squares already evaluated
    const start = new Square(s[0], s[1]); // Starting square
    const goal = new Square(g[0], g[1]); // Goal square
    
    // Calculate the manhattan distance for the hueristic
    start.heuristic = Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y);
    open.push(start);

    // Loop until the goal is found or open list is empty
    while (open.length > 0) {
        // Sort the open list based on the total hueristic value (cost + hueristic)
        open.sort((a, b) => (a.cost + a.heuristic) - (b.cost + b.heuristic));
        
        // Remove the lowest value from open list and add it in close list
        const current = open.shift();
        close.push(current);

        // Check if the current state is the goal and trace the solution path to the start (goal to start path)
        if(current.x == goal.x && current.y == goal.y) {
            const path = [];
            let square = current;
            while(square) {
                path.push([square.x, square.y]);
                square = square.parent;
            }
            // Retrun the path in reverse (start to goal)
            return path.reverse();
        }

         // Define the allowed movements in the maze
        const directions = [
            [-1, 0], // up
            [1, 0], // down
            [0, -1], // left
            [0, 1], // right
        ];

        // Evaluate the possible direction to move in
        for(let i = 0; i < 4; ++i) {
            const child_x = current.x + directions[i][0];
            const child_y = current.y + directions[i][1];
            
            // Check if the direction is valid
            if(child_x >= 0 && child_x < rows && child_y >= 0 && child_y < cols && maze[child_x][child_y] !== "X"){
                const child = new Square(child_x, child_y, current.cost + 1, current);
                // Calculate the manhattan distance as the heuristic value (cost + hueristic)
                child.heuristic = Math.abs(goal.x - child_x) + Math.abs(goal.y - child_y);

                // Check if child is found in either the open or the close
                const in_open = open.find(square => square.x === child_x && square.y === child_y);
                const in_close = close.find(square => square.x === child_x && square.y === child_y);
                
                // If the child is found in the open list -> update its cost if the new cost is lower
                if(in_open) {
                    if (in_open.cost > child.cost) {
                        in_open.parent = current;
                        in_open.cost = child.cost;
                    }
                } 

                // If the child is found in the close list -> update its cost 
                else if (in_close) {
                    if (in_close.cost > child.cost) {
                        in_close.parent = current;
                        in_close.cost = child.cost;
                        // Recompute costs for all the needed children
                        costUpdate(in_close, close, open);
                    }
                } 
                // If the child is not in the open or close lists ->  add it to open list
                else {
                    open.push(child);
                }
            }
        }
        // Debugging purposes, check the open and close lists
        let openlist = "open = ";
        open.forEach(square => {openlist += "(" + square.x + ", " + square.y + "): " + "cost=" + square.cost + ", h=" + square.heuristic + ", "});
        let closelist = "close = ";
        close.forEach(square => {closelist += "(" + square.x + ", " + square.y + "): " + "cost=" + square.cost + ", h=" + square.heuristic + ", "});
        console.log(openlist);
        console.log(closelist);
    }
    // If the path is not found
    return null;
} 

// Updating the cost of the children
function costUpdate(node, close, open) {
    const children = [...open, ...close].filter(square => square.parent === node);
    for (const child of children) {
        const newCost = node.cost + 1;
        if (child.cost > newCost) {
            child.cost = newCost;
            costUpdate(child, close, open);
        }
    }
}

// Assuming the number of rows, columns, and obstacles for the maze creation
let rows = 10;
let columns = 10;
let obstacles = 20;
const maze = generate_maze(rows, columns, obstacles);

// Assuming the first square is the starting point and the last square is the goal we want to reach
let start = [0, 0];
let goal = [rows-1, columns-1];
maze[0][0] = "S";
maze[rows-1][columns-1] = "G";

print_maze(maze);

const path = a(maze, start, goal);
// Printing the movements from start state to goal state 
if (path) {
    for (let i = 0; i < path.length; ++i) {
        if (!(path[i][0] === start[0] && path[i][1] === start[1]) && !(path[i][0] === goal[0] && path[i][1] === goal[1])) {
            maze[path[i][0]][path[i][1]] = "*";
            let x = path[i][0] - path[i - 1][0];
            let y = path[i][1] - path[i - 1][1];
            let operation;
            if (x == -1)
                operation = "up";
            else if (x == 1)
                operation = "down";
            else if (y == -1)
                operation = "left";
            else if (y == 1)
                operation = "right";

            document.getElementById("path").innerHTML += "(" + path[i] + ") - ";
            document.getElementById("description").innerHTML += 
                `One step <span style="color: #2b7c85;">${operation}</span>: (${path[i]}) <br>`;
        } else if (path[i][0] === start[0] && path[i][1] === start[1]) {
            document.getElementById("path").innerHTML += "(" + path[i] + ") - ";
            document.getElementById("description").innerHTML = 
                "Start at (" + path[i] + ") <br>";  
        } else if (path[i][0] === goal[0] && path[i][1] === goal[1]) {
            document.getElementById("path").innerHTML += "(" + path[i] + ")";
            document.getElementById("description").innerHTML += 
                "Goal at (" + path[i] + ") <br>";  
        }
    }
    console.log("solution");
    print_solution(maze);
}
else {
    console.log("no solution found");
    document.getElementById("solution").innerText = "No solution";
}