// # = fixed block
// H = moveable block
// . = dirt floor
// S = statue facing right
// Z = statue facing left

const roomTemplates = []
const startTemplate = {
    map: [
        'ycccccccccccw',
        'a           b',
        'a S S   Z Z b',
        'a           b',
        'a S S   Z Z b',
        'a    ...    b',
        'a S.S...Z.Z b',
        'a  .......  b',
        'xdddddddddddz'
    ],
    treasure: '',
    start: true,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
}
roomTemplates.push(startTemplate)
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a           b',
        'a           b',
        'a           b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: true,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a  ##   ##  b',
        'a  ##   ##  b',
        'a  ##   ##  b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a    ###    b',
        'a    ###    b',
        'a    ###    b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [1,1],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a  #     #  b',
        'a           b',
        'a  #     #  b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a  #     #  b',
        'a           b',
        'a           b',
        'a           b',
        'a  #     #  b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: true,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a           b',
        'a     H     b',
        'a           b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [3,6],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a  ##    ## b',
        'a           b',
        'a     ##    b',
        'a           b',
        'a  ##    ## b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a # # # # # b',
        'a           b',
        'a # # # # # b',
        'a           b',
        'a # # # # # b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a      #####b',
        'a        ###b',
        'a         ##b',
        'a           b',
        'a         ##b',
        'a        ###b',
        'a      #####b',
        'xdddddddddddz'
    ],
    treasure: [4,11],
    start: false,
    goal: true,
    noDoor: 'east',
    boss:'east',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a ######### b',
        'a # S   Z # b',
        'a #S     Z# b',
        'a #       # b',
        'a ###   ### b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [4,6],
    start: false,
    goal: false,
    noDoor: 'east,west',
    boss:'',
    bless: true
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a     #     b',
        'a    # #    b',
        'a   H   #   b',
        'a    # #    b',
        'a     #     b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [4,6],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a     H     b',
        'a    # #    b',
        'a   #   #   b',
        'a    # #    b',
        'a     #     b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [4,6],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a     #     b',
        'a    # #    b',
        'a   #   H   b',
        'a    # #    b',
        'a     #     b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [4,6],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a     #     b',
        'a    # #    b',
        'a   #   #   b',
        'a    # #    b',
        'a     H     b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [4,6],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a     #     b',
        'a    # #    b',
        'a   #   #   b',
        'a    # #    b',
        'a     #     b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [1,1],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'aS         Zb',
        'a           b',
        'a           b',
        'a           b',
        'a           b',
        'a           b',
        'aS         Zb',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: true,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a       ####b',
        'a       ####b',
        'a        ###b',
        'a           b',
        'a        ###b',
        'a       ####b',
        'a       ####b',
        'xdddddddddddz'
    ],
    treasure: [4,11],
    start: false,
    goal: true,
    noDoor: 'east',
    boss:'east',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a  #       #b',
        'a #   #   # b',
        'a    #   #  b',
        'a   #   #   b',
        'a  #   #    b',
        'a #   #   # b',
        'a#       #  b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a ######### b',
        'a         # b',
        'a         # b',
        'a         # b',
        'a ######### b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a           b',
        'a   #   #   b',
        'a           b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a           b',
        'a   H   #   b',
        'a           b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a           b',
        'a   #   H   b',
        'a           b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a #  #      b',
        'a #  ## ####b',
        'a #   #   # b',
        'a # # #   # b',
        'a ### #   # b',
        'a     # # # b',
        'a       #   b',
        'xdddddddddddz'
    ],
    treasure: [4,3],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a           b',
        'a #       # b',
        'a           b',
        'a   #   #   b',
        'aS         Zb',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: true,
    noDoor: '',
    boss:'north',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a##### #####b',
        'a####   ####b',
        'a##       ##b',
        'a           b',
        'a           b',
        'a  #     #  b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [1,6],
    start: false,
    goal: true,
    noDoor: 'north',
    boss:'north',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a#####      b',
        'a###        b',
        'a##         b',
        'a           b',
        'a##         b',
        'a###        b',
        'a#####      b',
        'xdddddddddddz'
    ],
    treasure: [4,1],
    start: false,
    goal: true,
    noDoor: 'west',
    boss:'west',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a  #     #  b',
        'a H       H b',
        'a  #     #  b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a  #     #  b',
        'a #       # b',
        'a  #     #  b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: true,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a  #     #  b',
        'a #       H b',
        'a  #     #  b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a           b',
        'a  #     #  b',
        'a H       # b',
        'a  #     #  b',
        'a           b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a ######### b',
        'a           b',
        'a ######### b',
        'a           b',
        'a ######### b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a ###HHH### b',
        'a #       # b',
        'a #       # b',
        'a #       # b',
        'a ######### b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [4,6],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a         # b',
        'a ####### # b',
        'a #     # # b',
        'a #   ### # b',
        'a #       # b',
        'a ######### b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: [3,7],
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})
roomTemplates.push({
    map: [
        'ycccccccccccw',
        'a           b',
        'a # # # # # b',
        'a # # # # # b',
        'a # # # # # b',
        'a # # # # # b',
        'a # # # # # b',
        'a           b',
        'xdddddddddddz'
    ],
    treasure: '*',
    start: false,
    goal: false,
    noDoor: '',
    boss:'',
    bless: false
})