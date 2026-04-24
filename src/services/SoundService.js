const sounds = {
    correct: new Audio('/sounds/correct.mp3'),
    incorrect: new Audio('/sounds/incorrect.mp3'),
    incorrect2: new Audio('/sounds/incorrect2.mp3')
}


export const SoundService = {

    play(name) {
        const audio = sounds[name];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(err => console.warn("Audio bloqueado por el navegador:", err));
        }
    }
}

