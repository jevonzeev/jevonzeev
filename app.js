const GITHUB_USERNAME = 'jevonzeev';
const PROXY_URL = 'https://wolfofjah.gilazeev444.workers.dev';

const SPRITE_MAP = {
  SLEEPING: 'assets/sleeping.jpg',
  HUMAN:    'assets/human.jpg',
  WEREWOLF: 'assets/werewolf.jpg',
};

const STATUS_MAP = {
  SLEEPING: { emoji: '💤', label: 'Sleeping…',      css: 'sleeping' },
  HUMAN:    { emoji: '🌟', label: 'Awake & Coding',  css: 'human'    },
  WEREWOLF: { emoji: '🐺', label: 'WILD WEREWOLF!',  css: 'werewolf' },
};

const STORIES = [
  "Once upon a time, Werewolf John wrote so much code that his keyboard melted. He took a nap to recover.",
  "John dreamed of a world where every bug was a feature. He coded until dawn, then slept like a dog.",
  "Legend says John once committed 99 times in a single day. The servers still whisper about it.",
  "In the moonlit valley, John refactored a thousand lines of spaghetti code before breakfast.",
  "A young developer asked John for advice. He replied: 'Commit often. Sleep well. Eat burgers.'",
];

var pet = {
  form:       'SLEEPING',
  sleepiness: 60,
  energy:     10,
  happiness:  50,
  commits:    0,
  lastTick:   Date.now(),
};

function saveState() {
  try { localStorage.setItem('wj_pet', JSON.stringify(pet)); } catch(e) {}
}

function loadState() {
  try {
    var raw = localStorage.getItem('wj_pet');
    if (raw) {
      var saved = JSON.parse(raw);
      var elapsed = (Date.now() - (saved.lastTick || Date.now())) / 1000 / 60;
      
      saved.sleepiness = Math.min(100, (saved.sleepiness != null ? saved.sleepiness : 60) + elapsed * 0.4);
      saved.happiness = Math.max(0, (saved.happiness != null ? saved.happiness : 50) - elapsed * 0.3);
      saved.lastTick = Date.now();
      pet = Object.assign(pet, saved);
    }
  } catch(e) {}
}

function tick() {
  var now = Date.now();
  var elapsed = (now - pet.lastTick) / 1000 / 60;
  pet.lastTick = now;

  pet.happiness = Math.max(0, pet.happiness - elapsed * 1.0);

  if (pet.form === 'HUMAN') {
    pet.sleepiness = Math.min(100, pet.sleepiness + elapsed * 0.8);
    pet.energy = Math.max(0, pet.energy - elapsed * 0.3);

    if (pet.sleepiness >= 100) {
      pet.form = 'SLEEPING';
      setHint('😴 John is exhausted and fell asleep! Poke him to wake up.');
    }
  }

  saveState();
  updatePetUI();
}

function actionPoke() {
  showReaction('👋');
  pet.form       = 'HUMAN';
  pet.sleepiness = Math.max(0, pet.sleepiness - 20);
  pet.happiness  = Math.min(100, pet.happiness + 5);
  setHint('You poked John awake! He yawns and stretches. 👋');
  saveState(); updatePetUI();
}

function actionPet() {
  showReaction('❤️');
  pet.happiness = Math.min(100, pet.happiness + 12);
  setHint(pet.form === 'WEREWOLF' ? 'The werewolf growls softly… 🐺❤️' : 'John smiles warmly. Happiness +12! 💜');
  saveState(); updatePetUI();
}

function actionFeedBurger() {
  showReaction('🍔');
  animateFoodBounce();
  pet.sleepiness = Math.min(100, pet.sleepiness + 30);
  pet.happiness  = Math.min(100, pet.happiness + 8);
  if (pet.sleepiness >= 100) {
    pet.form = 'SLEEPING';
    setHint('🍔 That burger was too good… John fell into a food coma! 😴');
  } else {
    setHint('Nom nom! 🍔 John devours the burger. Sleepiness increases.');
  }
  saveState(); updatePetUI();
}

