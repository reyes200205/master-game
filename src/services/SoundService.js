const sounds = {
    correct: new Audio('/sounds/correct.mp3'),
    incorrect: new Audio('/sounds/incorrect.mp3'),
    incorrect2: new Audio('/sounds/incorrect2.mp3'),
    incorrect3: new Audio('/sounds/incorrect3.mp3'),
    winner : new Audio('/sounds/winner.mp3'),
    winner2 : new Audio('/sounds/winner2.mp3'),
    count: new Audio('/sounds/count.mp3'),
}

export const SoundService = {
    play(name) {
        const audio = sounds[name];
        if (!audio) return;

        // Clona el audio para permitir reproducción simultánea y reinicio limpio
        const clone = audio.cloneNode();
        clone.play().catch(err => console.warn("Audio bloqueado por el navegador:", err));
    }
}