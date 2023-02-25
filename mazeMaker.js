// NOTE ON DEFAULTS:
// should all be set on the html page
let width = 5;
let height = 5;
//fraction of all possible cells accessible that counts as "interesting"
let interestingPercent = .5;
//fraction of all cells that must be dead ends. 
//So, in a 5x4 grid, all filled, there are 20 cells, and a 0.05 ratio means at least one dead end.
// above 0.2 seems unstable
let minDeadEnds = .15;
// is a boss key needed to enter the final room?
let bossKey = true;
// fraction of rooms with locked doors, and by extension keys. 0 = all doors open, 1 = all doors locked
let keyRatio = 0.3;
// do we try to place a key item for beating the boss in the map?(If false, player starts with it)
let dungeonItem = true;
// what ratio of doors aren't visible, and must be bombed? 0 = no bomb doors, 1 = all doors bombable
let bombWallRatio = 0.05;
// how hard is it to find the map? 0, you start with it, 1, do not place
// These will be in dead ends at this ratio from the start
let mapDifficulty = 0.3;
// how hard is it to find the compass? 0, you start with it, 1, do not place
let compassDifficulty = 0.3;
// how difficult are the enemies? 1 - 10, 1 being easiest. This is a range to allow for some 
// easy rooms and some hard ones
let difficultyRange = [1,4]
// heart pieces
let heartPieces = 4;

function toggleAdvanced(){
  document.getElementById('presets').style.display = 'none';
  document.getElementById('advSettings').style.display = 'block';
}

function advMaze(){
  width = document.getElementById('width').value;
  height = document.getElementById('height').value;
  interestingPercent = document.getElementById('interestingPercent').value;
  minDeadEnds = document.getElementById('minDeadEnds').value;
  bossKey = document.getElementById('bossKey').checked;
  keyRatio = document.getElementById('keyRatio').value;
  dungeonItem = document.getElementById('dungeonItem').checked;
  bombWallRatio = document.getElementById('bombWallRatio').value;
  mapDifficulty = document.getElementById('mapDifficulty').value;
  compassDifficulty = document.getElementById('compassDifficulty').value;
  generateDungeon()
}

function easyMaze(){
  width = 4;
  height = 4;
  interestingPercent = .5;
  minDeadEnds = .05;
  bossKey = true;
  keyRatio = 0.15;
  dungeonItem = false;
  bombWallRatio = 0.00;
  mapDifficulty = 0.15;
  compassDifficulty = 0.20;
  generateDungeon()
}

function medMaze(){
  width = 5;
  height = 5;
  interestingPercent = .70;
  minDeadEnds = .15;
  bossKey = true;
  keyRatio = 0.25;
  dungeonItem = true;
  bombWallRatio = 0.05;
  mapDifficulty = 0.20;
  compassDifficulty = 0.20;
  generateDungeon()
}

function hardMaze(){
  width = 8;
  height = 8;
  interestingPercent = .90;
  minDeadEnds = .2;
  bossKey = true;
  keyRatio = 0.35;
  dungeonItem = true;
  bombWallRatio = 0.15;
  mapDifficulty = 0.35;
  compassDifficulty = 0.35;
  generateDungeon()
}

function generateDungeon() {
  let regen = false;
  let tries = 0
  // the start is always in the bottom row of the maze
  const start = [height-1, Math.floor(Math.random() * width)];
  // the goal must be in the top half of the maze
  const goal = [Math.floor(Math.random() * (height/2)),Math.floor(Math.random() * width)]
  while(!regen){
      if(tries > 5){
        // to prevent a permanent hang, give up on having too many dead ends. This really matters in large dungeons
        minDeadEnds = minDeadEnds - 0.05
        tries = 0;
      }
      var maze = createMazeDFS(width, height, start, goal,keyRatio,bombWallRatio) 
      regen = isMazeInteresting(width,height,maze);
      tries++;
  }
  maze = setCritPathDistances(maze,width,height);
  maze = placeItems(maze,bossKey,dungeonItem,width,height,mapDifficulty,compassDifficulty);
  // output steps
  document.getElementById("renderTable").innerHTML = generateHTML(maze);
  const dungeon = generateMazeMapObj(maze,start)
  const dungeonJson = JSON.stringify(dungeon)
  const playLink = document.createElement("a");
  playLink.appendChild(document.createTextNode("Play Now"));
  document.getElementById("PlayNow").innerHTML = '';
  document.getElementById("PlayNow").appendChild(playLink);
  playLink.href = "index.html?d="+encodeURIComponent(dungeonJson)
  const blob = new Blob([dungeonJson], {type: "application/json"});
  const DLurl = URL.createObjectURL(blob);
  document.getElementById("downloadLink").href = DLurl;
  document.getElementById("downloadLink").download = dungeon.name + '.json';
  document.getElementById('downloadJSON').style.display = 'block';
};