function actionFeedCoffee() {
  showReaction('☕');
  pet.energy     = Math.min(100, pet.energy + 35);
  pet.sleepiness = Math.max(0,   pet.sleepiness - 10);
  pet.happiness  = Math.min(100, pet.happiness + 5);
  
  if (pet.energy >= 80) {
    pet.form = 'WEREWOLF';
    setHint('⚡ COFFEE OVERLOAD! John transforms into a WEREWOLF! 🐺');
  } else {
    setHint('☕ John sips the coffee. Energy +35%! He\'s buzzing.');
  }
  saveState(); updatePetUI();
}

function actionFeedSteak() {
  showReaction('🥩');
  pet.form       = 'HUMAN';
  pet.energy     = Math.max(0,   pet.energy - 40);
  pet.sleepiness = Math.max(0,   pet.sleepiness - 20);
  pet.happiness  = Math.min(100, pet.happiness + 15);
  setHint('🥩 RAWR! The raw steak satisfies the beast… Werewolf John calms down!');
  saveState(); updatePetUI();
}

function actionMoonlitMelody() {
  showReaction('🎵');
  flashMoonOverlay();
  setTimeout(function() {
    pet.form      = 'SLEEPING';
    pet.energy    = Math.max(0, pet.energy - 50);
    pet.happiness = Math.min(100, pet.happiness + 20);
    setHint('🌙 The Moonlit Melody fills the air… the werewolf drifts to sleep.');
    saveState(); updatePetUI();
  }, 1200);
}

function openStory() {
  var story = STORIES[Math.floor(Math.random() * STORIES.length)];
  openStoryDialog(story, function() {
    pet.form       = 'SLEEPING';
    pet.sleepiness = 100;
    pet.happiness  = Math.min(100, pet.happiness + 10);
    setHint('📖 Story time over. John yawns and drifts to sleep.');
    saveState(); updatePetUI();
  });
}

function updatePetUI() {
  var display    = document.getElementById('pet-display');
  var sprite     = document.getElementById('pet-sprite');
  var statusLbl  = document.getElementById('pet-status-label');
  var formVal    = document.getElementById('form-val');
  var energyVal  = document.getElementById('energy-val');
  var energyBar  = document.getElementById('energy-bar');
  var commitsVal = document.getElementById('commits-val');
  var sleepyVal  = document.getElementById('sleepy-val');
  var sleepyBar  = document.getElementById('sleepy-bar');
  var happyVal   = document.getElementById('happy-val');
  var happyBar   = document.getElementById('happy-bar');
  var controls   = document.getElementById('pet-controls');

  sprite.src = SPRITE_MAP[pet.form];
  sprite.alt = 'GitHub pet – currently ' + pet.form.toLowerCase();
  display.className = 'state-' + pet.form.toLowerCase();

  var s = STATUS_MAP[pet.form];
  statusLbl.textContent = s.emoji + ' ' + s.label;
  statusLbl.className   = 'pet-status ' + s.css;

  formVal.textContent    = pet.form;
  energyVal.textContent  = Math.round(pet.energy) + '%';
  commitsVal.textContent = pet.commits;
  sleepyVal.textContent  = Math.round(pet.sleepiness) + '%';
  happyVal.textContent   = Math.round(pet.happiness) + '%';

  setBar(energyBar, pet.energy);
  setBar(sleepyBar, pet.sleepiness);
  setBar(happyBar,  pet.happiness);

  updateFoodTray();

  controls.innerHTML = '';
  buildButtons(controls);
}

function setBar(barEl, value) {
  barEl.style.width = value + '%';
  barEl.classList.remove('level-low', 'level-mid', 'level-high');
  if (value >= 66) barEl.classList.add('level-high');
  else if (value >= 33) barEl.classList.add('level-mid');
  else barEl.classList.add('level-low');
}

function updateFoodTray() {
  var tray       = document.getElementById('food-tray');
  var itemBurger = document.getElementById('food-burger');
  var itemCoffee = document.getElementById('food-coffee');
  var itemSteak  = document.getElementById('food-steak');
  var itemMoon   = document.getElementById('food-moon');

  if (pet.form === 'SLEEPING') {
    tray.style.display = 'none';
  } else if (pet.form === 'HUMAN') {
    tray.style.display = '';
    itemBurger.style.display = '';
    itemCoffee.style.display = '';
    itemSteak.style.display  = 'none';
    itemMoon.style.display   = 'none';
  } else {
    tray.style.display = '';
    itemBurger.style.display = 'none';
    itemCoffee.style.display = 'none';
    itemSteak.style.display  = '';
    itemMoon.style.display   = '';
  }
}

