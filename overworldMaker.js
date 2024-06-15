// ***** CORE DEFAULT PARAMETERS
// These are set by the user on the html page to generate different styles of dungeons
// the defaults set here are not permanent
let height = 8
let width = 8

// How many dungeons are on this map?
let dungeonCount = Math.floor(height*width/16)+1 // There were 8 +1 dungeons in LoZ, on an 8x16 grid. 
// How many fairy fountains on the map? These refill your life. This sets a minimum
let minFairies   = Math.floor(height*width/16/8)+1 // There were 2 fairy fountains in LoZ, on an 8x16 grid. There should be at least 1 
// These may be used in the future to give different icons to different dungeons
let dungeonIcons = "🏛️🛕🏰🕌🏚️🏯"
// how many caves with random treasure must there be?
let minCaves = 1
// the icons used to show what is found in secrets. The number of times it appears is the liklihood
let secrets = ['⚔️','🧙‍♀️','🧙‍♂️','🛒','❤️','💰','❤️','💰','🛒','🛒','💰','🛒','❤️','❤️','💰','💰','💰','💰']
let secretsPlaced = []


let biomeDefinition = [
  //accessibility = likelihood a border tile in a biome is open to its neighbor in a different biome
  //openness      = likelihood a tile is open to its neighbor within a biome
  // both of these are affected by the fact that this tool tries to always prevent isolated pockets. 
  {name:'forest',   count:0, accessibility: .25, openness:0.2},
  {name:'hills',    count:0, accessibility: .2, openness:0.15},
  {name:'mountain', count:0, accessibility: 0.1,openness:0.0},
  {name:'bush',     count:0, accessibility: .25, openness:0.2},
  {name:'desert',   count:0, accessibility: .3, openness:0.4},
  {name:'ruins',    count:0, accessibility: 0.1,openness:0.0}
];

let gameName = ''

// the tool will work off this list of biomes
let biomes = [...biomeDefinition];

let start = getRandomStart()

// How many cells can a given biome take up? This is a pretty loose limit and only matters in the first pass
let biomeThreshold = (height*width)/biomes.length

/// *** GENERATE A DUNGEON FROM USER INPUT
// Generates an easy map
function easyMap(){
  width = 6;
  height = 6;
  minCaves = 12;
  dungeonCount = 3;
  minFairies = 1;
  biomes = [...biomeDefinition];
  generateWorld()
}

// Generates an middling map
function medMap(){
  width = 8;
  height = 8;
  minCaves = 22;
  dungeonCount = 6;
  minFairies = 2;
  biomes = [...biomeDefinition];
  generateWorld()
}

// Generates a hard map
function hardMap(){
  width = 16;
  height = 8;
  minCaves = 43;
  dungeonCount = 9;
  minFairies = 2;
  biomes = [...biomeDefinition];
  generateWorld()
}

function toggleAdvanced(){
  document.getElementById('presets').style.display = 'none';
  document.getElementById('advSettings').style.display = 'block';
}

// Runs when user generates a maze after entering their own parameters
function advMap(){
  width = Number(document.getElementById('width').value);
  height = Number(document.getElementById('height').value);
  minCaves = Math.floor(Number(document.getElementById('secretPercent').value) * width * height);
  dungeonCount = Number(document.getElementById('dungeons').value);
  minFairies = document.getElementById('fairies').checked;
  biomes = [...biomeDefinition];
  console.log(document.getElementById('openPercent').value)
  for(let i = 0; i < biomes.length; i++){
    biomes[i].openness = (biomes[i].openness * Number(document.getElementById('openPercent').value))
    console.log('openness for '+biomes[i].name+': '+biomes[i].openness)
  }
  generateWorld()
}

let world = []

function generateWorld(){
  console.log(width+' '+height)
  console.log(width*height)
  start = getRandomStart()
  secretsPlaced = []

  // Smaller maps should have a smaller number of biomes
  while(biomeThreshold < 6 && biomes.length > 1){ // don't let biomes reach 0, but reduce the number of biomes in the world
    console.log('removed a biome')
    biomes.splice(Math.floor(Math.random()*biomes.length), 1);
    console.log(biomes)
    biomeThreshold = (height*width)/biomes.length
  }
  world = []
  world = initWorld(width, height)
  // function that sets biomes to each screen  
  world = setBiomes(world)

  // function that sets accessibility within biomes
  world = mapOutBiomes(world)

  // function that makes sure you can cross between biomes. 
  world = setPasses(world)

  // Make sure there are no isolated pockets on the map
  let pocketTries = 0
  while(ensureConnectivity(world,null,start)==false && pocketTries < height*width*10){
    pocketTries++
    world = connectIsolatedPockets(world, null, start)
  }
  
  // place the dungeons on the map
  world = placeDungeons(world)

  gameName = generateGameName()

  document.getElementById("renderTable").innerHTML = generateHTML(world);
  const game = generateWorldMapObj(world,start,gameName)
  const gameJson = JSON.stringify(game)
  const playLink = document.createElement("a");
  playLink.appendChild(document.createTextNode("Play Now"));
  document.getElementById("PlayNow").innerHTML = '';
  document.getElementById("PlayNow").appendChild(playLink);
  playLink.href = "play.html?d="+encodeURIComponent(gameJson)
  const blob = new Blob([gameJson], {type: "application/json"});
  const DLurl = URL.createObjectURL(blob);
  document.getElementById("downloadLink").href = DLurl;
  document.getElementById("downloadLink").download = game.name + '.json';
  document.getElementById('downloadJSON').style.display = 'block';
}

