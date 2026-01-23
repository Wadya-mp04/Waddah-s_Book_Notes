let lightmode = localStorage.getItem('lightmode');
const themeSwitch = document.getElementById('theme-switch');


const enableLightmode = () => {
    document.body.classList.add("lightmode");
    localStorage.setItem('lightmode','active');
}

const disableLightmode = () => {
    document.body.classList.remove("lightmode");
    localStorage.setItem('lightmode','null');
}

if(lightmode ==='active'){
    enableLightmode();
}

if(themeSwitch)
{
    themeSwitch.addEventListener("click",()=>{
    lightmode = localStorage.getItem('lightmode');
    lightmode!="active"?enableLightmode():disableLightmode();
    });
}

// 1) One AudioContext for the page
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

// 2) Cache decoded audio buffers
const buffers = {};
async function loadBuffer(url) {
    if (buffers[url]) return buffers[url];
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const buffer = await audioCtx.decodeAudioData(arr);
    buffers[url] = buffer;
    return buffer;
}

// 3) Play with a per-play gain (volume 0.0–1.0)
async function playSound(url, volume = 1.0) {
    if (audioCtx.state === 'suspended') {
    // must be called in a user gesture; your clicks are fine
    await audioCtx.resume();
    }
    const buffer = await loadBuffer(url);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const gain = audioCtx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(audioCtx.destination);
    source.start(0);
}

// 4) Your helpers
function themeClick() {
    const isLight = document.body.classList.contains('lightmode');
    const url = isLight ? '/assets/toDarkMode.mp3' : '/assets/toLightMode.mp3';
    playSound(url, 0.5); // <- set your desired volume here
}

function playClick() {
    playSound('/assets/click.mp3', 0.75);
}

// Add button example (you already have this pattern)
// const addBtn = document.getElementById('add-button');
// if (addBtn) {
//     addBtn.addEventListener('click', (e) => {
//     e.preventDefault();
//     playClick();
//     });
// }
// const homeBtn = document.getElementById('home-button');
// if (homeBtn) {
//     homeBtn.addEventListener('click', (e) => {
//     e.preventDefault();
//     playClick();
//     });
// }
document.addEventListener('click', (e) => {
  const button = e.target.closest('.btn');

  // Not a button → ignore
  if (!button) return;

  // Exclude theme switch
  if (button.id === 'theme-switch') return;

  // Play click sound
  playClick();
});
window.themeClick = themeClick;
window.playClick = playClick;
window.clickSound = () => playClick();
       