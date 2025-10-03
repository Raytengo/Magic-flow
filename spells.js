function isInRange(x, y, target) {
    let targetLeft = target.x - 40;
    let targetRight = target.x + 40;
    let targetTop = target.y - 100;
    let targetBottom = target.y + 100;

    let closestX = max(targetLeft, min(x, targetRight));
    let closestY = max(targetTop, min(y, targetBottom));
    return (x - closestX) ** 2 + (y - closestY) ** 2 <= 10 ** 2;
}

class UpperAttack {
  constructor(caster, target) {
      this.x = caster.x;
      this.y = caster.y - CONFIG.playerHeight / 2 + 90;
      this.target = target;
      this.speed = target.x > caster.x ? 8 : -8;
      this.finished = false;
      this.damage = CONFIG.spellDamage.upperAttack;
  }

  update() {
      if (this.finished) return;

      this.x += this.speed;
      if (this.x < 0 || this.x > width) {
          this.finished = true;
          return;
      }

      if (isInRange(this.x, this.y, this.target)) {
          if (this.target.upperShieldActive) {
              console.log("UpperAttack blocked by UpperDefense");
              this.target.markDefenseToEnd("upper");
              this.finished = true;
          } else {
              console.log("UpperAttack hits target");
              this.target.takeDamage(this.damage);
              this.finished = true;
          }
      }
  }

  show() {
    if (typeof window.fireballImg !== 'undefined' && window.fireballImg) {
      push();
      translate(this.x, this.y);
      if (this.speed < 0) {
        scale(-1, 1);
      }
      let imgWidth = 90 * CONFIG.scale;
      let imgHeight = 50 * CONFIG.scale;
      image(window.fireballImg, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
      pop();
    } else {
      fill(255, 0, 0);
      ellipse(this.x, this.y, 20 * CONFIG.scale, 20 * CONFIG.scale);
    }
  }
}

class LowerAttack {
  constructor(caster, target) {
      this.x = caster.x;
      this.y = caster.y + CONFIG.playerHeight / 2 -100;
      this.target = target;
      this.speed = target.x > caster.x ? 6 : -6;
      this.finished = false;
      this.damage = CONFIG.spellDamage.lowerAttack;
  }

  update() {
      if (this.finished) return;

      this.x += this.speed;
      if (this.x < 0 || this.x > width) {
          this.finished = true;
          return;
      }

      if (isInRange(this.x, this.y, this.target)) {
          if (this.target.lowerShieldActive) {
              console.log("LowerAttack blocked by LowerDefense");
              this.target.markDefenseToEnd("lower");
              this.finished = true;
          } else {
              console.log("LowerAttack hits target");
              this.target.takeDamage(this.damage);
              this.finished = true;
          }
      }
  }

  show() {
    if (typeof window.spikeImg !== 'undefined' && window.spikeImg) {
      push();
      translate(this.x, this.y);
      if (this.speed < 0) {
        scale(-1, 1);
      }
      let imgWidth = 100 * CONFIG.scale;
      let imgHeight = 80 * CONFIG.scale;
      image(window.spikeImg, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
      pop();
    } else {
      fill(0, 255, 0);
      let spikeSize = 20 * CONFIG.scale;
      triangle(this.x - spikeSize/2, this.y, this.x, this.y - spikeSize, this.x + spikeSize/2, this.y);
    }
  }
}

class UpperDefense {
  constructor(caster) {
      this.target = caster;
      this.duration = 30;
      this.finished = false;
      this.type = 'upper';
  }

  update() {
      if (this.duration > 0) {
          this.duration--;
      } else {
          this.finished = true;
          this.target.upperShieldActive = false;
      }
  }

  show() {
    //   fill(100, 100, 100);
    //   ellipse(this.target.x, this.target.y - CONFIG.playerHeight / 2, 80, 80);
  }
}

class LowerDefense {
  constructor(caster) {
      this.target = caster;
      this.duration = 30;
      this.finished = false;
      this.type = 'lower';
  }

  update() {
      if (this.duration > 0) {
          this.duration--;
      } else {
          this.finished = true;
          this.target.lowerShieldActive = false;
      }
  }