function initWorld(col, row) {
  for(let i = 0;i<biomes.length;i++){
    biomes[i].count = 0
  }
  let maze = [];
  for (let i = 0; i < row; i++) {
    let row = [];
    for (let j = 0; j < col; j++) {
      row.push({
        // true in a direction means it is traversable
        north: false,
        south: false,
        east: false,
        west: false,
        // does the border in that direction cross into another biome?
        borderNorth: false,
        borderSouth: false,
        borderEast: false,
        borderWest: false,
        // If there is a door to a dungeon here, what dungeon Id is it?
        dungeonId: null,
        fairyFountain: false,
        cave: null,
        lakes:[],
        // is this the start location?
        start: (start.x == j && start.y == i),
        // pathfinding functions for when we start placing dungeons and secrets
        distanceToStart:0,
        deadEnd: false,
        // what is the biome of the tile? eg forest?
        biome: 'unset'
      })
    }
    maze.push(row);
  }
  return maze
}

function generateWorldMapObj(world,start,gameName){
  let game = {
    name: gameName,
    start:[start.y,start.x],
    // TO DO: allow the user to select different tilesets, such as Zelda 1 or an open tileset
    // default is gbc, which is what the tutorial used
    tileset:'gbc',
    map: [],
    // player hitpoints. 2 hitpoints = 1 heart piece
    HP: 4*2,
    startMap: true,      // needed to get the javascript game to load in testing
    startCompass: false,  // needed to get the javascript game to load in testing
    // to do: add stuff! Like items!
    stuff: ['sword'],
    type: 'overworld'
  };
  for (let i = 0; i < world.length; i++) {
    let mapRow = [];
    for (let j = 0; j < world[i].length; j++) {
      //let cellMap = selectMapTemplate(world[i][j])
      let roomOutput = {
        // index of this room map in the roomDefinitions array
        i: 0,
        // object representing the characters for each door in the door map
        d: {
          n: world[i][j].north?' ':'',
          s: world[i][j].south?' ':'',
          w: world[i][j].west?' ':'',
          e: world[i][j].east?' ':''
        },
        // once player enters the room, do we lock the doors behind them until they kill the enemies?
        lk: 0,
        // show the treasure immediately when the player enters the room (true), 
        // or they must defeat all enemies (false)
        b: 1,
        // sprite of the treasure that will drop in room
        trsSprt: '',
        // return a list of enemies
        e: []
      }
      mapRow.push(roomOutput)
    }
    game.map.push(mapRow)
  }
  return game;
}

// Return a map template that fits the needs of this map cell
function selectMapTemplate(cell){
  // a future version of this will be more robust. For now, just returns a random map from the list
  let cellMap = mapTemplates[Math.floor( Math.random() * mapTemplates.length )]
  // for the time being, all we are doing is opening the direction that is open as a single door, as in a dungeon. 
  // TO DO: is a more complex maze that allows for the player to traverse maps at the same x and y axis they are traversing in
  // and to make maps that take advantage of that
  /*
  if(cell.north){
    // add a hole in the "wall" north
    cellMap[0] = replaceAt(cellMap[0],Math.ceil(cellMap[0].length/2)," ",1)
  }
  if(cell.south){
    // add a hole in the "wall" south
    cellMap[cellMap.length-1] = replaceAt(cellMap[cellMap.length-1],Math.ceil(cellMap[cellMap.length-1].length/2)," ",1)
  }
  if(cell.east){
    // add a hole in the "wall" east
    cellMap[Math.floor(cellMap.length/2)] = replaceAt(cellMap[Math.floor(cellMap.length/2)],cellMap[Math.floor(cellMap.length/2)].length-1," ",1)
  }
  if(cell.west){
    // add a hole in the "wall" west
    cellMap[Math.floor(cellMap.length/2)] = replaceAt(cellMap[Math.floor(cellMap.length/2)],0," ",1)
  }*/
  return cellMap
}


