// Get the URL parameter containing the JSON data
const urlParams = new URLSearchParams(window.location.search);
const jsonData  = urlParams.get('d');
const tileXY    = 48
// dimensions of play area in tiles
const heightTile  = 12
const widthTile   = 13

// Parse the JSON data into a JavaScript object
var DUNGEON_DEF  = JSON.parse(jsonData);

// Speed Constants
const MOVE_SPEED        = 150
const PLAYER_DAMAGED_SPD= 200
const HITSPEED          = 300
const ARROW_SPEED       = 400

// controls
let goUp      = 'up'
let goDown    = 'down'
let goLeft    = 'left'
let goRight   = 'right'
let swordBtn  = 'c'
// to do, allow change item buttons
let bombBtn   = 'x'
let bowBtn    = 'z'

// Time constants
const PLAYER_HIT_NO_CONTROL     = 0.1
const PLAYER_HIT_INVULNERABLE   = 1
const BOMB_FUSE                 = 2
const BOMB_FLICKER              = 1.5
const BOMB_FLICKER_RATE         = 0.1
const BOMB_EXPLODE              = 0.5

// Enemy timing constants
const ENEMY_HIT_INVULNERABLE    = 0.30

// Weapons damage constants
const SWORD_DAMAGE  = 1
const BOMB_DAMAGE   = 1
const ARROW_DAMAGE  = 1

const startingInventory = {
    keys:      0,
    bossKey:   false,
    map:       DUNGEON_DEF.startMap,
    compass:   DUNGEON_DEF.startCompass,
    stuff:     DUNGEON_DEF.stuff,
    HP:        /*32,/*/DUNGEON_DEF.HP, 
    maxHP:     /*32,/*/DUNGEON_DEF.HP ,
    bombs:     4,
    arrows:    0
}

kaboom({
    global:true,
    //fullscreen:true,
    width: widthTile*tileXY, // width of canvas
    height: heightTile*tileXY, // height of canvas
    canvas: document.getElementById("gameArea"),
    scale:1,
    debug:true,
    clearColor: [248, 248, 136, 0],
});

// Image sources
// Door addendum: https://imgur.com/a/OJVUgI2
// Ania's original sprites: https://imgur.com/a/yrEzcQv

loadRoot('https://i.imgur.com/')
loadSprite('link-going-left', '1Xq9biB.png')
loadSprite('link-going-right', 'yZIb8O2.png')
loadSprite('link-going-down', 'tVtlP6y.png')
loadSprite('link-going-up', 'UkV0we0.png')
loadSprite('left-wall', 'rfDoaa1.png')
loadSprite('top-wall', 'QA257Bj.png')
loadSprite('bottom-wall', 'vWJWmvb.png')
loadSprite('right-wall', 'SmHhgUn.png')
loadSprite('bottom-left-wall', 'awnTfNC.png')
loadSprite('bottom-right-wall', '84oyTFy.png')
loadSprite('top-left-wall', 'xlpUxIm.png')
loadSprite('top-right-wall', 'z0OmBd1.jpg')
loadSprite('fire-pot', 'I7xSp7w.png')
loadSprite('north-door', 'U9nre4n.png')
loadSprite('west-door', 'okdJNls.png')
loadSprite('east-door', 'w1IYFr1.png')
loadSprite('south-door', 'znTiYvI.png')
loadSprite('lanterns', 'wiSiY09.png')
loadSprite('slicer', 'c6JFi5Z.png')
loadSprite('kaboom', 'o9WizfI.png')
loadSprite('stairs', 'VghkL08.png')
loadSprite('bg', '7ByW6aZ.png')
loadSprite('north-lock', 'qsW40p3.png')
loadSprite('east-lock', 'dtrHiAL.png')
loadSprite('south-lock', 'iMwBUKR.png')
loadSprite('west-lock', 'yrA2vi1.png')
loadSprite('invisibleObj', 'W8tj8RL.png')
loadSprite('boss-north-lock', 'T75bFAx.png')
loadSprite('boss-east-lock', '5q9wo0R.png')
loadSprite('boss-south-lock', '5OOZYEz.png')
loadSprite('boss-west-lock', 'ovsfCoL.png')
loadSprite('boss-key', 'p5rFPei.png')
loadSprite('key', 'FGsPWbN.png')
loadSprite('triforce', 'j41dvOu.png')
loadSprite('block', 'UwFiiid.png')
loadSprite('compass', 'Jzs1CqK.png')
loadSprite('map', 'm8TBsEa.png')
loadSprite('arrow-north','I1gUOJU.png')
loadSprite('arrow-south','LkaxG2V.png')
loadSprite('arrow-east','0EThrmo.png')
loadSprite('arrow-west','5pIKghl.png')
loadSprite('bomb-red','Wb9d9Df.png')
loadSprite('bomb','y01g9pZ.png')
loadSprite('bow','b7oQMSL.png')
loadSprite('sword-icon','FiUAwuH.png')
loadSprite('map-cell','mZ42XbY.png',{sliceX:16,sliceY:1})
loadSprite('map-boss-icon','rA3QETT.png')
loadSprite('map-player-icon','5fAUpHQ.png',{sliceX:2,sliceY:1})
loadSprite('map-treasure-icon','uTBdWgZ.png')
loadSprite('hearts','XPr05TD.png',{sliceX:3,sliceY:1})
// to do: replace with sword
loadSprite('kaboom', 'o9WizfI.png')
// enemy sprites, shortened for transmission by short json
loadSprite('sk', 'Ei1VnX8.png')  // skeletor, aka stalfos
loadSprite('ks','69arLgS.png',{sliceX:2,sliceY:1}) // keese
loadSprite('lk','poqDcqk.png',{sliceX:2,sliceY:1}) // like like
loadSprite('rpl','gz5LHU4.png',{sliceX:2,sliceY:1}) // rope-left
loadSprite('rpr','FIXKne3.png',{sliceX:2,sliceY:1}) // rope-right
loadSprite('beam','jZNtYxG.png',{sliceX:4,sliceY:1}) // beam shot by the wizrobes
loadSprite('wg','Wb8jSwW.png',{sliceX:5,sliceY:1}) // wizrobe, green