// This function takes the maze and the set-up variables and places the keys, locks, \
// and items in the dungeon. 
function placeItems(maze,bossKey,dungeonItem,cols,rows,mapDifficulty,compassDifficulty){
  // list of dead ends will be used to place the key item and the boss key
  let listOfDeadEnds = [];
  let roomCount = 0;
  let doorCount = 0;
  let maxCriticalIndex = 0;
  let maxDistance = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let openSides = countOpenSides(maze[i][j]);
      if(openSides > 0){
        if(maxDistance < maze[i][j].distanceToStart){
          maxDistance = maze[i][j].distanceToStart;
        }
        roomCount++;
        // as each passage represents two doors, divide doors by two to get the number of unique passages
        // this room is adding to the count
        doorCount = Math.floor(openSides/2);
        if(openSides == 1 && !maze[i][j].goal && !maze[i][j].start ){
          // This is a dead end. Add it to the listOfDeadEnds
          listOfDeadEnds.push( [i,j,maze[i][j].nearestCritPath,maze[i][j].distanceToStart]);
        }
        // save the goal room's nearestCritPath as the maxCriticalPath
        if(maze[i][j].goal){
          maxCriticalIndex = maze[i][j].nearestCritPath;
        }
      }
    }
  }
  // sort the dead ends so the ones that are furthest from the entrance along the critical path are first
  //listOfDeadEnds.sort((a, b) => b[2] - a[2])
  listOfDeadEnds = listOfDeadEnds.sort(function(a, b) {
    if (a[2] == b[2]) {
      return a[3] - b[3];
    }
    return b[2] - a[2];
  });
  console.log('listOfDeadEnds: '+listOfDeadEnds)
  let branchCount = listOfDeadEnds.length;
  // loop through the deadends and add prizes
  for(const deadEnd of listOfDeadEnds){
    console.log( 'distance vs max distance' + maze[deadEnd[0]][deadEnd[1]].distanceToStart/maxDistance)
    const room = maze[deadEnd[0]][deadEnd[1]];
    // skip dead ends that already have keys in them
    if(room.key){continue;}
    // create a ratio of prizes we need to hide to dead ends
    let prizeRatio = (bossKey + dungeonItem + (1 > mapDifficulty > 0 )+ (1 > compassDifficulty > 0 ) +1)/branchCount;
    //let addPrize = false;
    //if(Math.random()*0.8 < prizeRatio){
    //  addPrize = true;
    //}
    // earlier version of this had some randomness as to whether a dead end contained an item, but this led to a lot of unsatisfying dead ends, especially in small dungeons
    // now, all far-away dead ends contain things, and dead ends closer to the start contain the maps. 
    console.log('map difficulty: '+mapDifficulty)
    let addPrize = true;
    if(addPrize){
      // decide which prize to add
      // bossKey and dungeonItem go first
      if(bossKey && dungeonItem){
        if(Math.random() >= 0.5){
          maze[deadEnd[0]][deadEnd[1]].bossKey = true;
          bossKey = false;
        } else {
          maze[deadEnd[0]][deadEnd[1]].bossItem = true;
          dungeonItem = false;
        }
      } else if(bossKey){
        maze[deadEnd[0]][deadEnd[1]].bossKey = true;
        bossKey = false;
      } else if(dungeonItem) {
        maze[deadEnd[0]][deadEnd[1]].bossItem = true;
        dungeonItem = false;
      } else if(1 > compassDifficulty && compassDifficulty > 0 ){
        maze[deadEnd[0]][deadEnd[1]].compass = true;
        compassDifficulty = 1;
      } else if(1 > mapDifficulty && mapDifficulty > 0){
        maze[deadEnd[0]][deadEnd[1]].map = true;
        mapDifficulty = 1;
      }
    }
    branchCount--;
  }
  // after looping through the dead ends, it is possible that we have not placed all of the possible prizes
  // check for remaining prizes and add them somewhat randomly around the maze
  while(bossKey || dungeonItem || (1 > mapDifficulty &&  0 < mapDifficulty) || (1 > compassDifficulty &&  0 < compassDifficulty) ){
    let x = Math.floor(Math.random()*cols);
    let y = Math.floor(Math.random()*rows);
    // place something if cell exists, is not goal or start, and doesn't have a prize already
    if(maze[y][x].filled && 
      !maze[y][x].goal && 
      !maze[y][x].start && 
      !maze[y][x].map &&
      !maze[y][x].compass &&
      !maze[y][x].bossItem &&
      !maze[y][x].bossKey &&
      !maze[y][x].key){

        if(bossKey && dungeonItem){
          if(Math.random() >= 0.5){
            maze[y][x].bossKey = true;
            bossKey = false;
          } else {
            maze[y][x].bossItem = true;
            dungeonItem = false;
          }
        } else if(bossKey){
          maze[y][x].bossKey = true;
          bossKey = false;
        } else if(dungeonItem) {
          cbossItem = true;
          dungeonItem = false;
        } else if(1 > compassDifficulty > maze[y][x].distanceToStart/maxDistance && compassDifficulty > 0){
          maze[y][x].compass = true;
          compassDifficulty = 1;
        } else if(1 > mapDifficulty > maze[y][x].distanceToStart/maxDistance && mapDifficulty > 0){
          maze[y][x].map = true;
          mapDifficulty = 1;
        }
    }
  }
  return maze;
}