// assigns biomes to screens on the map randomly, then walks out from those points until a threshhold is met
function setBiomes(world){
  for(let biome of biomes){
    let coords
    let foundBlank = false
    while(foundBlank == false){
      coords = getRandomCell()
      console.log(coords)
      console.log(world[coords.y][coords.x].biome)
      if(world[coords.y][coords.x].biome == 'unset'){
        // Check if one of the neighboring screens is also a "root"
        // screen for a biome. We don't want these next to one another, so skip
        if(coords.x > 0 && world[coords.y][coords.x-1].biome != 'unset'){
          continue
        }
        if(coords.y > 0 && world[coords.y-1][coords.x].biome != 'unset'){
          continue
        }
        if(coords.y < height-1 && world[coords.y+1][coords.x].biome != 'unset'){
          continue
        }
        if(coords.x < width-1 && world[coords.y][coords.x+1].biome != 'unset'){
          continue
        }
        foundBlank = true
      }
    }
    world[coords.y][coords.x].biome = biome.name
    biome.count++
    // do a kind of walking algorithm that picks a random direction from the core spot and 
    // fills in the biomes. It doesn't overwrite the biomes of neighboring screens.
    let directionsTried = 0
    while (biome.count < biomeThreshold && directionsTried < 5) {
      const direction = Math.floor(Math.random() * 4); // 0: up, 1: right, 2: down, 3: left
      const newY = coords.y + (direction === 0 ? -1 : direction === 2 ? 1 : 0);
      const newX = coords.x + (direction === 1 ? 1 : direction === 3 ? -1 : 0);

      if (newY >= 0 && newY < height && newX >= 0 && newX < width &&
          (world[newY][newX].biome == 'unset' || world[newY][newX].biome == 'undefined' || typeof world[newY][newX].biome == 'undefined')) {
          world[newY][newX].biome = biome.name;
          biome.count++;
      }
      // we will only let this while loop go 4 times. This could populate all of the neighbors, 
      // or none. It adds randomness!
      directionsTried++
    }
  }

  // Generate an array of random coordinates
  let unsetCount = height*width
  let loopCount = 0
  while(unsetCount > 0){
    //loop while there are still unpopulated cells
    const randomCoordinates = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if(world[y][x].biome == 'unset' || world[y][x].biome == 'undefined' || typeof world[y][x].biome == 'undefined'){
            randomCoordinates.push([y, x]);
          } 
        }
    }
    unsetCount = randomCoordinates.length
    if(loopCount>15){
      // We are trapped because there is a wide open area. 
      break
    }
    if(unsetCount>0){
      // spread the biomes around the world!
      world = biomeSpreading(world,randomCoordinates)
    }
    loopCount++
  }
  return world
}

// Handle the spreading of biomes, dropped into a function so it can be retried if it fails to make something interesting. 
function biomeSpreading(world,randomCoordinates){
// Shuffle the array of random coordinates
  for (let i = randomCoordinates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomCoordinates[i], randomCoordinates[j]] = [randomCoordinates[j], randomCoordinates[i]];
  }

  for (const [y, x] of randomCoordinates) {
  // skip if biome is set for random screen
    if (world[y][x].biome == 'unset' || world[y][x].biome == 'undefined'  || typeof world[y][x].biome == 'undefined') {
      // this just makes sure that we haven't passed some kind of garbage value to this. 
      // it is messy programming but if its stupid and it works then it aint stupid
      world[y][x].biome = 'unset'
      let biomeCounts = {};
      // Count neighboring biomes
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newY = y + i;
            const newX = x + j;
            if (newY >= 0 && newY < height && newX >= 0 && newX < width &&  
                typeof world[y][x].biome !== 'undefined' && world[newY][newX].biome != 'unset' ) {
                let neighboringBiome = world[newY][newX].biome;
                if(typeof neighboringBiome === 'undefined'){
                  neighboringBiome = 'unset'
                }
                biomeCounts[neighboringBiome] = (biomeCounts[neighboringBiome] || 0) + 1;
            }
        }
      }
      //console.log(biomeCounts)
      // Set the most common neighboring biome
      let maxCount = 0;
      let commonBiome = '';
      for (const key in biomeCounts) {
          if (biomeCounts[key] > maxCount) {
              maxCount = biomeCounts[key];
              commonBiome = key;
          }
      }
      // If there is a tie, settle it randomly
      if (commonBiome == '') {
        const neighboringBiomes = Object.keys(biomeCounts);
        commonBiome = neighboringBiomes[Math.floor(Math.random() * neighboringBiomes.length)];
      }
      world[y][x].biome = commonBiome;
    }
  }
  return world
}

