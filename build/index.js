(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var javascriptAstar = require('javascript-astar');
var Player = require('./player')
var globalMap = null

var cellSize = 40
var enemies = []
var lights = []

class Enemy extends Player {
  constructor(name, positionX, positionY, level, indexDirection = 0) {
    super(name, positionX, positionY)
    this.indexDirection = indexDirection
    this.level = level
  }

  setEnemies(ens) {
    enemies.push(ens)
  }

  setLights(l) {
    lights = l
  }

  setGlobalMap(map) {
    globalMap = map
  }

  getPathToPlayer(player) {
    var graph = new javascriptAstar.Graph(globalMap);
    var start = graph.grid[this.positionX][this.positionY];
    var end = graph.grid[player.positionX][player.positionY];
    var result = javascriptAstar.astar.search(graph, start, end);

    var directions = []
    var r
    var baseX
    var baseY

    result.forEach((move) => {
      if (!r) {
        baseX = this.positionX
        baseY = this.positionY
      } else {
        baseX = r.x
        baseY = r.y
      }

      if (baseX < move.x) {
        directions.push({
          direction: 'y',
          push: 1
        })
      } else if (baseX > move.x) {

        directions.push({
          direction: 'y',
          push: -1
        })
      } else if (baseY < move.y) {
        directions.push({
          direction: 'x',
          push: 1
        })
      } else if (baseY > move.y) {
        directions.push({
          direction: 'x',
          push: -1
        })
      }

      r = move
    })

    return directions
  }

  loopEnemy(directions, target) {
    if (this.player.offsetTop + (cellSize -15) > target.player.offsetTop &&
      this.player.offsetTop < target.player.offsetTop + (cellSize -15) &&
      this.player.offsetLeft < target.player.offsetLeft + (cellSize -15) &&
      this.player.offsetLeft + (cellSize - 15) > target.player.offsetLeft
    ) {
      if (this.level.health === 0) {
        this.level.setHealth(5)
      } else {
        this.level.setHealth(this.level.health - 1)
      }

      enemies.forEach((enemy) => enemy.resetEnemy(enemy))
      lights.forEach((light) => light.reset())
      target.reset
      this.level.reset
      return
    }

    if (parseInt(this.player.style.top) % cellSize === 0 && parseInt(this.player.style.left) % cellSize === 0) {
      if (this.indexDirection === directions.length) {
        this.indexDirection = 0
        directions = this.getPathToPlayer(target, globalMap)
      }

      this.directionAxis = directions[this.indexDirection].direction
      this.directionForce = directions[this.indexDirection].push
      this.handleSprite(directions[this.indexDirection].direction, directions[this.indexDirection].push)
      this.handlePosition(directions[this.indexDirection].direction, directions[this.indexDirection].push)
      this.indexDirection++
    }

    this.move(this.directionAxis, this.directionForce, this.player);
    this.isMoving = true

    this.movingTimeout = window.setTimeout(() => {
      this.loopEnemy(directions, target)
    }, 8);
  }

  resetEnemy(enemy) {
    this.stopMoving()
    if (enemy.player.parentNode) enemy.player.parentNode.removeChild(enemy.player);
    var enemy = this
    enemy = null
  }
}

module.exports = Enemy

},{"./player":4,"javascript-astar":5}],2:[function(require,module,exports){
var cellSize = 40

class Light {
  constructor(name, positionX, positionY) {
    this.positionX = positionX
    this.positionY = positionY
    this.name = name
  }

  create() {
    var map = document.querySelector(".game-content")
    this.newLight = document.createElement("div")
    this.newLight.id = "light-container"

    var dot = document.createElement("div")
    dot.className = "dot";

    var pulse = document.createElement("div")
    pulse.className = "pulse";

    this.newLight.appendChild(dot)
    this.newLight.appendChild(pulse)
    this.newLight.style.left = (this.positionY * cellSize)+'px';
    this.newLight.style.top = (this.positionX * cellSize)+'px';
    this.newLight.style.visibility = 'visible';
    map.appendChild(this.newLight)
  }

  reset() {
    this.newLight.parentNode.removeChild(this.newLight);
    var light = this
    light = null 
  }

  setCellSize(size) {
    cellSize = size
  }
}

module.exports = Light
},{}],3:[function(require,module,exports){
var javascriptAstar = require('javascript-astar');
var Light = require('./light')
var Player = require('./player')
var Enemy = require('./enemy')
var moves = []

// Score de la partie
var score = 0

// dimension d'une case sur la grille
var cellSize = 40

var enemies = []
var lights = []
var indexLevel = 0
var globalMap = null
var batman = null
var map = null

var levels = [
  {
    level: 1, scoreToReach: 13, lights: [{x: 1, y: 12}, {x: 6, y: 1}, {x: 5, y: 6}, {x: 3, y: 14}, {x: 7, y: 9}, {x: 8, y: 3}, {x: 3, y: 3}, {x: 1, y: 5}, {x: 2, y: 10}, {x: 6, y: 15}, {x: 8, y: 17}, {x: 2, y: 18}, {x: 4, y: 9}], enemies: [{name: 'riddler', x: 3, y: 18}], map: 'map'
  },
  {
    level: 2, scoreToReach: 14, lights: [{x: 5, y: 7}, {x: 3, y: 6}, {x: 6, y: 10}, {x: 1, y: 2}, {x: 4, y: 12}, {x: 7, y: 15}, {x: 8, y: 18}, {x: 8, y: 9}, {x: 3, y: 15}, {x: 4, y: 18}, {x: 8, y: 3}, {x: 2, y: 11}, {x: 1, y: 13}, {x: 6, y: 1}], enemies: [{name: 'poison', x: 3, y: 18}], map: 'map2'
  },
  {
    level: 3, scoreToReach: 17, lights: [{x: 4,y: 9},{x: 4,y: 10},{x: 1,y: 16},{x: 7,y: 18},{x: 8,y: 4},{x: 8,y: 15},{x: 3,y: 3},{x: 5,y: 7},{x: 5,y: 12},{x: 2,y: 8},{x: 6,y: 5},{x: 2,y: 10},{x: 6,y: 14},{x: 7,y: 1},{x: 1,y: 5},{x: 8,y: 8},{x: 8,y: 11}], enemies: [{name: 'penguin', x: 3, y: 18}], map: 'map3'
  },  
  {
    level: 4, scoreToReach: 12, lights: [{x: 4, y: 4}, {x: 2, y: 7}, {x: 6, y: 7}, {x: 8, y: 9}, {x: 7, y: 2}, {x: 5, y: 16}, {x: 7, y: 11}, {x: 1, y: 11}, {x: 3, y: 13}, {x: 8, y: 18}, {x: 2, y: 3}, {x: 3, y: 18}], enemies: [{name: 'harley', x: 3, y: 18}], map: 'map4'
  },
  {
    level: 5, scoreToReach: 16, lights: [{x: 5, y:6}, {x: 5, y: 11}, {x: 2, y: 14}, {x: 6, y: 1}, {x: 3, y: 12}, {x: 4, y: 16}, {x: 2, y: 10}, {x: 7, y: 9}, {x: 3, y: 4}, {x: 2, y: 18}, {x: 4, y: 2}, {x: 7, y: 4}, {x: 8, y: 7}, {x: 1, y: 6}, {x: 8, y: 14}, {x: 4, y: 8}], enemies: [{name: 'joker', x: 3, y: 18}], map: 'map5'
  },
  {
    level: 6, scoreToReach: 23, lights: [{x:2, y: 3}, {x: 3, y: 5}, {x: 5, y: 6}, {x: 6, y: 8}, {x:3, y: 2}, {x: 5, y: 3}, {x: 6, y: 5}, {x: 1, y: 18}, {x: 1, y: 1}, {x: 6, y: 11}, {x: 5, y: 13}, {x: 3, y: 14}, {x: 6, y: 14}, {x: 5, y: 16}, {x: 3, y: 17}, {x: 3, y: 8}, {x: 4, y: 9}, {x: 3, y: 11}, {x: 4, y: 10}, {x: 8, y: 8}, {x: 8, y: 11},{x: 7, y: 3}, {x: 7, y: 16}], enemies: [{name: 'bane', x: 3, y: 18}], map: 'map6'
  }
]

class Level {
  constructor(level, health, score, scoreToReach) {
    this.level = level
    this.health = health
    this.score = score
    this.scoreToReach = scoreToReach
  }

  create() {
    var guiContainer = document.querySelector('.gui-container')

    if (!guiContainer.classList.contains('hidden')) {
      guiContainer.classList.add('hidden')
    }

    var board = document.querySelector('.game-content')
    board.style.background = `url("./assets/maps/gotham_shadow_${indexLevel}.png")`;
    var overlay = document.createElement('div')
    overlay.classList.add('overlay')

    var overlayLevel = document.createElement('div')
    overlayLevel.classList.add('overlay-content')
    var level = document.createElement('h2')
    level.innerHTML = "Level " + this.level;
    overlayLevel.appendChild(level)

    overlay.appendChild(overlayLevel)

    var overlayHealth = document.createElement('div')
    overlayHealth.classList.add('overlay-content')

    var health = document.createElement('h2')
    health.innerHTML = this.health;
    overlayHealth.appendChild(health)

    overlay.appendChild(overlayHealth)
    board.appendChild(overlay)

    setTimeout(() => {
      enemies = []
      lights = []

      fetch('assets/maps/' + levels[indexLevel].map + '.json')
      .then((response) => {

          response.json().then((map) => {
            globalMap = map

            var grid = document.querySelector('.game-content')
            if (grid.firstChild) {
              while(grid.firstChild) {
                grid.removeChild(grid.firstChild)
              }
            }

            let compteur = 0
            map.forEach((row, i) => {
              var rowElement = document.createElement('div')
              grid.appendChild(rowElement)

              row.forEach((cell, j) => {
                var line = document.createElement('div')
                line.classList.add('cell')

                if (cell === 0) {
                  line.classList.add('disabled')
                }

                line.innerHTML = (i) + ' - ' + j
                rowElement.appendChild(line)

                compteur++
              })
            })

            batman = new Player('batman', 3, 1)
            batman.create()
            batman.setCellSize(cellSize)
            batman.setLevel(this)
            batman.setGlobalMap(globalMap)
            batman.makePlayable()

            levels[indexLevel].lights.forEach((light, index) => {
              var light = new Light('light' + index, light.x, light.y)
              light.setCellSize(cellSize)
              light.create()
              lights.push(light)
            })

            batman.setLights(lights)

            levels[indexLevel].enemies.forEach((enemy) => {
              var en = new Enemy(enemy.name , enemy.x, enemy.y, this)
              en.create()
              enemies.push(en)
              en.setGlobalMap(globalMap)
              en.setEnemies(en)
              en.setLights(lights)
              var directions = en.getPathToPlayer(batman)
              en.loopEnemy(directions, batman)
            })

            this.initScore()
            this.renderScore()
            this.renderLife()

            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay)
            }
            var guiContainer = document.querySelector('.gui-container')
            guiContainer.classList.remove('hidden')
          })
      })
    }, 3000)
  }

  get reset() {
    return this.create()
  }

  setHealth(health) {
    this.health = health
  }

  initScore() {
    this.score = 0
  }

  renderScore() {
    var scoreElement = document.getElementById('score')
    scoreElement.innerHTML = "<p>Score : " + this.score + "</p>"

    if (this.score === this.scoreToReach) {
      indexLevel++

      if (!levels[indexLevel]) {
        var board = document.querySelector('.game-content')
        var overlay = document.createElement('div')
        overlay.classList.add('overlay')
        overlay.classList.add('endgame')

        var overlayTitle = document.createElement('div')
        overlayTitle.classList.add('overlay-content')
        var title = document.createElement('h2')
        title.innerHTML = "Congratulations"
        overlayTitle.appendChild(title)
        overlay.appendChild(overlayTitle)

        var overlayText = document.createElement('div')
        overlayText.classList.add('overlay-content')
        var text = document.createElement("p")
        text.innerHTML = "Thanks for playing Gotham Shadow ! If you want to help me improve the game, share your experience with me by completing the following ";


        var link = document.createElement("a")
        link.classList.add("aftergame")
        link.innerHTML = "survey."
        link.href = "https://docs.google.com/forms/d/e/1FAIpQLSdN3xFu_K1TUT_msgJdayWVGR0Z37sWyLN7ut1rISqBeEHKuQ/viewform?usp=sf_link"

        var options = document.createElement("p")
        options.innerHTML = "<a href='index.html'>Home</a> - <a href='play.html'>Play</a>"

        var credits = document.createElement("p")
        credits.innerHTML = "Gotham Shadow - Gaël Moliner - 2018"

        text.appendChild(link)
        overlayText.appendChild(text)
        overlayText.appendChild(options)
        overlayText.appendChild(credits)
        overlay.appendChild(overlayText)

        var guiContainer = document.querySelector('.gui-container')

        if (!guiContainer.classList.contains('hidden')) {
          guiContainer.classList.add('hidden')
        }

        board.appendChild(overlay)

        batman.resetPlayer()
        enemies.forEach((enemy) => enemy.resetEnemy(enemy))
        return
      }

      this.level = levels[indexLevel].level
      this.score = 0
      this.scoreToReach = levels[indexLevel].scoreToReach

      batman.resetPlayer()

      this.create()
      enemies.forEach((enemy) => enemy.resetEnemy(enemy))
    }
  }

  renderLife() {
    var scoreElement = document.getElementById('life')
    scoreElement.innerHTML = "<p>Life : " + this.health + "</p>"
  }

  scorePlus() {
    this.score++
    this.renderScore()
  }

  setScope(scope) {
    this.scope = scope
  }
}

