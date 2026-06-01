/* ═══════════════════════════════════════════════════════════════
   Field Companion – app.js
   Plain vanilla JS, no build tools, no dependencies.
   All state lives in localStorage under the key "fc_state".
═══════════════════════════════════════════════════════════════ */

'use strict';

// ── Storage key ──────────────────────────────────────────────────
const STORAGE_KEY = 'fc_state';

// ── Violation sound path (shared across all items) ───────────────
const VIOLATION_SOUND = 'assets/sounds/violation.mp3';

// ── Creature encounter definitions (mirrored from gamify) ────────
const CREATURE_ENCOUNTERS = [
  {
    key: 'easy',
    name: 'Common Goblin',
    difficulty: 'Easy',
    emoji: '👺',
    victoryMessage: 'You faced the Common Goblin and held your ground. The habit was resisted.',
    defeatMessage: 'The Common Goblin bested you this time. The habit prevailed — but the battle is recorded.',
  },
  {
    key: 'medium',
    name: 'Common Troll',
    difficulty: 'Medium',
    emoji: '👹',
    victoryMessage: 'You stood firm against the Common Troll. The bad habit was defeated.',
    defeatMessage: 'The Common Troll overwhelmed your resolve. The habit won this round — record it and fight on.',
  },
  {
    key: 'hard',
    name: 'Common Dragon',
    difficulty: 'Hard',
    emoji: '🐉',
    victoryMessage: 'Against all odds you slew the Common Dragon. A tremendous act of will.',
    defeatMessage: 'The Common Dragon proved too fierce. The bad habit struck hard — acknowledged and recorded.',
  },
];

const REWARD_ROLL_LINES = [
  'Runes hum in the dark...',
  'The chest rattles with promise...',
  'Ancient sigils ignite...',
  'Fortune turns the gears...',
  'The lock strains and glows...',
];

const GOLD_COINS_ID = 'gold-coins';
const REWARD_RARE_IDS = new Set(['genie-lamp', 'time']);
const REWARD_ROLL_DURATION_MS = 2200;