// this function sets two variables on every cell
  // The distance to the critical path
  // The index of the critical path closest to the cell
function setCritPathDistances(maze,cols,rows){
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // if this room is a deadend, start walking back
      if(countOpenSides(maze[i][j]) == 1 && !maze[i][j].start && !maze[i][j].goal){
        console.log('calculating crit index and such for dead end '+i+', '+j)
        let stack = [];
        stack.push([i,j])
        let nextCoords = [];
        let x = 0
        let lastCoords = [];
        let lastDir = '';
        // X is there to ensure we are not stuck in an endless loop. 
        while (stack.length > 0 && x < (cols*rows)) {
          x++;
          let currentCoords = stack.pop();
          console.log('current coords: '+currentCoords);
          
          console.log('last coords: '+lastCoords);
          let currentRoom = maze[currentCoords[0]][currentCoords[1]]
          console.log('currentRoom : '+ maze[currentCoords[0]][currentCoords[1]] )
          // find the open direction that we did not come from
          if(!currentRoom.north && lastDir != 'south' &&  maze[currentCoords[0]-1][currentCoords[1]].distanceToStart < maze[currentCoords[0]][currentCoords[1]].distanceToStart ) {
            console.log('go north');
            lastDir = 'north';
            nextCoords = [currentCoords[0]-1,currentCoords[1]];
          } else if(!currentRoom.south && lastDir != 'north'  && maze[currentCoords[0]+1][currentCoords[1]].distanceToStart < maze[currentCoords[0]][currentCoords[1]].distanceToStart){
            console.log('go south');
            lastDir = 'south';
            nextCoords = [currentCoords[0]+1,currentCoords[1]];
          } else if(!currentRoom.east && lastDir != 'west'  && maze[currentCoords[0]][currentCoords[1]+1].distanceToStart < maze[currentCoords[0]][currentCoords[1]].distanceToStart){
            console.log('go east');
            lastDir = 'east';
            nextCoords = [currentCoords[0],currentCoords[1]+1];
          } else if(!currentRoom.west && lastDir != 'east' && maze[currentCoords[0]][currentCoords[1]-1].distanceToStart < maze[currentCoords[0]][currentCoords[1]].distanceToStart){
            console.log('go west');
            lastDir = 'west';
            nextCoords = [currentCoords[0],currentCoords[1]-1];
          } else {
            console.log('something is wrong')
            break;
          }
          //console.log('nextCoords: '+nextCoords);
          // if the next room is critical, roll down the stack
          //console.log('is it crit? : '+maze[nextCoords[0]][nextCoords[1]].critical)
          if(maze[nextCoords[0]][nextCoords[1]].critical || maze[nextCoords[0]][nextCoords[1]].nearestCritPath  ){
            //console.log('this cell is on the critcal path!');
            let distanceToCrit = maze[nextCoords[0]][nextCoords[1]].distanceToCrit + 1;
            let critIndex = maze[nextCoords[0]][nextCoords[1]].nearestCritPath;
            maze[currentCoords[0]][currentCoords[1]].distanceToCrit = distanceToCrit;
            maze[currentCoords[0]][currentCoords[1]].nearestCritPath = critIndex ;
            // roll down the stack and calculate!
            while(stack.length > 0){
              distanceToCrit++;
              let activeCoords = stack.pop();
              maze[activeCoords[0]][activeCoords[1]].distanceToCrit = distanceToCrit;
              maze[activeCoords[0]][activeCoords[1]].nearestCritPath = critIndex ;
            }
            lastCoords = [];
          } else {
            //console.log('not crit keep going');
            // add the next room to the stack and continue
            lastCoords = currentCoords;
            stack.push(currentCoords);
            stack.push(nextCoords);
          }
        }
      }
    }
  }
  return maze;
}

// returns the number of doors in a room
function countOpenSides(room){
  var openSides = 0;
  if(!room.north){
    openSides++;
  }
  if(!room.south){
    openSides++;
  }
  if(!room.east){
    openSides++;
  }
  if(!room.west){
    openSides++;
  }
  return openSides;
}