// this function builds out the traversability within a given biome. 
function mapOutBiomes(world){
  // build out a list of coordinates in the whole map
  let coordList = randomCoordList()
  for(const biome of biomes){
    console.log('Review biome: '+biome.name)
    const totalScreensInBiome = biome.count
    let openness = biome.openness
    let internalBorders   = 0
    let internalCrossings = 0
    let biomeScreenList   = []

    // this sub-function is used below to decide whether to open a door
    function checkDirection(y, x, dy, dx,property,oppositeProperty) {
      console.log('check '+x+','+y+' '+property)
      if (y + dy >= 0 && y + dy < height && x + dx >= 0 && x + dx < width && world[y + dy][x + dx].biome == biome.name &&
          !containsArray(biomeScreenList, [y + dy, x + dx])) {
        internalBorders++;
        console.log('openness review: '+internalCrossings / internalBorders+' vs '+openness)
        if ((internalCrossings / internalBorders) < openness) {
          //console.log(x+','+y+' '+property+' should be true');
          world[y][x][property] = true;
          world[y + dy][x + dx][oppositeProperty] = true;
          internalCrossings++;
        }
      }
    }

    // LOOP through the randomized coordinate list, check each cell to see if it is in this biome
    for (let i = 0; i < coordList.length; i++) {
      let y = coordList[i][0]
      let x = coordList[i][1]
      if(world[y][x].biome == biome.name){
        // ignore all cells not in our biome for now. 
        // add this screen to a list we will work through again later
        biomeScreenList.push([y,x])
        // detect if screen to each direction is in the same biome and decide whether or not to "open a door"
        // Check north
        let directionsToCheck = [
        {y: y, x: x, dy: -1, dx: 0,prop: 'north',opp: 'south'},
        // Check south
        {y: y, x: x, dy: 1, dx: 0,prop: 'south',opp: 'north'},
        // Check west
        {y: y, x: x, dy: 0, dx: -1,prop: 'west',opp: 'east'},
        // Check east
        {y: y, x: x, dy: 0, dx: 1,prop: 'east',opp: 'west'}];
        
        // shuffle the directions
        directionsToCheck = shuffleArray(directionsToCheck)
        // now loop through the directions and decide whether to open the door
        for(let i = 0;i<directionsToCheck.length;i++){
          let dir = directionsToCheck[i]
          checkDirection(dir.y, dir.x, dir.dy, dir.dx, dir.prop, dir.opp);
        }
      }
    }
    // look for any screens that are isolated, without any connection to their neighbors. 
    console.log(biomeScreenList.length)
    //make openness stupid high to ensure we open some doors
    openness = (openness*100*2)
    openness = openness/100
    if(internalCrossings/internalBorders > openness){
      openness = 9000 // ensure doors open!!
    }
    console.log(biome.name + ' openness is now '+openness)
    let biomeScreenListCopy = biomeScreenList
    biomeScreenList = []
    // this looks for isolated rooms
    /* commented out, replaced with depth first search
    for(let i = 0;i<biomeScreenListCopy.length;i++){
      let y = biomeScreenListCopy[i][0]
      let x = biomeScreenListCopy[i][1]
      if(!world[y][x].north && !world[y][x].south && !world[y][x].east && !world[y][x].west){
        console.log(x+','+y+' needs some doors!')
        // no connections, so give them a connection to a neighbor!
        let directionsToCheck = [
          // check north
          {y: y, x: x, dy: -1, dx: 0,prop: 'north',opp: 'south'},
          // Check south
          {y: y, x: x, dy: 1, dx: 0,prop: 'south',opp: 'north'},
          // Check west
          {y: y, x: x, dy: 0, dx: -1,prop: 'west',opp: 'east'},
          // Check east
          {y: y, x: x, dy: 0, dx: 1,prop: 'east',opp: 'west'}];
        directionsToCheck = shuffleArray(directionsToCheck)
        
        for(let i = 0;i<directionsToCheck.length;i++){
          let dir = directionsToCheck[i]
          checkDirection(dir.y, dir.x, dir.dy, dir.dx, dir.prop, dir.opp);
        }
      }
    }*/
    const biomeStart = {y:biomeScreenListCopy[0][0],x:biomeScreenListCopy[0][1]}
    while(!ensureConnectivity(world,biome.name,biomeStart)){
      // here, we have to connect the whole of the biome to itself
      console.log('ensure connectivity for biome: '+biome.name)
      world = connectIsolatedPockets(world,biome.name,biomeStart)
    }
  }
  return world
}