// ── Default catalog ──────────────────────────────────────────────
// These items are written to localStorage on first launch.
// Icon filenames match gamify/image_assets/shop/ exactly.
const DEFAULT_CATALOG = [
  // ── Potions ─────────────────────────────────────────────────────
  {
    id: 'weak-health-potion',
    name: 'Weak Health Potion',
    description: 'A crude but effective brew that mends minor wounds. Earned through diligent effort.',
    icon: 'assets/icons/weak_health_potion.png',
    sound: 'assets/sounds/potion.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Weak Health Potion. A warm tingle spreads through your body.',
    violationMessage: 'You reached for a Weak Health Potion you had not earned. The transgression has been recorded.',
    quantity: 0,
  },
  {
    id: 'strong-health-potion',
    name: 'Strong Health Potion',
    description: 'A potent elixir that seals deep wounds and restores vigor. A hard-won reward.',
    icon: 'assets/icons/strong_health_potion.png',
    sound: 'assets/sounds/potion.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Strong Health Potion. Power surges through your veins.',
    violationMessage: 'You reached for a Strong Health Potion you had not earned. The transgression has been recorded.',
    quantity: 0,
  },
  {
    id: 'elixir-of-boost',
    name: 'Elixir of Boost',
    description: 'A bright tonic that restores vitality and sharpens the mind.',
    icon: 'assets/icons/elixir_of_boost.png',
    sound: 'assets/sounds/potion.mp3',
    useVerb: 'Drink',
    successMessage: 'You uncork the Elixir of Boost and drink it down. Energy rushes through you.',
    violationMessage: 'You consumed an Elixir of Boost you had not earned. The Journal records your excess.',
    quantity: 0,
  },
  {
    id: 'fountain-of-youth-elixir',
    name: 'Fountain of Youth Elixir',
    description: 'A shimmering elixir of legendary rarity. Fully restores hydration and wards off dehydration.',
    icon: 'assets/icons/fountain_of_youth_potion.png',
    sound: 'assets/sounds/magic.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Fountain of Youth Elixir. Time itself seems to slow as youth floods back into your limbs.',
    violationMessage: 'You drank the Fountain of Youth Elixir without earning it. Such greed has been recorded.',
    quantity: 0,
  },
  // ── Teas ────────────────────────────────────────────────────────
  {
    id: 'green-tea',
    name: 'Green Tea',
    description: 'A calming brew that resolves the active hydration reminder.',
    icon: 'assets/icons/green_tea.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You sip the Green Tea. The warmth settles your thoughts.',
    violationMessage: 'You drank Green Tea you had not poured. The Journal takes note.',
    quantity: 0,
  },
  {
    id: 'herbal-tea',
    name: 'Herbal Tea',
    description: 'A gentle infusion that satisfies the active hydration reminder.',
    icon: 'assets/icons/herbal_tea.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You sip the Herbal Tea. A gentle calm washes over you.',
    violationMessage: 'You sipped Herbal Tea you had not earned. The Journal takes note.',
    quantity: 0,
  },
  {
    id: 'black-tea',
    name: 'Black Tea',
    description: 'A bold cup that satisfies the active hydration reminder with a richer taste.',
    icon: 'assets/icons/black_tea.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Black Tea. The tannins bite, then settle warm and smooth.',
    violationMessage: 'You drank Black Tea you had not earned. The Journal records it.',
    quantity: 0,
  },
  // ── Drinks ──────────────────────────────────────────────────────
  {
    id: 'black-coffee',
    name: 'Black Coffee',
    description: 'A dangerous luxury that sharpens focus but comes with a cost.',
    icon: 'assets/icons/black_coffee.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Black Coffee. Focus flares like lightning.',
    violationMessage: 'You drank Black Coffee you had not earned. The Journal marks your overreach.',
    quantity: 0,
  },
  {
    id: 'ale',
    name: 'Ale',
    description: 'A rough tavern drink. A small indulgence earned after a hard day.',
    icon: 'assets/icons/ale.png',
    sound: 'assets/sounds/ale.mp3',
    useVerb: 'Drink',
    successMessage: 'You raise the Ale and drink deep. The tavern roar fades into warmth.',
    violationMessage: 'You drank Ale you had not earned. The barmaid eyes you with suspicion. Recorded.',
    quantity: 0,
  },
  {
    id: 'milk',
    name: 'Milk',
    description: 'A creamy drink that satisfies your current hydration reminder.',
    icon: 'assets/icons/milk.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Milk. Simple and wholesome.',
    violationMessage: 'You drank Milk you had not earned. The Journal records the indulgence.',
    quantity: 0,
  },
  {
    id: 'posset',
    name: 'Posset',
    description: 'A spiced dairy drink that satisfies the active hydration reminder.',
    icon: 'assets/icons/posset.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Posset. Spice and warmth coat your throat.',
    violationMessage: 'You consumed a Posset you had not earned. Recorded.',
    quantity: 0,
  },
  {
    id: 'flavored-water',
    name: 'Flavored Water',
    description: 'A light refreshment that satisfies the active hydration reminder.',
    icon: 'assets/icons/flavored_water.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Flavored Water. Crisp and refreshing.',
    violationMessage: 'You drank Flavored Water you had not earned. Recorded.',
    quantity: 0,
  },
  {
    id: 'sparkling-water',
    name: 'Sparkling Water',
    description: 'A bubbly refreshment that satisfies the active hydration reminder.',
    icon: 'assets/icons/sparkling_water.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Sparkling Water. The bubbles are invigorating.',
    violationMessage: 'You consumed Sparkling Water you had not earned. Recorded.',
    quantity: 0,
  },
  {
    id: 'fruit-juice',
    name: 'Fruit Juice',
    description: 'A fruity drink that can satisfy your current hydration reminder.',
    icon: 'assets/icons/fruit_juice.png',
    sound: 'assets/sounds/tea.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Fruit Juice. Sweet and bright.',
    violationMessage: 'You drank Fruit Juice you had not earned. Recorded.',
    quantity: 0,
  },
  {
    id: 'sweet-beverage',
    name: 'Sweet Beverage',
    description: 'A sugary drink that satisfies thirst but costs vitality.',
    icon: 'assets/icons/sweet_beverage.png',
    sound: 'assets/sounds/ale.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Sweet Beverage. Delicious, but you sense the sugar coursing through you.',
    violationMessage: 'You consumed a Sweet Beverage you had not earned. The Journal records the excess.',
    quantity: 0,
  },
  {
    id: 'sweet-fizzy-beverage',
    name: 'Sweet Fizzy Beverage',
    description: 'A sparkling sugary drink that satisfies thirst with an extra burst of fizz.',
    icon: 'assets/icons/sweet_fizzy_beverage.png',
    sound: 'assets/sounds/ale.mp3',
    useVerb: 'Drink',
    successMessage: 'You drink the Sweet Fizzy Beverage. The bubbles crackle as the sugar rush hits.',
    violationMessage: 'You consumed a Sweet Fizzy Beverage you had not earned. The Journal marks the indulgence.',
    quantity: 0,
  },
  // ── Food ────────────────────────────────────────────────────────
  {
    id: 'candy',
    name: 'Candy',
    description: 'A sweet treat. A small guilty pleasure earned through effort.',
    icon: 'assets/icons/candy.png',
    sound: 'assets/sounds/ale.mp3',
    useVerb: 'Eat',
    successMessage: 'You pop the Candy into your mouth. It melts sweetly.',
    violationMessage: 'You ate Candy you had not earned. The Journal records the indulgence.',
    quantity: 0,
  },
  {
    id: 'small-pastry',
    name: 'Small Pastry',
    description: 'A modest baked treat. A small reward for a task completed.',
    icon: 'assets/icons/small_pastry.png',
    sound: 'assets/sounds/ale.mp3',
    useVerb: 'Eat',
    successMessage: 'You eat the Small Pastry. Flaky and satisfying.',
    violationMessage: 'You ate a Small Pastry you had not earned. Recorded.',
    quantity: 0,
  },
  {
    id: 'large-pastry',
    name: 'Large Pastry',
    description: 'An indulgent baked good. A reward for significant effort.',
    icon: 'assets/icons/large_pastry.png',
    sound: 'assets/sounds/ale.mp3',
    useVerb: 'Eat',
    successMessage: 'You eat the Large Pastry. Rich and deeply satisfying.',
    violationMessage: 'You consumed a Large Pastry you had not earned. The Journal records the transgression.',
    quantity: 0,
  },
  {
    id: 'unhealthy-meal',
    name: 'Unhealthy Meal',
    description: 'A decadent and regrettable meal. Consumed only when truly earned.',
    icon: 'assets/icons/unhealthy_meal.png',
    sound: 'assets/sounds/ale.mp3',
    useVerb: 'Eat',
    successMessage: 'You eat the Unhealthy Meal. It is glorious and terrible all at once.',
    violationMessage: 'You ate an Unhealthy Meal you had not earned. The Journal records your lapse.',
    quantity: 0,
  },
  // ── Special ──────────────────────────────────────────────────────
  {
    id: GOLD_COINS_ID,
    name: 'Gold Coins',
    description: 'A stacked coin pouch, tracked as one running total like classic RuneScape.',
    icon: 'assets/icons/gold_coins.png',
    sound: 'assets/sounds/magic.mp3',
    useVerb: 'Spend',
    successMessage: 'You spend 1 gold coin from your pouch.',
    violationMessage: 'You tried to spend gold coins you had not earned. The Journal records the debt.',
    quantity: 0,
  },
  {
    id: 'diamond',
    name: 'Diamond',
    description: 'A precious gem of great value. Spend wisely in the bazaar.',
    icon: 'assets/icons/diamond.png',
    sound: 'assets/sounds/magic.mp3',
    useVerb: 'Use',
    successMessage: 'You spend the Diamond. Its brilliance lingers in your memory.',
    violationMessage: 'You spent a Diamond you had not earned. The merchant is not pleased. Recorded.',
    quantity: 0,
  },
  {
    id: 'gold-piece',
    name: 'Gold Piece',
    description: 'A single minted coin, useful as a small currency reward.',
    icon: 'assets/icons/gold_piece.png',
    sound: 'assets/sounds/magic.mp3',
    useVerb: 'Spend',
    successMessage: 'You spend a Gold Piece in a quick trade.',
    violationMessage: 'You tried to spend a Gold Piece you had not earned. The Journal records the debt.',
    quantity: 0,
  },
  {
    id: 'genie-lamp',
    name: 'Genie Lamp',
    description: 'An ancient brass lamp humming with trapped power. Use wisely — one wish granted.',
    icon: 'assets/icons/genie_lamp.png',
    sound: 'assets/sounds/magic.mp3',
    useVerb: 'Rub',
    successMessage: 'You rub the Genie Lamp. Smoke billows and a voice echoes — "Your wish is my command."',
    violationMessage: 'You rubbed a Genie Lamp you had not obtained. The spirit within is not amused. Recorded.',
    quantity: 0,
  },
  {
    id: 'mystery-box',
    name: 'Mystery Box',
    description: 'A sealed crate of unknown contents. Fortune favors the bold.',
    icon: 'assets/icons/mystery_box.png',
    sound: 'assets/sounds/magic.mp3',
    useVerb: 'Open',
    successMessage: 'You open the Mystery Box. Something wondrous tumbles out.',
    violationMessage: 'You opened a Mystery Box you had not earned. The Journal notes your impatience.',
    quantity: 0,
  },
  {
    id: 'time',
    name: 'Leisure Time',
    description: 'A measure of free time, earned and protected. Use it well.',
    icon: 'assets/icons/time.png',
    sound: 'assets/sounds/magic.mp3',
    useVerb: 'Use',
    successMessage: 'You spend the Leisure Time. A moment of rest, well earned.',
    violationMessage: 'You spent Leisure Time you had not earned. The Journal records the idle hour.',
    quantity: 0,
  },
];