function buildButtons(controls) {
  if (pet.form === 'SLEEPING') {
    controls.appendChild(makeBtn('👆 Poke to Wake', 'poke-btn', actionPoke));
  } else if (pet.form === 'HUMAN') {
    controls.appendChild(makeBtn('📖 Read Story', 'story-btn', openStory));
    controls.appendChild(makeBtn('🐾 Pet',        'poke-btn',  actionPet));
  } else {
    controls.appendChild(makeBtn('🐾 Pet Wolf', 'poke-btn', actionPet));
  }
}

function makeBtn(text, cls, fn) {
  var btn = document.createElement('button');
  btn.className   = 'pet-btn ' + cls;
  btn.textContent = text;
  btn.addEventListener('click', fn);
  return btn;
}

function setHint(text) {
  var el = document.getElementById('pet-hint');
  if(!el) return;
  el.style.opacity = '0';
  setTimeout(function() {
    el.textContent  = text;
    el.style.opacity = '1';
  }, 150);
}

function showReaction(emoji) {
  var display = document.getElementById('pet-display');
  var el = document.createElement('div');
  el.className   = 'reaction-overlay';
  el.textContent = emoji;
  display.appendChild(el);
  setTimeout(function() { el.remove(); }, 900);
}

function animateFoodBounce() {
  var sprite = document.getElementById('pet-sprite');
  sprite.style.transform = 'scale(1.08)';
  setTimeout(function() { sprite.style.transform = 'scale(1)'; }, 200);
}

function flashMoonOverlay() {
  var display = document.getElementById('pet-display');
  var overlay = document.createElement('div');
  overlay.className = 'moon-overlay';
  overlay.innerHTML = '<img src="assets/moon.jpg" alt="Moon" style="width:100%;height:100%;object-fit:cover;opacity:0.6;">';
  display.appendChild(overlay);
  setTimeout(function() { overlay.remove(); }, 1400);
}

function openStoryDialog(story, onClose) {
  var dialog = document.getElementById('story-dialog');
  var storyText = document.getElementById('story-text');
  storyText.textContent = story;
  dialog.showModal();

  var closeBtn = document.getElementById('story-close-btn');
  function handleClose() {
    dialog.close();
    closeBtn.removeEventListener('click', handleClose);
    if (onClose) onClose();
  }
  closeBtn.addEventListener('click', handleClose);
}

async function ghGraphQL(query, variables) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error('GitHub Proxy API Error');
  const json = await res.json();
  return json.data;
}

async function fetchRecentCommits() {
  var data = await ghGraphQL(
    'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}',
    { login: GITHUB_USERNAME }
  );
  var allDays = data.user.contributionsCollection.contributionCalendar.weeks
    .reduce((acc, w) => acc.concat(w.contributionDays), []);
  var last7 = allDays.slice(-7);
  var total = last7.reduce((s, d) => s + d.contributionCount, 0);
  return { total };
}

async function fetchRepos() {
  var data = await ghGraphQL(
    'query($login:String!){user(login:$login){repositories(first:30,orderBy:{field:UPDATED_AT,direction:DESC},privacy:PUBLIC){nodes{name description url openGraphImageUrl primaryLanguage{name} repositoryTopics(first:5){nodes{topic{name}}}}}}}',
    { login: GITHUB_USERNAME }
  );
  return data.user.repositories.nodes.map(r => {
    let folderName = r.name.toLowerCase() === 'jevonzeev' ? 'jevonzeev' : r.name;
    let fileName = (r.name.toLowerCase() === 'jevonzeev' ? 'jevonzeev' : r.name) + '.jpg';
    var rawDocCoverPath = 'https://raw.githubusercontent.com/' + GITHUB_USERNAME + '/' + folderName + '/main/doc/' + fileName;

    return {
      name:          r.name,
      description:   r.description || '',
      url:           r.url,
      image:         rawDocCoverPath,
      fallbackImage: r.openGraphImageUrl,
      language:      r.primaryLanguage ? r.primaryLanguage.name : null,
      topics:        r.repositoryTopics.nodes.map(t => t.topic.name),
    };
  });
}