// create gates between biomes
function setPasses(world){
  // build out a list of coordinates in the whole map
  let coordList = randomCoordList()

  for (let i = 0; i < coordList.length; i++) {
    const y = coordList[i][0]
    const x = coordList[i][1]
    function checkDirection(y, x, dy, dx,property,oppositeProperty) {
      console.log('check '+x+','+y+' '+property)
      if (y + dy >= 0 && y + dy < height && x + dx >= 0 && x + dx < width && world[y + dy][x + dx].biome != world[y][x].biome ) {
        const thisBiomeAccessibility = getBiome(world[y][x].biome).accessibility
        const oppBiomeAccessibility = getBiome(world[y + dy][x + dx].biome).accessibility
        const seed = Math.random() * 1
        if(seed < thisBiomeAccessibility*oppBiomeAccessibility){
          world[y][x][property] = true
          world[y + dy][x+dx][oppositeProperty] = true
        }
      }
    }
    if (!world[y][x].north) checkDirection(y, x, -1, 0,'north','south')
    if (!world[y][x].south) checkDirection(y, x, 1, 0,'south','north')
    if (!world[y][x].west) checkDirection(y, x, 0, -1,'west','east')
    if (!world[y][x].east) checkDirection(y, x, 0, 1,'east','west')
  }
  return world
}

// verifies that there are no isolated pockets anywhere
function ensureConnectivity(world,biome,theStart) {
  let visited = new Array(height).fill(0).map(() => new Array(width).fill(false));
  if(biome != null){
    for(let y = 0;y < height;y++){
      for(let x = 0;x < width;x++){
        if(world[y][x].biome != biome){
          // mark non-biome rooms as visited, so we can ignore them
          visited[y][x] = true
        }
      }
    }
  }
  // Depth-First Search to check connectivity
  function depthFirstSearch(y, x,biome) {
    if (y < 0 || y >= height || x < 0 || x >= width || visited[y][x] || !world[y][x].biome) {
      return;
    }
    // the biome variable is used if we are checking for connectivity within a biome
    if(biome != null && world[y][x].biome != biome){
      return
    }
    visited[y][x] = true;
    // Check all four directions
    if (world[y][x].north) depthFirstSearch(y - 1, x); // North
    if (world[y][x].south) depthFirstSearch(y + 1, x); // South
    if (world[y][x].west) depthFirstSearch(y, x - 1); // West
    if (world[y][x].east) depthFirstSearch(y, x + 1); // East
  }
  // Perform Depth-First Search from the first screen
  depthFirstSearch(theStart.y, theStart.x,biome);
  // Check if all screens are connected
  const isConnected = visited.every(row => row.every(cell => cell));
  return isConnected;
}

// Ensure there are no isolated pockets, just goes in and opens doors
function connectIsolatedPockets(world,biome,theStart) {
  let visited = new Array(height).fill(0).map(() => new Array(width).fill(false));
  if(biome != null){
    for(let y = 0;y < height;y++){
      for(let x = 0;x < width;x++){
        if(world[y][x].biome != biome){
          // mark non-biome rooms as visited, so we can ignore them
          visited[y][x] = true
        }
      }
    }
  }
  // Depth-First Search to find screens connected to the rest of the map
  function depthFirstSearch(y, x,biome) {
    if (y < 0 || y >= height || x < 0 || x >= width || visited[y][x] || !world[y][x].biome) {
        return;
    }
    // the biome variable is used if we are checking for connectivity within a biome
    if(biome != null && world[y][x].biome != biome){
      return
    }
    visited[y][x] = true;

    // Check all four directions
    if (world[y][x].north) depthFirstSearch(y - 1, x); // North
    if (world[y][x].south) depthFirstSearch(y + 1, x); // South
    if (world[y][x].west) depthFirstSearch(y, x - 1); // West
    if (world[y][x].east) depthFirstSearch(y, x + 1); // East
  }

  depthFirstSearch(theStart.y, theStart.x,biome);

  // Find isolated pockets and connect them
  const coordList = randomCoordList()
  for (const coord of coordList) {
    const x = coord[1]
    const y = coord[0]
    if(biome != null && world[y][x].biome != biome){
      //if we are doing a biome-only connectivity run, then ignore this one if it isn't our current biome
      continue
    }
    if (!visited[y][x]) {
      console.log('on first pass, didnt visit '+y+','+x)
      // Find a neighboring screen with a traversable path and connect them
      const neighbors = []
      if(y>0 && !world[y][x].north && visited[y - 1][x]){
        if(biome == null || world[y - 1][x].biome == biome) neighbors.push([y - 1, x]) // North
      }
      if(x>0 && !world[y][x].west && visited[y][x-1]){
        if(biome == null || world[y][x-1].biome == biome) neighbors.push([y, x - 1])  // west
      }
      if(y<height-1 && !world[y][x].south && visited[y + 1][x]){
        if(biome == null || world[y + 1][x].biome == biome) neighbors.push([y + 1, x]) // South
      } 
      if(x<width-1 && !world[y][x].east && visited[y][x+1]){
        if(biome == null || world[y][x+1].biome == biome) neighbors.push([y, x + 1]) // East
      }
      neighbors.filter(coord =>
          coord[0] >= 0 && coord[0] < height && coord[1] >= 0 && coord[1] < width 
      );
      
      if(neighbors.length == 0){
        // none of my neighbors are connected! oh no!
        // just connect to one anyways
        if(y>0 && !world[y][x].north){
          neighbors.push([y - 1, x]) // North
        }
        if(x>0 && !world[y][x].west){
          neighbors.push([y, x - 1])  // west
        }
        if(y<height-1 && !world[y][x].south){
          neighbors.push([y + 1, x]) // South
        } 
        if(x<width-1 && !world[y][x].east){
          neighbors.push([y, x + 1]) // East
        }
      }
      // randomly select a neighbor to connect to
      if (neighbors.length > 0) {
          const [ny, nx] = neighbors[Math.floor(Math.random() * neighbors.length)];
          if (ny < y) {
              world[y][x].north = true;
              world[ny][nx].south = true;
          } else if (ny > y) {
              world[y][x].south = true;
              world[ny][nx].north = true;
          } else if (nx < x) {
              world[y][x].west = true;
              world[ny][nx].east = true;
          } else if (nx > x) {
              world[y][x].east = true;
              world[ny][nx].west = true;
          } 
      }
    }
  }
  // Reset visited array for future use
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          visited[y][x] = false;
      }
  }
  return world;
}

