/*
  Locally App - Core Logic

  This script provides client‑side state management and view rendering for
  the Locally demo. All data is persisted in localStorage so the app can run
  without a backend. The login and sign‑up flows reuse the logic from the
  previous prototype. Additional functions render pages specified in the
  detailed app plan including messages, calendar, match, discover and
  manage. Many of these implementations are simplified, using static
  placeholder data to approximate the desired layouts and interactions.
*/

// ----- User management -----
function getUsers() {
  const users = localStorage.getItem('locally_users');
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem('locally_users', JSON.stringify(users));
}

function registerUser(user) {
  const users = getUsers();
  if (users.some(u => u.username === user.username)) {
    return { success: false, message: 'Username already exists' };
  }
  users.push(user);
  saveUsers(users);
  return { success: true };
}

function login(username, password) {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem('locally_current_user', JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, message: 'Invalid username or password' };
}

function getCurrentUser() {
  const data = localStorage.getItem('locally_current_user');
  return data ? JSON.parse(data) : null;
}

function logout() {
  localStorage.removeItem('locally_current_user');
  window.location.href = 'index.html';
}

// ----- Navigation -----
// Called on each page to initialise nav bars based on user role and page context.
function initNav(activePage) {
  const user = getCurrentUser();
  // Top bar role‑aware center text
  const centerText = document.querySelector('.top-bar .center-text');
  if (centerText && user) {
    if (user.role === 'performer') {
      centerText.textContent = 'Perform Locally';
    } else if (user.role === 'venue') {
      centerText.textContent = 'Book Locally';
    } else {
      centerText.textContent = 'Discover Locally';
    }
  }
  // Highlight active bottom nav
  const items = document.querySelectorAll('.bottom-nav .nav-item');
  items.forEach(item => {
    if (item.dataset.page === activePage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  // Profile initial
  const profileEl = document.querySelector('.top-bar .profile');
  if (profileEl && user) {
    profileEl.textContent = user.username.charAt(0).toUpperCase();
  }
  // Dropdown toggle
  if (profileEl) {
    profileEl.addEventListener('click', () => {
      const dropdown = document.querySelector('.dropdown');
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }
  // Hide dropdown on outside click
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.dropdown');
    const profileEl = document.querySelector('.top-bar .profile');
    if (!dropdown || !profileEl) return;
    if (!dropdown.contains(e.target) && !profileEl.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

// ----- Home page -----
function populateHome() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initNav('home');
  const greeting = document.getElementById('home-greeting');
  greeting.textContent = `Welcome, ${user.username}!`;
  const quickContainer = document.getElementById('quick-tiles');
  quickContainer.innerHTML = '';
  // Tiles vary by role
  if (user.role === 'performer' || user.role === 'venue') {
    // Quick tiles: Today’s Calendar, New Matches, Finish Profile, Recommended for You
    addTile(quickContainer, 'Today’s Calendar', 'View your next event', () => {
      window.location.href = 'calendar.html';
    });
    addTile(quickContainer, 'New Matches', 'See your latest matches', () => {
      window.location.href = 'match.html';
    });
    addTile(quickContainer, 'Finish Profile', 'Complete your profile to get better matches', () => {
      window.location.href = 'manage.html#profile';
    });
    addTile(quickContainer, 'Recommended for You', 'Discover venues and performers tailored to you', () => {
      window.location.href = 'match.html';
    });
  } else {
    // Local user quick tiles: Discover feed highlights
    addTile(quickContainer, 'Tonight’s Picks', 'See what’s happening tonight near you', () => {
      window.location.href = 'discover.html';
    });
    addTile(quickContainer, 'From People You Follow', 'Latest clips from your follows', () => {
      window.location.href = 'discover.html';
    });
    addTile(quickContainer, 'Local News', 'Catch up on neighbourhood stories', () => {
      window.location.href = 'discover.html';
    });
    addTile(quickContainer, 'This Weekend', 'What’s on this weekend', () => {
      window.location.href = 'discover.html';
    });
  }
}

function addTile(container, title, subtitle, onClick) {
  const tile = document.createElement('div');
  tile.className = 'tile';
  const h3 = document.createElement('h3');
  h3.textContent = title;
  const p = document.createElement('p');
  p.textContent = subtitle;
  const btn = document.createElement('button');
  btn.textContent = 'Open';
  btn.addEventListener('click', onClick);
  tile.appendChild(h3);
  tile.appendChild(p);
  tile.appendChild(btn);
  container.appendChild(tile);
}

// ----- Messages page -----
function populateMessages() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initNav('messages');
  // Sample threads data
  const threads = [
    {
      id: 1,
      name: 'Sam Singer',
      lastMessage: 'Great playing last night!',
      unread: true,
      messages: [
        { sender: 'Sam', content: 'Hey! Ready for Saturday?', you: false },
        { sender: user.username, content: 'Definitely! See you then.', you: true },
        { sender: 'Sam', content: 'Great playing last night!', you: false }
      ]
    },
    {
      id: 2,
      name: 'Cafe Blue',
      lastMessage: 'Invoice sent.',
      unread: false,
      messages: [
        { sender: 'Cafe Blue', content: 'Invoice sent.', you: false },
        { sender: user.username, content: 'Thanks! I’ll check.', you: true }
      ]
    }
  ];
  const listEl = document.getElementById('thread-list');
  listEl.innerHTML = '';
  threads.forEach(thread => {
    const item = document.createElement('div');
    item.className = 'thread-item' + (thread.unread ? ' unread' : '');
    item.dataset.id = thread.id;
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = thread.name.charAt(0);
    item.appendChild(avatar);
    const info = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = thread.name;
    const snippet = document.createElement('div');
    snippet.style.fontSize = '0.75rem';
    snippet.style.color = 'rgba(0,0,0,0.6)';
    snippet.textContent = thread.lastMessage;
    info.appendChild(name);
    info.appendChild(snippet);
    item.appendChild(info);
    item.addEventListener('click', () => {
      renderChat(thread);
    });
    listEl.appendChild(item);
  });
  // Render first thread by default
  if (threads.length > 0) {
    renderChat(threads[0]);
  }
}

function renderChat(thread) {
  const header = document.getElementById('chat-header');
  const nameEl = header.querySelector('.chat-name');
  nameEl.textContent = thread.name;
  const messagesEl = document.getElementById('chat-messages');
  messagesEl.innerHTML = '';
  thread.messages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + (msg.you ? 'you' : 'them');
    msgDiv.textContent = msg.content;
    messagesEl.appendChild(msgDiv);
  });
}

// ----- Calendar page -----
function populateCalendar() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initNav('calendar');
  // Display month header
  const monthLabel = document.getElementById('calendar-month');
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  monthLabel.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  // Build days of the month
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  // Determine padding days before the first of the month
  const startOffset = firstDay.getDay();
  const totalCells = startOffset + lastDay.getDate();
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    if (i >= startOffset) {
      const dateNum = i - startOffset + 1;
      const dateDiv = document.createElement('div');
      dateDiv.className = 'date';
      dateDiv.textContent = dateNum;
      cell.appendChild(dateDiv);
      // Sample events: assign a couple of days with events
      if (dateNum === 5) {
        const ev = document.createElement('div');
        ev.className = 'calendar-event';
        ev.textContent = 'Hold: Sam @ Cafe Blue';
        ev.classList.add('hold');
        cell.appendChild(ev);
      }
      if (dateNum === 12) {
        const ev = document.createElement('div');
        ev.className = 'calendar-event confirmed';
        ev.textContent = 'Confirmed: John @ Cafe Blue';
        cell.appendChild(ev);
      }
    }
    grid.appendChild(cell);
  }
}

// ----- Match page -----
function populateMatch() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initNav('match');
  const container = document.getElementById('match-feed');
  container.innerHTML = '';
  // For simplicity, re‑use computeMatches from earlier: performer/venue matching
  let matches = [];
  const users = getUsers();
  if (user.role === 'performer') {
    matches = users.filter(u => u.role === 'venue');
  } else if (user.role === 'venue') {
    matches = users.filter(u => u.role === 'performer');
  } else {
    // local: show both performers and venues as matches
    matches = users.filter(u => u.role !== 'local');
  }
  // Insert some curated demo matches at the top of the list
  let demoMatches = [];
  if (user.role === 'performer') {
    demoMatches = [
      { role: 'venue', name: 'Blue Note Cafe', venueType: 'Cafe', budget: '200-400', atmosphere: 'Cozy, Jazz-friendly' },
      { role: 'venue', name: 'Sunset Bar', venueType: 'Bar', budget: '100-300', atmosphere: 'Indie vibe' }
    ];
  } else if (user.role === 'venue') {
    demoMatches = [
      { role: 'performer', firstName: 'Maya', lastName: 'Alvarez', performerType: 'Singer', charge: '200-400', genre: 'Indie Pop' },
      { role: 'performer', firstName: 'Jazz', lastName: 'Trio', performerType: 'Band', charge: '300-500', genre: 'Jazz' }
    ];
  }
  // Combine curated and actual matches
  matches = demoMatches.concat(matches);
  // Build cards for each match
  matches.forEach((m, idx) => {
    const card = document.createElement('div');
    card.className = 'match-card';
    // Header
    const header = document.createElement('div');
    header.className = 'header';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    const nameString = m.role === 'venue' ? m.name : `${m.firstName} ${m.lastName}`;
    avatar.textContent = nameString.charAt(0).toUpperCase();
    const name = document.createElement('div');
    name.textContent = nameString;
    const score = document.createElement('div');
    score.className = 'score';
    // Dummy match score between 7.0 and 9.5
    const matchScore = (7 + Math.random() * 2.5).toFixed(1);
    score.textContent = `${matchScore}/10`;
    header.appendChild(avatar);
    header.appendChild(name);
    header.appendChild(score);
    // Media placeholder
    const media = document.createElement('div');
    media.className = 'media';
    // Chips row – reasons for match
    const chipsContainer = document.createElement('div');
    chipsContainer.className = 'chips';
    ['Genre fit','Budget fit','Near you','Available Fri'].forEach(txt => {
      const chip = document.createElement('div');
      chip.className = 'chip';
      chip.textContent = txt;
      chipsContainer.appendChild(chip);
    });
    // Meta row
    const meta = document.createElement('div');
    meta.className = 'meta';
    if (m.role === 'venue') {
      meta.textContent = `${m.venueType || 'Venue'} · Budget: ${m.budget || 'N/A'} · ${m.atmosphere || ''}`;
    } else {
      meta.textContent = `${m.performerType || 'Performer'} · Charge: ${m.charge || 'N/A'} · ${m.genre || ''}`;
    }
    // Actions
    const actions = document.createElement('div');
    actions.className = 'actions';
    const btnLike = document.createElement('button');
    btnLike.textContent = 'Like';
    const btnSave = document.createElement('button');
    btnSave.className = 'secondary';
    btnSave.textContent = 'Save';
    const btnSkip = document.createElement('button');
    btnSkip.className = 'secondary';
    btnSkip.textContent = 'Skip';
    actions.appendChild(btnSave);
    actions.appendChild(btnSkip);
    actions.appendChild(btnLike);
    // Append sections
    card.appendChild(header);
    card.appendChild(media);
    card.appendChild(chipsContainer);
    card.appendChild(meta);
    card.appendChild(actions);
    container.appendChild(card);
  });
  if (matches.length === 0) {
    container.innerHTML = '<p>No matches available.</p>';
  }
}

