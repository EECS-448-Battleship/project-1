/**
 * A thin wrapper for sound effects.
 */
class Sound {
    /**
     * Construct the sound.
     * @param {string} src - URL of the file
     */
    constructor(src) {
        /**
         * The sound element.
         * @type {HTMLAudioElement}
         */
        this.sound = document.createElement('audio')
        this.sound.src = src
        this.sound.setAttribute('preload', 'auto')
        this.sound.setAttribute('controls', 'none')
        this.sound.style.display = 'none'

        document.body.appendChild(this.sound)
    }

    /**
     * Start playing the sound.
     */
    play() {
        this.sound.play()
    }

    /**
     * Pause the sound.
     */
    stop() {
        this.sound.pause()
    }
}

const GameSounds = {
    Victory: new Sound('/lib/sounds/cartoon_success_fanfair.mp3'),
    Fire: new Sound('/lib/sounds/zapsplat_warfare_mortar_projectile_launch_002_25232.mp3'),
    Hit: new Sound('/lib/sounds/zapsplat_warfare_bomb_whizz_in_hit_close_by_explosion_med_003_48060.mp3'),
    Miss: new Sound('/lib/sounds/zapsplat_nature_water_pour_medium_amount_deep_sudden_fast_002_52765.mp3'),
}


export { GameSounds }