// Doesn't just place dungeons! Also places secrets and fairy fountains!
function placeDungeons(world){
  // add dungeons
  // start with another random list
  const coordList = randomCoordList()
  // this will hold a list of "dead end" cells, which only have one gate to another cell
  // we will place our dungeons there
  // not exactly the way Zelda worked, but should be fine
  let deadEndList = []
  for(const coord of coordList){
    const y = coord[0]
    const x = coord[1]
    if(y != start.y && x != start.x){
      let screen = world[y][x]
      let gates = 0
      if(world[y][x].north) gates++
      if(world[y][x].south) gates++
      if(world[y][x].east)  gates++
      if(world[y][x].west)  gates++
      if(gates == 1){
        // we are lazily approximating the distance to start
        const distanceFromStart = Math.abs( y - start.y )  + (Math.abs( x - start.x ) )
        deadEndList.push({y:y,x:x,distanceFromStart:distanceFromStart})
        console.log(coord[1]+','+coord[0] + ' is a dead end')
      }
    }
  }
  deadEndList = sortByProperty(deadEndList, 'distanceFromStart')
  let dungeonsPlaced  = 0
  let dungeonId       = 1
  // how many dead ends will not have a dungeon in them?
  const extraDeadEnds = deadEndList.length - dungeonCount;
  if(extraDeadEnds<0){
    // add some dungeons randomly across the world, since there aren't enough dead ends
    for(let i = 0;i<Math.abs(extraDeadEnds);i++){
      let set = false
      // don't add a dungeon to a dead end, we don't have enough!!
      while(!set){
        const coord = getRandomCell()
        const screen = world[coord.y][coord.x]
        let gates = 0
        if(screen.north) gates++
        if(screen.south) gates++
        if(screen.east)  gates++
        if(screen.west)  gates++
        if(gates == 1){
          // this is a dead end, skip it
          continue
        }
        if(cellIsEmpty(world[coord.y][coord.x]) && dungeonCheck(coord.y,coord.x,world)){
          world[coord.y][coord.x].dungeonId = dungeonId
          dungeonId++
          set = true
        }
      }
    }
  }
  
  // also count the number of fairy fountain and treasure caves placed
  let fairiesPlaced = 0
  let cavesPlaced = 0
  // this will work by looping through the list of dead ends.
  // once we have crossed a "ratio" it indicates that it is time to place one
  for(let i = 0;i<deadEndList.length;i++){
    const deadEnd = deadEndList[i]
    // is the ratio of dungeons placed to needed more than our progress through the loop?
    if((dungeonsPlaced/dungeonCount < i/deadEndList.length) 
    && cellIsEmpty(world[deadEnd.y][deadEnd.x]) 
    && dungeonCheck(deadEnd.y,deadEnd.x,world)){
      // place a dungeon
      dungeonsPlaced++
      world[deadEnd.y][deadEnd.x].dungeonId = dungeonId
      dungeonId++
    } else {
      // place something else at this location
      if(cellIsEmpty(world[deadEnd.y][deadEnd.x])){ // verify there isn't anything here
          if(minFairies>fairiesPlaced){
            world[deadEnd.y][deadEnd.x].fairyFountain = true
            fairiesPlaced++
          } else {
            // place a cave with treasure at this dead end
            world[deadEnd.y][deadEnd.x].cave = placeSecret()
            cavesPlaced++
          }
      }
    }
  }
  while(dungeonsPlaced<dungeonCount){
    const coords = getRandomCell()
    if(cellIsEmpty(world[coords.y][coords.x]) && dungeonCheck(coords.y,coords.x,world) ){
      dungeonsPlaced++
      world[coords.y][coords.x].dungeonId = dungeonId
      dungeonId++
    }
  }
  while(fairiesPlaced<minFairies){
    const coords = getRandomCell()
    if(cellIsEmpty(world[coords.y][coords.x])){
      fairiesPlaced++
      world[coords.y][coords.x].fairyFountain = true
    }
  }
  while(cavesPlaced<minCaves){
    const coords = getRandomCell()
    if(cellIsEmpty(world[coords.y][coords.x])){
      cavesPlaced++
      world[coords.y][coords.x].cave = placeSecret()
    }
  }
  return world
}

