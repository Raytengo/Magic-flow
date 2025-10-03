// This file contains the Player class

class Player {
  constructor(health, x, y, isAI = false) {
    this.health = health;
    this.maxHealth = health;
    this.x = x;
    this.y = y;
    this.activeSpells = [];
    this.isAI = isAI;
    this.upperShieldActive = false; 
    this.lowerShieldActive = false; 
    this.healingActive = false;
    this.entertainmentActive = false; 
    this.energy = 0;  // Current energy value
    this.lastHealth = health;  // Used to track health changes
   
    if (x < 500) {
      this.name = "Player1";
    } else {
      this.name = "Player2";
    }
    this.upperDefenseToEnd = false; 
    this.lowerDefenseToEnd = false; 
    this.state = "standing"; // standing, crouching, jumping, up_attack, down_attack
    this.attackFrameCounter = 0; // Remaining frames for attack animation
    this.cooldownTimer = 0; // Cooldown timer (in frames)
    this.isInCooldown = false; 
  }

  drawHealthBar() {
    let healthPercentage = this.health / this.maxHealth; 
    let healthColor = this.isAI ? color(255, 0, 0) : (this.x < 500 ? color(0, 200, 0) : color(0, 200, 0));
    let backgroundColor = color(200);
    let barX = this.x < 500 ? 20 : width - CONFIG.healthBarWidth - 20;
    let barWidth = CONFIG.healthBarWidth;
    let barHeight = CONFIG.healthBarHeight;
    let cornerRadius = 8; 

    // Background health bar 
    fill(backgroundColor);
    noStroke(); 
    rect(barX, 20, barWidth, barHeight, cornerRadius);

    // Actual health bar with rounded corners
    fill(healthColor);
    noStroke(); 
    rect(barX, 20, max(0, barWidth * healthPercentage), barHeight, cornerRadius);

    // Text showing health value
    fill(0); 
    textSize(16); 
    textAlign(CENTER, CENTER);
    text(`HP : ${Math.floor(this.health)}`, barX + barWidth / 2, 20 + barHeight / 2);

    // Draw energy bar
    let energyBarY = 20 + barHeight + 10;  // Energy bar position below health bar
    let energyPercentage = this.energy / CONFIG.maxEnergy;
    
    // // Energy bar background
    // fill(backgroundColor);
    // noStroke();
    // rect(barX, energyBarY, barWidth, CONFIG.energyBarHeight, cornerRadius);
    
    // // Energy bar
    // let energyColor = (this.energy >= CONFIG.maxEnergy) ? color(255,0,0) : color(255, 215, 0); // Red when full (100), otherwise gold
    // fill(energyColor);
    // noStroke();
    // rect(barX, energyBarY, max(0, barWidth * energyPercentage), CONFIG.energyBarHeight, cornerRadius);
    
    // // Energy bar text
    // fill(0);
    // textSize(14);
    // textAlign(CENTER, CENTER);
    // text(`Energy : ${Math.floor(this.energy)}`, barX + barWidth / 2, energyBarY + CONFIG.energyBarHeight / 2);
  }

  show() {
    let playerWidth = CONFIG.playerWidth;
    let playerHeight = CONFIG.playerHeight;
    let cornerRadius = 6;

    // State images take priority
    let img = null;
    // Determine image based on state
    if (this.state === "standing") {
      img = window.standingImg;
    } else if (this.state === "crouching") {
      img = window.crouchingImg;
    } else if (this.state === "jumping") {
      img = window.jumpingImg;
    } else if (this.state === "up_attack") {
      img = window.upAttImg;
    } else if (this.state === "down_attack") {
      img = window.downAttImg;
    } else if (this.healingActive) {
      img = window.cureImg; 
    } else if (this.entertainmentActive) {
      for (let spell of this.activeSpells) {
        if (spell instanceof EntertainmentSpell && spell.effectType === 1 && spell.ani===0) {
          img = window.animal1Img;
          break;
        }
        else if (spell instanceof EntertainmentSpell && spell.effectType === 1 && spell.ani===1) {
          img = window.animal2Img;
          break;
        }
      }
    }

    // Fallback if no image is available
    push();
    translate(this.x, this.y);

    if (img) {
      // Only flip when not drawing healing image
      if (img !== window.cureImg && this.x >= width / 2) {
        scale(-1, 1);
      }
      image(img, -playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);
    } else {
      img = window.standingImg;
      image(img, -playerWidth / 2, -playerHeight / 2, playerWidth, playerHeight);
    }
    pop(); 
  }