// ═══════════════════════════════════════════════════════════════
//  STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function mergeCatalogDefaults(loadedState) {
  const normalized = loadedState && typeof loadedState === 'object' ? loadedState : {};

  if (!Array.isArray(normalized.catalog)) {
    normalized.catalog = structuredClone(DEFAULT_CATALOG);
  } else {
    normalized.catalog = normalized.catalog.map(item => ({
      ...item,
      icon: item.id === GOLD_COINS_ID ? 'assets/icons/gold_coins.png' : item.icon,
      quantity: Math.max(0, parseInt(item.quantity, 10) || 0),
    }));

    const existingIds = new Set(normalized.catalog.map(item => item.id));
    DEFAULT_CATALOG.forEach(defaultItem => {
      if (!existingIds.has(defaultItem.id)) {
        normalized.catalog.push(structuredClone(defaultItem));
      }
    });
  }

  if (!Array.isArray(normalized.journal)) {
    normalized.journal = [];
  }

  return normalized;
}

/** Load state from localStorage, or seed with defaults. */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return mergeCatalogDefaults(JSON.parse(raw));
  } catch {
    // corrupt storage — start fresh
  }
  return mergeCatalogDefaults({});
}

/** Persist state to localStorage. */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Global state object — mutate then call saveState().
let state = loadState();