  show() {
    // fill(255, 255, 0);
    // ellipse(this.target.x, this.target.y + CONFIG.playerHeight / 2, 80, 80);
  }
}

class MeteorShower {
  constructor(caster, target) {
    this.caster = caster;
    this.target = target;
    this.meteors = [];
    this.finished = false;
    this.damagePerMeteor = CONFIG.spellDamage.meteorShower.damagePerMeteor;
    this.meteorCount = CONFIG.spellDamage.meteorShower.meteorCount;
    
    // Create meteors, initial position determined by caster's position
    for (let i = 0; i < this.meteorCount; i++) {
      let startX, startY;
      if (caster.x < width/2) {
        startX = random(0, width/5);
        startY = random(0, height/4 + 100);
      } else {
        startX = random(width*4/5, width);
        startY = random(0, height/4 + 100);
      }
      
      this.meteors.push({
        x: startX,
        y: startY,
        targetX: target.x + random(-20, 20),
        targetY: target.y - CONFIG.playerHeight/2,
        speed: random(5, 10),
        active: true
      });
    }
  }

  update() {
    if (this.finished) return;

    let allFinished = true;
    
    for (let meteor of this.meteors) {
      if (!meteor.active) continue;
      
      // Calculate vector from meteor to target
      let dx = meteor.targetX - meteor.x;
      let dy = meteor.targetY - meteor.y;
      let distance = sqrt(dx*dx + dy*dy);
      
      // If distance is small, consider it reached the target
      if (distance < 50) {
        if (this.target.upperShieldActive) {
          console.log("Meteor blocked by UpperDefense");
          this.target.markDefenseToEnd("upper");
        } else {
          console.log("Meteor hits target");
          this.target.takeDamage(this.damagePerMeteor);
        }
        meteor.active = false;
      } else {
        // Move towards target
        let speed = meteor.speed;
        meteor.x += (dx/distance) * speed;
        meteor.y += (dy/distance) * speed;
        allFinished = false;
      }
    }
    
    this.finished = allFinished;
  }

  show() {
    for (let meteor of this.meteors) {
      if (!meteor.active) continue;
      
      if (typeof window.starsImg !== 'undefined' && window.starsImg) {
        push();
        translate(meteor.x, meteor.y);
        let angle = atan2(meteor.targetY - meteor.y, meteor.targetX - meteor.x);
        rotate(angle);
        let imgSize = 100 * CONFIG.scale;
        if (this.caster.x > width / 2) {
          scale(1, -1); 
        }
        image(window.starsImg, -imgSize/2, -imgSize/2, imgSize, imgSize);
        pop();
      } else {
        fill(255, 165, 0);
        let meteorSize = 20 * CONFIG.scale;
        ellipse(meteor.x, meteor.y, meteorSize, meteorSize);
      }
    }
  }
}

class SharkAttack {
  constructor(caster, target) {
    this.caster = caster;
    this.target = target;
    this.x = target.x;
    this.y = height + 50;
    this.speed = 3;
    this.finished = false;
    this.damage = CONFIG.spellDamage.sharkAttack;
  }

  update() {
    if (this.finished) return;

    this.y -= this.speed;

    if (isInRange(this.x, this.y, this.target)) {
      if (this.target.lowerShieldActive) {
        console.log("SharkAttack blocked by LowerDefense");
        this.target.markDefenseToEnd("lower");
      } else {
        console.log("SharkAttack hits target");
        this.target.takeDamage(this.damage);
      }
      this.finished = true;
    }

    if (this.y < -50) {
      this.finished = true;
    }
  }

  show() {
    if (typeof window.sharkImg !== 'undefined' && window.sharkImg) {
      push();
      translate(this.x, this.y);
      rotate(PI/2);
      let imgWidth = 100 * CONFIG.scale;
      let imgHeight = 70 * CONFIG.scale;
      image(window.sharkImg, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
      pop();
    } else {
      fill(0, 0, 255);
      let sharkSize = 30 * CONFIG.scale;
      triangle(this.x - sharkSize/2, this.y, this.x, this.y - sharkSize, this.x + sharkSize/2, this.y);
    }
  }
}

class HealingPulse {
  constructor(caster) {
    this.caster = caster;
    this.duration = CONFIG.spellDamage.healingPulse.duration;
    this.finished = false;
    this.type = 'healing';
    this.healPerFrame = CONFIG.spellDamage.healingPulse.healPerFrame;
  }

