let gameState = 'START'; // 'START', 'PLAYING', 'GAME_OVER'
let winner = null;
let gameMode = 'AI'; // 'AI' or 'PVP'
let aiDifficulty = 0.3; // AI difficulty coefficient
let standingImg, crouchingImg, jumpingImg, upAttImg, downAttImg, backgroundImg;
let fireballImg, spikeImg;
let currentStatus = 'Waiting for backend connection...';

function preload() {
  standingImg = loadImage('pic/stand.png');
  crouchingImg = loadImage('pic/down.png');
  jumpingImg = loadImage('pic/jump.png');
  upAttImg = loadImage('pic/up_att.png');
  downAttImg = loadImage('pic/down_att.png');
  backgroundImg = loadImage('pic/background.png');
  fireballImg = loadImage('pic/fireball.png');
  spikeImg = loadImage('pic/spike.png');
  starsImg = loadImage('pic/stars.png');
  sharkImg = loadImage('pic/shark.png');
  rockImg = loadImage('pic/rock.png');
  cureImg = loadImage('pic/cure.png');
  animal1Img = loadImage('pic/animal1.png');
  animal2Img = loadImage('pic/animal2.png');
  planeImg = loadImage('pic/plane.png');
  plane2Img = loadImage('pic/plane2.png');
  bombImg = loadImage('pic/bomb.png');
  background2Img = loadImage('pic/background2.jpg');
  smileImg = loadImage('pic/smile.png');
  smile2Img = loadImage('pic/smile2.png');
  smile3Img = loadImage('pic/smile3.png');
  smile4Img = loadImage('pic/smile4.png');
  smile5Img = loadImage('pic/smile5.png');
  poisonImg = loadImage('pic/poison.PNG');
  winImg = loadImage('pic/win.png');
  loseImg = loadImage('pic/lose.png');
  dieImg = loadImage('pic/die.png');
  window.standingImg = standingImg;
  window.crouchingImg = crouchingImg;
  window.jumpingImg = jumpingImg;
  window.upAttImg = upAttImg;
  window.downAttImg = downAttImg;
  window.backgroundImg = backgroundImg;
  window.fireballImg = fireballImg;
  window.spikeImg = spikeImg;
  window.starsImg = starsImg;
  window.sharkImg = sharkImg;
  window.rockImg = rockImg;
  window.cureImg = cureImg;
  window.animal1Img = animal1Img;
  window.animal2Img = animal2Img;
  window.planeImg = planeImg;
  window.plane2Img = plane2Img;
  window.bombImg = bombImg;
  window.background2Img = background2Img;
  window.smileImg = smileImg;
  window.smile2Img = smile2Img;
  window.smile3Img = smile3Img;
  window.smile4Img = smile4Img;
  window.smile5Img = smile5Img;
  window.poisonImg = poisonImg;
  window.winImg = winImg;
  window.loseImg = loseImg;
  window.dieImg = dieImg;
}

function setup() {
  // Dynamic calculation of 16:9 canvas size
  let w = windowWidth;
  let h = windowHeight;
  if (w / h > 16/9) {
    h = windowHeight;
    w = h * 16 / 9;
  } else {
    w = windowWidth;
    h = w * 9 / 16;
  }
  CONFIG.canvasWidth = w;
  CONFIG.canvasHeight = h;
  CONFIG.scale = w / 1000;

  let cnv = createCanvas(CONFIG.canvasWidth, CONFIG.canvasHeight);
  cnv.parent('game-container');
  cnv.id('game-canvas');

  player1 = new Player(100, CONFIG.player1StartX, CONFIG.player1StartY, false);
  player2 = new Player(100, CONFIG.player2StartX, CONFIG.player2StartY, gameMode === 'AI');
  textAlign(CENTER, CENTER);
  textSize(24 * CONFIG.scale);
  
  initGameModeButton();
}

function windowResized() {
  let w = windowWidth;
  let h = windowHeight;
  if (w / h > 16/9) {
    h = windowHeight;
    w = h * 16 / 9;
  } else {
    w = windowWidth;
    h = w * 9 / 16;
  }
  CONFIG.canvasWidth = w;
  CONFIG.canvasHeight = h;
  CONFIG.scale = w / 1000;
  resizeCanvas(CONFIG.canvasWidth, CONFIG.canvasHeight);
  textSize(24 * CONFIG.scale);
}

