let enemyDirectory = []
// Skeletor
enemyDirectory.push({
    type: 'sk',   // type will also be set to sprite
    movement: 'move-ground',  //tbd, do we need this?
    killable: 'killable',
    hitpoints: 2,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 60,
    difficulty: 2,
    timeIntervals: {'changeDir':5},
    animSpeed:0
})

// TO DO: likelike sprite and AI (not included in 1st draft)*/
/*enemyDirectory.push({
    type: 'lk',//like-like
    movement: 'likelike', 
    killable: 'killable',
    hitpoints: 3,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 30,
    difficulty: 4,
    timeIntervals: {'changeDir':6,'holdPlayer':2},
    animSpeed:1
})
// this is the wizrobe that doesn't move from the oracle games
enemyDirectory.push({
    type: 'wg',
    movement: 'none', 
    killable: 'killable',
    hitpoints: 3,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 0,
    difficulty: 4,
    timeIntervals: {'sleep':2,'hat':0.5,'risen':2,'shoot':1},
    animSpeed:0
})*/
// rope snek
enemyDirectory.push({
    type: 'rp',
    movement: 'rope', 
    killable: 'killable',
    hitpoints: 3,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 70,
    difficulty: 2,
    sprites:['rpr','rpl'],
    timeIntervals: {'changeDir':4,'check':3},
    animSpeed:0.75
})
// keese bats
/*enemyDirectory.push({
    type: 'ks',
    movement: 'flap', 
    killable: 'killable',
    hitpoints: 1,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 0,
    difficulty:1,
    timeIntervals: {'flyCycle':7},
    animSpeed:0.2

})
// this is the wizrobe that teleports and stays put in oracle games
/*enemyDirectory.push({
    type: 'wizrobe-red',
    movement: 'none', 
    killable: 'killable',
    hitpoints: 3,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 0,
    difficulty: 3
})
// this is the wizrobe that moves around in the oracle games
/* TO DO: not if first draft
enemyDirectory.push({
    type: 'wizrobe-blue',
    movement: 'none', 
    killable: 'killable',
    hitpoints: 3,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 50,
    difficulty: 4
})*/
/*enemyDirectory.push({
    type: 'gel-red',
    movement: 'hop', 
    killable: 'killable',
    hitpoints: 2,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 75,
    difficulty: 1
})
enemyDirectory.push({
    type: 'gel-red-baby',
    movement: 'hop', 
    killable: 'killable',
    hitpoints: 1,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 75,
    difficulty: 0.5
})
enemyDirectory.push({
    type: 'mini-moldorm',
    movement: 'spin-ground-multiple', 
    killable: 'killable',
    hitpoints: 3,
    damage: -1,
    orientX: 0,
    orientY: -1,
    speed: 100,
    difficulty: 3
})*/