// ----- Discover page -----
function populateDiscover() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initNav('discover');
  const container = document.getElementById('discover-feed');
  container.innerHTML = '';
  // Static sample feed: show, performer, venue, news
  // Show card
  const showCard = document.createElement('div');
  showCard.className = 'show-card';
  const showHeader = document.createElement('div');
  showHeader.className = 'header';
  showHeader.innerHTML = '<strong>Sam @ Cafe Blue</strong> · Sep 21 · Downtown';
  const banner = document.createElement('div');
  banner.className = 'banner';
  const showActions = document.createElement('div');
  showActions.className = 'actions';
  ['Add to Calendar','Share','Get Details'].forEach(label => {
    const b = document.createElement('button');
    b.textContent = label;
    if (label === 'Get Details') b.className = 'primary';
    showActions.appendChild(b);
  });
  showCard.appendChild(showHeader);
  showCard.appendChild(banner);
  showCard.appendChild(showActions);
  container.appendChild(showCard);
  // Performer card
  const perfCard = document.createElement('div');
  perfCard.className = 'performer-card';
  const perfHeader = document.createElement('div');
  perfHeader.className = 'header';
  perfHeader.innerHTML = '<strong>Sam Singer</strong> · Jazz · 2mi';
  const perfMedia = document.createElement('div');
  perfMedia.className = 'media';
  const perfActions = document.createElement('div');
  perfActions.className = 'actions';
  ['Follow','Message','Save'].forEach(label => {
    const b = document.createElement('button');
    b.textContent = label;
    if (label === 'Message') b.className = 'primary';
    perfActions.appendChild(b);
  });
  perfCard.appendChild(perfHeader);
  perfCard.appendChild(perfMedia);
  perfCard.appendChild(perfActions);
  container.appendChild(perfCard);
  // Venue card
  const venueCard = document.createElement('div');
  venueCard.className = 'venue-card';
  const venueHeader = document.createElement('div');
  venueHeader.className = 'header';
  venueHeader.innerHTML = '<strong>Cafe Blue</strong> · Downtown';
  const venueGallery = document.createElement('div');
  venueGallery.className = 'gallery';
  const venueActions = document.createElement('div');
  venueActions.className = 'actions';
  ['Follow','Message','View Slots'].forEach(label => {
    const b = document.createElement('button');
    b.textContent = label;
    if (label === 'Message') b.className = 'primary';
    venueActions.appendChild(b);
  });
  venueCard.appendChild(venueHeader);
  venueCard.appendChild(venueGallery);
  venueCard.appendChild(venueActions);
  container.appendChild(venueCard);
  // News card
  const newsCard = document.createElement('div');
  newsCard.className = 'news-card';
  const newsHeader = document.createElement('div');
  newsHeader.className = 'header';
  newsHeader.innerHTML = '<strong>Local News</strong> · 2h ago';
  const newsThumb = document.createElement('div');
  newsThumb.className = 'thumb';
  const newsExcerpt = document.createElement('p');
  newsExcerpt.style.padding = '0.5rem';
  newsExcerpt.textContent = 'Jazz festival returns this weekend with performances from local favourites...';
  const newsActions = document.createElement('div');
  newsActions.className = 'actions';
  ['Read article','Follow','Message'].forEach(label => {
    const b = document.createElement('button');
    b.textContent = label;
    if (label === 'Read article') b.className = 'primary';
    newsActions.appendChild(b);
  });
  newsCard.appendChild(newsHeader);
  newsCard.appendChild(newsThumb);
  newsCard.appendChild(newsExcerpt);
  newsCard.appendChild(newsActions);
  container.appendChild(newsCard);
}