// Full screen button event
window.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('fullscreen-btn');
  if (btn) {
    btn.onclick = function() {
      // Enter full screen
      let elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      // Hide other blocks, only show game
      document.getElementById('top-row').style.display = 'none';
      btn.style.display = 'none';
      document.getElementById('game-container').style.display = 'block';
    };
  }
});

function draw() {
  image(backgroundImg, 0, 0, width, height);
  // Display camera view and recognition points
  if (window.webcamCanvas) {
    push();
    let camW = window.webcamCanvas.width;
    let camH = window.webcamCanvas.height;
    image(window.webcamCanvas, 10, 10, camW, camH);
    if (window.lastLandmarks && window.lastLandmarks.length > 0) {
      fill('lime');
      noStroke();
      for (const pt of window.lastLandmarks) {
        if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
          let px = 10 + pt.x * camW;
          let py = 10 + pt.y * camH;
          ellipse(px, py, 10, 10);
        }
      }
    }
    pop();
  }
  switch (gameState) {
    case 'START':
      drawStartScreen();
      if (window.visionReady) {
        gameState = 'PLAYING';
        currentStatus = 'Backend Connected Game Started';
      } else {
        currentStatus = 'Waiting for backend connection...';
      }
      break;
    case 'PLAYING':
      playGame();
      currentStatus = 'Playing';
      break;
    case 'GAME_OVER':
      drawGameOverScreen();
      currentStatus = 'Game Over';
      break;
  }
  // Update status to status-panel
  let txt = 'CurrentStatus: ' + currentStatus;
  if (typeof statusDiv !== 'undefined' && statusDiv) statusDiv.innerText = txt;
  const actionSpan = document.getElementById('current-action');
  const statusSpan = document.getElementById('current-status');
  if (actionSpan) actionSpan.textContent = window.currentAction || 'Null';
  if (statusSpan) statusSpan.textContent = currentStatus || 'Null';
}

function drawStartScreen() {
  // Background with a different gradient
  let c1 = color(10, 25, 77);    // Deep sea blue
  let c2 = color(72, 191, 160);  // Cyan green
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, i, width, i);
  }

  // Add a simple visual (e.g., a glowing effect or simple graphic)

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(80);
  text("Magic Flow", width / 2, height / 2 -20);
  textStyle(BOLD);
}