// ═══════════════════════════════════════════════════════════════
//  AUDIO
// ═══════════════════════════════════════════════════════════════

/** Play a sound file. Silently ignores missing files. */
function playSound(path) {
  if (!path) return;
  try {
    const audio = new Audio(path);
    audio.volume = 0.7;
    audio.play().catch(() => { /* file missing or blocked — ignore */ });
  } catch {
    // Audio not supported — ignore
  }
}

// ═══════════════════════════════════════════════════════════════
//  JOURNAL HELPERS
// ═══════════════════════════════════════════════════════════════

/** Create a new journal entry and prepend to journal array. */
function addJournalEntry(type, itemName, message) {
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    type,          // 'item_used' | 'violation'
    itemName,
    message,
    status: 'open',  // 'open' | 'processed'
    timestamp: new Date().toISOString(),
  };
  state.journal.unshift(entry);
  saveState();
  return entry;
}

/** Mark a journal entry as processed. */
function processJournalEntry(id) {
  const entry = state.journal.find(e => e.id === id);
  if (entry) { entry.status = 'processed'; saveState(); }
}

// ═══════════════════════════════════════════════════════════════
//  ITEM USE LOGIC
// ═══════════════════════════════════════════════════════════════

/**
 * Core use-item logic.
 * Returns { success: bool, message: string } so the caller can show UI.
 */
function useItem(itemId) {
  const item = state.catalog.find(i => i.id === itemId);
  if (!item) return;

  if (item.quantity > 0) {
    // ── Success path ─────────────────────────────────────────
    item.quantity -= 1;
    playSound(item.sound);
    addJournalEntry('item_used', item.name, item.successMessage);
    saveState();
    return { success: true, message: item.successMessage, icon: '✨' };
  } else {
    // ── Violation path ───────────────────────────────────────
    playSound(VIOLATION_SOUND);
    addJournalEntry('violation', item.name, item.violationMessage);
    return { success: false, message: item.violationMessage, icon: '⚠️' };
  }
}

function getRewardWeight(item) {
  if (!item) return 1;
  if (item.id === GOLD_COINS_ID) return 8;
  return REWARD_RARE_IDS.has(item.id) ? 1 : 4;
}

function drawRewardDrops() {
  const pool = state.catalog.filter(item => item && item.id);
  if (pool.length === 0) return [];

  const roll = Math.random();
  const dropCount = roll < 0.5 ? 1 : (roll < 0.85 ? 2 : 3);
  const cappedCount = Math.min(dropCount, pool.length);

  const remaining = [...pool];
  const drops = [];

  for (let i = 0; i < cappedCount; i += 1) {
    const totalWeight = remaining.reduce((sum, item) => sum + getRewardWeight(item), 0);
    let target = Math.random() * totalWeight;
    let pickIndex = 0;

    for (let j = 0; j < remaining.length; j += 1) {
      target -= getRewardWeight(remaining[j]);
      if (target <= 0) {
        pickIndex = j;
        break;
      }
    }

    const picked = remaining.splice(pickIndex, 1)[0];
    drops.push({
      itemId: picked.id,
      name: picked.name,
      icon: picked.icon,
      qty: picked.id === GOLD_COINS_ID
        ? (Math.floor(Math.random() * 151) + 50)
        : (Math.random() < 0.22 ? 2 : 1),
    });
  }

  return drops;
}

// ═══════════════════════════════════════════════════════════════
//  DOM HELPERS
// ═══════════════════════════════════════════════════════════════

/** Safely query a single element — throws a useful error if missing. */
function $(selector) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

/** Show an img if the path loads, otherwise show a fallback emoji. */
function makeIcon(src, fallbackEmoji, cssClass) {
  const img = document.createElement('img');
  img.src = src || '';
  img.alt = '';
  img.className = cssClass;
  img.onerror = () => {
    const span = document.createElement('span');
    span.className = cssClass.replace('icon', 'icon-fallback');
    span.textContent = fallbackEmoji;
    img.replaceWith(span);
  };
  return img;
}

/** Format an ISO timestamp to a readable local string. */
function formatTimestamp(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ═══════════════════════════════════════════════════════════════
//  SCREEN NAVIGATION
// ═══════════════════════════════════════════════════════════════

const SCREENS = ['backpack', 'journal', 'catalog'];

function showScreen(name) {
  SCREENS.forEach(s => {
    document.getElementById(`screen-${s}`).classList.toggle('active', s === name);
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === name);
  });

  // Re-render the active screen
  if (name === 'backpack') renderBackpack();
  if (name === 'journal')  renderJournal();
  if (name === 'catalog')  renderCatalog();
}