// ----- Manage page -----
function populateManage() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initNav('manage');
  // Tab switching
  const tabs = document.querySelectorAll('.manage-tabs .tab');
  const sections = document.querySelectorAll('.manage-section');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      sections.forEach(sec => {
        if (sec.id === tab.dataset.section) {
          sec.classList.add('active');
        } else {
          sec.classList.remove('active');
        }
      });
    });
  });
}

// ----- Event listeners for login and sign up -----
function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const username = form.querySelector('[name="username"]').value.trim();
  const password = form.querySelector('[name="password"]').value.trim();
  const result = login(username, password);
  const errorEl = document.getElementById('login-error');
  if (result.success) {
    // Route users to the appropriate home page based on role
    if (result.user.role === 'local') {
      window.location.href = 'local_home.html';
    } else {
      window.location.href = 'home.html';
    }
  } else {
    errorEl.textContent = result.message;
  }
}

function handleSignUp(role) {
  return function(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const user = {
      role,
      username: data.get('username'),
      password: data.get('password')
    };
    if (role === 'venue') {
      user.name = data.get('name');
      user.venueType = data.get('venue_type');
      user.location = data.get('location');
      user.budget = data.get('budget');
      user.preferredAct = data.get('preferred_act');
      user.genre = data.get('genre');
      user.atmosphere = data.get('atmosphere');
    } else if (role === 'performer') {
      user.firstName = data.get('first_name');
      user.lastName = data.get('last_name');
      user.stageName = data.get('stage_name');
      user.location = data.get('location');
      user.performerType = data.get('performer_type');
      user.genre = data.get('genre');
      user.preferredVenue = data.get('preferred_venue');
      user.atmosphere = data.get('atmosphere');
      user.charge = data.get('charge');
    } else {
      user.firstName = data.get('first_name');
      user.lastName = data.get('last_name');
      user.location = data.get('location');
    }
    const result = registerUser(user);
    const errorEl = document.getElementById('signup-error');
    if (result.success) {
      login(user.username, user.password);
      // Redirect new local users to the local home page; others to standard home
      if (role === 'local') {
        window.location.href = 'local_home.html';
      } else {
        window.location.href = 'home.html';
      }
    } else {
      errorEl.textContent = result.message;
    }
  };
}