//The maze is interesting if it meets a threshold of branching paths and total cells filled. 
function isMazeInteresting(cols,rows,maze){
    const cellCount = cols*rows;
    console.log('possible cells:'+cellCount);
    let accessibleCellCount = 0;
    let deadEndsCount = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let openSides = countOpenSides(maze[i][j]);
            if(openSides > 0){
                accessibleCellCount++;
            }
            if(openSides == 1){
                deadEndsCount++;
            }
        }
    }
    //console.log('accessible cells:'+accessibleCellCount);
    //console.log('dead ends:'+deadEndsCount);
    let interesting = true;
    //console.log('percent filled:'+accessibleCellCount/cellCount);
    if(accessibleCellCount/cellCount < interestingPercent){
        //console.log('not enough flled cells');
        interesting = false;
    }
    // the start and end are always dead ends, so remove them from the count
    // we are looking for branching paths
    //console.log('dead end ratio:'+(deadEndsCount-2)/accessibleCellCount+ ', required: '+minDeadEnds);
    if( (deadEndsCount-2)/accessibleCellCount < minDeadEnds){
        //console.log('not enough dead ends');
        interesting = false;
    }
    //console.log('Is it interesting?'+interesting);
    return interesting;
}

// Depth-first algorithm maze maker
function createMazeDFS(col, row, start, end) {
  return  createMazeDFS(col, row, start, end,0,0) 
}
function createMazeDFS(col, row, start, end,keyRatio,bombWallRatio) {
    let maze = [];
    for (let i = 0; i < row; i++) {
      let row = [];
      for (let j = 0; j < col; j++) {
        let goal = (i == end[0] && j == end[1]);
        row.push({
          // true in a direction means there is a *wall*, ie not transversable.
          north: true,
          south: true,
          east: true,
          west: true,
          start: false,
          deadEnd: false,
          filled: false,
          goal: goal,
          critical: false,
          distanceToStart:0,
          nearestCritPath:0,
          distanceToCrit:null,
          key: false,
          map: false,
          compass: false,
          // for all locks, true means this door is locked in this way
          lockNorth:false,
          lockSouth:false,
          lockEast:false,
          lockWest:false,
          bossLockNorth:false,
          bossLockSouth:false,
          bossLockEast:false,
          bossLockWest:false,
          bombLockNorth:false,
          bombLockSouth:false,
          bombLockEast:false,
          bombLockWest:false,
          bossKey:false,
          bossItem:false
        });
      }
      maze.push(row);
    }
  
    function dfs(currentPosition, end) {
      // the stack variable will return our path back to the start, with the last element being our last location.
      let stack = [currentPosition];
      // keep track of the keys and locks
      let lockCount = 0;
      let keyLog = [];
      // visited will include all rooms the function has touched.
      let visited = new Set();
      // extraBranches defines if we have found the goal cell and are just creating extra branches to 
      // flesh out the dungeon. 
      let extraBranches = false;
      // branchIndex is the distance from start of the cell where we started
      let branchIndex = 0;
      // set the start tile
      maze[currentPosition[0]][currentPosition[1]].start = true;
      while (stack.length) {
          // get the last set of coordinates from the stack, which is our current room, and remove from stack
          let current = stack.pop();
          //save the length of the stack to a variable, which is the distance from the start.
          const distanceToStart = extraBranches ? stack.length + branchIndex : stack.length;
          // we have not been to this room, see if we add a key
          if(!visited.has(`${current[0]},${current[1]}`)){
            //add a key if there are more locks than keys (failsafe) or at random
            if((lockCount > keyLog.length || Math.random() < keyRatio) &&
              // don't add keys to the start room
              !maze[current[0]][current[1]].start && 
              // do not add a key to the goal room
              current[0] != end[0] && current[1] != end[1]){
              maze[current[0]][current[1]].key = true;
              keyLog.push(current);
              //console.log('keyLog: '+keyLog)
            }
          }
          // Add current room to visited
          visited.add(`${current[0]},${current[1]}`);
          // set filled so we can easily calculate this for the interesting function
          maze[current[0]][current[1]].filled = true;
          //Set the distance to start
          if(maze[current[0]][current[1]].distanceToStart == 0 || maze[current[0]][current[1]].distanceToStart > distanceToStart){
            maze[current[0]][current[1]].distanceToStart = distanceToStart;
          }
          // we have reached the end coordinates! Is this the end of this loop!?
          if (current[0] === end[0] && current[1] === end[1]) {
            /* Lock the boss room if that is enabled and remove normal locks from the room*/
            if(bossKey){
              lockCount = lastDoorLockCheck(maze,current,lockCount);
              maze = bossLockTheLastRoom(maze,current);
            }
            // mark the end as being on critical path
            maze[current[0]][current[1]].nearestCritPath = distanceToStart;
            maze[current[0]][current[1]].distanceToCrit = 0;
            maze[current[0]][current[1]].critical = true;
            // loop down the stack and mark cells currently in it as being on the critical path
            while (stack.length) {
              var loopCurrent = stack.pop();
              maze[loopCurrent[0]][loopCurrent[1]].critical = true;
              maze[loopCurrent[0]][loopCurrent[1]].distanceToCrit = 0;
              maze[loopCurrent[0]][loopCurrent[1]].nearestCritPath = maze[loopCurrent[0]][loopCurrent[1]].distanceToStart;
            }
            // check to see if the maze has met minimum coverage and branches
            // if the maze is not interesting build a new branch
            if(!isMazeInteresting(col,row,maze) && visited.size < col*row){
              console.log('This maze is not interesting. Initiating extraBranch mode!!!');
              extraBranches = true;
              // set current to the newBranchIndex, and continue the rest of this function from that point
              //console.log(current)
              current = findNewBranchRoot(maze,visited,row,col);
              //console.log(current)
              // save the new branch root's distance from start to the branchIndex so we can figure that out for
              // future rooms
              branchIndex = maze[current[0]][current[1]].distanceToStart;
            } else {
              console.log('this maze is sufficiently interesting that we can stop now');
              break;
            }
            
          }
          // possible directions will hold an array of directions it could be possible to go from this cell. 
          const possibleDirections = findOpenDirections(current,visited,row,col);
          // if possibleDirections.length > 0, then we have not reached a dead end
          if (possibleDirections.length > 0) {
              // decide if locking the door
              let lockIt = lockDecision(keyRatio,bombWallRatio,keyLog.length,lockCount);
              if(lockIt == 'lock'){lockCount++}
              // as we can move forward, select a random possible direction
              possibleDirections.sort(() => Math.random() - 0.5);
              const nextDirection = possibleDirections[0];
              const nextPosition = nextDirection[1];
              // add the current room and the next one to the stack. The next one will be processed in the 
              // next run of the loop
              stack.push(current, nextPosition);
              maze = setDoor(maze,nextDirection[0],current,nextPosition,lockIt);
          } else {
            // the current cell is a dead end.
            maze[current[0]][current[1]].deadEnd = true;
            // do we need to make another branch, or just weave back?
            if(extraBranches && !isMazeInteresting(col,row,maze) && visited.size < col*row){
              // find a new branch root, which will get added back into the stack
              current = findNewBranchRoot(maze,visited,row,col);
              // save the new branch root's distance from start to the branchIndex so we can figure that out for
              // future rooms
              branchIndex = maze[current[0]][current[1]].distanceToStart;
              stack.push(current);
            } 
          }
      }
      // remove extra keys from the maze
      // The last key created is probably superfluous
      maze = cleanKeys(maze,keyLog,lockCount)
    }
    dfs(start, end);

    return maze;
}