function placeSecret(){
  // the goal of this function is to place secrets across the world that are worth getting, but not too many of any type
  // for now, it should cycle through the secrets string, which I have manually decided is in it
  if(secrets.length == secretsPlaced.length){
    secretsPlaced = []
  }
  let output = secrets[secretsPlaced.length]
  secretsPlaced.push(output)
  return output;
}

// verifies this cell doesn't border another dungeon
// so that dungeons aren't next to one another
function dungeonCheck(y,x,world){
  const neighbors = [];
  if(y>0){
    neighbors.push([y - 1, x]) // North
  }
  if(x>0){
    neighbors.push([y, x - 1])  // west
  }
  if(y<height-1){
    neighbors.push([y + 1, x]) // South
  } 
  if(x<width-1){
    neighbors.push([y, x + 1]) // East
  }
  for(let i = 0; i<neighbors.length;i++){
    nx = neighbors[i][1]
    ny = neighbors[i][0]
    //console.log('dungeon check '+ny+','+nx+' from origin '+y+','+x)
    // if this cell has a dungeon, return false
    if(world[ny][nx].dungeonId != null){
      //console.log('REJECT dungeon '+world[ny][nx].dungeonId+' at '+ny+','+nx+' from origin '+y+','+x)
      return false
    }
  }
  return true
}

function cellIsEmpty(cell){
  return cell.fairyFountain == false && cell.cave == null && cell.dungeonId == null && cell.start == false
}

function randomCoordList(){
  // build out a list of coordinates in the whole map
  let coordList = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      coordList.push([y,x])
    }
  }
  // shuffle the coordinate list so we approach the map differently each time.
  coordList = shuffleArray(coordList)
  return coordList
}

// utility function that sorts an array of objects by one of their properties
function sortByProperty(array, property) {
  return array.sort((a, b) => {
      if (a[property] < b[property]) {
          return -1;
      }
      if (a[property] > b[property]) {
          return 1;
      }
      return 0;
  });
}

// returns a random screen on the map
function getRandomCell(){
  let x = Math.floor(Math.random() * width);
  let y = Math.floor(Math.random() * height);
  return {y: y,x: x}
}

// start cells are always in the bottom 2 rows of the map!
// and the middle half!
function getRandomStart(){
  let x = Math.floor( (width/4)+(Math.random()*width/2) );
  let y = Math.floor( (height-2) + (Math.random() * 2));
  return {y: y,x: x}
}

function shuffleArray(input){
  for (let i = input.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [input[i], input[j]] = [input[j], input[i]];
  }
  return input
}

// check to see if an array contains annoter array
function containsArray(outerArray, innerArray) {
  for (let i = 0; i < outerArray.length; i++) {
      const currentArray = outerArray[i];
      if (currentArray.length === innerArray.length &&
          currentArray.every((value, index) => value === innerArray[index])) {
          return true;
      }
  }
  return false;
}

function getBiome(biomeName) {
  // Assuming biomes is your array containing biome objects
  const biome = biomes.find(b => b.name.toLowerCase() === biomeName.toLowerCase());
  return biome || null; // Return null if biome not found
}