// ----- Local consumer navigation -----
// Initialise nav bars for local pages
function initLocalNav(activePage) {
  const user = getCurrentUser();
  // Set profile initial and unread messages indicator if needed
  const profileEl = document.querySelector('.top-bar .profile');
  if (profileEl && user) {
    profileEl.textContent = user.username.charAt(0).toUpperCase();
  }
  // Highlight active tab in the bottom nav for local
  const items = document.querySelectorAll('.bottom-nav-local .nav-item');
  items.forEach(item => {
    if (item.dataset.page === activePage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  // Dropdown toggle for profile
  if (profileEl) {
    profileEl.addEventListener('click', () => {
      const dropdown = document.querySelector('.dropdown');
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
  }
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.dropdown');
    const profileEl = document.querySelector('.top-bar .profile');
    if (!dropdown || !profileEl) return;
    if (!dropdown.contains(e.target) && !profileEl.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

// Local Home page
function populateLocalHome() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initLocalNav('home');
  const content = document.getElementById('local-home-content');
  if (!content) return;
  content.innerHTML = '';
  // Determine which feed to show (for-you or following)
  const selection = localStorage.getItem('locally_feed_selection') || 'for-you';
  // Build sections; assign categories for filtering
  if (selection === 'for-you') {
    addLocalSection(content, 'Tonight’s Picks', [
      { title: 'Jazz Night @ Cafe Blue', meta: 'Tonight · 8pm · 1.2 mi', type: 'show' },
      { title: 'Open Mic @ The Copper Room', meta: 'Tonight · 7pm · 0.8 mi', type: 'show' }
    ], false, 'tonight');
    addLocalSection(content, 'From People You Follow', [
      { title: 'Sam Singer posted a new clip', meta: '2h ago', type: 'post' },
      { title: 'Cafe Blue shared a behind-the-scenes', meta: '5h ago', type: 'post' }
    ], false, 'following');
    addLocalSection(content, 'Local News', [
      { title: 'Jazz festival this weekend', meta: 'Local Times · 4h ago', type: 'news' },
      { title: 'New café opening soon', meta: 'City Chronicle · 1d ago', type: 'news' }
    ], true, 'news');
    addLocalSection(content, 'This Weekend', [
      { title: 'Saturday: Indie Pop @ Sunset Bar', meta: 'Sat · 9pm', type: 'show' },
      { title: 'Sunday: Brunch & Blues', meta: 'Sun · 11am', type: 'show' }
    ], false, 'weekend');
    addLocalSection(content, 'Recommended For You', [
      { title: 'Maya Alvarez (Performer)', meta: 'Indie Pop · 2 mi', type: 'performer' },
      { title: 'The Copper Room (Venue)', meta: 'Downtown · Jazz-friendly', type: 'venue' }
    ], false, 'recommended');
  } else {
    // Following feed: show only updates from followed people
    addLocalSection(content, 'From People You Follow', [
      { title: 'Sam Singer posted a rehearsal clip', meta: '1h ago', type: 'post' },
      { title: 'Cafe Blue announced a new event', meta: '3h ago', type: 'post' }
    ], false, 'following');
    addLocalSection(content, 'Your Saved / RSVP’d', [
      { title: 'Saved: Indie Pop @ Sunset Bar', meta: 'Sat · 9pm', type: 'saved' },
      { title: 'RSVP’d: Brunch & Blues', meta: 'Sun · 11am', type: 'saved' }
    ], false, 'saved');
  }
  // Update segmented control active styles
  const forBtn = document.getElementById('seg-for-you');
  const folBtn = document.getElementById('seg-following');
  if (forBtn && folBtn) {
    if (selection === 'for-you') {
      forBtn.style.backgroundColor = 'var(--cerulean)';
      forBtn.style.color = 'var(--bone)';
      folBtn.style.backgroundColor = 'transparent';
      folBtn.style.color = 'var(--night)';
    } else {
      folBtn.style.backgroundColor = 'var(--cerulean)';
      folBtn.style.color = 'var(--bone)';
      forBtn.style.backgroundColor = 'transparent';
      forBtn.style.color = 'var(--night)';
    }
  }
}

// Local Following page – dedicated page showing updates from followed performers/venues
function populateFollowingHome() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initLocalNav('home');
  const content = document.getElementById('following-content');
  if (!content) return;
  content.innerHTML = '';
  // This page shows only updates from people the user follows and saved/RSVP items
  addLocalSection(content, 'From People You Follow', [
    { title: 'Sam Singer posted a rehearsal clip', meta: '1h ago', type: 'post' },
    { title: 'Cafe Blue announced a new event', meta: '3h ago', type: 'post' }
  ], false, 'following');
  addLocalSection(content, 'Your Saved / RSVP’d', [
    { title: 'Saved: Indie Pop @ Sunset Bar', meta: 'Sat · 9pm', type: 'saved' },
    { title: 'RSVP’d: Brunch & Blues', meta: 'Sun · 11am', type: 'saved' }
  ], false, 'saved');
}

function addLocalSection(container, heading, items, outlined, category) {
  const section = document.createElement('div');
  section.className = 'local-section';
  if (category) section.dataset.category = category;
  const h3 = document.createElement('h3');
  h3.textContent = heading;
  section.appendChild(h3);
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'local-card';
    if (outlined) card.classList.add('outlined');
    const title = document.createElement('strong');
    title.textContent = it.title;
    const meta = document.createElement('div');
    meta.style.fontSize = '0.8rem';
    meta.style.color = 'rgba(0,0,0,0.6)';
    meta.textContent = it.meta;
    card.appendChild(title);
    card.appendChild(meta);
    section.appendChild(card);
  });
  container.appendChild(section);
}

// Local Post page
function populatePost() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initLocalNav('post');
  const content = document.getElementById('post-content');
  if (!content) return;
  content.innerHTML = '';
  // Two cards: Story and Record
  const story = document.createElement('div');
  story.className = 'post-option';
  story.innerHTML = '<strong>Write a Story</strong><p>Share your experience with a performer or venue.</p>';
  story.addEventListener('click', () => {
    alert('Story editor coming soon!');
  });
  const record = document.createElement('div');
  record.className = 'post-option';
  record.innerHTML = '<strong>Record</strong><p>Capture a photo or video.</p>';
  record.addEventListener('click', () => {
    alert('Camera interface coming soon!');
  });
  content.appendChild(story);
  content.appendChild(record);
}

// Local Discover page
function populateLocalDiscover() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initLocalNav('discover');
  const feed = document.getElementById('local-discover-feed');
  if (!feed) return;
  feed.innerHTML = '';
  // Simple feed mixing performers, venues and news
  // Define feed items with simple tags for filtering: show cards can be tonight, weekend, free, etc.
  const items = [
    {
      type: 'show',
      title: 'Sam Singer @ Cafe Blue',
      meta: 'Tonight · 8pm · Downtown',
      section: 'show',
      tags: ['tonight','nearby']
    },
    {
      type: 'performer',
      title: 'Maya Alvarez',
      meta: 'Indie Pop · 2 mi',
      section: 'performer',
      tags: ['nearby']
    },
    {
      type: 'venue',
      title: 'The Copper Room',
      meta: 'Downtown · Jazz-friendly',
      section: 'venue',
      tags: ['nearby']
    },
    {
      type: 'show',
      title: 'Sunday Brunch & Blues',
      meta: 'This Weekend · 11am · 1.5 mi',
      section: 'show',
      tags: ['this-weekend','free']
    },
    {
      type: 'news',
      title: 'Local band releases new album',
      meta: 'News · 3h ago',
      section: 'news',
      tags: []
    }
  ];
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'discover-card';
    card.dataset.section = it.section;
    // store tags for filtering
    if (it.tags) card.dataset.tags = it.tags.join(',');
    const title = document.createElement('strong');
    title.textContent = it.title;
    const meta = document.createElement('div');
    meta.style.fontSize = '0.8rem';
    meta.style.color = 'rgba(0,0,0,0.6)';
    meta.textContent = it.meta;
    const actions = document.createElement('div');
    actions.className = 'actions';
    if (it.section === 'show') {
      ['Add to Calendar','Share','Get Details'].forEach(label => {
        const b = document.createElement('button');
        b.textContent = label;
        actions.appendChild(b);
      });
    } else if (it.section === 'performer') {
      ['Follow','Message','Save'].forEach(label => {
        const b = document.createElement('button');
        b.textContent = label;
        if (label === 'Message') b.className = 'primary';
        actions.appendChild(b);
      });
    } else if (it.section === 'venue') {
      ['Follow','Message','Book'].forEach(label => {
        const b = document.createElement('button');
        b.textContent = label;
        if (label === 'Message') b.className = 'primary';
        actions.appendChild(b);
      });
    } else if (it.section === 'news') {
      ['Read article','Follow'].forEach(label => {
        const b = document.createElement('button');
        b.textContent = label;
        if (label === 'Read article') b.className = 'primary';
        actions.appendChild(b);
      });
    }
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);
    feed.appendChild(card);
  });
}