function drawGameOverScreen() {
  if (winner === null) {
    // Both players lose (nuclear ending)
    image(window.background2Img, 0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(80);
    textStyle(BOLD);
    text("You Got Nuked :(", width / 2, height / 2 - 50);
    let imgSize = 120 * CONFIG.scale;
    // Player 1 position
    push();
    translate(CONFIG.player1StartX, CONFIG.player1StartY);
    if (player1.x > width/2) scale(-1, 1);
    if (winner === player1) {
      image(window.dieImg, -imgSize/2, 0, imgSize*2, imgSize*2);
    } else {
      image(window.dieImg, -imgSize/2, 0, imgSize*2, imgSize*2);
    }
    pop();
    // Player 2 position
    push();
    translate(CONFIG.player2StartX, CONFIG.player2StartY);
    if (player2.x > width/2) scale(-1, 1);
    if (winner === player2) {
      image(window.dieImg, -imgSize/2, 0, imgSize*2, imgSize*2);
    } else {
      image(window.dieImg, -imgSize/2, 0, imgSize*2, imgSize*2);
    }
    pop();
  } else {
    // Normal ending
    let c1 = color(10, 25, 77);    // Deep sea blue
    let c2 = color(72, 191, 160);  // Cyan green
    for (let i = 0; i < height; i++) {
      let inter = map(i, 0, height, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(0, i, width, i);
    }
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(80);
    text(`${winner.name} Wins!`, width / 2, height / 2 - 50);
    textStyle(BOLD);
    // Display win/lose images at player positions
    let imgSize = 120 * CONFIG.scale;
    // Player 1 position
    push();
    translate(CONFIG.player1StartX, CONFIG.player1StartY);
    if (player1.x > width/2) scale(-1, 1);
    if (winner === player1) {
      image(window.winImg, -imgSize/2, 0, imgSize*2, imgSize*2);
    } else {
      image(window.loseImg, -imgSize/2, 0, imgSize*2, imgSize*2);
    }
    pop();
    // Player 2 position
    push();
    translate(CONFIG.player2StartX, CONFIG.player2StartY);
    if (player2.x > width/2) scale(-1, 1);
    if (winner === player2) {
      image(window.winImg, -imgSize/2, 0, imgSize*2, imgSize*2);
    } else {
      image(window.loseImg, -imgSize/2, 0, imgSize*2, imgSize*2);
    }
    pop();
  }
  
  textSize(20);
  text("Click to Restart", width / 2, height / 2 + 20);

  // Auto restart game after 5 seconds
  if (!window._autoRestartTimerSet) {
    window._autoRestartTimerSet = true;
    setTimeout(() => {
      if (gameState === 'GAME_OVER') {
        resetGame();
        window._autoRestartTimerSet = false;
      }
    }, 5000);
  }
}

function mousePressed() {
  if(gameState === 'GAME_OVER'){
    resetGame();
    window._autoRestartTimerSet = false;
  }
}

function resetGame() {
  player1 = new Player(100, CONFIG.player1StartX, CONFIG.player1StartY, false);
  player2 = new Player(100, CONFIG.player2StartX, CONFIG.player2StartY, gameMode === 'AI');
  gameState = 'PLAYING';
  winner = null;
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    player1.castSpell(new UpperAttack(player1, player2));
  } else if (keyCode === RIGHT_ARROW) {
    player1.castSpell(new LowerAttack(player1, player2));
  } else if (keyCode === UP_ARROW) {
    player1.castSpell(new UpperDefense(player1));
  } else if (keyCode === DOWN_ARROW) {
    player1.castSpell(new LowerDefense(player1));
  }
}

function playGame() {
  if (frameCount % 30 === 0) { 
    console.log(`[playGame @ frame ${frameCount}] P1 Active Spells: ${player1.activeSpells.length}`, player1.activeSpells);
  }
  player1.update();
  player2.update();

  player1.show();
  player2.show();

  player1.drawHealthBar();
  player2.drawHealthBar();

  for (let spell of player1.activeSpells) {
    spell.show();
  }
  for (let spell of player2.activeSpells) {
    spell.show();
  }

  // Ensure CONFIG.scissorsActionProbabilities exists, otherwise create default values
  if (!CONFIG.scissorsActionProbabilities) {
    CONFIG.scissorsActionProbabilities = {
      healingPulse: 1,     // Number 1 corresponds to healing skill
      meteorShower: 2,     // Number 2 corresponds to meteor shower
      sharkAttack: 3,      // Number 3 corresponds to shark attack
      ultimate: 4,         // Number 4 corresponds to ultimate skill
      entertainment: 5     // Number 5 corresponds to entertainment skill
    };
    console.log("Created default scissors gesture number mapping configuration");
  }

  // Update status panel display
  const leftHandAction = document.getElementById('left-hand-action');
  const rightHandAction = document.getElementById('right-hand-action');
  if (leftHandAction) leftHandAction.textContent = window.currentActionLeft || 'Null';
  if (rightHandAction) rightHandAction.textContent = window.currentActionRight || 'Null';

  if (gameState === 'PLAYING') {
    if (gameMode === 'AI') {
      // AI Mode: Right hand controls player1
      if (window.currentActionRight) {
        switch (window.currentActionRight) {
          case 'upperattack':
            player1.castSpell(new UpperAttack(player1, player2));
            break;
          case 'lowerattack':
            player1.castSpell(new LowerAttack(player1, player2));
            break;
          case 'upperdefense':
            player1.castSpell(new UpperDefense(player1));
            break;
          case 'lowerdefense':
            player1.castSpell(new LowerDefense(player1));
            break;
          case 'scissors':
            // Scissors gesture: Choose a skill based on random number 1-10
            const randomSkill = floor(random(1, 9)); // Generate random integer between 1-10
            console.log("Random skill number: " + randomSkill);

            // Select skill based on random number using if/else if
            if (randomSkill === 1) {
              player1.castSpell(new HealingPulse(player1));
              currentStatus = "Scissors gesture triggered: Healing Pulse";
            } else if (randomSkill === 2) {
              player1.castSpell(new MeteorShower(player1, player2));
              currentStatus = "Scissors gesture triggered: Meteor Shower";
            } else if (randomSkill === 3) {
              player1.castSpell(new SharkAttack(player1, player2));
              currentStatus = "Scissors gesture triggered: Shark Attack";
            } else if (randomSkill === 4) {
              player1.castSpell(new UltimateSpell(player1, player2));
              currentStatus = "Scissors gesture triggered: Ultimate Skill";
            } else if (randomSkill === 5) {
              player1.castSpell(new EntertainmentSpell(player1));
              currentStatus = "Scissors gesture triggered: Entertainment Skill";
            } else if (randomSkill === 6) {
              // Nuclear Bomb
              player1.castSpell(new UltimateSpell(player1, player2, 0)); // Directly pass effectType 0
              currentStatus = "Scissors gesture triggered: Nuclear Bomb";
            } else if (randomSkill === 7) {
              // Helicopter
              player1.castSpell(new UltimateSpell(player1, player2, 2)); // Directly pass effectType 2
              currentStatus = "Scissors gesture triggered: Helicopter";
            } else if (randomSkill === 8) {
              // COVID-19
              player1.castSpell(new UltimateSpell(player1, player2, 1)); // Directly pass effectType 1
              currentStatus = "Scissors gesture triggered: COVID-19";
            } else {
              // Fallback, should not be reached if randomSkill is 1-8
              console.error("Unexpected randomSkill value: " + randomSkill + ", defaulting to Entertainment.");
              player1.castSpell(new EntertainmentSpell(player1));
              currentStatus = "Scissors gesture triggered: Entertainment Skill (Fallback)";
            }
            
            console.log(currentStatus);
            // Clear energy after using scissors gesture
            player1.energy = 0;
            break;
        }
      }
      
      // AI Behavior
      if (player2.isAI) {
        // Adjust AI behavior frequency and strategy based on difficulty
        if (frameCount % 60 === 0 && random() < aiDifficulty) {
          const actions = [
            () => player2.castSpell(new UpperAttack(player2, player1)),
            () => player2.castSpell(new LowerAttack(player2, player1)),
            () => player2.castSpell(new UpperDefense(player2)),
            () => player2.castSpell(new LowerDefense(player2))
          ];
          
          // Increase attack tendency based on difficulty
          if (aiDifficulty > 0.5) {
            actions.push(() => player2.castSpell(new UpperAttack(player2, player1)));
            actions.push(() => player2.castSpell(new LowerAttack(player2, player1)));
          }
          
          // Increase attack frequency when player's health is low
          if (player1.health < 50 && aiDifficulty > 0.3) {
            actions.push(() => player2.castSpell(new UpperAttack(player2, player1)));
            actions.push(() => player2.castSpell(new LowerAttack(player2, player1)));
          }
          
          random(actions)();
        }
      }
    } else {
      // PVP Mode: Left hand controls player2, right hand controls player1
      // Handle right hand (player1)
      if (window.currentActionRight) {
        switch (window.currentActionRight) {
          case 'upperattack':
            player1.castSpell(new UpperAttack(player1, player2));
            break;
          case 'lowerattack':
            player1.castSpell(new LowerAttack(player1, player2));
            break;
          case 'upperdefense':
            player1.castSpell(new UpperDefense(player1));
            break;
          case 'lowerdefense':
            player1.castSpell(new LowerDefense(player1));
            break;
          case 'scissors':
            // Scissors gesture: Choose a skill based on random number 1-5
            const randomSkillRight = floor(random(1, 6)); // Generate random integer between 1-5
            console.log("Right hand random skill number: " + randomSkillRight);

            // Select skill based on random number using if/else if
            if (randomSkillRight === CONFIG.scissorsActionProbabilities.healingPulse) {
              player1.castSpell(new HealingPulse(player1));
              currentStatus = "Scissors gesture triggered: Healing Pulse";
            } else if (randomSkillRight === CONFIG.scissorsActionProbabilities.meteorShower) {
              player1.castSpell(new MeteorShower(player1, player2));
              currentStatus = "Scissors gesture triggered: Meteor Shower";
            } else if (randomSkillRight === CONFIG.scissorsActionProbabilities.sharkAttack) {
              player1.castSpell(new SharkAttack(player1, player2));
              currentStatus = "Scissors gesture triggered: Shark Attack";
            } else if (randomSkillRight === CONFIG.scissorsActionProbabilities.ultimate) {
              player1.castSpell(new UltimateSpell(player1, player2));
              currentStatus = "Scissors gesture triggered: Ultimate Skill";
            } else if (randomSkillRight === CONFIG.scissorsActionProbabilities.entertainment) {
              player1.castSpell(new EntertainmentSpell(player1));
              currentStatus = "Scissors gesture triggered: Entertainment Skill";
            } else {
              // Fallback, though should not be reached if randomSkillRight is 1-5
              console.error("Unexpected randomSkillRight value: " + randomSkillRight + ", defaulting to Entertainment.");
              player1.castSpell(new EntertainmentSpell(player1));
              currentStatus = "Scissors gesture triggered: Entertainment Skill (Fallback)";
            }
            
            console.log(currentStatus);
            // Clear energy after using scissors gesture
            player1.energy = 0;
            break;
        }
      }
      
      // Handle left hand (player2)
      if (window.currentActionLeft) {
        switch (window.currentActionLeft) {
          case 'upperattack':
            player2.castSpell(new UpperAttack(player2, player1));
            break;
          case 'lowerattack':
            player2.castSpell(new LowerAttack(player2, player1));
            break;
          case 'upperdefense':
            player2.castSpell(new UpperDefense(player2));
            break;
          case 'lowerdefense':
            player2.castSpell(new LowerDefense(player2));
            break;
          case 'scissors':
            // Scissors gesture: Choose a skill based on random number 1-5
            const randomSkillLeft = floor(random(1, 6)); // Generate random integer between 1-5
            console.log("Left hand random skill number: " + randomSkillLeft);

            // Select skill based on random number using if/else if
            if (randomSkillLeft === CONFIG.scissorsActionProbabilities.healingPulse) {
              player2.castSpell(new HealingPulse(player2));
              currentStatus = "Scissors gesture triggered: Healing Pulse";
            } else if (randomSkillLeft === CONFIG.scissorsActionProbabilities.meteorShower) {
              player2.castSpell(new MeteorShower(player2, player1));
              currentStatus = "Scissors gesture triggered: Meteor Shower";
            } else if (randomSkillLeft === CONFIG.scissorsActionProbabilities.sharkAttack) {
              player2.castSpell(new SharkAttack(player2, player1));
              currentStatus = "Scissors gesture triggered: Shark Attack";
            } else if (randomSkillLeft === CONFIG.scissorsActionProbabilities.ultimate) {
              player2.castSpell(new UltimateSpell(player2, player1));
              currentStatus = "Scissors gesture triggered: Ultimate Skill";
            } else if (randomSkillLeft === CONFIG.scissorsActionProbabilities.entertainment) {
              player2.castSpell(new EntertainmentSpell(player2));
              currentStatus = "Scissors gesture triggered: Entertainment Skill";
            } else {
              // Fallback, though should not be reached if randomSkillLeft is 1-5
              console.error("Unexpected randomSkillLeft value: " + randomSkillLeft + ", defaulting to Entertainment.");
              player2.castSpell(new EntertainmentSpell(player2));
              currentStatus = "Scissors gesture triggered: Entertainment Skill (Fallback)";
            }
            
            console.log(currentStatus);
            // Clear energy after using scissors gesture
            player2.energy = 0;
            break;
        }
      }
    }
  }

  // Check game over conditions
  if (player1.health <= 0 && player2.health > 0) {
    winner = player2;
    gameState = 'GAME_OVER';
  } else if (player2.health <= 0 && player1.health > 0) {
    winner = player1;
    gameState = 'GAME_OVER';
  } else if (player1.health <= 0 && player2.health <= 0) {
    winner = null;
    gameState = 'GAME_OVER';
  }
}

function checkAndAutoStartGame() {
    if (!autoStarted && webcam && webcam.video && model && webcam.video.readyState === 4) {
        // Status all OK and not auto-started
        if (gameState === 'START') {
            gameState = 'PLAYING';
            autoStarted = true;
            console.log('Game auto-started!');
        }
    }
}

function initGameModeButton() {
  const modeBtn = document.getElementById('mode-switch-btn');
  const modeDisplay = document.getElementById('game-mode');
  const difficultySlider = document.getElementById('ai-difficulty');
  const difficultyValue = document.getElementById('ai-difficulty-value');
  const difficultyContainer = document.getElementById('ai-difficulty-container');
  
  if (modeBtn) {
    modeBtn.onclick = function() {
      gameMode = gameMode === 'AI' ? 'PVP' : 'AI';
      modeDisplay.textContent = gameMode === 'AI' ? 'VS AI' : 'PVP Mode';
      // Show/hide difficulty control
      if (difficultyContainer) {
        difficultyContainer.style.display = gameMode === 'AI' ? 'block' : 'none';
      }
      resetGame();
    };
  }

  if (difficultySlider && difficultyValue) {
    difficultySlider.value = aiDifficulty;
    difficultyValue.textContent = aiDifficulty;
    difficultySlider.oninput = function() {
      aiDifficulty = parseFloat(this.value);
      difficultyValue.textContent = aiDifficulty;
    };
    // Initial show/hide state
    if (difficultyContainer) {
      difficultyContainer.style.display = gameMode === 'AI' ? 'block' : 'none';
    }
  }
}