  update() {
    if (this.duration > 0) {
      this.duration--;
      // Restore health each frame
      this.caster.health = min(this.caster.maxHealth, this.caster.health + this.healPerFrame);
    } else {
      this.finished = true;
      this.caster.healingActive = false;
    }
  }

  show() {
    // Healing effect will be shown in Player class's show method
  }
}

class EntertainmentSpell {
  constructor(caster) {
    this.caster = caster;
    this.duration = 180;  // 3 seconds = 180 frames
    this.finished = false;
    this.effectType = 0;  // 0: Taunt expression
    // Randomly select an expression image
    const smileImgs = [window.smileImg, window.smile2Img, window.smile3Img, window.smile4Img, window.smile5Img];
    this.smileImg = smileImgs[Math.floor(random(smileImgs.length))];
  }

  update() {
    if (this.finished) return;
    this.duration--;
    if (this.duration <= 0) {
      this.finished = true;
    }
  }

  show() {
    if (this.effectType === 0) { // Taunt
      push();
      let smileSize = 100 * CONFIG.scale;
      // Flip based on caster's position
      translate(this.caster.x, this.caster.y - CONFIG.playerHeight/2 - smileSize - 10 * CONFIG.scale + 90);
      if (this.caster.x < width / 2) {
        scale(-1, 1); // Flip for right player
      }
      image(this.smileImg, -smileSize/2, 0, smileSize, smileSize);
      pop();
    }
  }
}

class UltimateSpell {
    constructor(caster, target, _effectType = null) {
        this.caster = caster;
        this.target = target;
        this.effectType = (_effectType !== null) ? _effectType : floor(random(3));
        this.damage = 0;
        this.poisonDamage = CONFIG.spellDamage.ultimate.covid19;
        this.originalBackground = window.backgroundImg;
        
        switch(this.effectType) {
            case 0: // Nuclear bomb
                this.duration = 600;
                this.bombSpeed = 2;
                this.damage = CONFIG.spellDamage.ultimate.nuclearBomb;
                this.bombExploded = false;
                this.bombExplosionTimer = 0; // Explosion timer
                break;
            case 1: // COVID-19
                this.duration = 300;
                break;
            case 2: // Helicopter
                this.duration = 180;
                this.damage = CONFIG.spellDamage.ultimate.helicopter;
                break;
            default:
                this.duration = 300;
        }
        
        this.finished = false;
        
        // Nuclear bomb related properties
        this.bombY = 0;
        // Helicopter related properties
        this.planeX = width/2;
        this.planeY = 0;
        this.planeSpeed = 5;
        this.planeHit = false;
        this.planeAngle = 0;
    }

    update() {
        if (this.duration > 0) {
            this.duration--;
            switch(this.effectType) {
                case 0: // Nuclear bomb
                    if (!this.bombExploded) {
                        this.bombY += this.bombSpeed;
                        if (this.bombY >= height/1.32) {
                            this.bombExploded = true;
                            this.bombExplosionTimer = 60; // Explosion lasts 1 second
                            if (player1.health > 0 && player2.health > 0) {
                                player1.takeDamage(100);
                                player2.takeDamage(100);
                            }
                            window.backgroundImg = window.background2Img; // Change background when explosion starts
                        }
                    } else if (this.bombExplosionTimer > 0) {
                        this.bombExplosionTimer--;
                        if (this.bombExplosionTimer === 0) { // When explosion animation finishes
                            // Now set game over if players were damaged to 0 or by rule of nuke
                            gameState = 'GAME_OVER';
                            winner = null; // Or determine winner based on who has health left if any
                        }
                    }
                    break;
                case 1: // Virus
                    this.target.takeDamage(this.poisonDamage);
                    break;
                case 2: // Helicopter
                    if (!this.planeHit) {
                        let dx = this.target.x - this.planeX;
                        let dy = this.target.y - this.planeY;
                        let distance = sqrt(dx*dx + dy*dy);
                        if (distance < 50) {
                            this.planeHit = true;
                            this.target.takeDamage(30);
                            this.duration = 30;
                        } else {
                            this.planeX += (dx/distance) * this.planeSpeed;
                            this.planeY += (dy/distance) * this.planeSpeed;
                            this.planeAngle = atan2(dy, dx);
                        }
                    }
                    break;
            }
        } else {
            // Handle end logic for non-nuclear types
            if (this.effectType !== 0) {
                this.finished = true;
            } else if (this.effectType === 0 && this.bombExploded && this.bombExplosionTimer === 0) {
                // Nuclear explosion animation ends, and gameState is already GAME_OVER by now.
                // Mark skill as finished to be removed from active spells list.
                this.finished = true;
            }
        }
    }

