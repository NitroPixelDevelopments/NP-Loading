class MediaPlayer {
    constructor() {
        this.audio = new Audio('assets/audio/background.mp3');
        this.isPlaying = false;
        this.setupControls();
    }

    setupControls() {
        const toggleButton = document.getElementById('toggleMusic');
        const volumeSlider = document.getElementById('volumeControl');
        
        toggleButton.addEventListener('click', () => this.togglePlay());
        volumeSlider.addEventListener('input', (e) => this.updateVolume(e.target.value));
        
        // Initialize volume
        this.updateVolume(volumeSlider.value);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
    }

    updateVolume(value) {
        this.audio.volume = value / 100;
        document.querySelector('.volume-value').textContent = `${value}%`;
    }

    updatePlayButton() {
        const icon = document.querySelector('#toggleMusic i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const mediaPlayer = new MediaPlayer();
});