// Near Me page
function populateNearMe() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initLocalNav('near');
  const list = document.getElementById('near-list');
  if (!list) return;
  list.innerHTML = '';
  const events = [
    { title: 'Morning Jazz @ Cafe Blue', meta: 'Today · 10am · 0.5 mi', action: 'Get Details', category: 'today' },
    { title: 'Comedy Night @ The Barrel', meta: 'Tonight · 9pm · 2.1 mi', action: 'Book Reservation', category: 'week' }
  ];
  events.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'near-card';
    card.dataset.category = ev.category;
    const title = document.createElement('strong');
    title.textContent = ev.title;
    const meta = document.createElement('div');
    meta.style.fontSize = '0.8rem';
    meta.style.color = 'rgba(0,0,0,0.6)';
    meta.textContent = ev.meta;
    const btn = document.createElement('button');
    btn.textContent = ev.action;
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(btn);
    list.appendChild(card);
  });
}

// Search page
function populateSearch() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  initLocalNav('search');
  const results = document.getElementById('search-results');
  if (!results) return;
  results.innerHTML = '';
  // Placeholder search results
  const resultsData = [
    { title: 'Sam Singer', meta: 'Performer · Jazz · 2 mi', type: 'performer' },
    { title: 'Cafe Blue', meta: 'Venue · Downtown', type: 'venue' },
    { title: 'Jazz Night', meta: 'Show · Sep 21', type: 'show' }
  ];
  resultsData.forEach(res => {
    const card = document.createElement('div');
    card.className = 'search-card';
    card.dataset.type = res.type;
    const title = document.createElement('strong');
    title.textContent = res.title;
    const meta = document.createElement('div');
    meta.style.fontSize = '0.8rem';
    meta.style.color = 'rgba(0,0,0,0.6)';
    meta.textContent = res.meta;
    const actions = document.createElement('div');
    actions.className = 'actions';
    if (res.type === 'performer' || res.type === 'venue') {
      ['Follow','Message'].forEach(label => {
        const b = document.createElement('button');
        b.textContent = label;
        if (label === 'Message') b.className = 'primary';
        actions.appendChild(b);
      });
    } else {
      ['Add to Calendar','Save'].forEach(label => {
        const b = document.createElement('button');
        b.textContent = label;
        actions.appendChild(b);
      });
    }
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);
    results.appendChild(card);
  });
}

