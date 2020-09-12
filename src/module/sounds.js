function sound(src) {
    
    this.sound = document.createElement("audio");
    
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
    
}

const GameSounds = {
    Victory: new sound("/lib/sounds/cartoon_success_fanfair.mp3"),
    Fire: new sound("/lib/sounds/zapsplat_warfare_mortar_projectile_launch_002_25232.mp3"),
    Hit: new sound("/lib/sounds/zapsplat_warfare_bomb_whizz_in_hit_close_by_explosion_med_003_48060.mp3"),
    Miss: new sound("/lib/sounds/zapsplat_nature_water_pour_medium_amount_deep_sudden_fast_002_52765.mp3"),
}


export{
    GameSounds
}