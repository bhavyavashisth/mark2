// Advanced Hardware Detection System
class HardwareScanner {
    constructor() {
        this.userHardware = {};
        this.gameRequirements = this.getGameRequirements();
        this.compatibleGames = [];
    }
    
    async detectHardware() {
        try {
            // Detect CPU
            this.userHardware.cpu = {
                cores: navigator.hardwareConcurrency || 4,
                architecture: this.getCPUArchitecture()
            };
            
            // Detect GPU
            this.userHardware.gpu = await this.detectGPU();
            
            // Detect RAM
            this.userHardware.ram = this.detectRAM();
            
            // Detect storage
            this.userHardware.storage = await this.detectStorage();
            
            // Detect OS
            this.userHardware.os = this.detectOS();
            
            return this.userHardware;
        } catch (error) {
            console.error('Hardware detection failed:', error);
            return this.getFallbackHardware();
        }
    }
    
    async detectGPU() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const renderer = debugInfo ? 
                gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 
                'Unknown GPU';
            
            const vendor = debugInfo ? 
                gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 
                'Unknown Vendor';
            
            return {
                renderer: renderer,
                vendor: vendor,
                memory: this.estimateVRAM(renderer)
            };
        }
        
        return { renderer: 'Unknown', vendor: 'Unknown', memory: 2048 };
    }
    
    estimateVRAM(gpuName) {
        // Estimate VRAM based on GPU name patterns
        const patterns = {
            'RTX 30': 8000,
            'RTX 20': 6000,
            'GTX 16': 4000,
            'Radeon RX 6': 8000,
            'Radeon RX 5': 4000,
            'Intel HD': 1024,
            'Intel Iris': 2048,
            'M1': 8000,
            'M2': 12000
        };
        
        for (const [pattern, vram] of Object.entries(patterns)) {
            if (gpuName.includes(pattern)) return vram;
        }
        
        return 2048; // Default fallback
    }
    
    detectRAM() {
        // Try to get device memory (available in some browsers)
        if (navigator.deviceMemory) {
            return navigator.deviceMemory * 1024; // Convert GB to MB
        }
        
        // Estimate based on user agent
        const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
        return isMobile ? 4000 : 8000; // Default estimates
    }
    
    async detectStorage() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                return {
                    total: estimate.quota || 0,
                    used: estimate.usage || 0,
                    available: (estimate.quota - estimate.usage) || 0
                };
            } catch (error) {
                console.warn('Storage estimation failed:', error);
            }
        }
        
        // Fallback estimation
        return {
            total: 256 * 1024 * 1024 * 1024, // 256GB default
            available: 50 * 1024 * 1024 * 1024 // 50GB default
        };
    }
    
    detectOS() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Windows')) return 'windows';
        if (userAgent.includes('Macintosh')) {
            // Check for Apple Silicon
            if (navigator.platform.includes('MacARM') || 
                /Apple Silicon|M1|M2|M3/i.test(navigator.userAgent)) {
                return 'mac-arm';
            }
            return 'mac-intel';
        }
        if (userAgent.includes('Linux')) return 'linux';
        
        return 'unknown';
    }
    
    getCPUArchitecture() {
        const platform = navigator.platform;
        if (platform.includes('Win64') || platform.includes('Linux x86_64')) {
            return 'x64';
        }
        if (platform.includes('MacARM') || /arm|aarch/i.test(navigator.platform)) {
            return 'arm64';
        }
        return 'x86';
    }
    
    getGameRequirements() {
        return {
            'cyberpunk2077': {
                min: { cpu: 4, ram: 8192, gpu: 3072, storage: 70000 },
                rec: { cpu: 8, ram: 16384, gpu: 6144, storage: 70000 }
            },
            'eldenring': {
                min: { cpu: 4, ram: 8192, gpu: 3072, storage: 60000 },
                rec: { cpu: 8, ram: 16384, gpu: 6144, storage: 60000 }
            },
            'minecraft': {
                min: { cpu: 2, ram: 2048, gpu: 1024, storage: 1000 },
                rec: { cpu: 4, ram: 4096, gpu: 2048, storage: 4000 }
            }
        };
    }
    
    checkCompatibility(gameId) {
        const requirements = this.gameRequirements[gameId];
        if (!requirements) return null;
        
        const compatibility = {
            canRun: true,
            meetsRecommended: true,
            issues: [],
            scores: {
                cpu: 0,
                gpu: 0,
                ram: 0,
                storage: 0
            }
        };
        
        // Check CPU
        const cpuCores = this.userHardware.cpu.cores;
        compatibility.scores.cpu = Math.min(100, (cpuCores / requirements.rec.cpu) * 100);
        if (cpuCores < requirements.min.cpu) {
            compatibility.canRun = false;
            compatibility.issues.push(`CPU: Needs ${requirements.min.cpu}+ cores`);
        }
        
        // Check RAM
        const ramMB = this.userHardware.ram;
        compatibility.scores.ram = Math.min(100, (ramMB / requirements.rec.ram) * 100);
        if (ramMB < requirements.min.ram) {
            compatibility.canRun = false;
            compatibility.issues.push(`RAM: Needs ${requirements.min.ram / 1024}GB+`);
        }
        
        // Check GPU
        const gpuVRAM = this.userHardware.gpu.memory;
        compatibility.scores.gpu = Math.min(100, (gpuVRAM / requirements.rec.gpu) * 100);
        if (gpuVRAM < requirements.min.gpu) {
            compatibility.canRun = false;
            compatibility.issues.push(`GPU: Needs ${requirements.min.gpu / 1024}GB+ VRAM`);
        }
        
        // Check storage
        const storageMB = this.userHardware.storage.available / 1024 / 1024;
        compatibility.scores.storage = Math.min(100, (storageMB / requirements.rec.storage) * 100);
        if (storageMB < requirements.min.storage) {
            compatibility.canRun = false;
            compatibility.issues.push(`Storage: Needs ${requirements.min.storage / 1024}GB+ free`);
        }
        
        // Calculate overall score
        const overallScore = (
            compatibility.scores.cpu * 0.3 +
            compatibility.scores.gpu * 0.4 +
            compatibility.scores.ram * 0.2 +
            compatibility.scores.storage * 0.1
        );
        
        compatibility.overallScore = Math.round(overallScore);
        compatibility.meetsRecommended = overallScore >= 80;
        
        return compatibility;
    }
    
    generateOptimizationTips(compatibility) {
        const tips = [];
        
        if (compatibility.scores.cpu < 70) {
            tips.push({
                title: "CPU Optimization",
                content: "Close background applications, update drivers, consider overclocking if supported"
            });
        }
        
        if (compatibility.scores.gpu < 70) {
            tips.push({
                title: "GPU Optimization",
                content: "Lower in-game resolution to 1080p, disable ray tracing, update graphics drivers"
            });
        }
        
        if (compatibility.scores.ram < 70) {
            tips.push({
                title: "RAM Management",
                content: "Close unused browser tabs, disable startup programs, consider adding more RAM"
            });
        }
        
        return tips;
    }
}