// Switch between For You and Following feeds on local home
function switchLocalFeed(selection) {
  // If user selects 'following' on home page, redirect to dedicated Following page
  if (selection === 'following') {
    window.location.href = 'following.html';
  } else {
    localStorage.setItem('locally_feed_selection', selection);
    populateLocalHome();
  }
}

// Filter local home sections by category
function filterLocalHome(category) {
  const sections = document.querySelectorAll('.local-section');
  sections.forEach(sec => {
    if (!category || category === 'all') {
      sec.style.display = '';
    } else {
      const cat = sec.dataset.category;
      if (cat === category) {
        sec.style.display = '';
      } else {
        sec.style.display = 'none';
      }
    }
  });
}

// Filter discover feed by chip category
function filterDiscover(category) {
  const cards = document.querySelectorAll('#local-discover-feed .discover-card');
  cards.forEach(card => {
    const section = card.dataset.section;
    const tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
    if (!category || category === 'all') {
      card.style.display = '';
      return;
    }
    // tonight and this-weekend show only show cards with matching tags
    if (category === 'tonight' || category === 'this-weekend') {
      card.style.display = section === 'show' && tags.includes(category) ? '' : 'none';
      return;
    }
    // nearby shows performers/venues near you
    if (category === 'nearby') {
      card.style.display = tags.includes('nearby') ? '' : 'none';
      return;
    }
    // free and all-ages treat like free shows (we mark sample show as free)
    if (category === 'free' || category === 'all-ages' || category === 'open-mic') {
      card.style.display = tags.includes('free') ? '' : 'none';
      return;
    }
    card.style.display = 'none';
  });
}

