
class LoadingScreen {
    constructor() {
        console.log('LoadingScreen constructor called');
        if (!window.CONFIG) {
            console.error('CONFIG not loaded properly');
            return;
        }
        this.config = window.CONFIG;
        this.progress = 0;
        this.isLoading = false;
        this.loadingStages = [
            'Initializing...',
            'Loading assets...',
            'Connecting to server...',
            'Preparing environment...',
            'Almost ready...'
        ];
        
        this.setupElements();
        this.initializeComponents();
        this.setupRandomBackgrounds();
    }
    setupElements() {
        // First verify all elements exist
        const elements = {
            progress: document.querySelector('.progress'),
            container: document.querySelector('.loading-container'),
            barFill: document.querySelector('.loading-bar-fill'),
            message: document.querySelector('.loading-message'),
            tips: document.querySelector('.loading-tips'),
            logo: document.querySelector('.logo img'),
            discord: document.querySelector('.discord'),
            website: document.querySelector('.website')
        };

        // Log which elements were found for debugging
        console.log('Found elements:', elements);

        this.elements = elements;

        // Initialize visual elements
        document.title = this.config.server.name;
        
        // Set theme colors
        const root = document.documentElement;
        root.style.setProperty('--primary-color', this.config.visual.primaryColor);
        root.style.setProperty('--secondary-color', this.config.visual.secondaryColor);
    }

    initializeComponents() {
        // Simplified version with only working components
        try {
            this.components = {
                serverStats: new ServerStats(),
                eventTicker: new EventTicker()
            };
        } catch (error) {
            console.error('Failed to initialize components:', error);
        }
    }

    start() {
        // Add element existence check
        if (!this.elements || !this.elements.container) {
            console.log('Required elements not found. Check your HTML classes.');
            return;
        }

        this.progress = 0;
        this.isLoading = true;
        this.elements.container.style.display = 'block';
        this.elements.barFill.style.width = '0%';
        this.updateTips();
        
        if (!window.invokeNative) {
            this.simulateLoading();
        }
    }    setupRandomBackgrounds() {
        // Check if config and visual properties exist
        if (!this.config?.visual?.backgrounds) {
            // Set a default background if none provided
            document.body.style.backgroundImage = `url('assets/default-bg.jpg')`;
            return;
        }

        setInterval(() => {
            const backgrounds = this.config.visual.backgrounds;
            const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            document.body.style.backgroundImage = `url(${randomBg})`;
        }, this.config.visual.backgroundChangeInterval || 5000);
    }

    start() {
        this.progress = 0;
        this.isLoading = true;
        this.elements.container.style.display = 'block';
        this.elements.barFill.style.width = '0%';
        this.updateTips();
        
        // Only use simulateLoading for development/testing
        if (!window.invokeNative) {
            this.simulateLoading();
        }
    }

    updateTips() {
        if (!this.config.features.enableTips) return;
  
        const tipInterval = setInterval(() => {
            if (!this.isLoading) {
                clearInterval(tipInterval);
                return;
            }
            const randomTip = this.config.messages.tips[
                Math.floor(Math.random() * this.config.messages.tips.length)
            ];
            this.elements.tips.textContent = randomTip;
        }, 3000);
    }

    simulateLoading() {
        const interval = setInterval(() => {
            if (this.progress < 100) {
                this.progress += Math.random() * 5;
                if (this.progress > 100) this.progress = 100;
                this.updateProgress(this.progress);
            } else {
                clearInterval(interval);
                this.complete();
            }
        }, 200);
    }

    updateProgress(value) {
        const roundedProgress = Math.min(Math.round(value), 100);
        this.elements.progress.textContent = `${roundedProgress}%`;
        this.elements.barFill.style.width = `${roundedProgress}%`;
        this.updateLoadingStage(roundedProgress);
    }

    updateLoadingStage(progress) {
        const stageIndex = Math.floor((progress / 100) * this.loadingStages.length);
        const currentStage = this.loadingStages[Math.min(stageIndex, this.loadingStages.length - 1)];
        this.elements.message.textContent = currentStage;
    }

    complete() {
        this.isLoading = false;
        this.elements.message.textContent = "Welcome to County Road RP!";
        
        setTimeout(() => {
            this.elements.container.style.opacity = '0';
            setTimeout(() => {
                this.elements.container.style.display = 'none';
            }, 1000);
        }, 1000);
    } // Add closing brace here
} // Add closing brace for LoadingScreen class

// Rest of your classes (ServerStats, EventTicker)
class ServerStats {
        constructor() {
            this.setupElements();
            this.serverIP = "147.189.172.240:30120";
            this.updateInterval = 5000;
            this.stats = {
                players: 0,
                maxPlayers: 0,
                queue: 0,
                fps: 0,
                uptime: 0,
                lastUpdate: null
            };
            this.startUpdates();
        }

