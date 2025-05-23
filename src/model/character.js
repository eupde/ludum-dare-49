import eventBus from '../util/eventbus';

const BASE_STAT = 2;
export const STAT_TYPES = ['EARTH', 'AIR', 'FIRE', 'WATER'];

class Character {
    constructor() {
        this.stats = {
            EARTH: BASE_STAT,
            AIR: BASE_STAT,
            FIRE: BASE_STAT,
            WATER: BASE_STAT,
        };

        this.permanentStatBoosts = {
            EARTH: 0,
            AIR: 0,
            FIRE: 0,
            WATER: 0,
        };

        this.deathCount = 0;
        
        this.entropyCapacity = 5;

        this.entropy = 0;
        this.mapPosition = 0;
        this.mapPositionName = 'HOME';
    }

    applyPositionChange(pos, _data, name) {
        if (name !== 'HOME') {
            if (this.mapPosition === 0 || pos === 0) {
                this.entropy = Phaser.Math.Clamp(this.entropy + 1, 0, this.entropyCapacity);
            } else if (Math.abs(this.mapPosition - pos) === 2) {
                this.entropy = Phaser.Math.Clamp(this.entropy + 2, 0, this.entropyCapacity);
            } else {
                this.entropy = Phaser.Math.Clamp(this.entropy + 1, 0, this.entropyCapacity);
            }
            eventBus.emit('game:entropyUpdated');
        }
        this.mapPosition = pos;
        this.mapPositionName = name;
    }

    applyStat(stat, quantity) {
        this.stats[stat] += quantity;
        eventBus.emit('game:statsUpdated');
    }

    applyPermanentStatBoost(stat, quantity) {
        this.permanentStatBoosts[stat] += quantity;
    }

    applyRndBane() {
        this.entropyCapacity += Phaser.Math.RND.pick([-1, 1]);
    }

    applyRndBoon() {
        let stat = Phaser.Math.RND.pick(Object.keys(this.stats));
        this.applyPermanentStatBoost(stat, Phaser.Math.RND.pick([1, 2]));
    }

    randomBoonOrBane() {
        let baneOrBoon = Phaser.Math.RND.pick([this.applyRndBane, this.applyRndBoon]);
        baneOrBoon.call(this);
        eventBus.emit('game:entropyUpdated');
    }

    resetCurrentEntropy() {
        this.entropy = 0;
        eventBus.emit('game:entropyUpdated');
    }

    resetForRound() {
        STAT_TYPES.forEach((type) => {
            this.stats[type] = BASE_STAT + this.permanentStatBoosts[type];
        });

        this.deathCount += 1;
        this.entropy = 0;

        this.mapPosition = 0;
        this.mapPositionName = 'HOME';

        eventBus.emit('game:roundReset');
    }
}

let character = new Character();
export default character;
