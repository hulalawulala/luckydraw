// Import removed for file:// compatibility

// DOM Elements
const spinDuration = document.getElementById('spinDuration');
const burstDuration = document.getElementById('burstDuration');
const animationSpeed = document.getElementById('animationSpeed');
const currentRound = document.getElementById('currentRound');
const bulkAddText = document.getElementById('bulkAddText');
const bulkAddBtn = document.getElementById('bulkAddBtn');
const poolSearch = document.getElementById('poolSearch');
const participantList = document.getElementById('participantList');
const totalCount = document.getElementById('totalCount');
const clearAllBtn = document.getElementById('clearAllBtn');

const rigSearch = document.getElementById('rigSearch');
const rigSearchResults = document.getElementById('rigSearchResults');
const rigRoundNum = document.getElementById('rigRoundNum');
const rigBtn = document.getElementById('rigBtn');
const rigSelectedName = document.getElementById('rigSelectedName');
const riggedList = document.getElementById('riggedList');

let selectedRiggedName = null;

function init() {
  const settings = getSettings();
  spinDuration.value = settings.spinDuration || 5;
  burstDuration.value = settings.burstDuration || 2;
  animationSpeed.value = settings.animationSpeed || 50;
  currentRound.value = settings.currentRound || 1;
  
  rigRoundNum.value = settings.currentRound || 1;

  spinDuration.addEventListener('change', (e) => {
    updateSettings({ spinDuration: parseInt(e.target.value) || 5 });
  });

  burstDuration.addEventListener('change', (e) => {
    updateSettings({ burstDuration: parseInt(e.target.value) || 2 });
  });

  animationSpeed.addEventListener('change', (e) => {
    updateSettings({ animationSpeed: parseInt(e.target.value) || 50 });
  });

  currentRound.addEventListener('change', (e) => {
    updateSettings({ currentRound: parseInt(e.target.value) || 1 });
  });

  renderParticipants('');
  renderRiggedList();
}

// Participant Management
function renderParticipants(query, maxCount = 100) {
  const all = getParticipants();
  totalCount.textContent = all.length;
  
  participantList.innerHTML = '';
  
  // To avoid DOM lag with 9000 DOM nodes, paginate rendering
  const q = query.toLowerCase();
  let renderedCount = 0;
  
  for (let i = 0; i < all.length; i++) {
    if (all[i].toLowerCase().includes(q)) {
      const item = document.createElement('div');
      item.className = 'participant-item';
      
      const text = document.createElement('span');
      text.textContent = all[i];
      item.appendChild(text);
      
      const act = document.createElement('div');
      act.className = 'participant-actions';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'danger';
      delBtn.textContent = 'Delete';
      delBtn.onclick = () => {
        deleteParticipant(i);
        renderParticipants(poolSearch.value, maxCount);
      };
      
      act.appendChild(delBtn);
      item.appendChild(act);
      participantList.appendChild(item);
      
      renderedCount++;
      if (renderedCount >= maxCount) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'success';
        moreBtn.style.width = '100%';
        moreBtn.style.marginTop = '1rem';
        moreBtn.style.padding = '0.75rem';
        moreBtn.style.fontSize = '1.1rem';
        moreBtn.textContent = 'Load 100 More...';
        moreBtn.onclick = () => renderParticipants(query, maxCount + 100);
        participantList.appendChild(moreBtn);
        break;
      }
    }
  }
}

bulkAddBtn.addEventListener('click', () => {
  const txt = bulkAddText.value;
  if (!txt.trim()) return;
  addParticipants(txt);
  bulkAddText.value = '';
  renderParticipants(poolSearch.value);
});

poolSearch.addEventListener('input', (e) => {
  renderParticipants(e.target.value);
});

clearAllBtn.addEventListener('click', () => {
  if(confirm('Are you sure you want to delete ALL participants?')) {
      localStorage.removeItem('ld_participants');
      localStorage.removeItem('ld_rigged');
      renderParticipants('');
      renderRiggedList();
  }
});

// Rigging System
rigSearch.addEventListener('input', (e) => {
  const results = searchParticipants(e.target.value);
  rigSearchResults.innerHTML = '';
  
  if (e.target.value.length === 0) {
    rigSearchResults.classList.remove('active');
    return;
  }
  
  if (results.length > 0) {
    rigSearchResults.classList.add('active');
    results.forEach(res => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.textContent = res.name;
      div.onclick = () => {
        selectedRiggedName = res.name;
        rigSelectedName.textContent = `Selected: ${res.name}`;
        rigSearch.value = '';
        rigSearchResults.classList.remove('active');
        rigBtn.disabled = false;
      };
      rigSearchResults.appendChild(div);
    });
  } else {
    rigSearchResults.classList.remove('active');
  }
});

// Hide dropdown if clicked outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#rigSearch') && !e.target.closest('#rigSearchResults')) {
    rigSearchResults.classList.remove('active');
  }
});

rigBtn.addEventListener('click', () => {
  if (!selectedRiggedName) return;
  
  const rnd = parseInt(rigRoundNum.value);
  setRiggedWinner(rnd, selectedRiggedName);
  
  selectedRiggedName = null;
  rigSelectedName.textContent = '';
  rigBtn.disabled = true;
  rigRoundNum.value = rnd + 1; // Auto increment for sequential ease
  
  renderRiggedList();
});

function renderRiggedList() {
  const rigged = getRigged();
  riggedList.innerHTML = '';
  
  // Sort rounds numerically
  const rounds = Object.keys(rigged).map(Number).sort((a,b) => a-b);
  
  if (rounds.length === 0) {
    riggedList.innerHTML = '<span style="color: var(--text-muted); font-size: 0.9rem;">No winners pre-selected. Default random will be used.</span>';
    return;
  }
  
  rounds.forEach(r => {
    const div = document.createElement('div');
    div.className = 'rigged-item';
    
    const info = document.createElement('span');
    info.textContent = `Round ${r}: ${rigged[r]}`;
    div.appendChild(info);
    
    const dBtn = document.createElement('button');
    dBtn.className = 'danger';
    dBtn.textContent = 'Clear';
    dBtn.style.padding = '0.2rem 0.5rem';
    dBtn.style.fontSize = '0.75rem';
    dBtn.onclick = () => {
      deleteRiggedWinner(r);
      renderRiggedList();
    };
    div.appendChild(dBtn);
    
    riggedList.appendChild(div);
  });
}

init();
