
// ref
// https://labs.phaser.io/edit.html?src=src\game%20objects\tilemap\collision\tile%20callbacks.js
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
// https://gamedevacademy.org/how-to-make-a-mario-style-platformer-with-phaser-3/
// http://www.html5gamedevs.com/topic/37978-overlapping-on-a-tilemap-object-layer/


// phaser game settings
let config = {
  type: Phaser.AUTO,
  width: 24 * 48,
  height: 18 * 48,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 }
    }
},
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};


let coinLayer;

//let player;
let score = 0;
let gameOver = false;

// New game instance based on config
let game = new Phaser.Game(config);


// Preload assets
function preload ()
{
  // load grid tiles in spritesheet 
  this.load.spritesheet('tiles', './assets/map/gridtiles48x48.png', { frameWidth: 48, frameHeight: 48 });

  // load coin image/ spritesheet
  this.load.spritesheet('coins', './assets/map/coins48x48.png', { frameWidth: 48, frameHeight: 48 });
  
  // load Player
  this.load.spritesheet('player', './assets/dude.png', { frameWidth: 32, frameHeight: 48 });

  // load map (made with Tiled) in JSON format
  this.load.tilemapTiledJSON('map', './assets/map/world.json');
}

// Build the game - add assets, etc.
function create ()
{
    // make the tilemap from the imported json map.
    const map = this.make.tilemap({key: 'map', tileWidth: 48, tileHeight: 48 });

    // The tileset for the Ground, Walls, and Traps layers
    // note that gridtiles48x48 was set when creating the map in the Tiled editor
    const tileSet = map.addTilesetImage('gridtiles48x48', 'tiles');

    // tileset for coins
    // note that coins48x48 was set when creating the map in the Tiled editor
    const coinTiles = map.addTilesetImage('coins48x48', 'coins');

    
    // create the layers- match tilesets created above to layers
    // Note that the layer names match the ones defined in the Tiled editor
    const groundLayer = map.createDynamicLayer('Ground', tileSet, 0, 0);
    const wallLayer = map.createDynamicLayer('Walls', tileSet, 0, 0);
    const trapLayer = map.createDynamicLayer('Traps', tileSet, 0, 0);
    
    // coinLayer defined earlier (above preload()).
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

    // the player will collide with walls
    // The method setCollisionByExclusion makes all tiles except the ones sent available for collision detection.
    // Sending -1 in our case makes all tiles on this layer collidable.
    wallLayer.setCollisionByExclusion([-1]);

    // create the player sprite at starting position 360,310    
    this.player = this.physics.add.sprite(360, 310, 'player');
    this.player.setBounce(0.2); // our player will bounce from items
    this.player.setCollideWorldBounds(true); // don't go out of the map

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;


    //  player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();

    // Add collision detection for player and walls
    this.physics.add.collider(this.player, wallLayer);

    // when the player overlaps with a tile with index 141, the collectCoin function will be called
    // 141 found in the coins layer in the json file 
    coinLayer.setTileIndexCallback(141, collectCoin, this);
   
    // Add an overlap check for player and coins
    this.physics.add.overlap(this.player, coinLayer);

}

// called when player overlaps coin
// remove coin
function collectCoin(sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    return false;
}

function update() {

    // Player does not move by default
    this.player.body.setVelocity(0);

    // check for game over
    if (gameOver)
    {
        return;
    }

    // Horizontal left-right movement
    if (this.cursors.left.isDown)
    {
        this.player.body.setVelocityX(-80);
    }
    else if (this.cursors.right.isDown)
    {
        this.player.body.setVelocityX(80);
    }

    // Vertical up-down movement
    if (this.cursors.up.isDown)
    {
        this.player.body.setVelocityY(-80);
    }
    else if (this.cursors.down.isDown)
    {
        this.player.body.setVelocityY(80);
    }        

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown)
    {
        this.player.anims.play('left', true);
        //this.player.flipX = true;
    }
    else if (this.cursors.right.isDown)
    {
        this.player.anims.play('right', true);
        //this.player.flipX = false;
    }
    else if (this.cursors.up.isDown)
    {
        //this.player.anims.play('up', true);
    }
    else if (this.cursors.down.isDown)
    {
        //this.player.anims.play('down', true);
    }
    else
    {
        //this.player.anims.play('stop', true);
        this.player.anims.stop();
    }


}