// ═══════════════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════════════

// ── Item use modal ───────────────────────────────────────────────
const itemModal    = document.getElementById('item-modal');
const itemModalClose = document.getElementById('item-modal-close');

function openItemModal(item) {
  // Populate icon
  const wrap = itemModal.querySelector('.modal-icon-wrap');
  wrap.innerHTML = '';
  const img = makeIcon(item.icon, '🎒', 'modal-icon');
  wrap.appendChild(img);

  document.getElementById('item-modal-name').textContent = item.name;
  document.getElementById('item-modal-desc').textContent = item.description;
  document.getElementById('item-modal-qty').textContent  = item.quantity;
  document.getElementById('item-modal-use-btn').textContent = item.useVerb || 'Use';
  document.getElementById('item-modal-use-btn').dataset.id = item.id;

  itemModal.classList.remove('hidden');
}

function closeItemModal() {
  itemModal.classList.add('hidden');
}

itemModalClose.addEventListener('click', closeItemModal);
itemModal.addEventListener('click', e => { if (e.target === itemModal) closeItemModal(); });

document.getElementById('item-modal-use-btn').addEventListener('click', e => {
  const id = e.currentTarget.dataset.id;
  const result = useItem(id);
  closeItemModal();
  openResultModal(result.icon, result.message);
  renderBackpack();  // refresh quantity badges
});

// ── Result modal ─────────────────────────────────────────────────
const resultModal = document.getElementById('result-modal');

function openResultModal(icon, message) {
  document.getElementById('result-modal-icon-wrap').textContent = icon;
  document.getElementById('result-modal-message').textContent   = message;
  resultModal.classList.remove('hidden');
}

function closeResultModal() {
  resultModal.classList.add('hidden');
}

document.getElementById('result-modal-ok').addEventListener('click', closeResultModal);
resultModal.addEventListener('click', e => { if (e.target === resultModal) closeResultModal(); });

// ── Editor modal ─────────────────────────────────────────────────
const editorModal    = document.getElementById('editor-modal');
const editorForm     = document.getElementById('editor-form');
const editorDeleteBtn = document.getElementById('editor-delete-btn');

let _editingItemId = null;  // null = new item

function openEditorModal(item) {
  _editingItemId = item ? item.id : null;
  document.getElementById('editor-modal-title').textContent = item ? 'Edit Item' : 'New Item';

  document.getElementById('ef-name').value    = item ? item.name          : '';
  document.getElementById('ef-desc').value    = item ? item.description   : '';
  document.getElementById('ef-icon').value    = item ? item.icon          : '';
  document.getElementById('ef-sound').value   = item ? item.sound         : '';
  document.getElementById('ef-verb').value    = item ? item.useVerb       : 'Use';
  document.getElementById('ef-success').value = item ? item.successMessage  : '';
  document.getElementById('ef-violation').value = item ? item.violationMessage : '';
  document.getElementById('ef-qty').value     = item ? item.quantity      : 0;

  // Hide delete button for new items
  editorDeleteBtn.style.display = item ? 'block' : 'none';

  editorModal.classList.remove('hidden');
}

function closeEditorModal() {
  editorModal.classList.add('hidden');
  _editingItemId = null;
}

document.getElementById('editor-modal-close').addEventListener('click', closeEditorModal);
editorModal.addEventListener('click', e => { if (e.target === editorModal) closeEditorModal(); });

editorForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('ef-name').value.trim();
  if (!name) return;

  if (_editingItemId) {
    // Update existing
    const item = state.catalog.find(i => i.id === _editingItemId);
    if (item) {
      item.name             = name;
      item.description      = document.getElementById('ef-desc').value.trim();
      item.icon             = document.getElementById('ef-icon').value.trim();
      item.sound            = document.getElementById('ef-sound').value.trim();
      item.useVerb          = document.getElementById('ef-verb').value.trim() || 'Use';
      item.successMessage   = document.getElementById('ef-success').value.trim();
      item.violationMessage = document.getElementById('ef-violation').value.trim();
      item.quantity         = Math.max(0, parseInt(document.getElementById('ef-qty').value, 10) || 0);
    }
  } else {
    // Create new
    const newItem = {
      id: 'item-' + Date.now(),
      name,
      description:      document.getElementById('ef-desc').value.trim(),
      icon:             document.getElementById('ef-icon').value.trim(),
      sound:            document.getElementById('ef-sound').value.trim(),
      useVerb:          document.getElementById('ef-verb').value.trim() || 'Use',
      successMessage:   document.getElementById('ef-success').value.trim(),
      violationMessage: document.getElementById('ef-violation').value.trim(),
      quantity: Math.max(0, parseInt(document.getElementById('ef-qty').value, 10) || 0),
    };
    state.catalog.push(newItem);
  }

  saveState();
  closeEditorModal();
  renderCatalog();
});