    show() {
        console.log(`[UltimateSpell.show] CALLED. effectType: ${this.effectType}, duration: ${this.duration}, finished: ${this.finished}, target:`, this.target);
        switch(this.effectType) {
            case 0: // Nuclear bomb
                console.log(`[UltimateSpell.show] Case 0 (Bomb). bombExploded: ${this.bombExploded}, explosionTimer: ${this.bombExplosionTimer}, bombImg:`, window.bombImg, `, plane2Img:`, window.plane2Img);
                if (!this.bombExploded) {
                    push();
                    translate(CONFIG.canvasWidth/2, this.bombY);
                    let bombSize = 150 * CONFIG.scale;
                    console.log(`[UltimateSpell.show] Case 0 - Drawing bomb. Y: ${this.bombY}, Size: ${bombSize}`);
                    image(window.bombImg, -bombSize/2, -bombSize/2, bombSize, bombSize);
                    pop();
                } else if (this.bombExplosionTimer > 0) {
                    // Show larger explosion image plane2Img
                    push();
                    translate(CONFIG.canvasWidth/2, height/1.32);
                    let planeSize = 350 * CONFIG.scale;
                    console.log(`[UltimateSpell.show] Case 0 - Drawing explosion. Y: ${height/1.32}, Size: ${planeSize*2}`);
                    image(window.plane2Img, -planeSize/2, -planeSize/2, planeSize*2, planeSize*2);
                    pop();
                }
                break;
            case 1: // Virus
                console.log(`[UltimateSpell.show] Case 1 (Virus). target:`, this.target, `, poisonImg:`, window.poisonImg);
                push();
                fill(0, 255, 0);
                textSize(24 * CONFIG.scale);
                textAlign(CENTER);
                console.log(`[UltimateSpell.show] Case 1 - Drawing text/img for target: ${this.target ? this.target.x : 'No Target'}`);
                text("POISONED", this.target.x, this.target.y - 120 * CONFIG.scale);
                image(window.poisonImg, this.target.x, this.target.y - 200 * CONFIG.scale, 200, 100);
                pop();
                break;
            
            case 2: // Helicopter
              console.log(`[UltimateSpell.show] Case 2 (Heli). planeHit: ${this.planeHit}, X: ${this.planeX}, Y: ${this.planeY}, planeImg:`, window.planeImg, `, plane2Img:`, window.plane2Img);
              push(); 
              translate(this.planeX, this.planeY);
              rotate(this.planeAngle);
              if (this.caster.x > width / 2) {
                  scale(1, -1); 
              }
              
              if (this.planeHit) {
                  let planeSize = 200 * CONFIG.scale;
                  console.log(`[UltimateSpell.show] Case 2 - Drawing plane hit. X: ${this.planeX}, Size: ${planeSize}`);
                  image(window.plane2Img, -planeSize/2, -planeSize/2, planeSize, planeSize);
              } else {
                  let planeSize = 140 * CONFIG.scale;
                  console.log(`[UltimateSpell.show] Case 2 - Drawing plane. X: ${this.planeX}, Size: ${planeSize}`);
                  image(window.planeImg, -planeSize/2, -planeSize/2, planeSize, planeSize);
              }
              pop(); 
              break;
        }
    }
}