  update() {
    // Update Cooldown Status
    if (this.isInCooldown) {
      this.cooldownTimer--;
      if (this.cooldownTimer <= 0) {
        this.isInCooldown = false;
      }
    }

    // Handle Player Input (Only for Player1)
    if (this.x < width/2) { 
      if (keyIsPressed) {
        if (key === 'w' || key === 'W') {
          this.castSpell(new UpperAttack(this, this.x < width/2 ? player2 : player1));
        } else if (key === 's' || key === 'S') {
          this.castSpell(new LowerAttack(this, this.x < width/2 ? player2 : player1));
        } else if (key === 'q' || key === 'Q') {
          this.castSpell(new UpperDefense(this));
        } else if (key === 'e' || key === 'E') {
          this.castSpell(new LowerDefense(this));
        } else if (key === 't' || key === 'T') {
          this.castSpell(new HealingPulse(this));
        } else if (key === 'r' || key === 'R') {
          this.castSpell(new EntertainmentSpell(this));
        } else if (key === 'a' || key === 'A') {
          this.castSpell(new MeteorShower(this, this.x < width/2 ? player2 : player1));
        } else if (key === 'b' || key === 'B') {
          this.castSpell(new SharkAttack(this, this.x < width/2 ? player2 : player1));
        } else if (key === 'u' || key === 'U') { 
          if (this.health <= CONFIG.exe) { 
            this.castSpell(new UltimateSpell(this, this.x < width/2 ? player2 : player1));
          }
        }
      }
    }

    // Update Active Spells
    for (let i = this.activeSpells.length - 1; i >= 0; i--) {
      let spell = this.activeSpells[i];
      // console.log(`[Player.update] ${this.name} updating spell: ${spell.constructor.name}, finished: ${spell.finished}, duration: ${spell.duration}`); // Can be too verbose
      spell.update(); // Update individual spell logic (movement, timer, collision checks)
      if (spell.finished) {
        console.log(`[Player.update] ${this.name} removing FINISHED spell: ${spell.constructor.name} (effectType: ${spell.effectType})`);
        if (spell instanceof UpperDefense) {
           this.upperShieldActive = false; // Ensure shield flag is turned off
        } else if (spell instanceof LowerDefense) {
           this.lowerShieldActive = false; // Ensure shield flag is turned off
        } else if (spell instanceof HealingPulse) {
          this.healingActive = false;
        } else if (spell instanceof EntertainmentSpell) {
          this.entertainmentActive = false;
        }
        // Remove the finished spell from the active list
        this.activeSpells.splice(i, 1);
        console.log(`[Player.update] ${this.name} spell removed. Active spells count: ${this.activeSpells.length}`);
      }
    }

    // Update Player State based on current conditions
    // Attack animations take priority if active
    if (this.attackFrameCounter > 0) {
      this.attackFrameCounter--;
    } else {
      if (this.healingActive) {
        this.state = "healing"; 
      } else if (this.upperShieldActive) {
        this.state = "crouching"; 
      } else if (this.lowerShieldActive) {
        this.state = "jumping";
      } else if (this.entertainmentActive) {
        for (let spell of this.activeSpells) {
          if (spell instanceof EntertainmentSpell && spell.effectType === 1) {
            this.state = "animal";
            break;
          }
        }
      } else {
        // If no attack animation and no active shields, default to standing
         // Check if the state was previously an attack state and reset it
         if (this.state === "up_attack" || this.state === "down_attack") {
             this.state = "standing";
         }
         if (!this.upperShieldActive && !this.lowerShieldActive && !this.healingActive && !this.entertainmentActive) {
             this.state = "standing";
         }
      }
    }


    // Handle Delayed Defense End (If markDefenseToEnd was used)
    if (this.upperDefenseToEnd) {
      this.endDefense("upper");
      this.upperDefenseToEnd = false; 
    }
    if (this.lowerDefenseToEnd) {
      this.endDefense("lower");
      this.lowerDefenseToEnd = false; 
    }

    //  AI Behavior (If applicable)
    // if (this.isAI) {
    //   this.aiBehavior(); // AI logic would call castSpell
    // }
  }

  // --- AI Behavior Placeholder ---
  // aiBehavior() {
  //   // AI decision-making logic goes here
  //   // Example: Randomly choose an action if not in cooldown
  //   if (!this.isInCooldown && random(1) < 0.02) { // Example trigger condition
  //     let spellToCast = null;
  //     let opponent = (this.name === "Player1") ? player2 : player1; // Determine opponent
  //
  //     // Simple AI logic (can be much more complex)
  //     const spellTypes = [UpperAttack, LowerAttack, UpperDefense, LowerDefense, MeteorShower, SharkAttack];
  //     const SpellClass = random(spellTypes); // Choose a random spell type
  //
  //     // Need to handle spells requiring a target vs. self-cast
  //     if (SpellClass === UpperDefense || SpellClass === LowerDefense) {
  //        spellToCast = new SpellClass(this);
  //     } else if (opponent) { // Check if opponent exists
  //        spellToCast = new SpellClass(this, opponent);
  //     }
  //
  //     if (spellToCast) {
  //       this.castSpell(spellToCast); // Cast the chosen spell (will trigger cooldown)
  //     }
  //   }
  // }
  // --- End AI Behavior ---


