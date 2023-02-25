// TO DO
// **MAPS
// HIGH: generate other possible enemy lists (currently single skeletons)
    // Create external js file with enemy definitions. 
        // JSON only includes the count of each enemy in the room, not full definition
        // game script builds the enemies from external definition file
        // definition file also includes some enemy groups that are of the various difficulties. 
            // Skeletor definition
            // create Wizrobe definition, red (still) and blue (moving)
            // Zol
            // Gel
            // Mini-moldorm
// MED: Compress the room maps so that the levels can be passed by QR code (currently 12 KB for 16 rooms!)
    // Alternately, just pull in the room templates as an Id and pass the locks and doors as
    // an array of diffs
    // then the Game.js builds the maps on load so that the rest of the code doesn't have to change
    // Also, shorten some parameter names so JSON is shorter
// MED: decide if doors will be locked if there are enemies in the room
// MED: Annotate the code for future legibility
// LOW: new algorithm: looping path map maker, with central room
// LOW: new algorithm: maze item: bring x items to boss room, to unlock
// LOW: random name generator for exciting mazes

// KABOOM TO DO
// HIGH: New Enemy AIs and sprites
    // Wizrobe
    // Zol/Gel
    // Mini-Moldorm <= this may be hard

// HIGH: amend sprite set for testing full dungeon
    // example dungeon item: bow - DONE
    // statues
    // explosion? (the kaboom is nice :) )
    // Sword (directional, positional)
// HIGH: Make Switches work
// HIGH: Bombs make enemies bounce, not freeze
// HIGH: make a UI that shows the tools at hand, place for map
// HIGH: Related: change weapon buttons
// MED: Change link's hitbox
// MED: more enemy sprites
// Low: import a json map file to page kaboom and play it
    // this may be a separate page. If kaboom doesn't detect a "d" parameter, forward this page to
    // upload a file, which is converted to parameter and forwards you back
// LOW: Saving. Save maze state to a json file or a cookie. 
// LOW: allow use Zelda 1 sprites and tiles (down the road)
// LOW: dynamic sprite and tileset selection based on json parameters
// LOW: figure out how to animate walking
// VERY LOW: try out a few other browser-based game engines (maybe, this is proof of concept now)

// ????? BOSS FIGHT!





// STUFF THAT IS DONE
// HIGH: change scene based on position, not collision.
// doors
// HIGH: collect keys and unlock doors
// HIGH: why doesn't the boss lock variable get set in function bossLockTheLastRoom()?
// done maze maker
// MED: generate individual room maps
// HIGH: pick up map and compass
// HIGH: generate enemies for the rooms
    // Start with just single skeletors for testing
// HIGH: swing a sword, hurt enemies
// HIGH: hurting enemies makes them bounce away
// HIGH: killing enemies removes them from the room, and they do not respawn
// HIGH: In some rooms, lock the doors until all enemies are dead
//    - This entails both a locking on entry and an unlocking on enemy dead mechanism
// HIGH: drop bombs and bomb walls to open them
// HIGH: bombs hurt enemies
    // bomb sprite
// HIGH: use bow, shoot arrows, hurt enemies
// HIGH: track and render health
// HIGH: can only shoot bow after collecting it. 
// HIGH: Damage to link makes him invincible for a second and a half. Does he get knocked back? (not in LA)
// HIGH: Enemies do damage to link
// MED: render a map and make it work with compass

// MAP
// increase size - didn't do
// scale up for smaller maps - didn't do
// center the map
// scale down for larger map DONE