function categorize(repo) {
  if (repo.topics && repo.topics.length > 0) {
    var primaryTopic = repo.topics[0];
    return primaryTopic.charAt(0).toUpperCase() + primaryTopic.slice(1).replace(/-/g, ' ');
  }
  return repo.language || 'General';
}

function renderCategoryTabs(repos) {
  var cats = {};
  repos.forEach(r => { var c = categorize(r); cats[c] = (cats[c] || 0) + 1; });

  var tabsContainer = document.getElementById('category-tabs');
  if(!tabsContainer) return;
  tabsContainer.innerHTML = '';

  var allTab = document.createElement('button');
  allTab.className   = 'category-tab active';
  allTab.textContent = 'All (' + repos.length + ')';
  allTab.addEventListener('click', function() {
    setActiveTab(allTab);
    renderProjects(repos);
  });
  tabsContainer.appendChild(allTab);

  Object.keys(cats).forEach(function(cat) {
    var tab = document.createElement('button');
    tab.className   = 'category-tab';
    tab.textContent = cat + ' (' + cats[cat] + ')';
    tab.addEventListener('click', function() {
      setActiveTab(tab);
      renderProjects(repos.filter(r => categorize(r) === cat));
    });
    tabsContainer.appendChild(tab);
  });
}

function renderProjects(repos) {
  var grid = document.getElementById('projects-grid');
  if(!grid) return;
  grid.innerHTML = '';
  
  if (repos.length === 0) {
    grid.innerHTML = '<div class="empty-state"><p class="empty-state-title">No projects found</p></div>';
    return;
  }

  repos.forEach(function(repo) {
    var card = document.createElement('article');
    card.className = 'project-card';

    if (repo.image) {
      var img = document.createElement('img');
      img.className = 'project-image';
      img.src       = repo.image;
      img.alt       = repo.name + ' cover';
      img.loading   = 'lazy';
      img.onerror   = function() {
        if (repo.fallbackImage && this.src !== repo.fallbackImage) {
          this.src = repo.fallbackImage;
        } else {
          this.style.display = 'none';
        }
      };
      card.appendChild(img);
    }

    var content = document.createElement('div');
    content.className = 'project-content';

    var title = document.createElement('h3');
    title.className   = 'project-title';
    title.textContent = repo.name;
    content.appendChild(title);

    if (repo.language) {
      var langEl = document.createElement('p');
      langEl.className   = 'project-lang';
      langEl.textContent = repo.language;
      content.appendChild(langEl);
    }

    var desc = document.createElement('p');
    desc.className   = 'project-description';
    desc.textContent = repo.description || 'No description.';
    content.appendChild(desc);

    var link = document.createElement('a');
    link.className = 'project-link';
    link.href      = repo.url;
    link.target    = '_blank';
    link.rel       = 'noopener noreferrer';
    link.innerHTML = 'View Repo &rarr;';
    content.appendChild(link);

    card.appendChild(content);
    grid.appendChild(card);
  });
}

function setActiveTab(activeEl) {
  document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
  activeEl.classList.add('active');
}

async function init() {
  loadState();
  updatePetUI();

  try {
    var commitData = await fetchRecentCommits();
    pet.commits = commitData.total;
    // Only give initial boost if no storage present
    if (!localStorage.getItem('wj_pet')) {
      pet.energy = Math.min(100, commitData.total * 15);
      if (pet.energy >= 80) pet.form = 'WEREWOLF';
      else if (commitData.total > 0) pet.form = 'HUMAN';
    }
    updatePetUI();
  } catch(e) {
    console.error('GitHub fetch error:', e);
  }

  try {
    var allRepos = await fetchRepos();
    renderCategoryTabs(allRepos);
    renderProjects(allRepos);
  } catch(e) {
    console.error('Could not fetch repos:', e);
  }

  setInterval(tick, 26 * 1000);
  saveState();
}

init();