  // --- Cooldown Management ---
  
  startCooldown() {
    this.isInCooldown = true;
    this.cooldownTimer = CONFIG.spellCooldown; 
  }

  // --- Spell Casting ---
  castSpell(spell) {
    // 1. Check if player is currently in cooldown
    if (this.isInCooldown) {
      console.log(`[Player.castSpell] ${this.name} attempt to cast ${spell.constructor.name} - BLOCKED BY COOLDOWN`);
      return; 
    }

    // 2. If it's an ultimate spell, check if energy is sufficient
    if (spell instanceof UltimateSpell) {
      console.log(`[Player.castSpell] ${this.name} attempting UltimateSpell. Current Energy: ${this.energy}, Required: ${CONFIG.maxEnergy}`);
      if (this.energy < CONFIG.maxEnergy) {
        console.log(`[Player.castSpell] ${this.name} - UltimateSpell BLOCKED - Not enough energy.`);
        return;  // Not enough energy to cast ultimate
      }
      this.energy = 0;  // Clear energy after using ultimate
      console.log(`[Player.castSpell] ${this.name} - UltimateSpell energy consumed.`);
    }

    // 3. Check for conflicting actions (e.g., cannot attack while defending)
    // Check conflicts between defense spells
    if ((spell instanceof HealingPulse) && 
        (this.upperShieldActive || this.lowerShieldActive || this.healingActive)) {
      return; // Cannot use new defense spell if any defense spell is active
    }

    // 4. Add the spell to the active list
    this.activeSpells.push(spell);
    console.log(`[Player.castSpell] ${this.name} cast ${spell.constructor.name}. Active spells count: ${this.activeSpells.length}`, this.activeSpells);

    // 5. Set immediate player states/flags related to the spell
    if (spell instanceof UpperDefense) {
      this.upperShieldActive = true;
    } else if (spell instanceof LowerDefense) {
      this.lowerShieldActive = true;
    } else if (spell instanceof HealingPulse) {
      this.healingActive = true;
    } else if (spell instanceof EntertainmentSpell) {
      this.entertainmentActive = true;
      if (spell.effectType === 1) { // Costume change
        this.state = "animal";
      }
    } else if (spell instanceof UpperAttack || spell instanceof MeteorShower) {  // Meteor shower uses upper attack animation
      this.state = "up_attack";
      this.attackFrameCounter = CONFIG.attackAnimDuration || 60; 
    } else if (spell instanceof LowerAttack || spell instanceof SharkAttack) {  // Shark attack uses lower attack animation
      this.state = "down_attack";
      this.attackFrameCounter = CONFIG.attackAnimDuration || 60; 
    }

    // 6. Start the global cooldown **after** successfully casting
    this.startCooldown();
  }

  // --- Damage & Defense Handling ---
  takeDamage(amount) {
    let oldHealth = this.health;
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0; 
    }
    
    // Add fixed energy value each time damage is taken
    if (oldHealth > this.health) {
      this.energy = min(CONFIG.maxEnergy, this.energy + CONFIG.energyGainOnHit);
    }
  }

  // Call this method if an external event needs to prematurely end a defense spell
  markDefenseToEnd(defenseType) {
    if (defenseType === "upper") {
      this.upperDefenseToEnd = true; 
    } else if (defenseType === "lower") {
      this.lowerDefenseToEnd = true;
    }
  }

  endDefense(defenseType) {
    for (let i = this.activeSpells.length - 1; i >= 0; i--) {
      let spell = this.activeSpells[i];
      if (defenseType === "upper" && spell instanceof UpperDefense) {
        if (!spell.finished) { 
           spell.finished = true;
           this.upperShieldActive = false;
           break;
        }
      } else if (defenseType === "lower" && spell instanceof LowerDefense) {
         if (!spell.finished) {
           spell.finished = true;
           this.lowerShieldActive = false;
           break;
         }
      }
    }
    // Ensure flags are reset even if no matching spell was found active
    if (defenseType === "upper") this.upperShieldActive = false;
    if (defenseType === "lower") this.lowerShieldActive = false;

  }

}