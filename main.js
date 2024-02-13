import kaboom from 'kaboom';

const BG_HEIGHT = 1152;
const BG_WIDTH = 2048;
const SPEED = 640;
// const SPEED = 320;
const SHIPNAME = 'G1MPY';

const generateAnim = (to, from, speed = 6) => {
    return {
        to, from, speed, loop: true
    }
}


kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    background: [40, 40, 40]
})

loadRoot('sprites/')
loadSprite('teddy', 'teddy_sheet.png', {
    sliceX: 4,
    anims: {
        idle: 0,
        walk: generateAnim(0, 1, 8),
        jump: 2,
        pole: 3
    }
})
loadSprite('eyes', 'eyes.png', {
    sliceX: 5,
    anims: {
        idle: 0,
        blink: generateAnim(0, 4)
    }
})
loadSprite('bird', 'bird.png', {
    sliceX: 5,
    anims: {
        fly: generateAnim(0, 4)
    }
})
loadSprite('heart', 'heart_sheet.png', {
    sliceX: 4,
    anims: {
        spin: generateAnim(0, 3)
    }
})
loadSprite('grass', 'brick.png')
loadSprite('spikes', 'spikes.png')
loadSprite('pole1', 'pole1.png')
loadSprite('pole2', 'pole2.png')
loadSprite('pole_top', 'pole_top.png')
loadSprite('ship', 'ship.png')
loadSprite('logo', 'logo.png')
loadSprite('score', 'score.png', {
    sliceX: 2,
    anims: {
        disable: 0,
        enable: 1
    }
})

loadRoot('sounds/')
loadSound('heart', 'coin.wav')
loadSound('jump', 'jump.wav')
loadSound('pole', 'pole.wav')
loadSound('death', 'death.wav')
loadSound('ship', 'ship.wav')
loadSound('confirm', 'confirm.wav')

loadRoot('assets/')
loadSprite('right', 'right.png')
loadSprite('left', 'left.png')
loadSprite('up', 'up.png')
loadSprite('down', 'down.png')
loadSprite('space', 'space.png')
loadSprite('background', 'rsz_background.jpg')

loadRoot('fonts/')
loadFont('round', 'fonts/round9x13.ttf')
loadFont('mario', 'fonts/mario.ttf')

const blinkingMessage = (content, position) => {
    const message = add([
        text(content, {font: 'round', size: 24}),
        area(),
        anchor('center'),
        pos(position),
        opacity(),
        state('flash-up', ['flash-up', 'flash-down'])
    ])

    message.onStateEnter('flash-up', async () => {
        await tween(
            message.opacity,
            0,
            0.5,
            (opacity) => message.opacity = opacity,
            easings.linear
        )
        message.enterState('flash-down')
    })

    message.onStateEnter('flash-down', async () => {
        await tween(
            message.opacity,
            1,
            0.5,
            (opacity) => message.opacity = opacity,
            easings.linear
        )
        message.enterState('flash-up')
    })
}

scene('main', () => {
    add([
        sprite('logo'),
        area(),
        anchor('center'),
        pos(center().x, center().y -140),
        scale(3)
    ])
    blinkingMessage(
        "Press [ Enter ] to Play How To",
        vec2(center().x, center().y + 300)
    )

    onKeyPress('enter', () => {
        play('confirm')
        go('instructions');
    })

})

scene('instructions', () => {
    let bgScaleFactor = Math.max(height() / BG_HEIGHT, width() / BG_WIDTH);

    add([
        sprite('background'),
        anchor('center'),
        pos(center().x, center().y),
        scale(bgScaleFactor),
        fixed()
    ])

    add([
        text('Controls', { font: "round", size: 50}),
        area(),
        anchor('center'),
        pos(center().x, center().y - 200)
    ])

    const controlPrompts = add([
        pos(center().x + 30, center().y)
    ])
    controlPrompts.add([ sprite('up'), pos(0, -80) ])
    controlPrompts.add([ sprite('down'), ])
    controlPrompts.add([ sprite('left'), pos(-80, 0) ])
    controlPrompts.add([ sprite('right'), pos(80, 0) ])
    controlPrompts.add([ sprite('space'), pos(-200, 0) ])
    controlPrompts.add([
        text('Jump', { font: "round", size: 32 }),
        pos(-190, 100)
    ])
    controlPrompts.add([
        text('Move', { font: "round", size: 32 }),
        pos(10, 100)
    ])

    blinkingMessage(
        "Press [ Enter ] to Start Game",
        vec2(center().x, center().y + 300)
    )

    onKeyPress('enter', () => {
        play('confirm')
        go('game');
    })


})