// init the game by building the room maps from the roomDefinitions file and the doors provided
function initMap(){
    for(let row = 0; row < DUNGEON_DEF.map.length; row++){
        for(let col = 0; col < DUNGEON_DEF.map[row].length; col++){
            let mIndx = DUNGEON_DEF.map[row][col].i
            if(mIndx != null && mIndx < 0){
                mIndx = 1
            }
            let theMap = DUNGEON_DEF.type=='overworld'? mapTemplates[mIndx].map.slice() : roomTemplates[mIndx].map.slice()
            const doors = DUNGEON_DEF.map[row][col].d
            // north
            theMap[northDoorRow] = doors.n != ''?replaceAt(theMap[northDoorRow],halfWayX,doors.n,doors.n.length) : theMap[northDoorRow]
            // south
            theMap[southDoorRow] = doors.s != ''?replaceAt(theMap[southDoorRow],halfWayX,doors.s,doors.s.length) : theMap[southDoorRow]
            // east
            theMap[eastWestDoorRow] = doors.e != ''?replaceAt(theMap[eastWestDoorRow],eastDoorCol,doors.e,doors.e.length) : theMap[eastWestDoorRow]
            // west
            theMap[eastWestDoorRow] = doors.w != ''?replaceAt(theMap[eastWestDoorRow],westDoorCol,doors.w,doors.w.length) : theMap[eastWestDoorRow]
            DUNGEON_DEF.map[row][col].roomMap = theMap
            DUNGEON_DEF.map[row][col].visited = false
            console.log(DUNGEON_DEF.map[row][col].roomMap)
        }
    }
}

initMap();

