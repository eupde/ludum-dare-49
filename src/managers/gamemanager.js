import character from '../model/character';
import eventBus from '../util/eventbus';

const STAT_TYPES = [
    "EARTH",
    "AIR",
    "FIRE",
    "WATER"
];

class GameManager {

    constructor() {
        this.setupListeners();
    }

    setScene(scene) {
        this.mapScene = scene;
    }

    setupListeners() {
        eventBus.on("game:positionChanged", this.positionChanged.bind(this));
        eventBus.on("game:turnEnded", this.processTurn.bind(this));
    }

    positionChanged(pos, _data, name) {
        character.applyPositionChange(pos, _data, name);
        console.log(`Position changed. Now located at ${name}, entropy is now ${character.entropy}.`);
    }

    processTurn() {
        console.log(`STATS: Earth: ${character.stats["EARTH"]} Air: ${character.stats["AIR"]} FIRE: ${character.stats["FIRE"]} Water: ${character.stats["WATER"]}`)
        if(character.mapPositionName === "HOME") {
            this.applyEntropy();
            if(this.isDead()) {
                console.log("Oops, you died!");
                this.rollForPermenantStatBoost();
                this.handleDeath();
            } else {
                character.resetEntropy();
                eventBus.emit("game:enableInput");
            }
        } else {
            this.applyStatBonus();
            this.rollForChaos();
            if(this.isDead()) {
                console.log("Oops, you died!");
                this.rollForPermenantStatBoost();
                this.handleDeath();
            } else {
                if(character.entropy >= 6) {
                    console.log("Maxed out entropy, forcing home.");
                    this.forceHome();
                } else {
                    eventBus.emit("game:enableInput");
                }
            }
        }
    }

    applyStatBonus() {
        const type = character.mapPositionName;
        const extra = Phaser.Math.RND.pick([0, 0, 0, 1]);
        const quantity = 1 + extra;
        character.applyStat(type, quantity);
        console.log(`${type} increased by ${quantity}. ${type} is now ${character.stats[type]}.`);
    }

    applyEntropy() {
        for(let i = 0; i < character.entropy; i++) {
            const roll = Phaser.Math.RND.between(1, 6);
            if(roll < 5) {
                const type = STAT_TYPES[roll - 1];
                character.applyStat(type, -1);
                console.log(`Entropy rolled: ${roll}. -1 ${type}.`);
            } else {
                console.log(`Entropy rolled: ${roll}. No stat deducted.`);
            }
        }
    }

    rollForChaos() {
        const roll = Phaser.Math.RND.between(1, 10);
        if(roll <= character.entropy) {
            console.log(`Chaos HIT. Rolled ${roll}, entropy was ${character.entropy}.`);
            this.applyChaos();
        } else {
            console.log(`Chaos MISSED. Rolled ${roll}, entropy was ${character.entropy}.`);
        }
    }

    applyChaos() {
        for(let i = 0; i < 6; i++) {
            const roll = Phaser.Math.RND.between(1, 6);
            if(roll < 5) {
                const type = STAT_TYPES[roll - 1];
                character.applyStat(type, -1);
                console.log(`Chaos rolled: ${roll}. -1 ${type}.`);
            } else {
                console.log(`Chaos rolled: ${roll}. No stat deducted.`);
            }
        }
        character.resetEntropy();
    }

    isDead() {
        return character.stats["AIR"] <= 0 
        || character.stats["EARTH"] <= 0 
        || character.stats["FIRE"] <= 0 
        || character.stats["WATER"] <= 0
    }

    rollForPermenantStatBoost() {
        const roll = Phaser.Math.RND.between(1, 4);
        const type = STAT_TYPES[roll - 1];
        character.applyPermanentStatBoost(type, 1);
        console.log(`Permenant stat boost for dying: +1 ${type}.`);
    }
    
    handleDeath() {
        setTimeout(() => {
            character.resetForRound();
            this.mapScene.returnHome();
            eventBus.emit("game:enableInput");
        }, 2000);
    }

    forceHome() {
        eventBus.emit(
            "game:positionChanged",
            0,
            { x: 400, y: 300 },
            "HOME"
        );
    }

}

let gameManager = new GameManager();
export default gameManager;