        setupElements() {
            this.elements = {
                playerCount: document.getElementById('playerCount'),
                queueCount: document.getElementById('queueCount'),
                serverFPS: document.getElementById('serverFPS'),
                serverStatus: document.getElementById('serverStatus'),
                onlineStatus: document.querySelector('.online-status'),
                playerList: document.getElementById('playerList')
            };
        
            // Set initial values
            this.elements.playerCount.textContent = '0/0';
            this.elements.queueCount.textContent = '0';
            this.elements.serverFPS.textContent = '0';
            this.updateServerStatus(false);
        }

        updateServerStatus(isOnline) {
            if (isOnline) {
                this.elements.onlineStatus.className = 'online-status status-online';
                this.elements.serverStatus.textContent = 'Online';
            } else {
                this.elements.onlineStatus.className = 'online-status status-offline';
                this.elements.serverStatus.textContent = 'Offline';
            }
        }

        async fetchDetailedStats() {
            try {
                const [serverInfo, players] = await Promise.all([
                    fetch(`http://${this.serverIP}/info.json`),
                    fetch(`http://${this.serverIP}/players.json`)
                ]);

                const serverData = await serverInfo.json();
                const playerData = await players.json();

                return {
                    players: playerData.length,
                    maxPlayers: serverData.vars.sv_maxClients,
                    queue: 0, // If you have a queue system
                    fps: Math.round(serverData.vars.sv_fps || 60),
                    uptime: serverData.vars.Uptime,
                    playerList: playerData.map(p => ({
                        id: p.id,
                        name: p.name,
                        ping: p.ping
                    }))
                };
            } catch (error) {
                console.warn('Server stats fetch failed:', error);
                return this.stats; // Return current stats on error
            }
        }

        updateUI(stats) {
            // Update existing elements
            this.elements.playerCount.textContent = `${stats.players}/${stats.maxPlayers}`;
            this.elements.serverFPS.textContent = stats.fps;
        
            // Add player list update
            if (stats.playerList && this.elements.playerList) {
                this.elements.playerList.innerHTML = stats.playerList
                    .map(player => `
                        <div class="player-item">
                            <span class="player-name">${player.name}</span>
                            <span class="player-ping">${player.ping}ms</span>
                        </div>
                    `).join('');
            }

            // Add server health indicator
            const serverHealth = stats.fps >= 30 ? 'good' : stats.fps >= 20 ? 'warning' : 'critical';
            this.elements.serverStatus.className = `server-status ${serverHealth}`;
        }

        startUpdates() {
            this.updateStats();
            setInterval(() => this.updateStats(), this.updateInterval);
        }

        async updateStats() {
            const stats = await this.fetchDetailedStats();
            this.updateUI(stats);
            this.updateServerStatus(stats.players > 0);
        }
    }
  class EventTicker {
      constructor(config) {
          this.tickerElement = document.getElementById('eventTicker');
          this.events = [
              "🎉 Car Show this Saturday at 8PM EST",
              "💰 Double Money Week Starting Tomorrow",
              "🚓 Police Recruitment Open",
              "🏁 Street Racing Tournament Sunday",
              "🎮 New Game Mode Released"
          ];
        
          // Create enough copies for smooth infinite scroll
          this.renderEvents();
          this.startScrolling();
      }
    
      renderEvents() {
          // Repeat the announcements multiple times to ensure continuous flow
          const repeatedContent = Array(3).fill(this.events)
              .flat()
              .map(event => `<span class="event-item">${event}</span>`)
              .join('');
            
          this.tickerElement.innerHTML = repeatedContent;
      }

      startScrolling() {
          // Reset animation when it ends to create seamless loop
          this.tickerElement.addEventListener('animationend', () => {
              this.tickerElement.style.animation = 'none';
              // Trigger reflow
              void this.tickerElement.offsetWidth;
              this.tickerElement.style.animation = 'scroll 30s linear infinite';
          });
      }
  }
  // Initialize everything at the bottom
  let loadingScreen;

  // Wait for both DOM and CONFIG to be ready
  document.addEventListener('DOMContentLoaded', () => {
      // Verify DOM elements exist first
      const container = document.querySelector('.loading-container');
    
      if (!container) {
          console.log('Loading container not found - check HTML structure');
          return;
      }

      console.log('DOM loaded, initializing LoadingScreen');
      console.log('Config loaded:', window.CONFIG);
    
      loadingScreen = new LoadingScreen();
    
      // Only start if initialization was successful
      if (loadingScreen.elements && loadingScreen.elements.container) {
          loadingScreen.start();
          window.loadingScreen = loadingScreen;
      }
  });

  // Add event listener for FiveM loading progress
  window.addEventListener('message', function(e) {
      if (e.data.eventName === 'loadProgress') {
          loadingScreen.updateProgress(e.data.loadFraction * 100);
      }
  });