// Initialize scanner UI
const scanner = new HardwareScanner();

document.querySelectorAll('.platform-option').forEach(button => {
    button.addEventListener('click', async function() {
        const platform = this.dataset.platform;
        
        // Show detection step
        document.querySelector('[data-step="1"]').classList.remove('active');
        document.querySelector('[data-step="2"]').classList.add('active');
        
        // Animate detection
        const detectionItems = document.querySelectorAll('.detection-value');
        detectionItems.forEach(item => {
            item.textContent = 'Detecting...';
            item.classList.add('detecting');
        });
        
        // Simulate detection animation
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            document.querySelector('.progress-bar').style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                showResults();
            }
        }, 200);
        
        // Actually detect hardware
        await scanner.detectHardware();
        
        // Update UI with detected values
        document.getElementById('cpu-info').textContent = 
            `${scanner.userHardware.cpu.cores} cores (${scanner.userHardware.cpu.architecture})`;
        document.getElementById('gpu-info').textContent = 
            `${scanner.userHardware.gpu.renderer.split(' ')[0]} (${Math.round(scanner.userHardware.gpu.memory / 1024)}GB)`;
        document.getElementById('ram-info').textContent = 
            `${Math.round(scanner.userHardware.ram / 1024)}GB`;
        document.getElementById('storage-info').textContent = 
            `${Math.round(scanner.userHardware.storage.available / 1024 / 1024 / 1024)}GB free`;
    });
});