// After the dungeon is generated, this removes any extraneous keys from the dungeon
function cleanKeys(maze,keyLog,lockCount){
  while(keyLog.length > lockCount){
    let killKey = keyLog.pop();
    maze[killKey[0]][killKey[1]].key = false;
  }
  return maze;
}

// This makes the dungeon grow new branches after being created. 
function findNewBranchRoot(maze,visited,row,col){
  let found = false;
  let visitedArray = Array.from(visited);
  let coords = [];
  while(!found){
    const i = Math.floor(Math.random() * visitedArray.length)
    coords = visitedArray[i].split(',');
    coords[0] = parseFloat(coords[0]);
    coords[1] = parseFloat(coords[1]);
    visitedArray.splice(i,1)
    const openDirections = findOpenDirections(coords,visited,row,col);
    found = (!maze[coords[0]][coords[1]].goal && maze[coords[0]][coords[1]].filled && openDirections.length > 0);
  }
  console.log('new root: '+coords[0]+', '+coords[1]);
  return coords;
}

// updates lockCount if the final room in the dungeon is locked traditionally, and there should
// be a boss key instead. 
function lastDoorLockCheck(maze,current,lockCount){
  if(maze[current[0]][current[1]].lockSouth || 
    maze[current[0]][current[1]].lockNorth ||
    maze[current[0]][current[1]].lockEast ||
    maze[current[0]][current[1]].lockWest){
      lockCount--
    }
  return lockCount;
}

// While building the maze map, finds a direction from the current room that has
// not been visited by the maze algorithm
function findOpenDirections(current,visited,row,col){
  let possibleDirections = [];
  if (current[0] > 0 && !visited.has(`${current[0] - 1},${current[1]}`)) {
    possibleDirections.push(['north', [current[0] - 1, current[1]]]);
  }
  if (current[0] < row - 1 && !visited.has(`${current[0] + 1},${current[1]}`)) {
      possibleDirections.push(['south', [current[0] + 1, current[1]]]);
  }
  if (current[1] > 0 && !visited.has(`${current[0]},${current[1] - 1}`)) {
      possibleDirections.push(['west', [current[0], current[1] - 1]]);
  }
  if (current[1] < col - 1 && !visited.has(`${current[0]},${current[1] + 1}`)) {
      possibleDirections.push(['east', [current[0], current[1] + 1]]);
  }
  return possibleDirections;
}