scene( "game", ({ roomX,roomY,playerX, playerY,orientX, orientY,inventory})=>{

    layers(['bg','obj','ui'],'obj')

    // to do: use variables shared with the other file so I don't have to update these in two places
    const levelCfg = {
        width:tileXY,
        height:tileXY,
        a: [sprite('left-wall'), solid(), 'wall'],
        b: [sprite('right-wall'), solid(), 'wall'],
        c: [sprite('top-wall'), solid(), 'wall'],
        d: [sprite('bottom-wall'), solid(), 'wall'],
        w: [sprite('top-right-wall'), solid(), 'wall'],
        x: [sprite('bottom-left-wall'), solid(), 'wall'],
        y: [sprite('top-left-wall'), solid(), 'wall'],
        z: [sprite('bottom-right-wall'), solid(), 'wall'],
        '#': [sprite('block'), solid(), 'wall'],
        // to do: H should be a moveable block
        //'H': [sprite('block'), solid(), 'wall'],
        // to do: statue sprites:
        'Z': [sprite('block'), solid(), 'wall'],
        'S': [sprite('block'), solid(), 'wall'],
        [lockWDoor]: [sprite('west-lock'), solid() ,'lock','west-lock'],
        [lockNDoor]: [sprite('north-lock'), solid() ,'lock','north-lock'],
        [lockSDoor]: [sprite('south-lock'), solid() ,'lock','south-lock'],
        [lockEDoor]: [sprite('east-lock'), solid() ,'lock','east-lock'],
        [bossWDoor]: [sprite('boss-west-lock'), solid() ,'bossLock','west-lock'],
        [bossNDoor]: [sprite('boss-north-lock'), solid() ,'bossLock','north-lock'],
        [bossSDoor]: [sprite('boss-south-lock'), solid() ,'bossLock','south-lock'],
        [bossEDoor]: [sprite('boss-east-lock'), solid() ,'bossLock','east-lock'],
        [bombWDoor]: [sprite('left-wall'), solid() ,'bombLock','west-lock'],
        [bombNDoor]: [sprite('top-wall'), solid() ,'bombLock','north-lock'],
        [bombSDoor]: [sprite('bottom-wall'), solid() ,'bombLock','south-lock'],
        [bombEDoor]: [sprite('right-wall'), solid() ,'bombLock','east-lock'],
        [winSymbol]: [sprite('triforce') ,'triforce'],
        [keySymbol]: [sprite('key'), ,'key'],
        [bKeySymbl]: [sprite('boss-key'), ,'boss-key'],
        [stairs]: [sprite('stairs'), 'next-level'],
        [itemSymbl]: [sprite('bow'), ,'item','collect'],
        [compassSymbol]: [sprite('compass'), 'compass','collect'],
        [mapSymbol]: [sprite('map'), 'map','collect'],
        //'*': [sprite('slicer'), 'slicer', { dir: -1 }, 'dangerous'],
        '}': [sprite('sk'), 'dangerous', 'sk', { dir: -1, timer: 0 }],
        ')': [sprite('lanterns'), solid()],
        '(': [sprite('fire-pot'), solid()]
        // load unique sprites for them
        
    }
    console.log(roomX)
    console.log(roomY)
    console.log(DUNGEON_DEF.map[roomY][roomX].roomMap)
    console.log(levelCfg)
    addLevel(DUNGEON_DEF.map[roomY][roomX].roomMap,levelCfg);
    // set current room as visited so it is visible in the map
    DUNGEON_DEF.map[roomY][roomX].visited = true;

    add([sprite('bg'),layer('bg')])

    const player = add([
        sprite('link-going-up'),
        //area(vec2(6), vec2(24)),
        pos([playerX, playerY]),
        {
          // right by default
          dir: vec2(orientX,orientY),
          justDamaged: false,
          sprite: 'link-going-up',
          spriteOn: true,
          controlOn: true
        },
    ])

    player.action(() => {
        player.resolve()
    })

    // *********** CONTROLS **************
    keyDown(goLeft, () => {
        if(player.controlOn){
            player.changeSprite('link-going-left')
            player.move(-MOVE_SPEED, 0)
            player.dir = vec2(-1, 0)
            player.sprite = 'link-going-left'
        }
    })
    
    keyDown(goRight, () => {
        if(player.controlOn){
            player.changeSprite('link-going-right')
            player.move(MOVE_SPEED, 0)
            player.dir = vec2(1, 0)
            player.sprite = 'link-going-right'
        }
    })
    
    keyDown(goUp, () => {
        if(player.controlOn){
            player.changeSprite('link-going-up')
            player.move(0, -MOVE_SPEED)
            player.dir = vec2(0, -1)
            player.sprite = 'link-going-up'
        }
    })
    
    keyDown(goDown, () => {
        if(player.controlOn){
            player.changeSprite('link-going-down')
            player.move(0, MOVE_SPEED)
            player.dir = vec2(0, 1)
            player.sprite = 'link-going-down'
        }
    })

    keyPress(swordBtn, () => {
        if(inventory.stuff.includes('sword')){
            spawnSword(player.pos.add(player.dir.scale(tileXY)))
        }
    })

    keyPress(bombBtn, () => {
        if(inventory.stuff.includes('bomb') && inventory.bombs > 0){
            spawnBomb(player.pos.add(player.dir.scale(tileXY)))
        }
    })

    keyPress(bowBtn, () => {
        if(inventory.stuff.includes('bow') && inventory.arrows > 0){
            shootArrow(player.pos.add(player.dir.scale(tileXY)),player.dir)
        }
    })

    // *********** PLAYER MOVEMENT BETWEEN ROOMS ************
    // Create invisible trigger tiles that when collided with move the player between rooms
    const north = add([
        sprite('invisibleObj'),
        pos(tileXY*halfWayX, tileXY*(-1)),
        "north",
        
        solid()
    ])
    player.collides('north', () => {
        moveToRoom(roomX,roomY-1,tileXY*halfWayX,tileXY*southDoorRow,0,-1)
    })

    const south = add([
        sprite('invisibleObj'),
        pos(tileXY*halfWayX, tileXY*(1+southDoorRow)),
        "south",
        solid()
    ])
    player.collides('south', () => {
        moveToRoom(roomX,roomY+1,tileXY*halfWayX,0,0,-1)
    })

    const east = add([
        sprite('invisibleObj'),
        pos(tileXY*(1+eastDoorCol), tileXY*eastWestDoorRow),
        "east"
    ])
    player.collides('east', () => {
        moveToRoom(roomX+1,roomY,0,tileXY*eastWestDoorRow,1,0)
    })

    const west = add([
        sprite('invisibleObj'),
        pos(tileXY*(-1), tileXY*eastWestDoorRow),
        "west"
    ])
    player.collides('west', () => {
        moveToRoom(roomX-1,roomY,tileXY*eastDoorCol,tileXY*eastWestDoorRow,-1,0)
    })

    function moveToRoom(roomX,roomY,playerX,playerY,orientX,orientY){
        go('game', {
            roomY: roomY,
            roomX:roomX,
            playerX: playerX,
            playerY: playerY,
            orientX: orientX,
            orientY: orientY,
            inventory: inventory
        })
    }

    // ******** PICKING UP AND PLACING TREASURE *********************
    // PLACE EASY TREASURE ON SCENE LOAD
    if(DUNGEON_DEF.map[roomY][roomX].b /*bless*/ && 
        DUNGEON_DEF.map[roomY][roomX].trsSprt != null &&
        DUNGEON_DEF.map[roomY][roomX].trsSprt != '' &&
        DUNGEON_DEF.map[roomY][roomX].trsSprt.length > 0)
    {
        addTreasure(DUNGEON_DEF.map[roomY][roomX])
    }
    function addTreasure(roomDef){
        const mIndx = roomDef.i
        const roomTemplate = roomTemplates[mIndx]
        let treasureYX = roomTemplate.treasure
        if(treasureYX == '*'){
            treasureYX = [eastWestDoorRow,halfWayX]
        }
        add([
            sprite(roomDef.trsSprt),
            pos( tileXY * treasureYX[1], tileXY * treasureYX[0] ),
            'collect',
            ''+roomDef.trsSprt
        ])
    }
    player.collides('collect', (k) => {
        if(k.is('key')){collectKey(k)}
        if(k.is('boss-key')){collectBossKey(k)}
        if(k.is('map')){collectMap(k)}
        if(k.is('compass')){collectCompass(k)}
        if(k.is('bow')){collectBow()}
        if(k.is('triforce')){alert('You win! thanks for playing!')}
        destroy(k)
    })
    function noMoreTreasure(){
        DUNGEON_DEF.map[roomY][roomX].trsSprt = ''
    }

    function collectBow(){
        inventory.stuff.push('bow')
        inventory.arrows = 20
        renderButtons()
        noMoreTreasure()
    }

    function collectMap(k){
        inventory.map = true
        renderHasMap()
        noMoreTreasure()
        renderMap()
    }
    function collectCompass(k){
        inventory.compass = true
        renderHasCompass()
        noMoreTreasure()
        renderMap()
    }

    // ******* HANDLING KEYS AND LOCKS ***************
    function collectKey(k){
        inventory.keys++
        keysLabel.text = 'x'+inventory.keys
        noMoreTreasure()
    }
    player.collides('lock', (l) => {
        if(inventory.keys > 0){
            unlockDoor(l,lockEDoor,lockWDoor,lockSDoor,lockNDoor,' ')
            inventory.keys--
            keysLabel.text = 'x'+inventory.keys
        }
    })
    function collectBossKey(k){
        inventory.bossKey = true
        renderBossKey()
        noMoreTreasure()
    }
    player.collides('bossLock', (l) => {
        if(inventory.bossKey){
            inventory.bossKey = false
            unlockDoor(l,bossEDoor,bossWDoor,bossSDoor,bossNDoor,' ')
        }
    })
    function unlockDoor(l,lockE,lockW,lockS,lockN,replace){
        // remove this door's symbol from the room's map, and the next room's map, so we can come back here
        let lockRow = 0
        let lockSbl = ''
        let oppoSbl = ''
        let oppoRow = 0
        let nextRoomX = roomX
        let nextRoomY = roomY
        if (l.is("east-lock")) {
            lockRow = eastWestDoorRow
            oppoRow = eastWestDoorRow
            lockSbl = lockE
            oppoSbl = lockW
            nextRoomX++
        } else if (l.is("west-lock")) {
            lockRow = eastWestDoorRow
            oppoRow = eastWestDoorRow
            lockSbl = lockW
            oppoSbl = lockE
            nextRoomX--
        } else if (l.is("north-lock")) {
            lockRow = northDoorRow
            oppoRow = southDoorRow
            lockSbl = lockN
            oppoSbl = lockS
            nextRoomY--
        } else if (l.is("south-lock")) {
            lockRow = southDoorRow
            oppoRow = northDoorRow
            lockSbl = lockS
            oppoSbl = lockN
            nextRoomY++
        } else {
            // this is an error state, shouldn't happen
            return
        }
        DUNGEON_DEF.map[roomY][roomX].roomMap[lockRow] = DUNGEON_DEF.map[roomY][roomX].roomMap[lockRow].replace(lockSbl,replace)
        DUNGEON_DEF.map[nextRoomY][nextRoomX].roomMap[oppoRow] = DUNGEON_DEF.map[nextRoomY][nextRoomX].roomMap[oppoRow].replace(oppoSbl,replace)
        destroy(l)
    }

    // When a bomb explodes next to a bombable wall, destroy the wall
    collides('bomb-explode', 'bombLock', (b,l) => {
        unlockDoor(l,bombEDoor,bombWDoor,bombSDoor,bombNDoor,' ')
    })

    // *********** ALL ABOUT ENEMIES!!! ****************************************
    // ADD ENEMIES TO THE SCENE
    console.log('enemies.length: '+DUNGEON_DEF.map[roomY][roomX].e.length)
    if(DUNGEON_DEF.map[roomY][roomX].e.length > 0){
        let filled = []
        filled.push(Math.floor(playerY/tileXY),Math.floor(playerX/tileXY))
        console.log('filled: '+filled)
        let totalEnemies = 0
        for(let i = 0; i < DUNGEON_DEF.map[roomY][roomX].e.length; i++){
            let enemyType = DUNGEON_DEF.map[roomY][roomX].e[i].t
            let enemy = enemyDirectory.find(baddie => baddie.type === enemyType);
            let quantity = DUNGEON_DEF.map[roomY][roomX].e[i].q
            console.log('quantity on room load: '+quantity)
            totalEnemies = totalEnemies + quantity
            while(quantity > 0){
                let position = getRandUnfilledPosition(filled)
                console.log('add '+enemy.type+ ' to scene')
                let mySprite = enemy.type
                if(enemy.hasOwnProperty('sprites')){
                    // For now simply select the first of the possible sprites
                    mySprite = enemy.sprites[0];
                }
                add([
                    sprite(mySprite, {animSpeed: enemy.animSpeed }),
                    pos( tileXY * position[1], tileXY * position[0] ),
                    ''+enemy.type,
                    ''+enemy.movement,
                    ''+enemy.killable,
                    'dangerous',
                    {   type: enemy.type, 
                        timeIntervals: enemy.timeIntervals, 
                        speed:enemy.speed, 
                        HP:enemy.hitpoints , 
                        dirX: enemy.orientX, 
                        dirY: enemy.orientY, 
                        timer: 0,
                        stuck:0,
                        justDamaged:false,
                        spriteOn:true,
                        sprite:mySprite,
                        speed:enemy.speed
                    }
                ])
                console.log(enemy.orientX+', '+enemy.orientY)
                quantity--
                filled.push(position)
            }
        }
        // do we lock the doors until all enemies are killed?
        if(totalEnemies > 0 && DUNGEON_DEF.map[roomY][roomX].lk){
            setLockTriggers()
        }
    }

    // What happens when the player touches something that causes damage
    player.collides('dangerous', (e) => {
        if(!player.justDamaged){
            const damage = e.damage != null ? e.damage : -1
            editHP(damage)
            player.justDamaged  = true
            wait(PLAYER_HIT_NO_CONTROL, () => {
                wait(PLAYER_HIT_INVULNERABLE - PLAYER_HIT_NO_CONTROL, () => {
                    player.justDamaged  = false
                    player.spriteOn     = true
                    player.controlOn    = true
                    player.changeSprite(player.sprite)
                })
            })
            
        }
    })
    // player loop, handling what happens when just damaged. 
    player.action(() => {
        if(player.justDamaged){
            handleSpriteFlicker(player)
        }
        // Control is off, and the player was just damaged
        if(!player.controlOn && player.justDamaged){

        }
    });

    function editHP(p){
        inventory.HP += p
        renderHealth()
        if(inventory.HP <= 0){
            deathAnimation()
        }
    }

    function deathAnimation(){
        alert('Game Over')
        destroy(player)
    }

    function setLockTriggers(){
        // set triggers that are all around the player at playerX, playerY
        let triggerArray = [
            [2.1,0],[1.1,1.1],[0,2.1],[-1.1,1.1],[-2.1,0],[-1.1,-1.1],[0,-2.1],[1.1,-1.1]
        ]
        for(let i = 0; i < triggerArray.length; i++){
            add([
                sprite('invisibleObj'),
                pos( (tileXY * triggerArray[i][0]) + playerX, (tileXY * triggerArray[i][1]) +playerY ),
                'lock-trigger'
            ])
        }
    }

    // When the player touches the invisible lock triggers, it generates lock objects on top of the exists. 
    // note that this function sucks. 
    // I would like to compartmentalize this repeated code, but it fails when I do and I don't know why. 
    // I would rather it just work than look nice. 
    player.overlaps('lock-trigger', () => {
        // South
        if(DUNGEON_DEF.map[roomY][roomX].roomMap[southDoorRow][halfWayX] == ' '){
            add([
                sprite('south-door'),
                pos( halfWayX*tileXY, tileXY * southDoorRow ),
                'enemy-locked-door'
            ])
        }
        
        //lockTheDoor(southDoorRow,halfWayX,'south-door')
        // North
        if(DUNGEON_DEF.map[roomY][roomX].roomMap[northDoorRow][halfWayX] == ' '){
            add([
                sprite('north-door'),
                pos( halfWayX*tileXY, tileXY * northDoorRow ),
                'enemy-locked-door',
                solid()
            ])
        }
        //lockTheDoor(northDoorRow,halfWayX,'north-door')
        // East
        if(DUNGEON_DEF.map[roomY][roomX].roomMap[eastWestDoorRow][eastDoorCol] == ' '){
            add([
                sprite('east-door'),
                pos( eastDoorCol*tileXY, tileXY * eastWestDoorRow),
                'enemy-locked-door',
                solid()
            ])
        }
        //lockTheDoor(eastWestDoorRow,eastDoorCol,'east-door')
        // West
        if(DUNGEON_DEF.map[roomY][roomX].roomMap[eastWestDoorRow][westDoorCol] == ' '){
            add([
                sprite('west-door'),
                pos( westDoorCol*tileXY, tileXY * eastWestDoorRow ),
                'enemy-locked-door',
                solid()
            ])
        }
        //lockTheDoor(eastWestDoorRow,westDoorCol,'west-door')
        
        destroyAll('lock-trigger')
    })

    // lock a given door
    // this function should work, but does not. Why?
    /*function lockTheDoor(row,col,sprite){
        if(DUNGEON_DEF.map[roomY][roomX].roomMap[row][col] == ' '){
            add([
                sprite('south-door'),
                pos( halfWayX*tileXY, tileXY * southDoorRow ),
                'enemy-locked-door'
            ])
        }
    }*/

    // function for checking if we open the doors, and if so open them
    function openEnemyDoorsCheck(){
        let totalEnemies = 0
        for(let i = 0; i < DUNGEON_DEF.map[roomY][roomX].e.length; i++){
            totalEnemies = totalEnemies + DUNGEON_DEF.map[roomY][roomX].e[i].q
        }
        if(totalEnemies <= 0){
            destroyAll('enemy-locked-door')
        }
    }

    // *****************DEFINE ENEMY AI, SPEED, ETC**************************
    // SKELETOR
    action('sk', (s) => {
        handleRandomMovement(s,s.speed,s.timeIntervals['changeDir'])
    })
    // LikeLike
    action('lk', (l) => {
        handleRandomMovement(l,l.speed,l.timeIntervals['changeDir'])
    })

    // Rope
    action('rp', (l) => {
        handleRandomMovement(l,l.speed,l.timeIntervals['changeDir'])
    })

    // TO DO add AI for new enemies
    // ks, keese bat. Fly around, animate, slow down the animation speed and stop moving. Random direction changes. Must stay on screen.
    // wg, wizrobe green. Hat. Pick direction. Stand up. Shoot. Hat. Disapear. Doesn't move. 
    // lk, likelike. For now, can be same as the skeletor with its own movement



    // Handle the sprite flicker on 
    action('killable', (k) => {
        if(k.justDamaged){
            handleSpriteFlicker(k)
        }
        if(!k.justDamaged && !k.spriteOn){
            k.spriteOn = true
            k.changeSprite(k.sprite)
        }
        
    })

    // AI for enemies with random movement, such as the skeletor
    function handleRandomMovement(s,speed,timerSpeed){
        s.resolve()
        s.timer -= dt()
        let tempSpeed = speed
        if(!s.justDamaged || 
            s.timer <= 0 )
        {
            s.justDamaged = false;
            if(s.pos.x == s.priorX && s.priorY == s.pos.y){
                s.stuck = 100
            }
            if(s.pos.x < tileXY || s.pos.y < tileXY){
                s.stuck = 100
            }
            if(s.timer <= 0 || s.stuck > 1){
                let rando = Math.floor(Math.random() * 4)
                if(rando==0){
                    s.dirX = 0
                    s.dirY = -1
                } else if(rando==1){
                    s.dirX = 0
                    s.dirY = 1
                }else if(rando==2){
                    s.dirX = -1
                    s.dirY = 0
                }else{
                    s.dirX = 1
                    s.dirY = 0
                }
                s.timer = rand(timerSpeed)
                s.stuck = 0
            }
            s.priorX = s.pos.x
            s.priorY = s.pos.y
        } 
        if(s.justDamaged){
            tempSpeed = HITSPEED
        }
        //console.log('just damaged:'+s.justDamaged)
        s.move(s.dirX * tempSpeed,s.dirY * tempSpeed )
    }
    // generates a position in the room that is not already occupied by a wall, the player at start, or an enemy
    function getRandUnfilledPosition(filled){
        let randY = 0
        let randX = 0
        let tile = '#'
        while(tile != ' '){
            randY = Math.floor(Math.random()*(DUNGEON_DEF.map[roomY][roomX].roomMap.length-2)+1)
            randX = Math.floor(Math.random()*(DUNGEON_DEF.map[roomY][roomX].roomMap[0].length-2)+1)
            tile = DUNGEON_DEF.map[roomY][roomX].roomMap[randY].substring(randX, randX+1)
            //console.log('tile at random position '+randY+', '+randX +': "'+tile+'"')
            if(filled.includes( [randY,randX])){
                tile = '#'
               //console.log('but that spot is already filled')
            }
        }
        return [randY,randX]
    }

    // ******************** WEAPON AND ITEM USE  ***********
    // to do: replace with sword
    function spawnSword(p) {
        const obj = add([sprite('kaboom'), pos(p), 'sword'])
        wait(0.15, () => {
            destroy(obj)
        })
    }

    // create an arrow
    function shootArrow(p,d){
        let image = 'arrow-';
        if(d.x == 1 && d.y == 0){
            image = image + 'east'
            p.y += tileXY*.25
        } else if(d.x == 0 && d.y == 1){
            image = image + 'south'
            p.x += tileXY*.25
        } else if(d.x == -1 && d.y == 0){
            image = image + 'west'
            p.y += tileXY*.25
        } else{
            image = image + 'north'
            p.x += tileXY*.25
        }
        add([
            sprite(image),
            pos(p.x,p.y), 
            'arrow',
            {dir: d}
        ])
        inventory.arrows--
        arrowLabel.text = 'x'+inventory.arrows
    }
    action('arrow', (a) => {
        a.move(a.dir.x*ARROW_SPEED, a.dir.y*ARROW_SPEED )
        if(a.pos.x < 0 || 
            a.pos.x > tileXY*eastDoorCol ||
            a.pos.y < 0 ||
            a.pos.y > tileXY * southDoorRow
        ){
            destroy(a)
        }
    })

    // Create a bomb on the map and handle its timers and explosion
    function spawnBomb(p) {
        const bomb = add([sprite('bomb'), pos(p.x+(tileXY/4),p.y), area(vec2(), vec2(tileXY/2,tileXY)), 'bomb'])
        const explodeX = bomb.pos.x-(tileXY*.75)
        const explodeY = bomb.pos.y-(tileXY*.5)
        inventory.bombs--
        bombLabel.text = 'x'+inventory.bombs
        wait(BOMB_FUSE, () => {
            const bomb_fuse = add([sprite('bomb-red'),  area(vec2(), vec2(tileXY/2,tileXY)), pos(bomb.pos), 'bomb-fuse',{spriteOn:true,sprite:'bomb-red',oppSprite:'bomb',timer:BOMB_FLICKER_RATE}])
            destroy(bomb)
            wait(BOMB_FLICKER, () => {
                destroy(bomb_fuse)
                const explosion = add([sprite('kaboom'), pos(explodeX,explodeY), 'bomb-explode',scale(2)])
                wait(BOMB_EXPLODE, () => {
                    destroy(explosion)
                })
            })
        })
    }
    // Handle the sprite flicker on bombs about to explode 
    action('bomb-fuse', (k) => {
        k.timer -= dt()
        if(k.timer <= 0){
            k.timer = BOMB_FLICKER_RATE
            console.log('flicker')
            if(k.spriteOn){
                k.changeSprite(k.oppSprite)
                k.spriteOn = false
            } else {
                k.changeSprite(k.sprite)
                k.spriteOn = true
            }
        }
    })

    //********************* DAMAGING ENEMIES ************* */

    // sword damages enemies
    collides('sword', 'killable', (s,k) => {
        if(!k.justDamaged){
            damageEnemy(k,player.dir.x,player.dir.y,SWORD_DAMAGE)
        } 
    })

    // bomb damages enemies
    collides('bomb-explode', 'killable', (b,k) => {
        if(!k.justDamaged){
            // TO DO make enemy bounce away from a bomb
            // Don't just let this be 0,0
            damageEnemy(k,0,0,BOMB_DAMAGE)
        } 
    })

    // arrow damages enemies
    collides('arrow', 'killable', (a,k) => {
        if(!k.justDamaged){
            // TO DO make enemy bounce away from a bomb
            // Don't just let this be 0,0
            damageEnemy(k,a.dir.x,a.dir.y,ARROW_DAMAGE)
            destroy(a)
        } 
    })

    // HANDLE DAMAGING ENEMY
    function damageEnemy(k,dirX,dirY,damage){
        k.justDamaged = true
        console.log('k now in damage state')
        k.HP = k.HP - damage
        k.dirX = dirX
        k.dirY = dirY
        k.timer = ENEMY_HIT_INVULNERABLE
        if(k.HP <= 0){
            destroy(k)
            removeEnemyFromRoom(k.type)
            // TO DO: Add an explode sprite after it dies
            // check to see if we need to open doors
            openEnemyDoorsCheck()
        }
    }

    // Kill enemy
    function removeEnemyFromRoom(enemyType){
        let remaining = 0
        for(let i = 0; i < DUNGEON_DEF.map[roomY][roomX].e.length; i++){
            if(DUNGEON_DEF.map[roomY][roomX].e[i].t == enemyType){
                DUNGEON_DEF.map[roomY][roomX].e[i].q--
            }
            remaining = remaining + DUNGEON_DEF.map[roomY][roomX].e[i].q
            console.log('remaining '+DUNGEON_DEF.map[roomY][roomX].e[i].t+': '+DUNGEON_DEF.map[roomY][roomX].e[i].q)
        }
        if(remaining == 0 && 
            !DUNGEON_DEF.map[roomY][roomX].b/*bless*/ && 
            DUNGEON_DEF.map[roomY][roomX].trsSprt){
                addTreasure(DUNGEON_DEF.map[roomY][roomX])
            }
    }



    // ********* UI AND DEBUGGING DISPLAY *******

    // render the UI on load
    if(inventory.map){renderHasMap()}
    if(inventory.bossKey){renderBossKey()}
    if(inventory.compass){renderHasCompass()}
    renderButtons()
    renderHealth()
    renderMap()

    /*const roomLabel = add([
        text('row: '+roomY+ ', col: '+roomX),
        pos(400, tileXY*9.5),
        layer('ui'),
        {
          value: 'row: '+roomY+ ', col: '+roomX,
        },
        scale(2),
        color(0,0,0)
    ])*/

    const keyIcon = add([
        sprite('key'),
        pos(tileXY*(halfWayX-1) , tileXY*(southDoorRow+1)),
        layer('ui'),
    ])
    let keysLabel = add([
        text('x'+inventory.keys),
        pos(tileXY*(halfWayX-0.175),tileXY*(southDoorRow+1.375)),
        layer('ui'),
        {
            value: 'x'+inventory.keys,
        },
        scale( 2),
        color(0,0,0)
    ])
    const bombIcon = add([
        sprite('bomb'),
        pos(tileXY*(halfWayX-.75) , tileXY*(southDoorRow+2)),
        layer('ui'),
    ])
    let bombLabel = add([
        text('x'+inventory.bombs),
        pos(tileXY*(halfWayX-0.175),tileXY*(southDoorRow+2.375)),
        layer('ui'),
        {
            value: 'x'+inventory.bombs,
        },
        scale( 2),
        color(0,0,0)
    ])
    const arrowIcon = add([
        sprite('arrow-north'),
        pos(tileXY*(halfWayX-.75) , tileXY*(southDoorRow+3)),
        layer('ui'),
    ])
    let arrowLabel = add([
        text('x'+inventory.arrows),
        pos(tileXY*(halfWayX-0.175),tileXY*(southDoorRow+3.375)),
        layer('ui'),
        {
            value: 'x'+inventory.arrows,
        },
        scale( 2),
        color(0,0,0)
    ])
    
    function renderBossKey(){
        add([
            sprite('boss-key'),
            layer('ui'),
            pos(tileXY*(halfWayX+.8), tileXY*(southDoorRow+1)),
        ])
    }
    function renderHasMap(){
        add([
            sprite('map'),
            layer('ui'),
            pos(tileXY*(halfWayX+0.75), tileXY*(southDoorRow+2.05)),
        ])
    }
    function renderHasCompass(){
        add([
            sprite('compass'),
            layer('ui'),
            pos(tileXY*(halfWayX+0.75), tileXY*(southDoorRow+3)),
        ])
    }

    function renderButtons(){
        destroyAll('controls')
        add([
            text('Z'),
            pos(tileXY*(halfWayX+2.625), tileXY*(southDoorRow+2.25)),
            layer('ui'),
            'controls',
            {
                value: 'Z',
            },
            scale(3),
            color(0,0,0)
        ])
        add([
            text('X'),
            pos(tileXY*(halfWayX+4), tileXY*(southDoorRow+2.25)),
            layer('ui'),
            'controls',
            {
                value: 'X',
            },
            scale(3),
            color(0,0,0)
        ])
        add([
            text('C'),
            pos(tileXY*(halfWayX+5.365), tileXY*(southDoorRow+2.25)),
            layer('ui'),
            'controls',
            {
                value: 'C',
            },
            scale(3),
            color(0,0,0)
        ])
        add([
            text('[  ][  ][  ]'),
            pos(tileXY*(halfWayX+2.25), tileXY*(southDoorRow+2.75)),
            layer('bg'),
            'controls',
            {
                value: '[  ][  ][  ]',
            },
            scale(vec2(2,7)),
            color(0,0,0)
        ])
        
        if(inventory.stuff.includes('bow')){
            add([
                sprite('bow'),
                layer('ui'),
                'controls',
                pos(tileXY*(halfWayX+2.625),  tileXY*(southDoorRow+2.75)),
            ])
        }
        if(inventory.stuff.includes('bomb')){
            add([
                sprite('bomb'),
                layer('ui'),
                'controls',
                pos(tileXY*(halfWayX+4),  tileXY*(southDoorRow+2.75)),
            ])
        }
        if(inventory.stuff.includes('sword')){
            add([
                sprite('sword-icon'),
                layer('ui'),
                'controls',
                pos(tileXY*(halfWayX+5.365),  tileXY*(southDoorRow+2.75)),
            ])
        }
    }
    
    function renderHealth(){
        // remove current healthbar when needing to refresh
        destroyAll('heart-bar')
        let heartCount     = inventory.maxHP/2
        let currentHealth  = inventory.HP/2
        const startHeartOffset = 2
        let heartOffset = startHeartOffset
        let vertOffset = 0
        console.log('heartCount'+inventory.HP)
        for(let h = 0; h < heartCount; h++ ){
            let frame = currentHealth > h ? (currentHealth == 0.5+h ? 1 : 2) : 0
            add([
                sprite('hearts',{
                    animSpeed: 0,
                    frame: frame
                }),
                pos(tileXY*(halfWayX+heartOffset),(tileXY*(southDoorRow+1)) + (tileXY*vertOffset)),
                layer('ui'),
                'heart-bar'
            ])
            console.log('heartCount'+heartCount)
            heartOffset +=0.5
            if(vertOffset == 0 && h == 8){
                vertOffset = 0.5
                heartOffset = startHeartOffset
            }
        }
    }

    // **************** RENDERING MAP AND COMPASS *******
    function renderMap(){
        const originYmultiplier = (DUNGEON_DEF.map[roomY][roomX].roomMap.length+0.25)
        let mapOriginX          = tileXY/2
        let mapOriginY          = tileXY*originYmultiplier
        let mapScale            = 1
        const mapCellWidth      = 26   
        const mapCellHeight     = 26
        const mapCellYpadding   = 0
        const mapCellXpadding   = 0
        // width of the map area
        const maxMapWidth       = (tileXY*halfWayX)-(tileXY*1.25) // half minus one, with padding
        // height of map area, ie all of the area below the play area minus some padding
        const maxMapHeight      = (heightTile*tileXY)-(tileXY*originYmultiplier)-(0.25*tileXY)
        // to justify the the middle of the map area...
        // how big would the map be if all rooms were rendered at the unmodified resolution?
        const trueMapWidth = DUNGEON_DEF.map[0].length * (mapCellWidth+mapCellXpadding)
        const trueMapHeight = DUNGEON_DEF.map.length * (mapCellHeight+mapCellYpadding)
        // If the map is smaller than the max, center the map horizontally and vertically in the space
        // if the map is larger than the max, figure out the scaling
        // first, which overage is larger, height or width?
        let widthRatio = trueMapWidth/maxMapWidth
        let heightRatio = trueMapHeight/maxMapHeight
        let ratio = widthRatio > heightRatio ? widthRatio : heightRatio
        mapScale = 1 / ratio
        
        mapOriginX = (maxMapWidth/2)- (trueMapWidth/2*mapScale)+(tileXY*0.25)
        mapOriginY = (maxMapHeight/2)-(trueMapHeight/2*mapScale)+(tileXY*originYmultiplier)
        
        // when re-rendering, destroy existing map
        destroyAll('map-item')

        for(let row = 0; row < DUNGEON_DEF.map.length; row++){
            for(let col = 0; col < DUNGEON_DEF.map[row].length; col++){
                const mapCellX = mapOriginX+(mapScale*((col*mapCellWidth)+mapCellXpadding))
                const mapCellY = mapOriginY+(mapScale*((row*mapCellHeight)+mapCellYpadding))
                const mapcell = getMapCell(DUNGEON_DEF.map[row][col])
                if(mapcell == 0){
                    // skip empty cells
                    continue
                }
                if(inventory.map ||  DUNGEON_DEF.map[row][col].visited){
                    add([
                        sprite('map-cell',{
                            animSpeed: 0,
                            frame: mapcell
                        }),
                        scale(mapScale),
                        pos(mapCellX,mapCellY),
                        'map-item','map-cell'
                    ])
                }
                if(inventory.compass){
                    if(DUNGEON_DEF.map[row][col].trsSprt != null && DUNGEON_DEF.map[row][col].trsSprt != '' && DUNGEON_DEF.map[row][col].trsSprt != 'triforce'){
                        add([
                            sprite('map-treasure-icon'),
                            pos(mapCellX,mapCellY),
                            'map-item','map-treasure',
                            scale(mapScale)
                        ])
                    }
                    if(DUNGEON_DEF.map[row][col].trsSprt == 'triforce'){
                        add([
                            sprite('map-boss-icon'),
                            pos(mapCellX,mapCellY),
                            'map-item','map-boss',
                            scale(mapScale)
                        ])
                    }
                }
            }
        }
        const youAreHereX = mapOriginX+(mapScale * ((roomX*mapCellWidth)+mapCellXpadding))
        const youAreHereY = mapOriginY+(mapScale * ((roomY*mapCellHeight)+mapCellYpadding))
        add([
            sprite('map-player-icon',{frame:0, animSpeed: 0.5}),
            pos(youAreHereX,youAreHereY),
            'map-item','map-player',
            scale(mapScale)
        ])
    }

    // TO DO TEST THIS FUNCTION!
    function getMapCell(roomDef){
        const doors = [' ',lockNDoor,lockSDoor,lockEDoor,lockWDoor,bombNDoor,bombSDoor,bombEDoor,bombWDoor,bossSDoor,bossWDoor,bossNDoor,bossEDoor]
        let index = 0;
        // north
        if(doors.includes(roomDef.d.n)){
            index += 1
        }
        // east
        if(doors.includes(roomDef.d.e)){
            index += 2
        }
        // south
        if(doors.includes(roomDef.d.s)){
            index += 4
        }
        //west
        if(doors.includes(roomDef.d.w)){
            index += 8
        }
        return index;
    }
    
    // **************** GRAPHICS FUNCTIONS **************
    
    // Flickers a sprite on and off, such as when damaged
    function handleSpriteFlicker(k){
        if(!k.spriteOn){
            k.changeSprite(k.sprite)
            k.spriteOn = true
        } else {
            k.changeSprite('invisibleObj')
            k.spriteOn = false
        }
    }
});

start("game", {roomX: DUNGEON_DEF.start[1],roomY: DUNGEON_DEF.start[0],playerX: tileXY*6,playerY:tileXY*7,orientX:0,orientY:-1,inventory: startingInventory})
