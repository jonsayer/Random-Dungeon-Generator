// Constants shared between the different pages
const baseRoom = [
    'ycccccccccccw',
    'a           b',
    'a           b',
    'a           b',
    'a           b',
    'a           b',
    'a           b',
    'a           b',
    'xdddddddddddz'
]
const rowDoorWidth = 1
const lockNDoor = '^'
const lockSDoor = 'v'
const lockEDoor = '>'
const lockWDoor = '<'
const bombNDoor = 'T'
const bombSDoor = '_'
const bombEDoor = ']'
const bombWDoor = '['
const bossNDoor = '`'
const bossSDoor = ','
const bossEDoor = '-'
const bossWDoor = '='
const keySymbol = 'k'
const bKeySymbl = 'K'
const itemSymbl = 'i'
const winSymbol = 'A'
const northDoor = ' '
const southDoor = ' '
const eastDoor = ' '
const westDoor = ' '
const mapSymbol = 'M'
const compassSymbol = '@'
const stairs = '$'

// the south door will be in the bottom row of a room map
const southDoorRow = baseRoom.length-1;
const eastWestDoorRow = 4
const eastDoorCol = baseRoom[0].length-1
const northDoorRow = 0
const westDoorCol = 0
const halfWayX = Math.floor(baseRoom[0].length/2)