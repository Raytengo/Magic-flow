let scales = 1.6;
const CONFIG = {
    // Canvas size configuration
    canvasWidth: 1600,    
    canvasHeight: 900,
    scale: scales,          

    // Player configuration
    playerWidth: 180 * 2,    
    playerHeight: 200 * 2,  
    player1StartX: 100 * scales,  
    player1StartY: 400 * scales,  
    player2StartX: 900 * scales,  
    player2StartY: 400 * scales,  

    // UI configuration
    healthBarWidth: 400 * scales,    
    healthBarHeight: 30 * scales,    
    energyBarHeight: 20 * scales,   
    ultimateEnergyThreshold: 0,  
    maxEnergy: 0,               
    energyGainOnHit: 0,

    // Scissors gesture configuration
    scissorsActionProbabilities: {
        healingPulse: 1,     // Healing skill probability
        meteorShower: 2,     // Meteor shower skill probability
        sharkAttack: 3,      // Shark attack probability
        entertainment: 4,     // Entertainment skill probability
        ultimate: 5,
    },
    
    attackAnimDuration: 60,
    spellCooldown: 50,
    exe: 100,
    
    // Spell damage configuration
    spellDamage: {
        upperAttack: 10,
        lowerAttack: 10,
        meteorShower: {
            damagePerMeteor: 0.5,
            meteorCount: 20
        },
        sharkAttack: 3,
        healingPulse: {
            healPerFrame: 0.2,
            duration: 150
        },
        ultimate: {
            nuclearBomb: 100,
            covid19: 0.1,
            helicopter: 30
        }
    }
};