editorDeleteBtn.addEventListener('click', () => {
  if (!_editingItemId) return;
  if (!confirm('Delete this item from the catalog? This cannot be undone.')) return;
  state.catalog = state.catalog.filter(i => i.id !== _editingItemId);
  saveState();
  closeEditorModal();
  renderCatalog();
});

// ═══════════════════════════════════════════════════════════════
//  RENDER: BACKPACK
// ═══════════════════════════════════════════════════════════════

function renderBackpack() {
  const grid = document.getElementById('backpack-grid');
  grid.innerHTML = '';

  state.catalog.forEach(item => {
    const slot = document.createElement('div');
    slot.className = 'item-slot' + (item.quantity === 0 ? ' depleted' : '');
    slot.setAttribute('role', 'button');
    slot.setAttribute('tabindex', '0');
    slot.setAttribute('aria-label', `${item.name}, quantity ${item.quantity}`);
    slot.dataset.id = item.id;

    // Icon
    const icon = makeIcon(item.icon, '🎒', 'slot-icon');
    slot.appendChild(icon);

    // Quantity badge
    const badge = document.createElement('span');
    badge.className = 'slot-qty' + (item.quantity === 0 ? ' qty-zero' : '');
    badge.textContent = item.quantity;
    slot.appendChild(badge);

    // Click / keyboard → open use modal
    const handleActivate = () => openItemModal(item);
    slot.addEventListener('click', handleActivate);
    slot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivate(); }
    });

    grid.appendChild(slot);
  });
}

// ═══════════════════════════════════════════════════════════════
//  RENDER: JOURNAL
// ═══════════════════════════════════════════════════════════════

let _journalFilter = 'open';  // 'open' | 'all'

function renderJournal() {
  const list = document.getElementById('journal-list');
  list.innerHTML = '';

  let entries = state.journal;
  if (_journalFilter === 'open') {
    entries = entries.filter(e => e.status === 'open');
  }

  if (entries.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'journal-empty';
    empty.textContent = _journalFilter === 'open'
      ? 'No open entries. The journal is at rest.'
      : 'The journal is empty.';
    list.appendChild(empty);
    return;
  }

  entries.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'journal-entry' + (entry.status === 'processed' ? ' processed' : '');

    const header = document.createElement('div');
    header.className = 'journal-entry-header';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'journal-entry-item';
    nameSpan.textContent = entry.itemName;

    const badge = document.createElement('span');
    badge.className = `journal-type-badge badge-${entry.type}`;
    const TYPE_LABELS = {
      item_used:     'Used',
      violation:     'Violation',
      fight_victory: '⚔ Victory',
      fight_defeat:  '⚔ Defeat',
      reward_claimed: '🎁 Reward',
    };
    badge.textContent = TYPE_LABELS[entry.type] || entry.type;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'journal-entry-time';
    timeSpan.textContent = formatTimestamp(entry.timestamp);

    header.appendChild(nameSpan);
    header.appendChild(badge);
    header.appendChild(timeSpan);

    const msg = document.createElement('p');
    msg.className = 'journal-entry-msg';
    msg.style.whiteSpace = 'pre-line';
    msg.textContent = entry.message;

    li.appendChild(header);
    li.appendChild(msg);

    // Process button — only for open entries
    if (entry.status === 'open') {
      const btn = document.createElement('button');
      btn.className = 'journal-process-btn';
      btn.textContent = 'Mark as Processed';
      btn.addEventListener('click', () => {
        processJournalEntry(entry.id);
        renderJournal();
      });
      li.appendChild(btn);
    }

    list.appendChild(li);
  });
}

// ── Journal filter buttons ────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    _journalFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b === btn);
    });
    renderJournal();
  });
});

// ═══════════════════════════════════════════════════════════════
//  RENDER: CATALOG
// ═══════════════════════════════════════════════════════════════