// Sets the lock variables on the last room of the maze, ie. 'current'
function bossLockTheLastRoom(maze,current){
  console.log('Begin bossLockTheLastRoom')
  console.log('we are in this room: '+current)
  
  console.log('Value of north: '+maze[current[0]][current[1]].north)
  console.log('Value of east: '+maze[current[0]][current[1]].east)
  console.log('Value of south: '+maze[current[0]][current[1]].south)
  console.log('Value of west: '+maze[current[0]][current[1]].west)

  if(!maze[current[0]][current[1]].north){
    maze[current[0]-1][current[1]].bossLockSouth = true;
  } else if(!maze[current[0]][current[1]].south){
    maze[current[0]+1][current[1]].bossLockNorth = true;
  } else if(!maze[current[0]][current[1]].east){
    maze[current[0]][current[1]+1].bossLockWest = true;
  } else if(!maze[current[0]][current[1]].west){
    maze[current[0]][current[1]-1].bossLockEast = true;
  }
  // remove normal locks from the boss room when there is boss key
  if(maze[current[0]][current[1]].lockNorth){
    maze[current[0]][current[1]].lockNorth = false;
    maze[current[0]-1][current[1]].lockSouth = false;
  } else if(maze[current[0]][current[1]].lockSouth){
    maze[current[0]][current[1]].lockSouth = false;
    maze[current[0]+1][current[1]].lockNorth = false;
  } else if(maze[current[0]][current[1]].lockEast){
    maze[current[0]][current[1]].lockEast = false;
    maze[current[0]][current[1]+1].lockWest = false;
  } else if(maze[current[0]][current[1]].lockWest){
    maze[current[0]][current[1]].lockWest = false;
    maze[current[0]][current[1]-1].lockEast = false;
  }
  // remove bomb walls from the boss room when there is boss key
  if(maze[current[0]][current[1]].bombLockNorth){
    maze[current[0]][current[1]].bombLockNorth = false;
    maze[current[0]-1][current[1]].bombLockSouth = false;
  } else if(maze[current[0]][current[1]].bombLockSouth){
    maze[current[0]][current[1]].bombLockSouth = false;
    maze[current[0]+1][current[1]].bombLockNorth = false;
  } else if(maze[current[0]][current[1]].bombLockEast){
    maze[current[0]][current[1]].bombLockEast = false;
    maze[current[0]][current[1]+1].bombLockWest = false;
  } else if(maze[current[0]][current[1]].bombLockWest){
    maze[current[0]][current[1]].bombLockWest = false;
    maze[current[0]][current[1]-1].bombLockEast = false;
  }
  return maze;
}

// Sets a door between to rooms in the maze.
function setDoor(maze,direction,current,nextPosition,lockIt){
  let opposite = '';
  if(direction == 'north'){
    opposite = 'south';
  } else if(direction == 'south'){
    opposite = 'north';
  } else if(direction == 'east'){
    opposite = 'west';
  }else if(direction == 'west'){
    opposite = 'east';
  }
  maze[current[0]][current[1]][direction] = false;
  maze[nextPosition[0]][nextPosition[1]][opposite] = false;
  direction = direction.charAt(0).toUpperCase() + direction.slice(1);
  opposite = opposite.charAt(0).toUpperCase() + opposite.slice(1);
  if(lockIt == 'bomb'){
    maze[current[0]][current[1]]['bombLock'+direction] = true;
    maze[nextPosition[0]][nextPosition[1]]['bombLock'+opposite] = true;
  }
  if(lockIt == 'lock'){
    maze[current[0]][current[1]]['lock'+direction] = true;
    maze[nextPosition[0]][nextPosition[1]]['lock'+opposite] = true;
  }
  return maze;
}

// this function decides to lock a door or not
function lockDecision(keyRatio,bombWallRatio,keyCount,lockCount){
  if(keyRatio == 0 && bombWallRatio == 0){ return ''}
  if(Math.random() < bombWallRatio ){
    return 'bomb';
  }
  if(keyCount > lockCount+1 || (Math.random() < keyRatio && keyCount > lockCount)){
    return 'lock';
  }
  return '';
}