scene('game', () => {
    let hearts = 0;

    let bgScaleFactor = Math.max(height() / BG_HEIGHT, width() / BG_WIDTH);

    add([
        sprite('background'),
        anchor('center'),
        pos(center().x, center().y),
        scale(bgScaleFactor),
        fixed()
    ])


    const scoreboard = add([
        pos(20, 20),
        fixed(),
        z(2),
        scale(2)
    ])

    scoreboard.add([
        text('score:', { font: 'round', size: 20}),
    ])

    let score = scoreboard.add([
        text(hearts+'/'+SHIPNAME.length, { font: 'round', size: 20}),
        pos(80, 0),
    ])

    let score_hearts = []

    for(let i = 0; i < SHIPNAME.length; i++) {
        score_hearts.push(scoreboard.add([
            sprite('score'),
            pos((32+8)*i, 20)
        ]))
    }

    setGravity(1600);
    
    const tileConfigs = {
        tileWidth: 64,
        tileHeight: 64,
        pos: vec2(0, 0),
        tiles: {
            '@': () => [
                sprite('teddy'),
                area({ shape: new Rect(vec2(12, 0), 32, 64) }),
                body(),
                z(1),
                'player'
            ],
            '=': () => [
                sprite('grass'),
                offscreen(),
                area(),
                body({ isStatic: true }),
                'grass'
            ],
            '$': () => [
                sprite('heart', { anim: 'spin' }),
                offscreen(),
                area(),
                'heart'
            ],
            '|': () => [
                sprite('pole1'),
                offscreen(),
                area(),
                'pole'
            ],
            '*': () => [
                sprite('pole2'),
                offscreen(),
                area(),
                'pole'
            ],
            '!': () => [
                sprite('pole1'),
                offscreen(),
            ],
            '.': () => [
                sprite('pole2'),
                offscreen(),
            ],
            '^': () => [
                sprite('bird', { anim: 'fly' }),
                offscreen(),
                area(),
            ],
            'o': () => [
                sprite('pole_top'),
                area(),
                body({ isStatic: true }),
                // 'pole_top'
            ],
            'x': () => [
                sprite('spikes'),
                area({ shape: new Rect(vec2(0, 32), 64, 32) }),
                'spikes'
            ]
        }
    }

    const level = addLevel([
        ' @             o                     ',
        '               *                     ',
        '               |                     ',
        '         $     *                     ',
        '               |                     ',
        '        ===    *                     ',
        '               |                     ',
        '               *                     ',
        '============   |                     ',
        '               *                     ',
        '               |                     ',
        '               *                     ',
        '               |                            $  ',
        '               *                                  ',
        '               |                                 $',
        '               *                           ===  ==',
        '               |    $             $           ',
        '               .                        ==    ',
        '               !        x   x   x   x         ',
        '               ========================       ',
    ], tileConfigs)


    const player = level.get('player')[0]

    player.onGround(() => {
        if (!isKeyDown('left') && !isKeyDown('right')) {
            player.play('idle');
        } else {
            player.play('walk');
        }
    })

    player.onUpdate(() => {
        camPos(player.pos)
        if (player.pos.y >= 2000) {
            play('death')
            go('lose')
        }
    })

    onKeyDown('left', () => {
        // if (player.isFalling() && !player.isJumping()) return
        if (player.curAnim() === 'pole') return
        player.move(-SPEED, 0)
        player.flipX = true;
        if (player.isGrounded() && player.curAnim() !== 'walk') {
            player.play('walk');
        }
    })
    
    onKeyDown('right', () => {
        // if (player.isFalling() && !player.isJumping()) return
        if (player.curAnim() === 'pole') return
        player.move(SPEED, 0)
        player.flipX = false;
        if (player.isGrounded() && player.curAnim() !== 'walk') {
            player.play('walk');
        }
    })

    ;['left', 'right'].forEach((key) => {
        onKeyRelease(key, () => {
            if (player.isGrounded() && !isKeyDown("left") && !isKeyDown("right")) {
                player.play("idle")
            }
        })
    })

    onKeyPress('space', () => {
        if (player.isGrounded() || player.curAnim() === 'pole') {
            player.isStatic = false;
            player.jump()
            play('jump');
            player.play('jump');
        }
    })

    player.onCollide('pole', (pole) => {
        if (player.curAnim() === 'pole') return
        player.play('pole');
        player.moveTo(pole.pos.x, pole.pos.y);
        player.isStatic = true;
    })

    player.onCollide('spikes', (spikes) => {
        play('death')
        go('lose')
    })

    let down_playing = false
    player.onKeyDown('down', () => {
        if (player.curAnim() !== 'pole') return
        if (!down_playing) {
            down_playing = true;
            play('pole')
            setTimeout(() => {
                down_playing = false
            }, 3000)
        }
        player.move(0, SPEED);
    })

    player.onKeyDown('up', () => {
        if (player.curAnim() !== 'pole') return
        player.move(0, -SPEED);
    })

    player.onCollide('grass', () => {
        if (player.curAnim() !== 'pole') return
        player.isStatic = false;
    })

    player.onCollide('heart', (heart) => {
        score_hearts[hearts].play('enable');
        score_hearts[hearts].add([
            text(SHIPNAME[hearts], { font: 'round', size: 12 }),
            anchor('center'),
            pos(16, 18)
        ])

        heart.destroy();
        play('heart');
        hearts++;
        score.destroy();
        score = scoreboard.add([
            text(hearts+'/'+SHIPNAME.length, { font: 'round', size: 20}),
            pos(160, 0)
        ])

        if (hearts === SHIPNAME.length) {
            setTimeout(() => {
                play('ship')
                go('ship')
            }, 1000)
        }
    })



})

scene('lose', () => {
    let bgScaleFactor = Math.max(height() / BG_HEIGHT, width() / BG_WIDTH);

    add([
        sprite('background'),
        anchor('center'),
        pos(center().x, center().y),
        scale(bgScaleFactor),
        fixed()
    ])

    add([
        text('Game Over', { font: "round", size: 50}),
        area(),
        anchor('center'),
        pos(center().x, center().y - 200)
    ])


    setTimeout(() => {
        blinkingMessage(
            "Press [ Enter ] to Restart Game",
            vec2(center().x, center().y + 300)
        )

        onKeyPress('enter', () => {
            play('confirm')
            go('game');
        })
    }, 3000)


})

scene('ship', () => {
    add([
        text('ship sailed', { font: "round", size: 50}),
        area(),
        anchor('center'),
        pos(center().x, center().y - 300)
    ])
    add([
        text('G1MPY', { font: "round", size: 56}),
        area(),
        anchor('center'),
        pos(center().x, center().y -200)
    ])
    add([
        sprite('ship'),
        area(),
        anchor('center'),
        pos(center().x, center().y +100),
        scale(3)
    ])
})

go('main')