function launchGame() {
  var level1 = new Level(levels[indexLevel].level, 5, 0, levels[indexLevel].scoreToReach)
  level1.create()
}

launchGame()

},{"./enemy":1,"./light":2,"./player":4,"javascript-astar":5}],4:[function(require,module,exports){
var javascriptAstar = require('javascript-astar');

var globalMap = null
var cellSize = 40
var lights = []

class Player {
  constructor(name, positionX, positionY, movingTimeout, directionAxis = null, directionForce = 0, isMoving = false) {
    this.name = name
    this.positionX = positionX
    this.positionY = positionY
    this.movingTimeout = -1
  }

  setLights(l) {
    lights = l
  }

  setGlobalMap(map) {
    globalMap = map
  }

  create() {
    var map = document.querySelector(".game-content")
    this.player = document.createElement("div")
    this.player.id = this.name
    this.player.className = this.name
    this.player.style.left = (this.positionY * cellSize) +'px';
    this.player.style.top = (this.positionX * cellSize) +'px';
    this.player.style.visibility = 'visible';
    map.appendChild(this.player)
  }

  stopMoving() {
    clearTimeout(this.movingTimeout);
    this.movingTimeout = -1
  }

  resetPlayer() {
    window.removeEventListener('keydown', this.boundSayHello);
    this.player.parentNode.removeChild(this.player);
    var player = this
    player = null
  }

  handlePosition(direction, push) {
    if (direction === 'x' && push === -1) {
      if (push === this.directionForce) {
        this.positionY--
      } else {
        this.positionY++
      }
    }

    if (direction === 'x' && push === 1) {
      if (push === this.directionForce) {
        this.positionY++
      } else {
        this.positionY--
      }
    }

    if (direction === 'y' && push === -1) {
      if (push === this.directionForce) {
        this.positionX--
      } else {
        this.positionX++
      }
    }

    if (direction === 'y' && push === 1) {
      if (push === this.directionForce) {
        this.positionX++
      } else {
        this.positionX--
      }
    }
    // getJokerPath()
    // $scope.$apply()
  }

  handleSprite(direction, push) {
    if (direction === 'x' && push === -1) {
      this.resetSprites()
      this.player.classList.add('move-left')
    }

    if (direction === 'x' && push === 1) {
      this.resetSprites()
      this.player.classList.add('move-right')
    }

    if (direction === 'y' && push === -1) {
      this.resetSprites()
      this.player.classList.add('move-top')
    }

    if (direction === 'y' && push === 1) {
      this.resetSprites()
      this.player.classList.add('move-bottom')
    }
  }

  handleLights() {
    lights.forEach((light, i) => {
      if (this.positionX === light.positionX && this.positionY === light.positionY) {
        this.level.scorePlus()
        light.reset()
        lights.splice(i, 1)
      }
    })
  }

  setLevel(level) {
    this.level = level
  }

  resetSprites() {
    this.player.classList.remove('move-bottom')
    this.player.classList.remove('move-top')
    this.player.classList.remove('move-right')
    this.player.classList.remove('move-left')
  }

  move(dir, offset) {
    if (dir === 'x') {
      this.player.style.left = (parseInt(this.player.style.left) + offset) + 'px'
    } else if (dir === 'y') {
      this.player.style.top = (parseInt(this.player.style.top) + offset) + 'px'
    }
  }

  loop(direction, push) {
    if (this.isMoving) {
      if (parseInt(this.player.style.top) % cellSize === 0 && parseInt(this.player.style.left) % cellSize === 0) {
        // Première direction
        if (!this.directionAxis && this.directionForce === 0) {
          this.handleLights()

          if (direction === 'x' && push === -1) {
            if (globalMap[this.positionX][this.positionY-1] === 0) {
              return
            } else {
              this.handleSprite(direction, push)
            }
          }

          if (direction === 'x' && push === 1) {
            if (globalMap[this.positionX][this.positionY+1] === 0) {
              return
            } else {
              this.handleSprite(direction, push)
            }
          }

          if (direction === 'y' && push === -1) {
            if (globalMap[this.positionX-1][this.positionY] === 0) {
              return
            } else {
              this.handleSprite(direction, push)
            }
          }

          if (direction === 'y' && push === 1) {
            if (globalMap[this.positionX+1][this.positionY] === 0) {
              return
            } else {
              this.handleSprite(direction, push)
            }
          }

          this.directionAxis = direction
          this.directionForce = push

        } else if (this.stopped) {
          this.handleLights()

          if (direction === 'x' && push === -1) {
            if (globalMap[this.positionX][this.positionY-1] === 0) {
              return
            } else {
              this.handleSprite(direction, push)
            }
          }

          if (direction === 'x' && push === 1) {
            if (globalMap[this.positionX][this.positionY+1] === 0) {
              return
            } else {
              this.handleSprite(direction, push)
            }
          }

          if (direction === 'y' && push === -1) {
            if (globalMap[this.positionX-1][this.positionY] === 0) {
              return
            } else {
              this.handleSprite(direction, push)
            }
          }

          if (direction === 'y' && push === 1) {
            if (globalMap[this.positionX+1][this.positionY] === 0) {
              return
            } else {
              this.handleSprite(direction, push)
            }
          }

          this.directionAxis = direction
          this.directionForce = push
          this.stopped = false
         } else {
          if (this.directionAxis !== direction) {
            this.handlePosition(this.directionAxis, this.directionForce)
            this.handleLights()

            if (direction === 'x' && push === -1) {
              if (this.directionAxis === 'y' &&
                  this.directionForce === -1 &&
                  globalMap[this.positionX-1][this.positionY] === 0 &&
                  globalMap[this.positionX][this.positionY-1] === 0)
              {
                this.resetSprites()
                this.stopped = true
                return
              }

              if (this.directionAxis === 'y' &&
                  this.directionForce === 1 &&
                  globalMap[this.positionX+1][this.positionY] === 0 &&
                  globalMap[this.positionX][this.positionY-1] === 0)
              {
                this.resetSprites()
                this.stopped = true
                return
              }

              if (globalMap[this.positionX][this.positionY-1] !== 0) {
                this.directionAxis = direction
                this.directionForce = push
                this.handleSprite(direction, push)
              }
            }

            if (direction === 'x' && push === 1) {
              if (this.directionAxis === 'y' &&
                  this.directionForce === -1 &&
                  globalMap[this.positionX-1][this.positionY] === 0 &&
                  globalMap[this.positionX][this.positionY+1] === 0)
              {
                this.resetSprites()
                this.stopped = true
                return
              }

              if (this.directionAxis === 'y' &&
                  this.directionForce === 1 &&
                  globalMap[this.positionX+1][this.positionY] === 0 &&
                  globalMap[this.positionX][this.positionY+1] === 0)
              {
                this.resetSprites()
                this.stopped = true
                return
              }

              if (globalMap[this.positionX][this.positionY+1] !== 0) {
                this.directionAxis = direction
                this.directionForce = push
                this.handleSprite(direction, push)
              }
            }

            if (direction === 'y' && push === -1) {
              if (this.directionAxis === 'x' &&
                  this.directionForce === -1 &&
                  globalMap[this.positionX][this.positionY-1] === 0 &&
                  globalMap[this.positionX-1][this.positionY] === 0)
              {
                this.resetSprites()
                this.stopped = true
                return
              }

              if (this.directionAxis === 'x' &&
                  this.directionForce === 1 &&
                  globalMap[this.positionX][this.positionY+1] === 0 &&
                  globalMap[this.positionX-1][this.positionY] === 0)
              {
                  this.resetSprites()
                  this.stopped = true
                  return
              }

              if (globalMap[this.positionX-1][this.positionY] !== 0) {
                this.directionAxis = direction
                this.directionForce = push
                this.handleSprite(direction, push)
              }
            }

            if (direction === 'y' && push === 1) {
              if (this.positionX > 8) {
                this.directionAxis = 'x'
                this.directionForce = -1
                direction = 'x'
                push = -1
              } else {
                if (this.directionAxis === 'x' &&
                    this.directionForce === -1 &&
                    globalMap[this.positionX][this.positionY-1] === 0 &&
                    globalMap[this.positionX+1][this.positionY] === 0)
                {
                    this.resetSprites()
                    this.stopped = true
                    return
                }

                if (this.directionAxis === 'x' &&
                    this.directionForce === 1 &&
                    globalMap[this.positionX][this.positionY+1] === 0 &&
                    globalMap[this.positionX+1][this.positionY] === 0)
                {
                    this.resetSprites()
                    this.stopped = true
                    return
                }

                if (globalMap[this.positionX+1][this.positionY] !== 0) {
                  this.directionAxis = direction
                  this.directionForce = push
                  this.handleSprite(direction, push)
                }
              }
            }
          } else {
            this.handleSprite(direction, push)
            this.handlePosition(direction, push)
            this.handleLights()

            if (direction === 'x') {
              if (globalMap[this.positionX][this.positionY-1] === 0 ||
                globalMap[this.positionX][this.positionY+1] === 0) {
                this.resetSprites()
                this.stopped = true
                return
              }

              this.directionAxis = direction
              this.directionForce = push
            }

            if (direction === 'y') {
              if (this.positionX > 8 ||
                this.positionX < 1 ||
                globalMap[this.positionX-1][this.positionY] === 0 ||
                globalMap[this.positionX+1][this.positionY] === 0) {
                this.resetSprites()
                this.stopped = true
                return
              }

              this.directionAxis = direction
              this.directionForce = push
            }
          }
        }
      }
    }
    this.move(this.directionAxis, this.directionForce, this.player);
    this.isMoving = true

    this.movingTimeout = window.setTimeout(() => {
      this.loop(direction, push)
    }, 8);
  }

  startMoving(direction, push) {
    if (this.movingTimeout === -1) {
      this.loop(direction, push);
    }
  }

  bindKeyDown() {
    this.stopMoving()
  }

  oneKeyDown(event) {
    if (!event) {
      return
    }

    this.stopMoving()
    var direction
    var push

    if (event.keyCode === 39) {
      // right
      push = 1
      direction = 'x'
    } else if (event.keyCode === 37) {
      // left
      push = -1
      direction = 'x'
    } else if (event.keyCode === 40) {
      // bottom
      push = 1
      direction = 'y'
    } else if (event.keyCode === 38) {
      // top
      push = -1
      direction = 'y'
    } else {
      return
    }

    this.startMoving(direction, push);
  }

  makePlayable() {
    this.boundSayHello = evt => this.oneKeyDown(evt);
    window.addEventListener('keydown', this.boundSayHello);
  }

  setPlayer(player) {
    this.player = player
  }

  setCellSize(cell) {
    this.cellSize = cell
  }

  get reset() {
    return this.resetPlayer()
  }

  setLight(lights) {
    this.LIGHTS = []

    lights.forEach((light) => {
      this[light.name] = light
      this.LIGHTS.push(light.name)
    })
  }
}

module.exports = Player

},{"javascript-astar":5}],5:[function(require,module,exports){
// javascript-astar 0.4.1
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

(function(definition) {
    /* global module, define */
    if(typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = definition();
    } else if(typeof define === 'function' && define.amd) {
        define([], definition);
    } else {
        var exports = definition();
        window.astar = exports.astar;
        window.Graph = exports.Graph;
    }
})(function() {

function pathTo(node){
    var curr = node,
        path = [];
    while(curr.parent) {
        path.unshift(curr);
        curr = curr.parent;
    }
    return path;
}

function getHeap() {
    return new BinaryHeap(function(node) {
        return node.f;
    });
}

var astar = {
    /**
    * Perform an A* Search on a graph given a start and end node.
    * @param {Graph} graph
    * @param {GridNode} start
    * @param {GridNode} end
    * @param {Object} [options]
    * @param {bool} [options.closest] Specifies whether to return the
               path to the closest node if the target is unreachable.
    * @param {Function} [options.heuristic] Heuristic function (see
    *          astar.heuristics).
    */
    search: function(graph, start, end, options) {
        graph.cleanDirty();
        options = options || {};
        var heuristic = options.heuristic || astar.heuristics.manhattan,
            closest = options.closest || false;

        var openHeap = getHeap(),
            closestNode = start; // set the start node to be the closest if required

        start.h = heuristic(start, end);

        openHeap.push(start);

        while(openHeap.size() > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if(currentNode === end) {
                return pathTo(currentNode);
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node.
            var neighbors = graph.neighbors(currentNode);

            for (var i = 0, il = neighbors.length; i < il; ++i) {
                var neighbor = neighbors[i];

                if (neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.getCost(currentNode),
                    beenVisited = neighbor.visited;

                if (!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    graph.markDirty(neighbor);
                    if (closest) {
                        // If the neighbour is closer than the current closestNode or if it's equally close but has
                        // a cheaper path than the current closest node then it becomes the closest node
                        if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
                            closestNode = neighbor;
                        }
                    }

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        if (closest) {
            return pathTo(closestNode);
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    },
    // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
    heuristics: {
        manhattan: function(pos0, pos1) {
            var d1 = Math.abs(pos1.x - pos0.x);
            var d2 = Math.abs(pos1.y - pos0.y);
            return d1 + d2;
        },
        diagonal: function(pos0, pos1) {
            var D = 1;
            var D2 = Math.sqrt(2);
            var d1 = Math.abs(pos1.x - pos0.x);
            var d2 = Math.abs(pos1.y - pos0.y);
            return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
        }
    },
    cleanNode:function(node){
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.visited = false;
        node.closed = false;
        node.parent = null;
    }
};

/**
* A graph memory structure
* @param {Array} gridIn 2D array of input weights
* @param {Object} [options]
* @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
*/
function Graph(gridIn, options) {
    options = options || {};
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (var x = 0; x < gridIn.length; x++) {
        this.grid[x] = [];

        for (var y = 0, row = gridIn[x]; y < row.length; y++) {
            var node = new GridNode(x, y, row[y]);
            this.grid[x][y] = node;
            this.nodes.push(node);
        }
    }
    this.init();
}

Graph.prototype.init = function() {
    this.dirtyNodes = [];
    for (var i = 0; i < this.nodes.length; i++) {
        astar.cleanNode(this.nodes[i]);
    }
};

Graph.prototype.cleanDirty = function() {
    for (var i = 0; i < this.dirtyNodes.length; i++) {
        astar.cleanNode(this.dirtyNodes[i]);
    }
    this.dirtyNodes = [];
};

Graph.prototype.markDirty = function(node) {
    this.dirtyNodes.push(node);
};

Graph.prototype.neighbors = function(node) {
    var ret = [],
        x = node.x,
        y = node.y,
        grid = this.grid;

    // West
    if(grid[x-1] && grid[x-1][y]) {
        ret.push(grid[x-1][y]);
    }

    // East
    if(grid[x+1] && grid[x+1][y]) {
        ret.push(grid[x+1][y]);
    }

    // South
    if(grid[x] && grid[x][y-1]) {
        ret.push(grid[x][y-1]);
    }

    // North
    if(grid[x] && grid[x][y+1]) {
        ret.push(grid[x][y+1]);
    }

    if (this.diagonal) {
        // Southwest
        if(grid[x-1] && grid[x-1][y-1]) {
            ret.push(grid[x-1][y-1]);
        }

        // Southeast
        if(grid[x+1] && grid[x+1][y-1]) {
            ret.push(grid[x+1][y-1]);
        }

        // Northwest
        if(grid[x-1] && grid[x-1][y+1]) {
            ret.push(grid[x-1][y+1]);
        }

        // Northeast
        if(grid[x+1] && grid[x+1][y+1]) {
            ret.push(grid[x+1][y+1]);
        }
    }

    return ret;
};

Graph.prototype.toString = function() {
    var graphString = [],
        nodes = this.grid, // when using grid
        rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len; x++) {
        rowDebug = [];
        row = nodes[x];
        for (y = 0, l = row.length; y < l; y++) {
            rowDebug.push(row[y].weight);
        }
        graphString.push(rowDebug.join(" "));
    }
    return graphString.join("\n");
};

function GridNode(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
}

GridNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function(fromNeighbor) {
    // Take diagonal weight into consideration.
    if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
        return this.weight * 1.41421;
    }
    return this.weight;
};

GridNode.prototype.isWall = function() {
    return this.weight === 0;
};

function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    },
    remove: function(node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function(n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while(true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null,
                child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore){
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};

return {
    astar: astar,
    Graph: Graph
};

});

},{}]},{},[3]);