async function showResults() {
    const results = document.getElementById('scanner-results');
    results.innerHTML = '<h3>Analyzing Compatibility...</h3>';
    
    // Check compatibility for all games
    const games = [
        { id: 'cyberpunk2077', name: 'Cyberpunk 2077' },
        { id: 'eldenring', name: 'Elden Ring' },
        { id: 'minecraft', name: 'Minecraft' }
    ];
    
    let compatibleGames = [];
    
    games.forEach(game => {
        const compatibility = scanner.checkCompatibility(game.id);
        if (compatibility && compatibility.canRun) {
            compatibleGames.push({ ...game, compatibility });
        }
    });
    
    // Sort by compatibility score
    compatibleGames.sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);
    
    // Display results
    results.innerHTML = `
        <h3><i class="fas fa-check-circle"></i> Compatible Games Found</h3>
        <div class="compatibility-list">
            ${compatibleGames.map(game => `
                <div class="compatibility-card ${game.compatibility.meetsRecommended ? 'recommended' : 'minimum'}">
                    <div class="compatibility-header">
                        <h4>${game.name}</h4>
                        <span class="compatibility-score">
                            ${game.compatibility.overallScore}%
                        </span>
                    </div>
                    
                    <div class="compatibility-metrics">
                        <div class="metric">
                            <span class="metric-label">CPU</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${game.compatibility.scores.cpu}%"></div>
                            </div>
                            <span class="metric-value">${Math.round(game.compatibility.scores.cpu)}%</span>
                        </div>
                        
                        <div class="metric">
                            <span class="metric-label">GPU</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${game.compatibility.scores.gpu}%"></div>
                            </div>
                            <span class="metric-value">${Math.round(game.compatibility.scores.gpu)}%</span>
                        </div>
                        
                        <div class="metric">
                            <span class="metric-label">RAM</span>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: ${game.compatibility.scores.ram}%"></div>
                            </div>
                            <span class="metric-value">${Math.round(game.compatibility.scores.ram)}%</span>
                        </div>
                    </div>
                    
                    <div class="compatibility-status">
                        <span class="status-badge ${game.compatibility.meetsRecommended ? 'recommended' : 'minimum'}">
                            ${game.compatibility.meetsRecommended ? 'Recommended Settings' : 'Minimum Settings'}
                        </span>
                    </div>
                    
                    <div class="compatibility-actions">
                        <button class="cta-button small" onclick="window.location.href='game-${game.id}.html'">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="cta-button small secondary" onclick="showOptimizationTips('${game.id}')">
                            <i class="fas fa-cogs"></i> Optimization Tips
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="hardware-summary">
            <h4><i class="fas fa-microchip"></i> Your Hardware Summary</h4>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-label">CPU:</span>
                    <span class="summary-value">${scanner.userHardware.cpu.cores} cores</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">GPU:</span>
                    <span class="summary-value">${scanner.userHardware.gpu.renderer.split(' ')[0]}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">RAM:</span>
                    <span class="summary-value">${Math.round(scanner.userHardware.ram / 1024)}GB</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Storage Free:</span>
                    <span class="summary-value">${Math.round(scanner.userHardware.storage.available / 1024 / 1024 / 1024)}GB</span>
                </div>
            </div>
        </div>
    `;
    
    results.classList.add('show');
}
// In script.js
function initCPUScanner() {
    const scanner = new HardwareScanner();
    
    // Add event listeners
    document.querySelectorAll('.platform-option').forEach(button => {
        button.addEventListener('click', async function() {
            // Your scanner logic here
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.compatibility-scanner')) {
        initCPUScanner();
    }
});