// Filter near me events
function filterNearMe(filter) {
  const cards = document.querySelectorAll('#near-list .near-card');
  cards.forEach(card => {
    const cat = card.dataset.category;
    if (!filter || filter === 'all') {
      card.style.display = '';
    } else {
      card.style.display = cat === filter ? '' : 'none';
    }
  });
}

// Filter search results by scope
function filterSearch(scope) {
  const cards = document.querySelectorAll('#search-results .search-card');
  cards.forEach(card => {
    const type = card.dataset.type;
    if (!scope || scope === 'all') {
      card.style.display = '';
    } else {
      card.style.display = type === scope ? '' : 'none';
    }
  });
}

// Toggle message board overlay for local pages
function toggleMessageBoard() {
  let board = document.getElementById('message-board');
  if (!board) {
    board = document.createElement('div');
    board.id = 'message-board';
    board.style.position = 'fixed';
    // Position board below top bars; adjust for sticky headers
    // Place the board below the top bar so it's visible on any page
    board.style.top = '80px';
    board.style.right = '16px';
    board.style.width = '300px';
    board.style.maxHeight = '380px';
    board.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--bone');
    board.style.color = getComputedStyle(document.documentElement).getPropertyValue('--night');
    board.style.borderRadius = getComputedStyle(document.documentElement).getPropertyValue('--radius-card');
    board.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    board.style.overflowY = 'auto';
    board.style.zIndex = '2000';
    board.style.padding = '0.75rem';
    // Sample threads
    const threads = [
      { name: 'Sam Singer', snippet: 'Are you coming tonight?' },
      { name: 'Cafe Blue', snippet: 'New deals this week!' },
      { name: 'The Copper Room', snippet: 'Thanks for the review!' }
    ];
    threads.forEach(th => {
      const item = document.createElement('div');
      item.style.padding = '0.5rem 0';
      item.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
      const name = document.createElement('strong');
      name.textContent = th.name;
      const msg = document.createElement('div');
      msg.textContent = th.snippet;
      msg.style.fontSize = '0.8rem';
      msg.style.color = 'rgba(0,0,0,0.6)';
      item.appendChild(name);
      item.appendChild(msg);
      board.appendChild(item);
    });
    document.body.appendChild(board);
  }
  board.style.display = (board.style.display === 'none' || board.style.display === '') ? 'block' : 'none';
}

// Utility to hide dropdowns and highlight nav after navigation
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  // Redirect to login if not authenticated and not on auth pages
  const authPages = ['index.html','signup.html','signup_performer.html','signup_venue.html','signup_local.html'];
  const current = location.pathname.split('/').pop();
  if (!user && !authPages.includes(current)) {
    window.location.href = 'index.html';
  }

  // Attach toggle handler to any message icon in the top bar for local pages
  const messageIcons = document.querySelectorAll('.message-icon');
  messageIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      // Prevent event from bubbling to dropdown or other handlers
      e.stopPropagation();
      toggleMessageBoard();
    });
  });

  // For local pages with a custom bottom nav, also attach message board toggle to the entire top right container
  if (document.querySelector('.bottom-nav-local')) {
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
      // The right container is the third child of the top bar
      const containers = topBar.querySelectorAll(':scope > div');
      if (containers.length >= 3) {
        const rightContainer = containers[2];
        rightContainer.addEventListener('click', (e) => {
          // Do not interfere with profile dropdown or sign-out links
          if (e.target.classList.contains('profile') || e.target.closest('.dropdown')) return;
          toggleMessageBoard();
        });
      }
    }
  }
});