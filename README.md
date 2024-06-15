# Random Playable Zelda Dungeon

This is a work in progress for generating random Zelda dungeons and eventually an overworld with dungeons for a Zelda-style game. 

The game uses the Kaboom! 0.5.0 to play. It expands upon a basic Zelda clone tutorial for Kaboom by ([freecodecamp.org on YouTube](https://www.youtube.com/watch?v=4OaHB0JbJDI)).

## How to use it

On mazeMaker.html, select the different options to generate a dungeon. You can create an easy, middling, or hard dungeon using pre-set values. Clicking "Advanced settings" opens the full set of options available to you. 

The map of the dungeon generated will appear below the the settings. The map will include the following emoji icons:

- 🗝️ = There is a key in this room. 
- 🗺️ = The Dungeon Map is in this room. 
- 🧭 = The Compass is in this room. 
- 🏹 = The dungeon item is in this room. Currently, this is just a bow. 

The borders of the table cells indicate the type of doors:

- No border means an open door. 
- Black dotted lines mean a locked door, needing a key to open. 
- Red dotted lines mean this is a bombable wall. 

The shading of the table cells means:

- Green is the starting room. 
- Yellow is the ending room.
- Grey is the "critical path", the direct path between the starting and ending points. All branches of the maze come off of this path. 

## Playing the dungeon 

When you click the "Play Now" link, you're taken to play.html. You will notice in the URL bar of your browser a whole lot of text. What is happening is that when mazeMaker.html generated the dungeon it also generated a JSON representation of it, and this JSON is passed via the URL bar to play.html. This page interprets the JSON and creates a dungeon you can play, with enemies and item drops. 

You can also download the JSON to save a dungeon, but at this point there isn't much you can do with this file. 

### Controls

- Arrow keys to move
- C to use your "sword"
- X to drop a bomb
- Z to use an "item", which currently is just the bow. 

## How it generates a dungeon map

This basically uses a depth-first-search algorithm to generate a maze with multiple branching paths. It always works on a rectangular grid, and tries to fill that whole space, but doesn't always. 

## In Progress: Overworld Generator

overworldMaker.html is a work in progress. It generates an overworld map for a Zelda 1-style game. 

It worlds by setting starting points randomly across the map for the different "biomes" of the map, with would be the maps various regions where one might imagine the style of the tileset would show trees for a forest, rocks for a mountain, etc. It randomly grows each biome until they cross some sort of threshold. It adds random connections between screens of each biome, then connects the biomes to each other before finally making sure there are no isolated screens, connecting those to the map at large. 

Like the dungeon generator, you can use the presets to create easy, midling, or hard world maps, or set parameters yourself. 

A randomly-generated game title will appear above the game map you generate.  

The map will include these emoji icons:

- 🎬 = Player Start
- 🏛️ = Dungeon, indicated by a number.
- 🛒 = Shop
- ❤️ = Piece of Heart
- 💰 = Free money!
- 🧚‍♀️ = Fairy fountain where you can refresh your health. 
- 🧙‍♂️ = Wizard who gives sage advice.
- 🧙‍♀️ = Witch who brews life-saving potions
- ⚔️ = Sword upgrade

Table cell borders that are open indicate that you can traverse between those screens. 

You *can* click the "Play Now" link, and it will pass a playable JSON to play.js, allowing you to traverse this map. At this point, however, it doesn't do much. There is no way to find secrets or dungeons, all screens use the dungeon tileset, and there isn't much to do.

## Future progress I hope to make

- Add a boss room to the dungeons, their weakness depending on the dungeon item. 
- More diverse enemies. 
- More dungeon items to find. 
- Replace the Zelda graphics with open source alternatives. 
- Animated player sprite.
- Replace the Kaboom 0.5.0 game engine with something more robust. Oddly, actually playing the game is less interesting to me than generating the maps, so don't expect this!
- Add a sword swing animation instead of a bland "BAM!" icon for a sword swing. 
- A overworld graphics to the overworld generator, with different screen maps that can connect to one another. 
- Connect the overworld generator to the dungeon generator so that it creates both together, and mod the player allowing the player can traverse from the overworld to dungeons and back again. 
- I have general intentions to use the code from this to create a new repository that creates a playable dungeon in GB Studio, instead of javascript. If I make that, I will likely not deploy it to this repository but its own. 

## Don't sue me Nintendo

- Obviously the graphics are from Nintendo's "The Legend of Zelda: Link's Awakening" for Game Boy Color. Go buy that game, it's great. I am using the graphics as fair use for eductional purposes, for now. 