// Outputs the maze object and array and creates an HTML table to display the 
// arrangement of the dungeon, mainly for testing
function generateHTML(maze){
    let html = '<table>';
    for (let i = 0; i < maze.length; i++) {
      html += '<tr>';
      for (let j = 0; j < maze[i].length; j++) {
        html += '<td style="width:120px;height:100px;';
        html += maze[i][j].north ? 'border-top: solid 2px black;' : '';
        html += maze[i][j].east ? 'border-right: solid 2px black;' : '';
        html += maze[i][j].south ? 'border-bottom: solid 2px black;' : '';
        html += maze[i][j].west ? 'border-left: solid 2px black;' : '';
        html += maze[i][j].bombLockNorth ? 'border-top: dotted 2px black;' : '';
        html += maze[i][j].bombLockEast ? 'border-right: dotted 2px black;' : '';
        html += maze[i][j].bombLockSouth ? 'border-bottom: dotted 2px black;' : '';
        html += maze[i][j].bombLockWest ? 'border-left: dotted 2px black;' : '';
        html += maze[i][j].lockNorth ? 'border-top: dotted 2px red;' : '';
        html += maze[i][j].lockEast ? 'border-right: dotted 2px red;' : '';
        html += maze[i][j].lockSouth ? 'border-bottom: dotted 2px red;' : '';
        html += maze[i][j].lockWest ? 'border-left: dotted 2px red;' : '';
        html += maze[i][j].critical ? 'background-color: #eee;' : '';
        html += maze[i][j].start ? 'background-color: green;' : '';
        html += maze[i][j].goal ? 'background-color: gold;' : '';
        html += '">'+i+','+j+'<br/>';
        html += maze[i][j].filled ? '2Bgn: '+maze[i][j].distanceToStart+'<br />CrtI: '+maze[i][j].nearestCritPath+'<br />D2C: '+maze[i][j].distanceToCrit : '';
        html += maze[i][j].map ? '<br/>🗺️':'';
        html += maze[i][j].bossItem ? '<br/>🏹':'';
        html += maze[i][j].bossKey ? '<br/>🔑':'';
        html += maze[i][j].compass ? '<br/>🧭':'';
        html += maze[i][j].key ? '<br/>🗝️':'';
        html += '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    return html;
};

// Converts a maze with generic rooms into one with actual room maps usable by kaboom,
// as well as generating the metadata for the dungeon and the rooms
function generateMazeMapObj(maze,start){
  let dungeon = {
    name: dungeonNameGenerator(),
    start:start,
    // TO DO: allow the user to select different tilesets, such as Zelda 1 or an open tileset
    // default is gbc, which is what the tutorial used
    tileset:'gbc',
    map: [],
    startMap: mapDifficulty == 0,
    startCompass: compassDifficulty == 0,
    // player hitpoints. 2 hitpoints = 1 heart piece
    HP: heartPieces*2,
    // to do: add stuff! Like items!
    stuff: ['sword','bomb']
  };
  for (let i = 0; i < maze.length; i++) {
    let mapRow = [];
    for (let j = 0; j < maze[i].length; j++) {
      let roomDef = selectRoomTemplate(maze[i][j])
      let roomMap   = roomDef.map.slice()
      // north
      roomMap = setDoorForRoomGenerator(roomMap,maze[i][j],'north',northDoor,bombNDoor,lockNDoor,bossNDoor,northDoorRow,halfWayX)
      // south
      roomMap = setDoorForRoomGenerator(roomMap,maze[i][j],'south',southDoor,bombSDoor,lockSDoor,bossSDoor,southDoorRow,halfWayX)
      // east
      roomMap = setDoorForRoomGenerator(roomMap,maze[i][j],'east',eastDoor,bombEDoor,lockEDoor,bossEDoor,eastWestDoorRow,eastDoorCol)
      // west
      roomMap = setDoorForRoomGenerator(roomMap,maze[i][j],'west',westDoor,bombWDoor,lockWDoor,bossWDoor,eastWestDoorRow,westDoorCol)
      let treasureYX = [eastWestDoorRow,halfWayX]
      if(roomDef.treasure.length > 1){
        treasureYX = roomDef.treasure
      }
      let treasureSymbol = ''
      let trsSprt = ''
      if(maze[i][j].key){
        treasureSymbol = keySymbol
        trsSprt = 'key'
      } else if(maze[i][j].map){
        treasureSymbol = mapSymbol
        trsSprt = 'map'
      } else if(maze[i][j].compass){
        treasureSymbol = compassSymbol
        trsSprt = 'compass'
      } else if(maze[i][j].bossKey){
        treasureSymbol = bKeySymbl
        trsSprt = 'boss-key'
      } else if(maze[i][j].bossItem){
        treasureSymbol = itemSymbl
        // to do: change this sprite to a bow
        trsSprt = 'bow'
      } else if(maze[i][j].goal){
        trsSprt = 'triforce'
        treasureSymbol = winSymbol
      }
      // temp: drop treasure on the map, might not always do this, only if it is a bless
      //if(treasureSymbol != ' '){
        //console.log('replaceAt called from generateMazeMapObj, when we add treasure')
        //roomMap[eastWestDoorRow] = replaceAt(roomMap[treasureYX[0]],treasureYX[1],treasureSymbol,1)
      //}
      // to do: generate a list of enemies that will be in this room, based on the difficulty setting
      let difficultyRangeSeed = []
      for(let i = difficultyRange[0]; i < difficultyRange[1];i++){
        difficultyRangeSeed.push(i)
      }
      let enemies = generateEnemies((maze[i][j].start || roomDef.bless),maze[i][j].goal,difficultyRangeSeed)
      console.log(enemies)
      let lockDoor = false
      // decide if we are locking the doors in the room, and Link must kill the enemies before the doors open
      if(enemies.length>0 && 
        !roomDef.bless &&
        // compare a random number A to a random difficulty level in our range B, and if the A is less, lock the doors
        // a more difficult dungeon will have more locked doors
        Math.floor(Math.random()*11) < difficultyRangeSeed[Math.floor(Math.random() * difficultyRangeSeed.length) ]
        ){
          lockDoor = true
      }
      // Return an object which will contain all of the enemies to create along with the map
      let roomOutput = {
        // this is the array of tiles that makes our room
        roomMap: roomMap,
        // once player enters the room, do we lock the doors behind them?
        lockDoor: lockDoor,
        // show the treasure immediately when the player enters the room (true), 
        // or they must defeat all enemies (false)
        bless: roomDef.bless,
        // where treasure drops on defeat of all enemies, or on bless
        treasureYX: treasureYX,
        // what treasure drops
        // Removed, game script doesn't use: 
        //treasureSymbol: treasureSymbol,
        // trsSprtName
        trsSprt: trsSprt,
        // return a list of enemies
        enemies: enemies,
        // used by the game to build the map as player walks around
        visited:false
      }
      mapRow.push(roomOutput)
    }
    dungeon.map.push(mapRow)
  }
  return dungeon;
}

// TO DO: flesh this out!!!
// Should take into consideration the difficulty of the dungeon, set by the variables at the start
// more difficult enemies show up on harder levels
function generateEnemies(noEnemies,end,difficultyRangeSeed){
  let enemies = []
  if(noEnemies){
    return enemies
  }
  enemies.push({
    type: 'skeletor',
    movement: 'move-ground',
    killable: 'killable',
    hitpoints: 2,
    quantity: 1,
    damage: -1,
    orientX: 0,
    orientY: -1
  })
  return enemies
}

function selectRoomTemplate(room){
  if(room.start){
    return startTemplate
  }
  let options = roomTemplates.slice()
  if(room.goal){
    options = options.filter( x => x.goal === true)
  }
  options = room.north ? options : options.filter( x => !x.noDoor.includes('north'))
  options = room.south ? options : options.filter( x => !x.noDoor.includes('south'))
  options = room.east  ? options : options.filter( x => !x.noDoor.includes('east'))
  options = room.west  ? options : options.filter( x => !x.noDoor.includes('west'))
  return options[ Math.floor( Math.random() * options.length ) ]
}

function setDoorForRoomGenerator(roomMap,cell,direction,openChar,bombChar,lockChar,bossChar,rowEdit,colEdit){
  // note the capital letter, for camel case
  let Direction = direction.charAt(0).toUpperCase()+direction.slice(1,direction.length)
  //console.log('set '+direction+'. Variables, solid wall: '+cell[direction]+', bombLock'+Direction+': '+cell['bombLock'+Direction]+', normal lock:'+cell['lock'+Direction]+', boss lock: '+cell['bossLock'+Direction] )
  if(!cell[direction] || cell['bombLock'+Direction] || cell['lock'+Direction] || cell['bossLock'+Direction]){
    //console.log('direction in room generator: '+direction)
    let doorChar = '';
    if(cell['bombLock'+Direction]){
      doorChar = bombChar;
    } else if(cell['lock'+Direction]){
      doorChar = lockChar;
    } else if(cell['bossLock'+Direction]){
      doorChar = bossChar;
    } else if(!cell[direction]){
      doorChar = openChar;
    }
    //console.log('row to edit: '+roomMap[rowEdit])
    //console.log('rowEdit: '+rowEdit)
    if(doorChar != ''){
      //console.log('replaceAt called from setDoorForRoomGenerator')
      roomMap[rowEdit] = replaceAt( roomMap[rowEdit], colEdit , doorChar, doorChar.length);
    }
  }
  return roomMap
}

function replaceAt(thestring,index, replacement,droplength) {
  //console.log(thestring)
  //console.log(index)
  //console.log(replacement)
  //console.log(droplength)
  return thestring.substring(0, index+(droplength-1)) + replacement + thestring.substring(index+(droplength-1) + replacement.length);
}

// to do: generate a random dungeon name based on word lists
function dungeonNameGenerator(){
  return 'Tomb of To Be Decided'
}