function renderCatalog() {
  const list = document.getElementById('catalog-list');
  list.innerHTML = '';

  const sortedCatalog = [...state.catalog].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  );

  sortedCatalog.forEach(item => {
    const li = document.createElement('li');
    li.className = 'catalog-row';

    // Icon
    const icon = makeIcon(item.icon, '🎒', 'catalog-row-icon');
    li.appendChild(icon);

    // Info
    const info = document.createElement('div');
    info.className = 'catalog-row-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'catalog-row-name';
    nameEl.textContent = item.name;

    const qtyEl = document.createElement('div');
    qtyEl.className = 'catalog-row-qty';
    qtyEl.textContent = `Qty: ${item.quantity}`;
    qtyEl.dataset.id = item.id;

    info.appendChild(nameEl);
    info.appendChild(qtyEl);
    li.appendChild(info);

    // +/− controls and quantity display
    const controls = document.createElement('div');
    controls.className = 'catalog-row-controls';

    const minusBtn = document.createElement('button');
    minusBtn.className = 'qty-btn';
    minusBtn.textContent = '−';
    minusBtn.setAttribute('aria-label', `Decrease ${item.name} quantity`);
    minusBtn.addEventListener('click', () => {
      const target = state.catalog.find(i => i.id === item.id);
      if (target && target.quantity > 0) {
        target.quantity -= 1;
        saveState();
        qtyEl.textContent = `Qty: ${target.quantity}`;
        qtyDisplay.textContent = target.quantity;
      }
    });

    const qtyDisplay = document.createElement('span');
    qtyDisplay.className = 'catalog-qty-display';
    qtyDisplay.textContent = item.quantity;

    const plusBtn = document.createElement('button');
    plusBtn.className = 'qty-btn';
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', `Increase ${item.name} quantity`);
    plusBtn.addEventListener('click', () => {
      const target = state.catalog.find(i => i.id === item.id);
      if (target) {
        target.quantity += 1;
        saveState();
        qtyEl.textContent = `Qty: ${target.quantity}`;
        qtyDisplay.textContent = target.quantity;
      }
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'catalog-edit-btn';
    editBtn.textContent = '✏';
    editBtn.setAttribute('aria-label', `Edit ${item.name}`);
    editBtn.addEventListener('click', () => openEditorModal(item));

    controls.appendChild(minusBtn);
    controls.appendChild(qtyDisplay);
    controls.appendChild(plusBtn);
    controls.appendChild(editBtn);
    li.appendChild(controls);

    list.appendChild(li);
  });
}

// ── New item button ───────────────────────────────────────────────
document.getElementById('btn-new-item').addEventListener('click', () => {
  openEditorModal(null);
});

// ═══════════════════════════════════════════════════════════════
//  FIGHT LOG MODAL
// ═══════════════════════════════════════════════════════════════

const fightModal = document.getElementById('fight-modal');
const fightStepCreature = document.getElementById('fight-step-creature');
const fightStepOutcome  = document.getElementById('fight-step-outcome');
const fightSubmitBtn    = document.getElementById('fight-submit-btn');
const fightChosenName   = document.getElementById('fight-chosen-name');

let _fightCreatureKey = null;  // selected creature key
let _fightOutcome     = null;  // 'victory' | 'defeat'

function openFightModal() {
  // Reset state
  _fightCreatureKey = null;
  _fightOutcome     = null;
  document.getElementById('fight-notes').value = '';
  fightSubmitBtn.disabled = true;

  // Reset visual selections
  document.querySelectorAll('.creature-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('selected'));

  // Show step 1 only
  fightStepCreature.classList.remove('hidden');
  fightStepOutcome.classList.add('hidden');

  fightModal.classList.remove('hidden');
}

function closeFightModal() {
  fightModal.classList.add('hidden');
}

function updateFightSubmitState() {
  fightSubmitBtn.disabled = !(_fightCreatureKey && _fightOutcome);
}

// Open / close
document.getElementById('btn-log-fight').addEventListener('click', openFightModal);
document.getElementById('fight-modal-close').addEventListener('click', closeFightModal);
fightModal.addEventListener('click', e => { if (e.target === fightModal) closeFightModal(); });

// Step 1: creature selection
document.querySelectorAll('.creature-card').forEach(card => {
  card.addEventListener('click', () => {
    _fightCreatureKey = card.dataset.key;

    // Highlight selection
    document.querySelectorAll('.creature-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    // Populate step 2 label and reveal it
    const creature = CREATURE_ENCOUNTERS.find(c => c.key === _fightCreatureKey);
    fightChosenName.textContent = creature ? creature.name : '';
    fightStepOutcome.classList.remove('hidden');

    updateFightSubmitState();
  });
});

// Step 2: outcome selection
document.querySelectorAll('.outcome-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    _fightOutcome = btn.dataset.outcome;
    document.querySelectorAll('.outcome-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateFightSubmitState();
  });
});

// Submit
fightSubmitBtn.addEventListener('click', () => {
  if (!_fightCreatureKey || !_fightOutcome) return;

  const creature = CREATURE_ENCOUNTERS.find(c => c.key === _fightCreatureKey);
  const notes    = document.getElementById('fight-notes').value.trim();
  const won      = _fightOutcome === 'victory';

  const baseMessage = won ? creature.victoryMessage : creature.defeatMessage;
  const fullMessage = notes ? `${baseMessage}\n\n"${notes}"` : baseMessage;

  const type = won ? 'fight_victory' : 'fight_defeat';
  const label = `${creature.emoji} ${creature.name} (${creature.difficulty})`;

  addJournalEntry(type, label, fullMessage);

  closeFightModal();
  renderJournal();
});

// ═══════════════════════════════════════════════════════════════
//  REWARD MODAL
// ═══════════════════════════════════════════════════════════════

const rewardModal = document.getElementById('reward-modal');
const rewardCard = document.getElementById('reward-card');
const rewardRollBtn = document.getElementById('reward-roll-btn');
const rewardClaimBtn = document.getElementById('reward-claim-btn');
const rewardReelText = document.getElementById('reward-reel-text');
const rewardRevealList = document.getElementById('reward-reveal-list');

let rewardRolling = false;
let rewardReelInterval = null;

function resetRewardModalUI() {
  rewardCard.classList.remove('rolling', 'revealed');
  rewardReelText.textContent = 'Ready to roll the chest.';
  rewardRevealList.innerHTML = '';
  rewardClaimBtn.classList.add('hidden');
  rewardRollBtn.disabled = false;
}

function openRewardModal() {
  resetRewardModalUI();
  rewardModal.classList.remove('hidden');
}

function closeRewardModal() {
  if (rewardRolling) return;
  rewardModal.classList.add('hidden');
}

function renderRewardDrops(drops) {
  rewardRevealList.innerHTML = '';
  drops.forEach((drop, index) => {
    const li = document.createElement('li');
    li.className = 'reward-drop';
    li.style.animationDelay = `${index * 0.08}s`;

    const icon = makeIcon(drop.icon, '🎁', 'reward-drop-icon');
    li.appendChild(icon);

    const name = document.createElement('span');
    name.className = 'reward-drop-name';
    name.textContent = drop.name;
    li.appendChild(name);

    const qty = document.createElement('span');
    qty.className = 'reward-drop-qty';
    qty.textContent = `+${drop.qty}`;
    li.appendChild(qty);

    rewardRevealList.appendChild(li);
  });
}

function applyRewardDrops(drops) {
  drops.forEach(drop => {
    const item = state.catalog.find(entry => entry.id === drop.itemId);
    if (item) {
      item.quantity += drop.qty;
    }
  });
  saveState();
}

function logRewardDrops(drops) {
  const detailLines = drops.map(drop => `- ${drop.name} x${drop.qty}`);
  const message = `You opened the Mystic Reward Chest and received:\n${detailLines.join('\n')}`;
  addJournalEntry('reward_claimed', 'Mystic Reward Chest', message);
}

function startRewardRoll() {
  if (rewardRolling) return;

  if (!Array.isArray(state.catalog) || state.catalog.length === 0) {
    openResultModal('⚠️', 'No catalog items found. Add items in Catalog before rolling rewards.');
    return;
  }

  rewardRolling = true;
  rewardCard.classList.remove('revealed');
  rewardCard.classList.add('rolling');
  rewardRollBtn.disabled = true;
  rewardClaimBtn.classList.add('hidden');
  rewardRevealList.innerHTML = '';

  rewardReelInterval = setInterval(() => {
    const line = REWARD_ROLL_LINES[Math.floor(Math.random() * REWARD_ROLL_LINES.length)];
    rewardReelText.textContent = line;
  }, 160);

  setTimeout(() => {
    clearInterval(rewardReelInterval);
    rewardReelInterval = null;

    const drops = drawRewardDrops();
    applyRewardDrops(drops);
    logRewardDrops(drops);
    renderRewardDrops(drops);
    rewardReelText.textContent = 'Rewards revealed. Claim what you earned.';

    rewardCard.classList.remove('rolling');
    rewardCard.classList.add('revealed');
    rewardClaimBtn.classList.remove('hidden');
    rewardRolling = false;

    playSound('assets/sounds/magic.mp3');
    renderBackpack();
    renderCatalog();
  }, REWARD_ROLL_DURATION_MS);
}

document.getElementById('btn-reward-myself').addEventListener('click', openRewardModal);
document.getElementById('reward-modal-close').addEventListener('click', closeRewardModal);
rewardModal.addEventListener('click', e => { if (e.target === rewardModal) closeRewardModal(); });
rewardRollBtn.addEventListener('click', startRewardRoll);
rewardClaimBtn.addEventListener('click', () => {
  closeRewardModal();
  if (document.getElementById('screen-journal').classList.contains('active')) {
    renderJournal();
  }
});

// ═══════════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════════

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

// ═══════════════════════════════════════════════════════════════
//  EXPORT / IMPORT
// ═══════════════════════════════════════════════════════════════

document.getElementById('btn-export').addEventListener('click', () => {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href     = url;
  a.download = `field-companion-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('btn-import-trigger').addEventListener('click', () => {
  document.getElementById('import-file-input').click();
});

document.getElementById('import-file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const imported = JSON.parse(evt.target.result);

      // Basic validation — must have catalog array
      if (!Array.isArray(imported.catalog)) {
        alert('Invalid backup file: missing catalog.');
        return;
      }

      if (!confirm('Import this backup? Your current data will be replaced.')) return;

      state = imported;
      // Ensure journal exists after import
      if (!Array.isArray(state.journal)) state.journal = [];
      saveState();
      showScreen('backpack');
      alert('Backup imported successfully.');
    } catch {
      alert('Failed to parse the backup file. Make sure it is a valid JSON export.');
    }
  };

  reader.readAsText(file);
  // Reset so the same file can be re-imported if needed
  e.target.value = '';
});

// ═══════════════════════════════════════════════════════════════
//  SERVICE WORKER REGISTRATION
// ═══════════════════════════════════════════════════════════════

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════

// Render the default screen
showScreen('backpack');
