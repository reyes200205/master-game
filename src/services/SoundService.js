const cloneable = {
    correct: new Audio('/sounds/correct.mp3'),
    incorrect: new Audio('/sounds/incorrect.mp3'),
    incorrect2: new Audio('/sounds/incorrect2.mp3'),
    incorrect3: new Audio('/sounds/incorrect3.mp3'),
    winner: new Audio('/sounds/winner.mp3'),
    winner2: new Audio('/sounds/winner2.mp3'),
    count: new Audio('/sounds/count.mp3'),
};

const persistent = {
    tictac: new Audio('/sounds/tictac.mp3'),
    tictac2: new Audio('/sounds/tictac2.mp3'),
};

persistent.tictac.loop = true;
persistent.tictac2.loop = true;

export const SoundService = {
    setRate(name, rate) {
        const audio = persistent[name];
        if (!audio) return;
        audio.playbackRate = rate;
    },
    play(name) {
        if (persistent[name]) {
            const audio = persistent[name];
            audio.currentTime = 0;
            audio.play().catch(err => console.warn('Audio bloqueado:', err));
            return;
        }
        if (cloneable[name]) {
            const clone = cloneable[name].cloneNode();
            clone.play().catch(err => console.warn('Audio bloqueado:', err));
        }
    },
    stop(name) {
        const audio = persistent[name];
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
    },
};