// Outputs the world object and array and creates an HTML table to display the 
// arrangement of the dungeon, mainly for testing
function generateHTML(world){
  let html = '<h3>'+gameName+'</h3>'
  html += '<table>';
  for (let i = 0; i < world.length; i++) {
    html += '<tr>';
    for (let j = 0; j < world[i].length; j++) {
      html += '<td style="width:120px;height:100px;';
      html += !world[i][j].north ? 'border-top: solid 3px black;' : '';
      html += !world[i][j].east ? 'border-right: solid 3px black;' : '';
      html += !world[i][j].south ? 'border-bottom: solid 3px black;' : '';
      html += !world[i][j].west ? 'border-left: solid 3px black;' : '';
      html += setBackgroundFromBiome(world[i][j].biome)
      html += '">'+j+','+i+'<br/>';
      html += world[i][j].start ? '🎬<br/>' : '';
      html += world[i][j].dungeonId != null ? '🏛️'+world[i][j].dungeonId+'<br/>' : '';
      html += world[i][j].fairyFountain ? '🧚‍♀️<br/>' : '';
      html += world[i][j].cave != null ? world[i][j].cave+'<br/>' : '';
      html += world[i][j].biome
      html += '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
};

function setBackgroundFromBiome(biome){
  let backgroundColor;  
    switch (biome) {
      case 'forest':
          backgroundColor = 'green';
          break;
      case 'hills':
          backgroundColor = 'darkolivegreen';
          break;
      case 'mountain':
          backgroundColor = 'brown';
          break;
      case 'ruins':
          backgroundColor = 'grey';
          break;
      case 'desert':
          backgroundColor = 'tan';
          break;
      case 'bush':
          backgroundColor = 'orange';
          break;
      default:
          backgroundColor = 'white'; // Default color if biome doesn't match any case
    }
    return `background-color: ${backgroundColor};`;
}



function generateGameName() {
  // lists for generating random game names
  const countryNameP1 = [
    'Hy', 'Lo', 'Mid', 'Lyr', 'Nor', 'Fer', 'Gal', 'Var', 'Py', 'Tyr', 'Zor', 'Ver', 'Syl', 'Mor', 'Gor', 'Nar', 'Riv', 'Cy', 'Bor', 'Har'
  ];
  const countryNameP2 = [
    'rule', 'land', 'gard', 'ia', 'stan', 'vale', 'ria', 'thorn', 'mark', 'vale', 'ora', 'wood', 'helm', 'shire', 'crest', 'mire', 'landia', 'helm', 'dor', 'ford'
  ];
  const humanRoles = [
    'Hero', 'Princess', 'Demon', 'Wizard', 'King', 'Prince', 'Conqueror', 'Witch', 'Knight', 'Sorcerer', 'Queen', 'Warrior', 'Sorceress', 'Emperor', 'Mage', 'Barbarian', 'Champion', 'Warlock', 'Assassin', 'Prophet'
  ];
  const storyTypes = [
    'Legend', 'Fantasy', 'Myth', 'Tale', 'Prophecy', 'Adventure', 'Epic', 'Saga','Quest', 'Mystery', 'Folklore', 'Chronicle'
  ];
  const macguffins = [
    'Sword', 'Crown', 'Ring', 'Tomb', 'Amulet', 'Orb', 'Key', 'Scroll', 'Pendant', 'Crystal', 'Tome', 'Relic', 'Statue', 'Scepter', 'Mirror', 'Gemstone', 'Grail'
  ];
  const names = [
    'Helga', 'Goro', 'Lancelot', 'Guinevere', 'Gawain', 'Titania', 'Oberon', 'Persephone', 'Tristan', 'Freyja', 'Odysseus', 'Merlin', 'Morgana', 'Beowulf','Sigurd', 'Brynhildr', 'Gilgamesh', 'Enkidu', 'Medea', 'Hercules', 'Atalanta', 'Theseus', 'Perseus', 'Cassandra'
  ];
  const numbers = [
    'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'
  ];

  // Randomly generates a game name from lists of words
  const country1  = countryNameP1[Math.floor(Math.random() * countryNameP1.length)];
  const country2  = countryNameP2[Math.floor(Math.random() * countryNameP2.length)];
  const humanRole = humanRoles[Math.floor(Math.random() * humanRoles.length)];
  const story     = storyTypes[Math.floor(Math.random() * storyTypes.length)];
  const macguffin = macguffins[Math.floor(Math.random() * macguffins.length)];
  const name      = names[Math.floor(Math.random() * names.length)];
  const count     = (dungeonCount > numbers.length)? numbers[Math.floor(Math.random() * numbers.length)]:numbers[dungeonCount-1]
  
  // Randomly determine which structure to use
  const structure = Math.floor(Math.random() * 11);
  
  // Construct the dungeon name based on the chosen structure
  if (structure === 0) {
    return `The ${story} of ${country1}${country2}`;
  } else if (structure === 1) {
    return `The ${story} of the ${humanRole}'s ${macguffin}`;
  }else if (structure === 2) {
    return `The ${macguffin} of ${country1}${country2}`;
  } else if (structure === 3) {
    return `The ${macguffin} of the ${humanRole}`;
  } else if (structure === 4) {
    return `The ${story} of the ${humanRole}`;
  } else if (structure === 5) {
      return `The ${story} of ${name}`;
  } else if (structure === 6) {
    return `The ${story} of ${country1}${country2}`;
  } else if (structure === 7) {
    const plural = (dungeonCount==1?'':'s')
    return `The ${story} of the ${count} ${macguffin}${plural}`;
  } else if (structure === 8) {
    return `The ${story} of ${name}'s ${macguffin}`;
  } else if (structure === 9) {
    return `The ${macguffin} of ${name}`;
  } else if (structure === 10) {
    return `The ${story} of ${name} the ${humanRole}`;
  } else {
    return `The ${story} of the ${humanRole} of ${country1}${country2}`;
  }
}