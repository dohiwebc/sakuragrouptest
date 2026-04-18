const firebaseConfig = {
  apiKey: "AIzaSyCjornedfO5QmeQtNYCW4xWpr7hhES87yc",
  authDomain: "sakurascore-39f78.firebaseapp.com",
  databaseURL: "https://sakurascore-39f78-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sakurascore-39f78",
  storageBucket: "sakurascore-39f78.firebasestorage.app",
  messagingSenderId: "773042743229",
  appId: "1:773042743229:web:590065203fd924c84fd4d4",
  measurementId: "G-BGRVPLKG0K",
};

const FALLBACK_PLAYERS = [
  { id: "1", name: "平岡 頼樹" },
  { id: "2", name: "山田 興" },
  { id: "3", name: "佐藤 陸翔" },
  { id: "4", name: "光田 明紗" },
  { id: "5", name: "乘松 孝明" },
  { id: "6", name: "須賀 瑞輝" },
  { id: "7", name: "和田 龍生" },
];

/** 閲覧モードで「選手名」ソート時の表示順（Firebase の name と完全一致する必要あり） */
const VIEWER_ROSTER_NAME_ORDER = [
  "平岡 頼樹",
  "山田 興",
  "乘松 孝明",
  "光田 明紗",
  "佐藤 陸翔",
  "須賀 瑞輝",
  "和田 龍生",
  "藤原 一聖",
  "二神 聖空",
  "奥田 達郎",
  "乘松 瑞希",
  "平岡 咲希",
  "上田 詩織",
  "佐藤 里虹",
  "大北 悠真",
];

let players = [...FALLBACK_PLAYERS];
let currentTournaments = [];
let currentMatches = [];

const stats = [
  { key: "attackSuccess", label: "アタック成功数" },
  { key: "attackFailure", label: "アタック失敗数" },
  { key: "zeroBreak", label: "ゼロ抜き数" },
  { key: "catch", label: "キャッチ数" },
  { key: "out", label: "アウト数" },
  { key: "return", label: "復帰数" },
];

const GRADE_SYMBOLS = {
  "1": "①",
  "2": "②",
  "3": "③",
};

const ROLE_LABELS = {
  captain: "★",
  viceCaptain: "☆",
};

const state = {
  selectedPlayerId: players[0]?.id ?? "",
  records: {},
  role: null,
  selectedTournamentId: "",
  selectedMatchId: "",
  viewerSelectedMatchIds: [],
  viewerSelectedPlayerId: "all",
  viewerStageFilter: "all",
  viewerOpponentFilter: "all",
  viewerDetailMatchId: "",
  viewerTournamentRecords: {},
  viewerLastRenderedRows: [],
  viewerLastSelectedMatchIds: [],
  viewerSortKey: "name",
  viewerSortOrder: "asc",
  viewerDetailSortKey: "name",
  viewerDetailSortOrder: "asc",
  currentStep: 1,
  showActiveOnly: false,
  autoSaveTimerId: null,
  autoSaveCountdownId: null,
  autoSaveDueAt: null,
  currentMatchSaveHistory: [],
  currentMatchLastUpdatedAt: null,
  exportSelectedTournamentIds: [],
};

const PASSWORDS = {
  staff: "sakurastaff",
};

const DB_PATHS = {
  players: "players",
  tournaments: "tournaments",
  matches: "matches",
  records: "records",
};

const loginCardEl = document.getElementById("loginCard");
const appAreaEl = document.getElementById("appArea");
const playerLoginButtonEl = document.getElementById("playerLoginButton");
const staffModeButtonEl = document.getElementById("staffModeButton");
const staffPasswordAreaEl = document.getElementById("staffPasswordArea");
const loginPasswordEl = document.getElementById("loginPassword");
const staffLoginButtonEl = document.getElementById("staffLoginButton");
const loginErrorEl = document.getElementById("loginError");
const guideAccordionButtonEl = document.getElementById("guideAccordionButton");
const guideAccordionBodyEl = document.getElementById("guideAccordionBody");
const guideAccordionIconEl = document.getElementById("guideAccordionIcon");
const metricsAccordionButtonEl = document.getElementById("metricsAccordionButton");
const metricsAccordionBodyEl = document.getElementById("metricsAccordionBody");
const metricsAccordionIconEl = document.getElementById("metricsAccordionIcon");
const logoutButtonEl = document.getElementById("logoutButton");
const modeTextEl = document.getElementById("modeText");
const saveMatchButtonEl = document.getElementById("saveMatchButton");
const saveStatusEl = document.getElementById("saveStatus");
const saveStatusDetailEl = document.getElementById("saveStatusDetail");
const validationMessageEl = document.getElementById("validationMessage");
const lastUpdatedTextEl = document.getElementById("lastUpdatedText");
const saveHistoryListEl = document.getElementById("saveHistoryList");

const tabsEl = document.getElementById("playerTabs");
const statsAreaEl = document.getElementById("statsArea");
const currentPlayerNameEl = document.getElementById("currentPlayerName");
const totalPlaysEl = document.getElementById("totalPlays");
const playerBenchStatusEl = document.getElementById("playerBenchStatus");
const toggleBenchButtonEl = document.getElementById("toggleBenchButton");
const togglePlayerActiveButtonEl = document.getElementById("togglePlayerActiveButton");
const benchMessageEl = document.getElementById("benchMessage");
const newPlayerNameEl = document.getElementById("newPlayerName");
const newPlayerGradeEl = document.getElementById("newPlayerGrade");
const newPlayerRoleEl = document.getElementById("newPlayerRole");
const newPlayerHandednessEl = document.getElementById("newPlayerHandedness");
const newPlayerMemoEl = document.getElementById("newPlayerMemo");
const createPlayerButtonEl = document.getElementById("createPlayerButton");
const showActiveOnlyButtonEl = document.getElementById("showActiveOnlyButton");
const togglePlayerManagementButtonEl = document.getElementById("togglePlayerManagementButton");
const playerManagementSectionEl = document.getElementById("playerManagementSection");
const playerManagementAccordionButtonEl = document.getElementById("playerManagementAccordionButton");
const playerManagementAccordionBodyEl = document.getElementById("playerManagementAccordionBody");
const playerManagementAccordionIconEl = document.getElementById("playerManagementAccordionIcon");
const playerManagementCreateAreaEl = document.getElementById("playerManagementCreateArea");
const playerManagementListEl = document.getElementById("playerManagementList");
const matchSummaryEl = document.getElementById("matchSummary");
const activePlayerCountEl = document.getElementById("activePlayerCount");
const benchPlayerCountEl = document.getElementById("benchPlayerCount");
const allPlayersTotalPlaysEl = document.getElementById("allPlayersTotalPlays");
const opponentEl = document.getElementById("opponent");
const matchStageEl = document.getElementById("matchStage");
const tournamentSelectEl = document.getElementById("tournamentSelect");
const tournamentHelpTextEl = document.getElementById("tournamentHelpText");
const newTournamentNameEl = document.getElementById("newTournamentName");
const tournamentDateEl = document.getElementById("tournamentDate");
const tournamentMatchTypeEl = document.getElementById("tournamentMatchType");
const createTournamentButtonEl = document.getElementById("createTournamentButton");
const confirmTournamentButtonEl = document.getElementById("confirmTournamentButton");
const toggleTournamentCreateButtonEl = document.getElementById("toggleTournamentCreateButton");
const toggleTournamentEditButtonEl = document.getElementById("toggleTournamentEditButton");
const tournamentCreateAreaEl = document.getElementById("tournamentCreateArea");
const tournamentEditAreaEl = document.getElementById("tournamentEditArea");
const editTournamentNameEl = document.getElementById("editTournamentName");
const editTournamentDateEl = document.getElementById("editTournamentDate");
const editTournamentMatchTypeEl = document.getElementById("editTournamentMatchType");
const updateTournamentButtonEl = document.getElementById("updateTournamentButton");
const deleteTournamentButtonEl = document.getElementById("deleteTournamentButton");
const viewerSectionEl = document.getElementById("viewerSection");
const viewerSummaryEl = document.getElementById("viewerSummary");
const exportViewerCsvButtonEl = document.getElementById("exportViewerCsvButton");
const viewerEmptyStateEl = document.getElementById("viewerEmptyState");
const viewerStageFilterEl = document.getElementById("viewerStageFilter");
const viewerOpponentFilterEl = document.getElementById("viewerOpponentFilter");
const viewerMatchFiltersEl = document.getElementById("viewerMatchFilters");
const viewerPlayerSelectEl = document.getElementById("viewerPlayerSelect");
const viewerTotalsEl = document.getElementById("viewerTotals");
const viewerTotalsAccordionButtonEl = document.getElementById("viewerTotalsAccordionButton");
const viewerTotalsAccordionBodyEl = document.getElementById("viewerTotalsAccordionBody");
const viewerTotalsAccordionIconEl = document.getElementById("viewerTotalsAccordionIcon");
const viewerRankingsEl = document.getElementById("viewerRankings");
const viewerRankingAccordionButtonEl = document.getElementById("viewerRankingAccordionButton");
const viewerRankingAccordionBodyEl = document.getElementById("viewerRankingAccordionBody");
const viewerRankingAccordionIconEl = document.getElementById("viewerRankingAccordionIcon");
const viewerDetailAccordionButtonEl = document.getElementById("viewerDetailAccordionButton");
const viewerDetailAccordionBodyEl = document.getElementById("viewerDetailAccordionBody");
const viewerDetailAccordionIconEl = document.getElementById("viewerDetailAccordionIcon");
const viewerTableBodyEl = document.getElementById("viewerTableBody");
const viewerDetailMatchSelectEl = document.getElementById("viewerDetailMatchSelect");
const viewerDetailSummaryEl = document.getElementById("viewerDetailSummary");
const viewerDetailTableBodyEl = document.getElementById("viewerDetailTableBody");
const selectAllViewerMatchesButtonEl = document.getElementById("selectAllViewerMatchesButton");
const clearViewerMatchesButtonEl = document.getElementById("clearViewerMatchesButton");
const viewerSortKeyEl = document.getElementById("viewerSortKey");
const viewerSortOrderEl = document.getElementById("viewerSortOrder");
const viewerSortButtonsEls = Array.from(
  document.querySelectorAll(".viewer-main-stats-table .table-sort-button"),
);
const viewerDetailSortButtonsEls = Array.from(
  document.querySelectorAll(".viewer-detail-stats-table .table-sort-button"),
);
const matchSelectEl = document.getElementById("matchSelect");
const matchHelpTextEl = document.getElementById("matchHelpText");
const createMatchButtonEl = document.getElementById("createMatchButton");
const confirmMatchButtonEl = document.getElementById("confirmMatchButton");
const toggleMatchCreateButtonEl = document.getElementById("toggleMatchCreateButton");
const toggleMatchEditButtonEl = document.getElementById("toggleMatchEditButton");
const matchCreateAreaEl = document.getElementById("matchCreateArea");
const matchEditAreaEl = document.getElementById("matchEditArea");
const editOpponentEl = document.getElementById("editOpponent");
const editMatchStageEl = document.getElementById("editMatchStage");
const updateMatchButtonEl = document.getElementById("updateMatchButton");
const deleteMatchButtonEl = document.getElementById("deleteMatchButton");
const backToStep1ButtonEl = document.getElementById("backToStep1Button");
const backToStep2ButtonEl = document.getElementById("backToStep2Button");
const step1SectionEl = document.getElementById("step1Section");
const step2SectionEl = document.getElementById("step2Section");
const step3SectionEl = document.getElementById("step3Section");
const checkModeSectionEl = document.getElementById("checkModeSection");
const checkModeSummaryEl = document.getElementById("checkModeSummary");
const checkModeListEl = document.getElementById("checkModeList");
const playerProfileModalEl = document.getElementById("playerProfileModal");
const playerProfileContentEl = document.getElementById("playerProfileContent");
const closePlayerProfileButtonEl = document.getElementById("closePlayerProfileButton");
const exportModalEl = document.getElementById("exportModal");
const closeExportModalButtonEl = document.getElementById("closeExportModalButton");
const exportFilenameInputEl = document.getElementById("exportFilenameInput");
const exportTournamentListEl = document.getElementById("exportTournamentList");
const selectAllExportTournamentsButtonEl = document.getElementById("selectAllExportTournamentsButton");
const exportHelpAccordionButtonEl = document.getElementById("exportHelpAccordionButton");
const exportHelpAccordionBodyEl = document.getElementById("exportHelpAccordionBody");
const exportHelpAccordionIconEl = document.getElementById("exportHelpAccordionIcon");
const exportErrorMessageEl = document.getElementById("exportErrorMessage");
const exportRetryAreaEl = document.getElementById("exportRetryArea");
const exportRetryButtonEl = document.getElementById("exportRetryButton");
const cancelExportButtonEl = document.getElementById("cancelExportButton");
const confirmExportButtonEl = document.getElementById("confirmExportButton");

const hasFirebaseConfig =
  Boolean(firebaseConfig.apiKey) && Boolean(firebaseConfig.databaseURL);

const app = hasFirebaseConfig ? firebase.initializeApp(firebaseConfig) : null;
const db = app ? firebase.database() : null;

function getPlayersRef() {
  return db.ref(DB_PATHS.players);
}

function getPlayerRef(playerId) {
  return db.ref(`${DB_PATHS.players}/${playerId}`);
}

function getTournamentsRef() {
  return db.ref(DB_PATHS.tournaments);
}

function getTournamentRef(tournamentId) {
  return db.ref(`${DB_PATHS.tournaments}/${tournamentId}`);
}

function getMatchesRef(tournamentId) {
  return db.ref(`${DB_PATHS.matches}/${tournamentId}`);
}

function getMatchRef(tournamentId, matchId) {
  return db.ref(`${DB_PATHS.matches}/${tournamentId}/${matchId}`);
}

function getTournamentRecordsRef(tournamentId) {
  return db.ref(`${DB_PATHS.records}/${tournamentId}`);
}

function getMatchRecordsRef(tournamentId, matchId) {
  return db.ref(`${DB_PATHS.records}/${tournamentId}/${matchId}`);
}

function normalizeTournament(id, value = {}) {
  return {
    id,
    name: value.name ?? "名称未設定",
    date: value.date ?? "",
    matchType: value.matchType ?? "大会",
    createdAt: value.createdAt ?? 0,
    updatedAt: value.updatedAt ?? value.createdAt ?? 0,
  };
}

function normalizeMatch(id, value = {}) {
  return {
    id,
    date: value.date ?? null,
    opponent: value.opponent ?? "",
    stage: value.stage ?? "予選",
    matchType: value.matchType ?? "その他",
    createdAt: value.createdAt ?? 0,
    updatedAt: value.updatedAt ?? value.createdAt ?? 0,
  };
}

function normalizePlayer(id, value = {}, fallbackOrder = Number.MAX_SAFE_INTEGER) {
  return {
    id,
    name: value.name ?? "名称未設定",
    grade: value.grade ? String(value.grade) : "",
    role: value.role ? String(value.role) : "",
    handedness: value.handedness ? String(value.handedness) : "",
    memo: value.memo ?? "",
    active: value.active !== false,
    order: Number.isFinite(value.order) ? value.order : fallbackOrder,
    createdAt: value.createdAt ?? null,
  };
}

function getGradeLabel(grade) {
  return GRADE_SYMBOLS[String(grade)] ?? "";
}

function getGradeFullLabel(grade) {
  return {
    1: "1年生",
    2: "2年生",
    3: "3年生",
  }[String(grade)] ?? "未設定";
}

function getRoleLabel(role) {
  return ROLE_LABELS[String(role)] ?? "";
}

function getRoleFullLabel(role) {
  return {
    captain: "キャプテン",
    viceCaptain: "副キャプテン",
  }[String(role)] ?? "なし";
}

function getHandednessLabel(handedness) {
  return {
    right: "右",
    left: "左",
    both: "両",
  }[String(handedness)] ?? "未設定";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getPlayerBadgesHtml(player) {
  const badges = [];
  const gradeLabel = getGradeLabel(player?.grade);
  const roleLabel = getRoleLabel(player?.role);
  if (gradeLabel) {
    badges.push(`<span class="player-badge grade-badge">${gradeLabel}</span>`);
  }
  if (roleLabel) {
    badges.push(`<span class="player-badge role-badge">${roleLabel}</span>`);
  }

  return badges.join("");
}

function getPlayerDisplayHtml(player) {
  return `<span class="player-display"><span class="player-display-name">${escapeHtml(
    player?.name ?? "未登録選手",
  )}</span>${getPlayerBadgesHtml(player)}</span>`;
}

function renderPlayerNameButtonHtml(player) {
  return `<button class="player-name-button" type="button" data-player-id="${escapeHtml(player.id)}">${getPlayerDisplayHtml(
    player,
  )}</button>`;
}

function openPlayerProfile(playerId) {
  const player = players.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  playerProfileContentEl.innerHTML = `
    <div class="profile-grid">
      <div class="profile-item">
        <span class="profile-item-label">名前</span>
        <div>${getPlayerDisplayHtml(player)}</div>
      </div>
      <div class="profile-item">
        <span class="profile-item-label">学年</span>
        <div>${escapeHtml(getGradeFullLabel(player.grade))}</div>
      </div>
      <div class="profile-item">
        <span class="profile-item-label">役職</span>
        <div>${escapeHtml(getRoleFullLabel(player.role))}</div>
      </div>
      <div class="profile-item">
        <span class="profile-item-label">利き手</span>
        <div>${escapeHtml(getHandednessLabel(player.handedness))}</div>
      </div>
      <div class="profile-item">
        <span class="profile-item-label">メモ</span>
        <div>${escapeHtml(player.memo || "なし")}</div>
      </div>
    </div>
  `;

  playerProfileModalEl.classList.remove("hidden");
}

function closePlayerProfile() {
  playerProfileModalEl.classList.add("hidden");
}

function formatPlayerLabel(player) {
  const gradeLabel = getGradeLabel(player?.grade);
  const roleLabel = getRoleLabel(player?.role);
  const suffix = [gradeLabel, roleLabel].filter(Boolean).join(" ");
  return suffix ? `${player.name} ${suffix}` : player.name;
}

function resetViewerFilters() {
  state.viewerSelectedMatchIds = [];
  state.viewerSelectedPlayerId = "all";
  state.viewerStageFilter = "all";
  state.viewerOpponentFilter = "all";
}

function isStaff() {
  return state.role === "staff";
}

function toggleGuideAccordion() {
  toggleAccordionAnimated(guideAccordionBodyEl, guideAccordionIconEl);
}

function toggleMetricsAccordion() {
  toggleAccordionAnimated(metricsAccordionBodyEl, metricsAccordionIconEl);
}

function renderCheckMode() {
  if (!isStaff()) {
    checkModeSectionEl.classList.add("hidden");
    return;
  }

  checkModeSectionEl.classList.remove("hidden");
  const warnings = [];

  if (!state.selectedTournamentId) {
    warnings.push("大会が未選択です。まず大会を選択してください。");
  }
  if (state.selectedTournamentId && !currentMatches.length) {
    warnings.push("この大会には試合がありません。試合を追加してください。");
  }
  if (!state.selectedMatchId) {
    warnings.push("試合が未選択です。試合を確定すると記録チェックが有効になります。");
  }

  const activePlayers = players.filter((player) => player.active !== false);
  if (!activePlayers.length) {
    warnings.push("アクティブ選手がいません。選手管理で追加または再表示してください。");
  }

  if (state.selectedTournamentId && state.selectedMatchId) {
    warnings.push(...validateCurrentRecords());
    const unenteredPlayers = activePlayers
      .filter((player) => {
        const record = getPlayerStats(player.id);
        if (record.isBench) {
          return false;
        }
        const total = stats.reduce((sum, stat) => sum + (record[stat.key] || 0), 0);
        return total === 0;
      })
      .map((player) => player.name);

    if (unenteredPlayers.length) {
      warnings.push(`未入力候補: ${unenteredPlayers.join(" / ")}`);
    }
  }

  if (!warnings.length) {
    checkModeSummaryEl.textContent = "現在の入力状態は問題ありません。";
    checkModeListEl.innerHTML = '<li class="check-item ok">チェックOK: このまま保存・運用できます。</li>';
    return;
  }

  checkModeSummaryEl.textContent = `${warnings.length}件の確認ポイントがあります`;
  checkModeListEl.innerHTML = warnings.map((message) => `<li class="check-item warn">${escapeHtml(message)}</li>`).join("");
}

function applyPermission() {
  const canEdit = isStaff();
  opponentEl.disabled = !canEdit;
  matchStageEl.disabled = !canEdit;
  newTournamentNameEl.disabled = !canEdit;
  tournamentDateEl.disabled = !canEdit;
  tournamentMatchTypeEl.disabled = !canEdit;
  createTournamentButtonEl.disabled = !canEdit;
  confirmTournamentButtonEl.disabled = !state.selectedTournamentId;
  confirmTournamentButtonEl.classList.toggle("hidden", !canEdit);
  updateTournamentButtonEl.disabled = !canEdit || !state.selectedTournamentId;
  deleteTournamentButtonEl.disabled = !canEdit || !state.selectedTournamentId;
  createMatchButtonEl.disabled = !canEdit;
  confirmMatchButtonEl.disabled = !state.selectedMatchId;
  updateMatchButtonEl.disabled = !canEdit || !state.selectedMatchId;
  deleteMatchButtonEl.disabled = !canEdit || !state.selectedMatchId;
  toggleTournamentCreateButtonEl.classList.toggle("hidden", !canEdit);
  toggleTournamentEditButtonEl.classList.toggle("hidden", !canEdit);
  toggleMatchCreateButtonEl.classList.toggle("hidden", !canEdit);
  toggleMatchEditButtonEl.classList.toggle("hidden", !canEdit);
  togglePlayerManagementButtonEl.classList.toggle("hidden", !canEdit);
  createPlayerButtonEl.disabled = !canEdit;
  toggleBenchButtonEl.disabled = !canEdit;
  togglePlayerActiveButtonEl.classList.toggle("hidden", !canEdit);
  playerManagementSectionEl.classList.toggle("hidden", !canEdit);
  viewerSectionEl.classList.toggle("hidden", canEdit || !state.selectedTournamentId);
  modeTextEl.textContent = canEdit
    ? "現在: EDIT / 編集モード"
    : "現在: VIEW / 閲覧モード";
  renderCheckMode();
}

function toggleCreateArea(areaEl, buttonEl) {
  const willShow = areaEl.classList.contains("hidden");
  areaEl.classList.toggle("hidden", !willShow);
  buttonEl.textContent = willShow ? "閉じる" : `+ ${buttonEl.dataset.defaultLabel}`;
}

function toggleEditArea(areaEl, buttonEl) {
  const willShow = areaEl.classList.contains("hidden");
  areaEl.classList.toggle("hidden", !willShow);
  buttonEl.textContent = willShow ? "閉じる" : buttonEl.dataset.defaultLabel;
}

function showStep(step) {
  if (!isStaff()) {
    step1SectionEl.classList.remove("hidden");
    step2SectionEl.classList.add("hidden");
    step3SectionEl.classList.add("hidden");
    return;
  }
  state.currentStep = step;
  step1SectionEl.classList.toggle("hidden", step !== 1);
  step2SectionEl.classList.toggle("hidden", step !== 2);
  step3SectionEl.classList.toggle("hidden", step !== 3);
}

function syncStepByState() {
  if (!isStaff()) {
    showStep(1);
    return;
  }
  if (state.currentStep === 1) {
    showStep(1);
    return;
  }
  if (state.currentStep === 2) {
    if (!state.selectedTournamentId) {
      showStep(1);
      return;
    }
    showStep(2);
    return;
  }
  if (!state.selectedMatchId) {
    showStep(2);
    return;
  }
  showStep(3);
}

function parseHomeDeepLinkFromUrl() {
  try {
    const p = new URLSearchParams(window.location.search);
    const tid = p.get("tournament") || p.get("tid");
    const mid = p.get("match") || p.get("mid");
    if (tid && mid) return { tournamentId: tid, matchId: mid };
  } catch {}
  return null;
}

/** 通知パネル等から index に ?tournament=&match= で入ったとき、該当試合を開く */
async function applyHomeDeepLinkFromUrlParams() {
  const params = parseHomeDeepLinkFromUrl();
  if (!params || !db) return;
  const { tournamentId, matchId } = params;
  if (!currentTournaments.some((t) => t.id === tournamentId)) return;

  state.selectedTournamentId = tournamentId;
  tournamentSelectEl.value = tournamentId;
  const selectedTournament = currentTournaments.find((t) => t.id === tournamentId);
  fillTournamentMetaInputs(selectedTournament);
  fillTournamentEditInputs(selectedTournament);

  const matches = await loadMatchesByTournament(tournamentId);
  renderMatchOptions(matches);
  const matchObj = matches.find((m) => m.id === matchId);
  if (!matchObj) return;

  if (isStaff()) {
    state.selectedMatchId = matchId;
    matchSelectEl.value = matchId;
    fillMatchMetaInputs(matchObj);
    fillMatchEditInputs(matchObj);
    await loadRecordsForMatch();
    renderRecordSummary();
    syncStepByState();
  } else {
    state.selectedMatchId = "";
    matchSelectEl.value = "";
    fillMatchMetaInputs(null);
    fillMatchEditInputs(null);
    state.records = {};
    resetViewerFilters();
    state.viewerSelectedMatchIds = [matchId];
    await loadViewerRecordsForTournament();
    renderViewerContent();
  }

  renderStats();
  applyPermission();
  try {
    const path = window.location.pathname.split("/").pop() || "index.html";
    window.history.replaceState({}, "", path);
  } catch {}
}

function login(role, password) {
  if (role === "staff") {
    const expected = PASSWORDS.staff;
    if (password !== expected) {
      loginErrorEl.textContent = "パスワードが違います。";
      return;
    }
  }

  state.role = role;
  loginErrorEl.textContent = "";
  loginPasswordEl.value = "";
  staffPasswordAreaEl.classList.add("hidden");
  loginCardEl.classList.add("hidden");
  appAreaEl.classList.remove("hidden");
  applyPermission();
  renderTabs();
  renderStats();
  void (async () => {
    await initializeData();
    await applyHomeDeepLinkFromUrlParams();
  })();
}

function logout() {
  state.role = null;
  state.selectedTournamentId = "";
  state.selectedMatchId = "";
  resetViewerFilters();
  state.viewerTournamentRecords = {};
  state.viewerSortKey = "name";
  state.viewerSortOrder = "asc";
  state.viewerDetailSortKey = "name";
  state.viewerDetailSortOrder = "asc";
  state.currentStep = 1;
  if (state.autoSaveTimerId) {
    window.clearTimeout(state.autoSaveTimerId);
    state.autoSaveTimerId = null;
  }
  clearAutoSaveCountdown();
  resetMatchSaveMeta(null);
  loginPasswordEl.value = "";
  loginErrorEl.textContent = "";
  setValidationMessage("");
  staffPasswordAreaEl.classList.add("hidden");
  appAreaEl.classList.add("hidden");
  loginCardEl.classList.remove("hidden");
  setSaveState("未保存", "まだ保存されていません", "");
  showStep(1);
}

playerLoginButtonEl.addEventListener("click", () => {
  login("player", "");
});

staffModeButtonEl.addEventListener("click", () => {
  loginErrorEl.textContent = "";
  staffPasswordAreaEl.classList.remove("hidden");
  loginPasswordEl.focus();
});

staffLoginButtonEl.addEventListener("click", () => {
  login("staff", loginPasswordEl.value);
});

loginPasswordEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    login("staff", loginPasswordEl.value);
  }
});

logoutButtonEl.addEventListener("click", () => {
  logout();
});

function getCurrentPlayer() {
  return players.find((p) => p.id === state.selectedPlayerId) ?? players[0];
}

function getPlayerStats(playerId) {
  return state.records[playerId] || {};
}

function getAttackFailureFromRecord(record = {}) {
  if (Number.isFinite(record.attackFailure)) {
    return Math.max(0, Number(record.attackFailure) || 0);
  }
  const attack = Math.max(0, Number(record.attack) || 0);
  const attackSuccess = Math.max(0, Number(record.attackSuccess) || 0);
  return Math.max(0, attack - attackSuccess);
}

function isBenched(playerId) {
  return Boolean(getPlayerStats(playerId).isBench);
}

function getVisiblePlayers() {
  const activePlayers = players.filter((player) => player.active !== false);
  if (!state.showActiveOnly) {
    return activePlayers;
  }
  return activePlayers.filter((player) => !isBenched(player.id));
}

function getAllPlayersTotalPlays() {
  return players.reduce((sum, player) => {
    if (player.active === false || isBenched(player.id)) {
      return sum;
    }
    const playerStats = getPlayerStats(player.id);
    return (
      sum +
      stats.reduce((acc, stat) => acc + (playerStats[stat.key] || 0), 0)
    );
  }, 0);
}

function renderRecordSummary() {
  const activePlayers = players.filter((player) => player.active !== false);
  const benchPlayers = activePlayers.filter((player) => isBenched(player.id));
  activePlayerCountEl.textContent = String(activePlayers.length - benchPlayers.length);
  benchPlayerCountEl.textContent = String(benchPlayers.length);
  allPlayersTotalPlaysEl.textContent = String(getAllPlayersTotalPlays());

  const tournament = getSelectedTournament();
  const match = currentMatches.find((item) => item.id === state.selectedMatchId);
  const parts = [
    tournament?.name,
    tournament?.matchType,
    match?.stage,
    match?.opponent,
  ].filter(Boolean);
  matchSummaryEl.textContent = parts.join(" / ");
}

function renderPlayerManagementList() {
  playerManagementListEl.innerHTML = "";
  if (!players.length) {
    playerManagementListEl.textContent = "選手が登録されていません。";
    return;
  }

  players.forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "player-list-item";

    const meta = document.createElement("div");
    meta.className = "player-list-meta";
    const createdAt = player.createdAt
      ? new Date(player.createdAt).toLocaleString("ja-JP")
      : "日時不明";
    const gradeText = getGradeLabel(player.grade) || "学年未設定";
    const roleText = getRoleLabel(player.role) || "役割なし";
    const handednessText = getHandednessLabel(player.handedness);
    meta.innerHTML = `<strong>${getPlayerDisplayHtml(player)}</strong><span>${gradeText} / ${roleText} / ${handednessText} / ${createdAt}</span>`;

    row.appendChild(meta);

    if (isStaff()) {
      const editFields = document.createElement("div");
      editFields.className = "player-edit-fields";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = player.name;
      nameInput.placeholder = "選手名";

      const gradeSelect = document.createElement("select");
      gradeSelect.innerHTML = `
        <option value="">学年を選択</option>
        <option value="1">1年 / ①</option>
        <option value="2">2年 / ②</option>
        <option value="3">3年 / ③</option>
      `;
      gradeSelect.value = player.grade || "";

      const roleSelect = document.createElement("select");
      roleSelect.innerHTML = `
        <option value="">役割なし</option>
        <option value="captain">キャプテン / C</option>
        <option value="viceCaptain">副キャプテン / VC</option>
      `;
      roleSelect.value = player.role || "";

      const handednessSelect = document.createElement("select");
      handednessSelect.innerHTML = `
        <option value="">利き手未設定</option>
        <option value="right">右</option>
        <option value="left">左</option>
        <option value="both">両</option>
      `;
      handednessSelect.value = player.handedness || "";

      const memoInput = document.createElement("input");
      memoInput.type = "text";
      memoInput.value = player.memo || "";
      memoInput.placeholder = "メモ";

      editFields.append(nameInput, gradeSelect, roleSelect, handednessSelect, memoInput);
      row.appendChild(editFields);

      const actions = document.createElement("div");
      actions.className = "player-list-actions";

      const orderField = document.createElement("div");
      orderField.className = "player-order-field";
      const orderLabel = document.createElement("span");
      orderLabel.className = "player-order-label";
      orderLabel.textContent = "表示順";
      const orderInput = document.createElement("input");
      orderInput.type = "number";
      orderInput.className = "player-order-input";
      orderInput.min = "0";
      orderInput.max = String(players.length - 1);
      orderInput.value = String(index);
      orderInput.title = "0が先頭。変更したら「順を適用」を押してください。";
      const orderApplyButton = document.createElement("button");
      orderApplyButton.type = "button";
      orderApplyButton.className = "sub-btn";
      orderApplyButton.textContent = "順を適用";
      orderApplyButton.addEventListener("click", () => {
        void applyPlayerDisplayOrder(player.id, orderInput.value);
      });
      orderField.append(orderLabel, orderInput, orderApplyButton);

      const upButton = document.createElement("button");
      upButton.className = "sub-btn";
      upButton.textContent = "↑";
      upButton.disabled = index === 0;
      upButton.addEventListener("click", () => {
        void movePlayerOrder(player.id, -1);
      });

      const downButton = document.createElement("button");
      downButton.className = "sub-btn";
      downButton.textContent = "↓";
      downButton.disabled = index === players.length - 1;
      downButton.addEventListener("click", () => {
        void movePlayerOrder(player.id, 1);
      });

      const deleteButton = document.createElement("button");
      deleteButton.className = "sub-btn danger-btn";
      deleteButton.textContent = "完全削除";
      deleteButton.addEventListener("click", () => {
        void deletePlayer(player.id, player.name);
      });

      const saveButton = document.createElement("button");
      saveButton.className = "primary-btn";
      saveButton.textContent = "更新";
      saveButton.addEventListener("click", () => {
        void updatePlayerDetails(
          player.id,
          nameInput.value,
          gradeSelect.value,
          roleSelect.value,
          handednessSelect.value,
          memoInput.value,
        );
      });

      actions.append(orderField, upButton, downButton, saveButton, deleteButton);
      row.appendChild(actions);
    }

    playerManagementListEl.appendChild(row);
  });
}

function togglePlayerManagementAccordion() {
  toggleAccordionAnimated(playerManagementAccordionBodyEl, playerManagementAccordionIconEl);
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function escapeCsvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function getViewerActiveMatchIds() {
  return state.viewerSelectedMatchIds;
}

function getViewerSelectedPlayerId() {
  return state.viewerSelectedPlayerId;
}

function getViewerFilteredMatches() {
  return currentMatches.filter((match) => {
    const stageOk = state.viewerStageFilter === "all" || (match.stage ?? "") === state.viewerStageFilter;
    const opponentOk =
      state.viewerOpponentFilter === "all" || (match.opponent ?? "") === state.viewerOpponentFilter;
    return stageOk && opponentOk;
  });
}

function getMatchLabel(match) {
  const tournament = getSelectedTournament();
  const tournamentName = tournament?.name || "大会名未設定";
  return `${tournamentName} / ${match.stage || "区分未設定"} / ${match.opponent || "対戦相手未設定"}`;
}

function renderViewerMatchFilters() {
  viewerMatchFiltersEl.innerHTML = "";
  const filteredMatches = getViewerFilteredMatches();
  if (!filteredMatches.length) {
    viewerMatchFiltersEl.innerHTML = '<p class="login-description no-margin">試合がありません。</p>';
    return;
  }

  filteredMatches.forEach((match) => {
    const label = document.createElement("label");
    label.className = "filter-chip";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = getViewerActiveMatchIds().includes(match.id);
    input.addEventListener("change", () => {
      const selected = new Set(getViewerActiveMatchIds());
      if (input.checked) {
        selected.add(match.id);
      } else {
        selected.delete(match.id);
      }
      state.viewerSelectedMatchIds = Array.from(selected);
      renderViewerMatchFilters();
      renderViewerContent();
    });

    const text = document.createElement("span");
    text.textContent = getMatchLabel(match);

    label.append(input, text);
    viewerMatchFiltersEl.appendChild(label);
  });
}

function renderViewerPlayerSelect() {
  viewerPlayerSelectEl.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "全選手";
  viewerPlayerSelectEl.appendChild(allOption);

  players
    .filter((player) => player.active !== false)
    .forEach((player) => {
      const option = document.createElement("option");
      option.value = player.id;
      option.textContent = String(player.name ?? "").trim() || "名称未設定";
      viewerPlayerSelectEl.appendChild(option);
    });

  const availableIds = ["all", ...players.filter((player) => player.active !== false).map((player) => player.id)];
  if (!availableIds.includes(state.viewerSelectedPlayerId)) {
    state.viewerSelectedPlayerId = "all";
  }
  viewerPlayerSelectEl.value = state.viewerSelectedPlayerId;
}

function renderViewerOpponentFilter() {
  viewerOpponentFilterEl.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "すべての相手";
  viewerOpponentFilterEl.appendChild(allOption);

  const opponents = Array.from(
    new Set(currentMatches.map((match) => match.opponent || "対戦相手未設定").filter(Boolean)),
  );

  opponents.forEach((opponent) => {
    const option = document.createElement("option");
    option.value = opponent;
    option.textContent = opponent;
    viewerOpponentFilterEl.appendChild(option);
  });

  const available = ["all", ...opponents];
  if (!available.includes(state.viewerOpponentFilter)) {
    state.viewerOpponentFilter = "all";
  }
  viewerOpponentFilterEl.value = state.viewerOpponentFilter;
}

function renderViewerDetailMatchSelect(availableMatches) {
  viewerDetailMatchSelectEl.innerHTML = "";

  if (!availableMatches.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "試合がありません";
    viewerDetailMatchSelectEl.appendChild(option);
    state.viewerDetailMatchId = "";
    return;
  }

  availableMatches.forEach((match) => {
    const option = document.createElement("option");
    option.value = match.id;
    option.textContent = getMatchLabel(match);
    viewerDetailMatchSelectEl.appendChild(option);
  });

  if (!availableMatches.some((match) => match.id === state.viewerDetailMatchId)) {
    state.viewerDetailMatchId = availableMatches[0].id;
  }

  viewerDetailMatchSelectEl.value = state.viewerDetailMatchId;
}

function getViewerPlainPlayerNameForSort(row) {
  const player = players.find((p) => p.id === row.id);
  return (player?.name ?? row.name ?? "").trim();
}

function getViewerNameSortIndex(plainName) {
  const idx = VIEWER_ROSTER_NAME_ORDER.indexOf(plainName);
  if (idx !== -1) {
    return idx;
  }
  return VIEWER_ROSTER_NAME_ORDER.length;
}

function sortViewerRowsWithKeyOrder(rows, sortKey, sortOrder) {
  const direction = sortOrder === "asc" ? 1 : -1;
  const key = sortKey;
  return [...rows].sort((a, b) => {
    if (key === "name") {
      const na = getViewerPlainPlayerNameForSort(a);
      const nb = getViewerPlainPlayerNameForSort(b);
      const ia = getViewerNameSortIndex(na);
      const ib = getViewerNameSortIndex(nb);
      if (ia !== ib) {
        return (ia - ib) * direction;
      }
      return na.localeCompare(nb, "ja") * direction;
    }
    return ((a[key] ?? 0) - (b[key] ?? 0)) * direction;
  });
}

function sortViewerRows(rows) {
  return sortViewerRowsWithKeyOrder(rows, state.viewerSortKey, state.viewerSortOrder);
}

function sortViewerDetailRows(rows) {
  return sortViewerRowsWithKeyOrder(rows, state.viewerDetailSortKey, state.viewerDetailSortOrder);
}

function syncViewerSortControls() {
  viewerSortKeyEl.value = state.viewerSortKey;
  viewerSortOrderEl.value = state.viewerSortOrder;
  viewerSortButtonsEls.forEach((button) => {
    const isActive = button.dataset.sortKey === state.viewerSortKey;
    button.classList.toggle("active", isActive);
    button.classList.toggle("asc", isActive && state.viewerSortOrder === "asc");
    button.classList.toggle("desc", isActive && state.viewerSortOrder === "desc");
  });
}

function syncViewerDetailSortControls() {
  viewerDetailSortButtonsEls.forEach((button) => {
    const isActive = button.dataset.sortKey === state.viewerDetailSortKey;
    button.classList.toggle("active", isActive);
    button.classList.toggle("asc", isActive && state.viewerDetailSortOrder === "asc");
    button.classList.toggle("desc", isActive && state.viewerDetailSortOrder === "desc");
  });
}

function getAverage(rows, key) {
  if (!rows.length) {
    return 0;
  }
  return rows.reduce((sum, row) => sum + (row[key] ?? 0), 0) / rows.length;
}

function isViewerSinglePlayerMode() {
  return state.viewerSelectedPlayerId !== "all";
}

function buildViewerPlayerRow(playerId, recordsByMatch, selectedMatchIds) {
  const player = players.find((item) => item.id === playerId);
  const totals = {
    attack: 0,
    attackSuccess: 0,
    attackFailure: 0,
    zeroBreak: 0,
    catch: 0,
    out: 0,
    return: 0,
    attackContributionTotal: 0,
    catchContributionTotal: 0,
    benchMatchCount: 0,
  };

  selectedMatchIds.forEach((matchId) => {
    const allRecords = recordsByMatch[matchId] ?? {};
    const record = allRecords[playerId] ?? {};
    if (record.isBench) {
      totals.benchMatchCount += 1;
    }
    const teamAttackSuccess = Object.values(allRecords).reduce(
      (sum, item) => sum + (item?.isBench ? 0 : item?.attackSuccess || 0),
      0,
    );
    const teamCatch = Object.values(allRecords).reduce(
      (sum, item) => sum + (item?.isBench ? 0 : item?.catch || 0),
      0,
    );

    if (!record.isBench) {
      totals.attackSuccess += record.attackSuccess || 0;
      totals.attackFailure += getAttackFailureFromRecord(record);
      totals.zeroBreak += record.zeroBreak || 0;
      totals.catch += record.catch || 0;
      totals.out += record.out || 0;
      totals.return += record.return || 0;
    }

    totals.attackContributionTotal += teamAttackSuccess
      ? ((record.attackSuccess || 0) / teamAttackSuccess) * 100
      : 0;
    totals.catchContributionTotal += teamCatch ? ((record.catch || 0) / teamCatch) * 100 : 0;
  });

  const incoming = totals.catch + totals.out;
  totals.attack = totals.attackSuccess + totals.attackFailure;
  const attackRate = totals.attack ? (totals.attackSuccess / totals.attack) * 100 : 0;
  const catchRate = incoming ? (totals.catch / incoming) * 100 : 0;
  const attackContribution = selectedMatchIds.length
    ? totals.attackContributionTotal / selectedMatchIds.length
    : 0;
  const catchContribution = selectedMatchIds.length
    ? totals.catchContributionTotal / selectedMatchIds.length
    : 0;

  const gamesTotal = selectedMatchIds.length;
  const gamesPlayed = gamesTotal - totals.benchMatchCount;

  return {
    id: playerId,
    name: player ? String(player.name ?? "").trim() || "未登録選手" : "未登録選手",
    attack: totals.attack,
    attackSuccess: totals.attackSuccess,
    attackFailure: totals.attackFailure,
    attackRate,
    zeroBreak: totals.zeroBreak,
    catch: totals.catch,
    out: totals.out,
    incoming,
    catchRate,
    return: totals.return,
    /** 出場した試合数（選択範囲内でベンチ以外） */
    games: gamesPlayed,
    /** 集計対象の試合数（選択試合数） */
    gamesTotal,
    attackContribution,
    catchContribution,
  };
}

function renderViewerTotals(rows, selectedMatchIds) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.attack += row.attack;
      acc.attackSuccess += row.attackSuccess;
      acc.attackFailure += row.attackFailure;
      acc.zeroBreak += row.zeroBreak;
      acc.catch += row.catch;
      acc.out += row.out;
      acc.incoming += row.incoming;
      acc.return += row.return;
      return acc;
    },
    { attack: 0, attackSuccess: 0, attackFailure: 0, zeroBreak: 0, catch: 0, out: 0, incoming: 0, return: 0 },
  );

  const metrics = [
    ["選択試合数", selectedMatchIds.length],
    ["総アタック数", totals.attack],
    ["アタック成功数", totals.attackSuccess],
    ["アタック失敗数", totals.attackFailure],
    ["アタック成功率", formatPercentWithCounts(totals.attackSuccess, totals.attack)],
    ["飛んできた本数", totals.incoming],
    ["キャッチ数", totals.catch],
    ["アウト数", totals.out],
    ["キャッチ率", formatPercentWithCounts(totals.catch, totals.incoming)],
    ["内野復帰数", totals.return],
    ["ゼロ抜き数", totals.zeroBreak],
  ];

  if (isViewerSinglePlayerMode()) {
    metrics.splice(8, 0, ["アタック貢献度", formatPercent(getAverage(rows, "attackContribution"))]);
    metrics.splice(9, 0, ["キャッチ貢献度", formatPercent(getAverage(rows, "catchContribution"))]);
  }

  viewerTotalsEl.innerHTML = metrics
    .map(
      ([label, value]) => `
        <div class="summary-box">
          <span class="summary-label">${label}</span>
          <span class="summary-value viewer-summary-value">${value}</span>
        </div>`,
    )
    .join("");
}

function createRankingRows(rows, key, minimumValue = 0) {
  return [...rows]
    .filter((row) => (row[key] ?? 0) > minimumValue)
    .sort((a, b) => {
      const diff = (b[key] ?? 0) - (a[key] ?? 0);
      if (diff !== 0) {
        return diff;
      }
      return a.name.localeCompare(b.name, "ja");
    })
    .slice(0, 3);
}

function renderRankingCard(title, rows, key, formatter = (value) => String(value), minimumValue = 0) {
  const rankedRows = createRankingRows(rows, key, minimumValue);
  if (!rankedRows.length) {
    return `
      <section class="ranking-card">
        <h4 class="ranking-card-title">${title}</h4>
        <p class="login-description no-margin">表示できるデータがありません。</p>
      </section>
    `;
  }

  return `
    <section class="ranking-card">
      <h4 class="ranking-card-title">${title}</h4>
      <div class="ranking-list">
        ${rankedRows
          .map((row, index) => {
            const player = players.find((item) => item.id === row.id) ?? { id: row.id, name: row.name };
            return `
              <div class="ranking-item">
                <span class="ranking-item-rank">${index + 1}位</span>
                <div class="ranking-item-main">
                  ${renderPlayerNameButtonHtml(player)}
                </div>
                <span class="ranking-item-value">${formatter(row[key] ?? 0)}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderViewerRankings(rows) {
  if (!rows.length) {
    viewerRankingsEl.innerHTML = "";
    return;
  }

  viewerRankingsEl.innerHTML = [
    renderRankingCard("アタック成功数", rows, "attackSuccess"),
    renderRankingCard("キャッチ数", rows, "catch"),
    renderRankingCard("アタック貢献度", rows, "attackContribution", formatPercent, 0),
    renderRankingCard("キャッチ貢献度", rows, "catchContribution", formatPercent, 0),
  ].join("");

  viewerRankingsEl.querySelectorAll(".player-name-button").forEach((button) => {
    button.addEventListener("click", () => {
      const playerId = button.dataset.playerId;
      if (playerId) {
        openPlayerProfile(playerId);
      }
    });
  });
}

function toggleViewerTotalsAccordion() {
  toggleAccordionAnimated(viewerTotalsAccordionBodyEl, viewerTotalsAccordionIconEl);
}

function toggleViewerRankingAccordion() {
  toggleAccordionAnimated(viewerRankingAccordionBodyEl, viewerRankingAccordionIconEl);
}

function toggleViewerDetailAccordion() {
  toggleAccordionAnimated(viewerDetailAccordionBodyEl, viewerDetailAccordionIconEl);
}

function renderViewerTable(rows) {
  viewerTableBodyEl.innerHTML = "";
  if (!rows.length) {
    viewerTableBodyEl.innerHTML =
      '<tr><td colspan="14" class="empty-cell">集計できるデータがありません。</td></tr>';
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="sticky-col">${renderPlayerNameButtonHtml(players.find((player) => player.id === row.id) ?? { id: row.id, name: row.name })}</td>
      <td>${row.gamesTotal ? `${row.games}/${row.gamesTotal}` : "0"}</td>
      <td>${row.attack}</td>
      <td>${row.attackSuccess}</td>
      <td>${row.attackFailure}</td>
      <td>${formatPercentWithCounts(row.attackSuccess, row.attack)}</td>
      <td>${row.incoming}</td>
      <td>${row.catch}</td>
      <td>${row.out}</td>
      <td>${formatPercentWithCounts(row.catch, row.incoming)}</td>
      <td class="viewer-contribution-col">${formatPercent(row.attackContribution)}</td>
      <td class="viewer-contribution-col">${formatPercent(row.catchContribution)}</td>
      <td>${row.return}</td>
      <td>${row.zeroBreak}</td>
    `;
    tr.querySelector(".player-name-button")?.addEventListener("click", () => {
      openPlayerProfile(row.id);
    });
    viewerTableBodyEl.appendChild(tr);
  });
}

function renderViewerDetailTable(rows) {
  viewerDetailTableBodyEl.innerHTML = "";
  if (!rows.length) {
    viewerDetailTableBodyEl.innerHTML =
      '<tr><td colspan="13" class="empty-cell">この試合の詳細データがありません。</td></tr>';
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="sticky-col">${renderPlayerNameButtonHtml(players.find((player) => player.id === row.id) ?? { id: row.id, name: row.name })}</td>
      <td>${row.attack}</td>
      <td>${row.attackSuccess}</td>
      <td>${row.attackFailure}</td>
      <td>${formatPercentWithCounts(row.attackSuccess, row.attack)}</td>
      <td>${row.incoming}</td>
      <td>${row.catch}</td>
      <td>${row.out}</td>
      <td>${formatPercentWithCounts(row.catch, row.incoming)}</td>
      <td>${formatPercent(row.attackContribution)}</td>
      <td>${formatPercent(row.catchContribution)}</td>
      <td>${row.return}</td>
      <td>${row.zeroBreak}</td>
    `;
    tr.querySelector(".player-name-button")?.addEventListener("click", () => {
      openPlayerProfile(row.id);
    });
    viewerDetailTableBodyEl.appendChild(tr);
  });
}

/** 閲覧CSVのファイル名用（Windows等で使えない文字を除去） */
function sanitizeCsvFilenamePart(text) {
  return String(text ?? "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

/** 大会日が入っているときだけ「年-月-日」を返す（未入力は空） */
function getViewerCsvDatePrefix(tournamentDate) {
  if (tournamentDate && /^\d{4}-\d{1,2}-\d{1,2}/.test(String(tournamentDate))) {
    const [y, m, d] = String(tournamentDate).split("-").map((v) => Number.parseInt(v, 10));
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      return `${y}-${m}-${d}`;
    }
  }
  return "";
}

function getTodayDatePrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatPercentWithCounts(success, total) {
  const safeSuccess = Math.max(0, Number(success) || 0);
  const safeTotal = Math.max(0, Number(total) || 0);
  const rate = safeTotal ? (safeSuccess / safeTotal) * 100 : 0;
  return `${formatPercent(rate)}（${safeSuccess}/${safeTotal}）`;
}

function buildViewerRankingsData(rows, topN = 5) {
  const defs = [
    ["アタック成功数", "attackSuccess", (v) => String(v)],
    ["キャッチ数", "catch", (v) => String(v)],
    ["アタック貢献度", "attackContribution", (v) => formatPercent(v)],
    ["キャッチ貢献度", "catchContribution", (v) => formatPercent(v)],
  ];
  return defs.map(([title, key, fmt]) => {
    const list = [...rows]
      .filter((r) => (r[key] ?? 0) > 0)
      .sort((a, b) => {
        const diff = (b[key] ?? 0) - (a[key] ?? 0);
        if (diff !== 0) return diff;
        return (a.name ?? "").localeCompare(b.name ?? "", "ja");
      })
      .slice(0, topN)
      .map((row, idx) => ({ rank: idx + 1, name: row.name, value: fmt(row[key] ?? 0) }));
    return { title, list };
  });
}

function buildViewerSummaryStats(rows, selectedMatchCount) {
  const totals = rows.reduce(
    (acc, row) => {
      acc.attack += row.attack;
      acc.attackSuccess += row.attackSuccess;
      acc.attackFailure += row.attackFailure;
      acc.catch += row.catch;
      acc.out += row.out;
      acc.incoming += row.incoming;
      acc.return += row.return;
      acc.zeroBreak += row.zeroBreak;
      return acc;
    },
    { attack: 0, attackSuccess: 0, attackFailure: 0, catch: 0, out: 0, incoming: 0, return: 0, zeroBreak: 0 },
  );
  return [
    ["選択試合数", selectedMatchCount],
    ["総アタック数", totals.attack],
    ["アタック成功数", totals.attackSuccess],
    ["アタック失敗数", totals.attackFailure],
    ["アタック成功率", formatPercentWithCounts(totals.attackSuccess, totals.attack)],
    ["飛んできた本数", totals.incoming],
    ["キャッチ数", totals.catch],
    ["アウト数", totals.out],
    ["キャッチ率", formatPercentWithCounts(totals.catch, totals.incoming)],
    ["内野復帰数", totals.return],
    ["ゼロ抜き数", totals.zeroBreak],
  ];
}

function createViewerTableRowsCsv(rows) {
  return rows.map((row) => [
    row.name,
    row.gamesTotal ? `${row.games}/${row.gamesTotal}` : "0",
    row.attack,
    row.attackSuccess,
    row.attackFailure,
    formatPercentWithCounts(row.attackSuccess, row.attack),
    row.incoming,
    row.catch,
    row.out,
    formatPercentWithCounts(row.catch, row.incoming),
    formatPercent(row.attackContribution),
    formatPercent(row.catchContribution),
    row.return,
    row.zeroBreak,
  ]);
}

async function buildTournamentViewerSnapshot(tournamentId) {
  const tournament = currentTournaments.find((t) => t.id === tournamentId);
  if (!tournament) return null;
  const matches = await loadMatchesByTournament(tournamentId);
  const recordsSnapshot = await getTournamentRecordsRef(tournamentId).once("value");
  const recordsByMatch = recordsSnapshot.val() ?? {};
  const filteredMatches = matches.filter((match) => {
    const stageOk = state.viewerStageFilter === "all" || (match.stage ?? "") === state.viewerStageFilter;
    const opponentOk = state.viewerOpponentFilter === "all" || (match.opponent ?? "") === state.viewerOpponentFilter;
    return stageOk && opponentOk;
  });
  let selectedMatchIds = filteredMatches.map((m) => m.id);
  if (tournamentId === state.selectedTournamentId) {
    selectedMatchIds = state.viewerSelectedMatchIds.filter((id) => filteredMatches.some((m) => m.id === id));
  }
  const selectedPlayerId = state.viewerSelectedPlayerId;
  const rows = players
    .map((player) => buildViewerPlayerRow(player.id, recordsByMatch, selectedMatchIds))
    .filter((row) => selectedPlayerId === "all" || row.id === selectedPlayerId)
    .filter((row) => players.find((p) => p.id === row.id)?.active !== false)
    .filter((row) => row.games > 0 || row.attack || row.catch || row.out || row.return || row.zeroBreak)
    .map((row) => ({ ...row }));
  const sortedRows = sortViewerRows(rows);
  const summaryStats = buildViewerSummaryStats(rows, selectedMatchIds.length);
  const rankings = buildViewerRankingsData(sortedRows, 5);
  return {
    tournament,
    filteredMatches,
    selectedMatchIds,
    selectedPlayerId,
    rows: sortedRows,
    summaryStats,
    rankings,
  };
}

async function buildExportSnapshots(tournamentIds) {
  const snapshots = [];
  for (const tournamentId of tournamentIds) {
    const snap = await buildTournamentViewerSnapshot(tournamentId);
    if (snap) snapshots.push(snap);
  }
  return snapshots;
}

function getExportSelectedFormat() {
  const checked = document.querySelector('input[name="exportFormat"]:checked');
  return checked?.value ?? "pdf";
}

function getExportSelectedTournamentIds() {
  return state.exportSelectedTournamentIds.filter((id) => currentTournaments.some((t) => t.id === id));
}

function buildDefaultExportFileBaseName() {
  const ids = getExportSelectedTournamentIds();
  const names = ids
    .map((id) => currentTournaments.find((t) => t.id === id)?.name ?? "")
    .map((name) => sanitizeCsvFilenamePart(name))
    .filter(Boolean);
  const joinedNames = names.length ? names.join("_") : "さくらグループ";
  const dateCandidate =
    ids.length === 1
      ? getViewerCsvDatePrefix(currentTournaments.find((t) => t.id === ids[0])?.date)
      : getTodayDatePrefix();
  return dateCandidate ? `${dateCandidate}_${joinedNames}` : joinedNames;
}

function setExportError(message) {
  exportErrorMessageEl.textContent = message;
  exportErrorMessageEl.classList.toggle("hidden", !message);
}

function setExportRetryVisible(visible) {
  exportRetryAreaEl.classList.toggle("hidden", !visible);
}

function openExportModal() {
  if (!currentTournaments.length) {
    window.alert("大会データがありません。");
    return;
  }
  if (!state.exportSelectedTournamentIds.length) {
    state.exportSelectedTournamentIds = state.selectedTournamentId
      ? [state.selectedTournamentId]
      : currentTournaments.map((t) => t.id);
  }
  exportFilenameInputEl.value = buildDefaultExportFileBaseName();
  renderExportTournamentList();
  setExportError("");
  setExportRetryVisible(false);
  exportModalEl.classList.remove("hidden");
}

function closeExportModal() {
  exportModalEl.classList.add("hidden");
}

function renderExportTournamentList() {
  exportTournamentListEl.innerHTML = "";
  currentTournaments.forEach((tournament) => {
    const label = document.createElement("label");
    label.className = "filter-chip";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.exportSelectedTournamentIds.includes(tournament.id);
    input.addEventListener("change", () => {
      const set = new Set(state.exportSelectedTournamentIds);
      if (input.checked) set.add(tournament.id);
      else set.delete(tournament.id);
      state.exportSelectedTournamentIds = Array.from(set);
      exportFilenameInputEl.value = buildDefaultExportFileBaseName();
    });
    const text = document.createElement("span");
    const dateLabel = tournament.date ? ` (${tournament.date})` : "";
    text.textContent = `${tournament.name}${dateLabel}`;
    label.append(input, text);
    exportTournamentListEl.appendChild(label);
  });
}

function ensureOverwriteConfirm(fileName) {
  const key = "sakuramatch-export-history";
  let history = [];
  try {
    history = JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    history = [];
  }
  if (history.includes(fileName)) {
    return window.confirm("このファイル名は既に出力履歴があります。続行しますか？");
  }
  history.push(fileName);
  window.localStorage.setItem(key, JSON.stringify(history.slice(-80)));
  return true;
}

function triggerBlobDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildOutputFileNameWithExt(ext) {
  const input = sanitizeCsvFilenamePart(exportFilenameInputEl.value) || buildDefaultExportFileBaseName();
  return `${input}.${ext}`;
}

function buildCsvTextFromSnapshots(snapshots) {
  const headers = [
    "大会名",
    "選手名",
    "出場数",
    "総アタック数",
    "アタック成功数",
    "アタック失敗数",
    "アタック成功率",
    "飛んできた本数",
    "キャッチ数",
    "アウト数",
    "キャッチ率",
    "アタック貢献度",
    "キャッチ貢献度",
    "内野復帰数",
    "ゼロ抜き数",
  ];
  const lines = [headers];
  snapshots.forEach((snap) => {
    const conditionLines = buildExportConditionItems(snap).map(([k, v]) => `${k}: ${v}`);
    if (conditionLines.length) {
      lines.push([`出力条件: ${conditionLines.join(" / ")}`]);
    }
    createViewerTableRowsCsv(snap.rows).forEach((row) => lines.push([snap.tournament.name, ...row]));
    lines.push([]);
  });
  return lines.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function renderExportCard(title, items) {
  const darkBg = "#0f0f0f";
  const darkPanel = "#181818";
  const darkBorder = "#3a2e10";
  const textMain = "#f8e7a1";
  const textSub = "#d6bf73";
  return `
    <section style="background:${darkBg};border:1px solid ${darkBorder};border-radius:12px;padding:14px;margin-bottom:14px;">
      <h3 style="margin:0 0 10px;font-size:16px;color:${textMain};">${escapeHtml(title)}</h3>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">
        ${items
          .map(
            ([label, value]) =>
              `<div style="border:1px solid ${darkBorder};background:${darkPanel};border-radius:8px;padding:8px;"><div style="font-size:11px;color:${textSub};">${escapeHtml(label)}</div><div style="font-size:14px;color:${textMain};font-weight:700;">${escapeHtml(value)}</div></div>`,
          )
          .join("")}
      </div>
    </section>`;
}

async function renderElementToCanvas(element, scale = 1.5) {
  return await window.html2canvas(element, { backgroundColor: "#ffffff", scale });
}

async function renderElementToPngBlob(element) {
  const canvas = await renderElementToCanvas(element, 1.5);
  return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

function getSelectedPlayerNameForExport(selectedPlayerId) {
  if (!selectedPlayerId || selectedPlayerId === "all") {
    return "";
  }
  return players.find((p) => p.id === selectedPlayerId)?.name ?? "";
}

function getExportSortLabel(key) {
  return (
    {
      name: "選手名",
      games: "出場数",
      attack: "総アタック数",
      attackSuccess: "アタック成功数",
      attackFailure: "アタック失敗数",
      attackRate: "アタック成功率",
      incoming: "飛んできた本数",
      catch: "キャッチ数",
      out: "アウト数",
      catchRate: "キャッチ率",
      attackContribution: "アタック貢献度",
      catchContribution: "キャッチ貢献度",
      return: "内野復帰数",
      zeroBreak: "ゼロ抜き数",
    }[key] ?? key
  );
}

function buildExportConditionItems(snap) {
  const items = [];
  if (state.viewerStageFilter !== "all") {
    items.push(["試合区分", state.viewerStageFilter]);
  }
  if (state.viewerOpponentFilter !== "all") {
    items.push(["対戦相手", state.viewerOpponentFilter]);
  }
  if (snap.filteredMatches.length > 0 && snap.selectedMatchIds.length !== snap.filteredMatches.length) {
    items.push(["選択試合", `${snap.selectedMatchIds.length}/${snap.filteredMatches.length}`]);
  }
  const playerName = getSelectedPlayerNameForExport(snap.selectedPlayerId);
  if (playerName) {
    items.push(["選手絞り込み", playerName]);
  }
  if (!(state.viewerSortKey === "name" && state.viewerSortOrder === "asc")) {
    items.push(["並び替え", `${getExportSortLabel(state.viewerSortKey)}（${state.viewerSortOrder === "asc" ? "昇順" : "降順"}）`]);
  }
  return items;
}

function renderExportConditionBadgeHtml(items) {
  if (!items.length) {
    return "";
  }
  return `
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px;">
      ${items
        .map(
          ([label, value]) =>
            `<span style="display:inline-block;border:1px solid #6b5420;border-radius:999px;padding:3px 8px;font-size:11px;color:#f8e7a1;background:#1a1a1a;">${escapeHtml(label)}: ${escapeHtml(String(value))}</span>`,
        )
        .join("")}
    </div>
  `;
}

async function exportAsPng(snapshots, baseName) {
  for (const snap of snapshots) {
    const mount = document.createElement("div");
    mount.style.position = "fixed";
    mount.style.left = "-10000px";
    mount.style.top = "0";
    mount.style.width = "1100px";
    mount.style.background = "#0a0a0a";
    mount.style.color = "#f8e7a1";
    mount.style.padding = "16px";

    const summarySection = document.createElement("div");
    const conditionItems = buildExportConditionItems(snap);
    summarySection.innerHTML = renderExportCard(
      `${snap.tournament.name} 統計`,
      snap.summaryStats.map(([label, value]) => [label, String(value)]),
    );
    if (conditionItems.length) {
      const wrap = document.createElement("div");
      wrap.innerHTML = renderExportConditionBadgeHtml(conditionItems);
      summarySection.prepend(wrap);
    }

    const rankingItems = snap.rankings.flatMap((r) =>
      r.list.map((item) => [`${r.title} ${item.rank}位`, `${item.name} ${item.value}`]),
    );
    const rankingSection = document.createElement("div");
    rankingSection.innerHTML = renderExportCard(`${snap.tournament.name} ランキング`, rankingItems);
    if (conditionItems.length) {
      const wrap = document.createElement("div");
      wrap.innerHTML = renderExportConditionBadgeHtml(conditionItems);
      rankingSection.prepend(wrap);
    }

    const tableEl = document.createElement("table");
    tableEl.style.width = "100%";
    tableEl.style.borderCollapse = "collapse";
    const tableCaption = conditionItems.length
      ? `<caption style="caption-side:top;text-align:left;padding:6px 0;">${renderExportConditionBadgeHtml(conditionItems)}</caption>`
      : "";
    tableEl.innerHTML = `
      ${tableCaption}
      <thead><tr>${["選手名", "出場数", "総アタック数", "アタック成功数", "アタック失敗数", "アタック成功率", "飛んできた本数", "キャッチ数", "アウト数", "キャッチ率", "アタック貢献度", "キャッチ貢献度", "内野復帰数", "ゼロ抜き数"]
        .map((h) => `<th style="border:1px solid #6b5420;padding:6px;background:#1a1a1a;font-size:12px;color:#f8e7a1;">${h}</th>`)
        .join("")}</tr></thead>
      <tbody>
        ${createViewerTableRowsCsv(snap.rows)
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td style="border:1px solid #3a2e10;padding:6px;font-size:12px;color:#f8e7a1;background:#101010;">${escapeHtml(cell)}</td>`)
                .join("")}</tr>`,
          )
          .join("")}
      </tbody>`;

    mount.append(summarySection, rankingSection, tableEl);
    document.body.appendChild(mount);

    const summaryBlob = await renderElementToPngBlob(summarySection);
    const rankingBlob = await renderElementToPngBlob(rankingSection);
    const tableBlob = await renderElementToPngBlob(tableEl);
    triggerBlobDownload(summaryBlob, `${baseName}_${sanitizeCsvFilenamePart(snap.tournament.name)}_統計.png`);
    triggerBlobDownload(rankingBlob, `${baseName}_${sanitizeCsvFilenamePart(snap.tournament.name)}_ランキング.png`);
    triggerBlobDownload(tableBlob, `${baseName}_${sanitizeCsvFilenamePart(snap.tournament.name)}_成績表.png`);
    mount.remove();
  }
}

function exportAsCsv(snapshots, fileName) {
  const csvText = buildCsvTextFromSnapshots(snapshots);
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  triggerBlobDownload(blob, fileName);
}

function exportAsPdf(snapshots, fileName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

    const addCanvasPageToPdf = (canvas, shouldAddPage) => {
    if (shouldAddPage) {
      doc.addPage();
    }
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 8;
    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2;
    const scale = Math.min(maxW / canvas.width, maxH / canvas.height);
    const drawW = canvas.width * scale;
    const drawH = canvas.height * scale;
    const x = (pageWidth - drawW) / 2;
    const y = margin;
    doc.addImage(canvas.toDataURL("image/png"), "PNG", x, y, drawW, drawH);
  };

    const renderPdfPageBlock = async (html, widthPx = 880) => {
    const mount = document.createElement("div");
    mount.style.position = "fixed";
    mount.style.left = "-10000px";
    mount.style.top = "0";
      mount.style.width = `${widthPx}px`;
      mount.style.background = "#0a0a0a";
      mount.style.padding = "8px";
      mount.style.color = "#f8e7a1";
    mount.innerHTML = html;
    document.body.appendChild(mount);
      const canvas = await renderElementToCanvas(mount, 2);
    mount.remove();
    return canvas;
  };

  const run = async () => {
    let pageCount = 0;
    for (const snap of snapshots) {
      const conditionItems = buildExportConditionItems(snap);
      const infoCanvas = await renderPdfPageBlock(`
        <h2 style="margin:0 0 8px;font-size:24px;">大会情報 / 統計</h2>
        <div style="font-size:22px;font-weight:700;margin-bottom:6px;">${escapeHtml(snap.tournament.name)}</div>
        <div style="font-size:15px;margin-bottom:8px;">日付: ${escapeHtml(snap.tournament.date || "未設定")} / 選択試合数: ${snap.selectedMatchIds.length}</div>
        ${renderExportConditionBadgeHtml(conditionItems)}
        ${renderExportCard(`${snap.tournament.name} 統計`, snap.summaryStats)}
      `, 860);
      addCanvasPageToPdf(infoCanvas, pageCount > 0);
      pageCount += 1;

      const tableRows = createViewerTableRowsCsv(snap.rows)
        .map(
          (row) =>
            `<tr>${row
              .map((cell) => `<td style="border:1px solid #3a2e10;padding:6px;font-size:11px;color:#f8e7a1;background:#101010;">${escapeHtml(cell)}</td>`)
              .join("")}</tr>`,
        )
        .join("");
      const tableCanvas = await renderPdfPageBlock(`
        <h2 style="margin:0 0 6px;font-size:24px;">${escapeHtml(snap.tournament.name)} 成績表</h2>
        ${renderExportConditionBadgeHtml(conditionItems)}
        <table style="width:100%;border-collapse:collapse;background:#0f0f0f;">
          <thead><tr>${["選手名", "出場数", "総アタック数", "アタック成功数", "アタック失敗数", "アタック成功率", "飛んできた本数", "キャッチ数", "アウト数", "キャッチ率", "アタック貢献度", "キャッチ貢献度", "内野復帰数", "ゼロ抜き数"]
            .map((h) => `<th style="border:1px solid #6b5420;padding:5px;background:#1a1a1a;font-size:12px;color:#f8e7a1;">${h}</th>`)
            .join("")}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      `, 980);
      addCanvasPageToPdf(tableCanvas, true);
      pageCount += 1;

      const rankingItems = snap.rankings.flatMap((r) =>
        r.list.map((item) => [`${r.title} ${item.rank}位`, `${item.name} ${item.value}`]),
      );
      const rankingCanvas = await renderPdfPageBlock(`
        <h2 style="margin:0 0 6px;font-size:24px;">${escapeHtml(snap.tournament.name)} ランキング</h2>
        ${renderExportConditionBadgeHtml(conditionItems)}
        ${renderExportCard(`${snap.tournament.name} ランキング`, rankingItems)}
      `, 860);
      addCanvasPageToPdf(rankingCanvas, true);
      pageCount += 1;
    }
    doc.save(fileName);
  };

  return run();
}

async function executeExport() {
  try {
    setExportError("");
    setExportRetryVisible(false);
    const format = getExportSelectedFormat();
    const selectedTournamentIds = getExportSelectedTournamentIds();
    if (!selectedTournamentIds.length) {
      setExportError("出力対象の大会を1つ以上選択してください。");
      return;
    }

    const snapshots = await buildExportSnapshots(selectedTournamentIds);
    const allRows = snapshots.flatMap((snap) => snap.rows);
    if (!allRows.length) {
      setExportError("出力対象のデータがありません。");
      return;
    }

    const containsAllMatchExport = snapshots.some(
      (snap) => snap.filteredMatches.length > 0 && snap.selectedMatchIds.length === snap.filteredMatches.length,
    );
    if (containsAllMatchExport) {
      const ok = window.confirm("全試合を出力しますか？");
      if (!ok) {
        return;
      }
    }

    const fileName = buildOutputFileNameWithExt(format === "png" ? "png" : format);
    if (!ensureOverwriteConfirm(fileName)) {
      return;
    }

    if (format === "csv") {
      exportAsCsv(snapshots, fileName);
    } else if (format === "pdf") {
      await exportAsPdf(snapshots, fileName);
    } else {
      const baseName = fileName.replace(/\.png$/i, "");
      await exportAsPng(snapshots, baseName);
    }
    window.alert("出力が完了しました。");
    closeExportModal();
  } catch (error) {
    console.error(error);
    setExportError("出力エラーが発生しました。再度お試しください。");
    setExportRetryVisible(true);
  }
}

function renderViewerContent() {
  const hasTournament = Boolean(state.selectedTournamentId);
  const canShowViewer = !isStaff() && hasTournament;
  viewerSectionEl.classList.toggle("hidden", !canShowViewer);
  if (!canShowViewer) {
    state.viewerLastRenderedRows = [];
    state.viewerLastSelectedMatchIds = [];
    setViewerEmptyState("");
    viewerRankingsEl.innerHTML = "";
    return;
  }

  viewerStageFilterEl.value = state.viewerStageFilter;
  renderViewerOpponentFilter();
  const filteredMatches = getViewerFilteredMatches();
  renderViewerDetailMatchSelect(filteredMatches);
  const selectedMatchIds = getViewerActiveMatchIds().filter((matchId) =>
    filteredMatches.some((match) => match.id === matchId),
  );
  const selectedPlayerId = getViewerSelectedPlayerId();
  syncViewerSortControls();
  syncViewerDetailSortControls();
  renderViewerMatchFilters();
  renderViewerPlayerSelect();

  if (!currentMatches.length) {
    state.viewerLastRenderedRows = [];
    state.viewerLastSelectedMatchIds = [];
    setViewerEmptyState("この大会にはまだ試合がありません。試合が追加されるとここに集計が表示されます。");
    viewerTotalsEl.innerHTML = "";
    viewerRankingsEl.innerHTML = "";
    renderViewerTable([]);
    viewerDetailSummaryEl.textContent = "";
    renderViewerDetailTable([]);
    return;
  }

  if (!filteredMatches.length) {
    state.viewerLastRenderedRows = [];
    state.viewerLastSelectedMatchIds = [];
    setViewerEmptyState("現在の区分・対戦相手条件に一致する試合がありません。条件を変更してみてください。");
    viewerTotalsEl.innerHTML = "";
    viewerRankingsEl.innerHTML = "";
    renderViewerTable([]);
    viewerDetailSummaryEl.textContent = "";
    renderViewerDetailTable([]);
    return;
  }

  if (!selectedMatchIds.length) {
    state.viewerLastRenderedRows = [];
    state.viewerLastSelectedMatchIds = [];
    setViewerEmptyState("試合が選択されていません。上の絞り込みから1試合以上選択してください。");
    viewerTotalsEl.innerHTML = "";
    viewerRankingsEl.innerHTML = "";
    renderViewerTable([]);
    viewerDetailSummaryEl.textContent = "";
    renderViewerDetailTable([]);
    return;
  }

  const selectedPlayerText =
    selectedPlayerId === "all"
      ? "全選手を表示中"
      : `${players.find((player) => player.id === selectedPlayerId)?.name ?? "選手"}を表示中`;
  viewerSummaryEl.textContent = `${selectedMatchIds.length}試合 / ${selectedPlayerText}`;

  const rowIds = players.map((player) => player.id);
  const rows = rowIds
    .map((playerId) => buildViewerPlayerRow(playerId, state.viewerTournamentRecords, selectedMatchIds))
    .filter((row) => selectedPlayerId === "all" || row.id === selectedPlayerId)
    .filter((row) => players.find((player) => player.id === row.id)?.active !== false)
    .filter((row) => row.games > 0 || row.attack || row.catch || row.out || row.return || row.zeroBreak)
    .map((row) => ({ ...row }));

  if (!rows.length) {
    state.viewerLastRenderedRows = [];
    state.viewerLastSelectedMatchIds = [];
    setViewerEmptyState("現在の絞り込み条件では集計できるデータがありません。条件を変更してみてください。");
    viewerTotalsEl.innerHTML = "";
    viewerRankingsEl.innerHTML = "";
    renderViewerTable([]);
    viewerDetailSummaryEl.textContent = "";
    renderViewerDetailTable([]);
    return;
  }

  setViewerEmptyState("");

  const sortedRows = sortViewerRows(rows);
  state.viewerLastRenderedRows = sortedRows;
  state.viewerLastSelectedMatchIds = selectedMatchIds;

  renderViewerTotals(rows, selectedMatchIds);
  renderViewerRankings(sortedRows);
  renderViewerTable(sortedRows);

  const detailMatch = filteredMatches.find((match) => match.id === state.viewerDetailMatchId) ?? filteredMatches[0];
  const detailRows = players
    .map((player) =>
      buildViewerPlayerRow(player.id, state.viewerTournamentRecords, detailMatch ? [detailMatch.id] : []),
    )
    .filter((row) => selectedPlayerId === "all" || row.id === selectedPlayerId)
    .filter((row) => players.find((player) => player.id === row.id)?.active !== false)
    .filter((row) => row.attack || row.catch || row.out || row.return || row.zeroBreak || row.games > 0);

  viewerDetailSummaryEl.textContent = detailMatch
    ? `${getMatchLabel(detailMatch)} の個別成績`
    : "";
  renderViewerDetailTable(sortViewerDetailRows(detailRows));
}

async function loadViewerRecordsForTournament() {
  if (!db || !state.selectedTournamentId) {
    state.viewerTournamentRecords = {};
    renderViewerContent();
    return;
  }

  const snapshot = await getTournamentRecordsRef(state.selectedTournamentId).once("value");
  state.viewerTournamentRecords = snapshot.val() ?? {};
  renderViewerContent();
}

function queueAutoSave() {
  if (!isStaff() || !state.selectedTournamentId || !state.selectedMatchId) {
    return;
  }
  if (state.autoSaveTimerId) {
    window.clearTimeout(state.autoSaveTimerId);
  }
  startAutoSaveCountdown();
  state.autoSaveTimerId = window.setTimeout(() => {
    void saveCurrentMatchRecords(true);
  }, 3000);
}

function updateStat(playerId, statKey, diff) {
  if (!isStaff()) {
    return;
  }
  if (isBenched(playerId)) {
    return;
  }
  const playerStats = getPlayerStats(playerId);
  const next = Math.max(0, (playerStats[statKey] || 0) + diff);
  state.records[playerId] = { ...playerStats, [statKey]: next };
  renderStats();
  refreshValidationState();
  queueAutoSave();
}

function renderTabs() {
  tabsEl.innerHTML = "";
  const visiblePlayers = getVisiblePlayers();
  if (!visiblePlayers.find((player) => player.id === state.selectedPlayerId)) {
    state.selectedPlayerId = visiblePlayers[0]?.id ?? "";
  }
  visiblePlayers.forEach((player) => {
    const btn = document.createElement("button");
    btn.className = `tab ${player.id === state.selectedPlayerId ? "active" : ""}`;
    btn.textContent = isBenched(player.id)
      ? `${formatPlayerLabel(player)}（ベンチ）`
      : formatPlayerLabel(player);
    btn.addEventListener("click", () => {
      state.selectedPlayerId = player.id;
      renderTabs();
      renderStats();
    });
    tabsEl.appendChild(btn);
  });
}

function renderStats() {
  const player = getCurrentPlayer();
  if (!player) {
    currentPlayerNameEl.textContent = "選手データがありません";
    statsAreaEl.innerHTML = "";
    totalPlaysEl.textContent = "0";
    playerBenchStatusEl.textContent = "";
    benchMessageEl.classList.add("hidden");
    renderRecordSummary();
    return;
  }
  const playerStats = getPlayerStats(player.id);
  const benched = isBenched(player.id);
  currentPlayerNameEl.textContent = `選手記録: ${formatPlayerLabel(player)}`;
  playerBenchStatusEl.textContent = benched ? "現在: ベンチ" : "現在: 出場中";
  toggleBenchButtonEl.textContent = benched ? "出場に戻す" : "ベンチ";
  togglePlayerActiveButtonEl.textContent = player.active === false ? "選手を再表示" : "選手を非表示";

  statsAreaEl.innerHTML = "";
  benchMessageEl.classList.toggle("hidden", !benched);

  if (benched) {
    totalPlaysEl.textContent = "0";
    renderRecordSummary();
    refreshValidationState();
    return;
  }

  let total = 0;

  stats.forEach((stat) => {
    const value = playerStats[stat.key] || 0;
    total += value;

    const row = document.createElement("div");
    row.className = "row";

    const label = document.createElement("span");
    label.textContent = stat.label;

    const counter = document.createElement("div");
    counter.className = "counter";

    const minus = document.createElement("button");
    minus.className = "btn";
    minus.textContent = "-";
    minus.disabled = !isStaff();
    minus.addEventListener("click", () => updateStat(player.id, stat.key, -1));

    const val = document.createElement("span");
    val.className = "value";
    val.textContent = String(value);

    const plus = document.createElement("button");
    plus.className = "btn plus";
    plus.textContent = "+";
    plus.disabled = !isStaff();
    plus.addEventListener("click", () => updateStat(player.id, stat.key, 1));

    counter.append(minus, val, plus);
    row.append(label, counter);
    statsAreaEl.appendChild(row);
  });

  totalPlaysEl.textContent = String(total);
  renderRecordSummary();
  refreshValidationState();
}

function setSaveStatus(text) {
  setSaveState(text, "", "");
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function setSaveState(status, detail = "", tone = "") {
  saveStatusEl.textContent = status;
  saveStatusDetailEl.textContent = detail;
  saveStatusEl.classList.remove("is-dirty", "is-saving", "is-saved", "is-error");
  if (tone) {
    saveStatusEl.classList.add(tone);
  }
}

function clearAutoSaveCountdown() {
  if (state.autoSaveCountdownId) {
    window.clearInterval(state.autoSaveCountdownId);
    state.autoSaveCountdownId = null;
  }
  state.autoSaveDueAt = null;
}

function renderSaveHistory() {
  if (!state.currentMatchSaveHistory.length) {
    saveHistoryListEl.innerHTML = '<div class="save-history-item">まだ保存履歴はありません。</div>';
    return;
  }

  saveHistoryListEl.innerHTML = state.currentMatchSaveHistory
    .map(
      (item) => `
        <div class="save-history-item">${item.time} / ${item.label}</div>
      `,
    )
    .join("");
}

function setLastUpdatedAt(timestamp) {
  state.currentMatchLastUpdatedAt = timestamp || null;
  lastUpdatedTextEl.textContent = timestamp
    ? `最終更新: ${formatTime(timestamp)}`
    : "最終更新: 未保存";
}

function pushSaveHistory(label, timestamp = Date.now()) {
  state.currentMatchSaveHistory = [
    { label, time: formatTime(timestamp) },
    ...state.currentMatchSaveHistory,
  ].slice(0, 5);
  renderSaveHistory();
}

function resetMatchSaveMeta(updatedAt = null) {
  state.currentMatchSaveHistory = [];
  renderSaveHistory();
  setLastUpdatedAt(updatedAt);
}

function startAutoSaveCountdown() {
  clearAutoSaveCountdown();
  state.autoSaveDueAt = Date.now() + 3000;

  const updateCountdown = () => {
    if (!state.autoSaveDueAt) {
      return;
    }
    const remainingMs = Math.max(0, state.autoSaveDueAt - Date.now());
    const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
    setSaveState("自動保存待ち", `${remainingSeconds}秒後に自動保存します`, "is-dirty");
  };

  updateCountdown();
  state.autoSaveCountdownId = window.setInterval(() => {
    if (!state.autoSaveDueAt) {
      clearAutoSaveCountdown();
      return;
    }
    updateCountdown();
  }, 250);
}

function setValidationMessage(message) {
  validationMessageEl.textContent = message;
  validationMessageEl.classList.toggle("hidden", !message);
}

function setTournamentHelpText(message) {
  tournamentHelpTextEl.textContent = message;
}

function setMatchHelpText(message) {
  matchHelpTextEl.textContent = message;
}

function setViewerEmptyState(message) {
  viewerEmptyStateEl.textContent = message;
  viewerEmptyStateEl.classList.toggle("hidden", !message);
}

function validateCurrentRecords() {
  const errors = [];

  players.forEach((player) => {
    if (player.active === false) {
      return;
    }

    const playerStats = getPlayerStats(player.id);
    if (!playerStats) {
      return;
    }

    if (playerStats.isBench) {
      const hasBenchStats = stats.some((stat) => (playerStats[stat.key] || 0) > 0);
      if (hasBenchStats) {
        errors.push(`${player.name} はベンチなのに記録が入っています。`);
      }
      return;
    }

    const attackSuccess = playerStats.attackSuccess || 0;
    const attackFailure = getAttackFailureFromRecord(playerStats);
    if (attackFailure < 0) {
      errors.push(`${player.name} のアタック失敗数が不正です。`);
    }
    if (attackSuccess < 0) {
      errors.push(`${player.name} のアタック成功数が不正です。`);
    }
  });

  return errors;
}

function refreshValidationState() {
  if (!isStaff() || !state.selectedTournamentId || !state.selectedMatchId) {
    setValidationMessage("");
    renderCheckMode();
    return true;
  }

  const errors = validateCurrentRecords();
  if (!errors.length) {
    setValidationMessage("");
    renderCheckMode();
    return true;
  }

  setValidationMessage(errors[0]);
  renderCheckMode();
  return false;
}

function renderTournamentOptions(tournaments) {
  currentTournaments = tournaments;
  const validIds = new Set(tournaments.map((t) => t.id));
  state.exportSelectedTournamentIds = state.exportSelectedTournamentIds.filter((id) => validIds.has(id));
  if (!state.exportSelectedTournamentIds.length && tournaments.length) {
    state.exportSelectedTournamentIds = [state.selectedTournamentId || tournaments[0].id];
  }
  tournamentSelectEl.innerHTML = "";
  if (!tournaments.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "大会がありません";
    tournamentSelectEl.appendChild(option);
    state.selectedTournamentId = "";
    setTournamentHelpText(
      isStaff()
        ? "まだ大会がありません。右上の「+ 新規大会を追加」から最初の大会を作成してください。"
        : "公開されている大会がまだありません。編集モードで大会が追加されると閲覧できます。",
    );
    applyPermission();
    return;
  }

  tournaments.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    tournamentSelectEl.appendChild(option);
  });

  if (!state.selectedTournamentId || !tournaments.find((t) => t.id === state.selectedTournamentId)) {
    state.selectedTournamentId = tournaments[0].id;
  }
  tournamentSelectEl.value = state.selectedTournamentId;
  const selected = tournaments.find((t) => t.id === state.selectedTournamentId);
  fillTournamentMetaInputs(selected);
  setTournamentHelpText(
    isStaff()
      ? "大会を選んで次へ進むか、新規作成・編集を行ってください。"
      : "大会を選ぶと、その大会の集計成績を閲覧できます。",
  );
  applyPermission();
}

function renderMatchOptions(matches) {
  currentMatches = matches;
  matchSelectEl.innerHTML = "";
  if (!matches.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "試合がありません";
    matchSelectEl.appendChild(option);
    state.selectedMatchId = "";
    setMatchHelpText(
      isStaff()
        ? "この大会にはまだ試合がありません。「+ 新規試合を追加」から試合を作成してください。"
        : "この大会にはまだ閲覧できる試合データがありません。",
    );
    applyPermission();
    return;
  }

  matches.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    const tournament = getSelectedTournament();
    const tournamentName = tournament?.name || "大会名未設定";
    option.textContent = `${tournamentName} / ${item.stage || "区分未設定"} / ${item.opponent || "対戦相手未設定"}`;
    matchSelectEl.appendChild(option);
  });

  if (state.selectedMatchId && matches.find((m) => m.id === state.selectedMatchId)) {
    matchSelectEl.value = state.selectedMatchId;
  } else {
    state.selectedMatchId = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "試合を選択してください";
    placeholder.selected = true;
    placeholder.disabled = true;
    matchSelectEl.prepend(placeholder);
    matchSelectEl.value = "";
  }
  setMatchHelpText(
    isStaff()
      ? "試合を選んで次へ進むか、新規作成・編集を行ってください。"
      : "試合を選択すると、選択中大会の詳細データを確認できます。",
  );
  applyPermission();
}

function fillMatchMetaInputs(match) {
  if (!match) {
    opponentEl.value = "";
    matchStageEl.value = "予選";
    return;
  }

  opponentEl.value = match.opponent ?? "";
  matchStageEl.value = match.stage ?? "予選";
}

function fillTournamentMetaInputs(tournament) {
  if (tournament) {
    tournamentDateEl.value = tournament.date ?? "";
    tournamentMatchTypeEl.value = tournament.matchType ?? "大会";
  }
}

function fillTournamentEditInputs(tournament) {
  if (!tournament) {
    editTournamentNameEl.value = "";
    editTournamentDateEl.value = "";
    editTournamentMatchTypeEl.value = "大会";
    return;
  }
  editTournamentNameEl.value = tournament.name ?? "";
  editTournamentDateEl.value = tournament.date ?? "";
  editTournamentMatchTypeEl.value = tournament.matchType ?? "大会";
}

function fillMatchEditInputs(match) {
  if (!match) {
    editOpponentEl.value = "";
    editMatchStageEl.value = "予選";
    return;
  }
  editOpponentEl.value = match.opponent ?? "";
  editMatchStageEl.value = match.stage ?? "予選";
}

function getSelectedTournament() {
  return currentTournaments.find((t) => t.id === state.selectedTournamentId) ?? null;
}

async function seedTournamentsIfNeeded() {
  if (!db) return;
  const snapshot = await getTournamentsRef().once("value");
  if (snapshot.exists()) {
    return;
  }

  const defaultTournamentRef = getTournamentsRef().push();
  await defaultTournamentRef.set({
    id: defaultTournamentRef.key,
    name: "初期大会",
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  });
}

async function loadTournaments() {
  if (!db) return [];
  const snapshot = await getTournamentsRef().once("value");
  const data = snapshot.val() ?? {};
  return Object.entries(data)
    .map(([id, value]) => normalizeTournament(id, value))
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
}

async function loadMatchesByTournament(tournamentId) {
  if (!db || !tournamentId) return [];
  const snapshot = await getMatchesRef(tournamentId).once("value");
  const data = snapshot.val() ?? {};
  return Object.entries(data).map(([id, value]) => normalizeMatch(id, value));
}

async function loadRecordsForMatch() {
  if (!db || !state.selectedTournamentId || !state.selectedMatchId) {
    if (state.autoSaveTimerId) {
      window.clearTimeout(state.autoSaveTimerId);
      state.autoSaveTimerId = null;
    }
    clearAutoSaveCountdown();
    state.records = {};
    resetMatchSaveMeta(null);
    setSaveState("未保存", "試合を選択すると保存状態が表示されます", "");
    renderStats();
    refreshValidationState();
    return;
  }
  const snapshot = await getMatchRecordsRef(state.selectedTournamentId, state.selectedMatchId).once("value");
  if (state.autoSaveTimerId) {
    window.clearTimeout(state.autoSaveTimerId);
    state.autoSaveTimerId = null;
  }
  clearAutoSaveCountdown();
  const rawRecords = snapshot.val() ?? {};
  state.records = Object.fromEntries(
    Object.entries(rawRecords).map(([playerId, record]) => {
      const safeRecord = record ?? {};
      if (safeRecord.isBench) {
        return [playerId, { isBench: true }];
      }
      return [
        playerId,
        {
          ...safeRecord,
          attackFailure: getAttackFailureFromRecord(safeRecord),
        },
      ];
    }),
  );
  const selectedMatch = currentMatches.find((item) => item.id === state.selectedMatchId);
  resetMatchSaveMeta(selectedMatch?.updatedAt ?? null);
  setSaveState("保存済み", "この試合の最新データを読み込みました", "is-saved");
  renderStats();
  refreshValidationState();
}

async function seedPlayersIfNeeded() {
  if (!db) return;
  const snapshot = await getPlayersRef().once("value");
  if (snapshot.exists()) {
    return;
  }

  for (const [index, player] of FALLBACK_PLAYERS.entries()) {
    await getPlayerRef(player.id).set({
      name: player.name,
      active: true,
      order: index,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });
  }
}

async function loadPlayersFromRealtimeDatabase() {
  if (!db) {
    setSaveState("Firebase未接続", "script.js に接続設定を入力すると同期できます", "is-error");
    return;
  }

  try {
    await seedPlayersIfNeeded();
    const snapshot = await getPlayersRef().once("value");
    const playersData = snapshot.val() ?? {};
    players = Object.entries(playersData)
      .map(([id, value], index) => normalizePlayer(id, value, index))
      .sort((a, b) => {
        if ((a.order ?? Number.MAX_SAFE_INTEGER) !== (b.order ?? Number.MAX_SAFE_INTEGER)) {
          return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
        }
        return a.name.localeCompare(b.name, "ja");
      });

    if (!players.length) {
      players = [...FALLBACK_PLAYERS];
    }
    if (!players.find((p) => p.id === state.selectedPlayerId)) {
      state.selectedPlayerId = players[0].id;
    }
    const activePlayerIds = players.filter((player) => player.active !== false).map((player) => player.id);
    if (state.viewerSelectedPlayerId !== "all" && !activePlayerIds.includes(state.viewerSelectedPlayerId)) {
      state.viewerSelectedPlayerId = "all";
    }
    renderPlayerManagementList();
    renderTabs();
    await loadRecordsForMatch();
    renderViewerContent();
    setSaveStatus("選手データ同期済み");
  } catch (error) {
    console.error(error);
    const code = error?.code ?? "unknown";
    if (code === "permission-denied") {
      setSaveState("同期失敗", "Realtime Databaseルールで拒否されています", "is-error");
      return;
    }
    setSaveState("同期失敗", `エラーコード: ${code}`, "is-error");
  }
}

function buildMatchMetaPayload() {
  const tournament = getSelectedTournament();
  return {
    date: tournament?.date ?? "",
    opponent: opponentEl.value.trim(),
    stage: matchStageEl.value,
    matchType: tournament?.matchType ?? "大会",
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  };
}

function buildRecordsPayload() {
  const records = players.map((player) => {
    const stats = { ...getPlayerStats(player.id) };
    if (stats.isBench) {
      return {
        id: player.id,
        stats: { isBench: true },
      };
    }
    stats.attackFailure = getAttackFailureFromRecord(stats);
    delete stats.attack;
    return {
      id: player.id,
      stats,
    };
  });

  return Object.fromEntries(records.map((item) => [item.id, item.stats]));
}

async function createPlayer() {
  if (!isStaff()) {
    setSaveStatus("スタッフのみ選手追加可能");
    return;
  }
  const name = newPlayerNameEl.value.trim();
  const grade = newPlayerGradeEl.value;
  const role = newPlayerRoleEl.value;
  const handedness = newPlayerHandednessEl.value;
  const memo = newPlayerMemoEl.value.trim();
  if (!name) {
    setSaveStatus("選手名を入力してください");
    return;
  }
  if (!grade) {
    setSaveStatus("学年を選択してください");
    return;
  }
  const ref = getPlayersRef().push();
  await ref.set({
    id: ref.key,
    name,
    grade,
    role,
    handedness,
    memo,
    active: true,
    order: players.length,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
  });
  newPlayerNameEl.value = "";
  newPlayerGradeEl.value = "";
  newPlayerRoleEl.value = "";
  newPlayerHandednessEl.value = "";
  newPlayerMemoEl.value = "";
  playerManagementCreateAreaEl.classList.add("hidden");
  togglePlayerManagementButtonEl.textContent = `+ ${togglePlayerManagementButtonEl.dataset.defaultLabel}`;
  await loadPlayersFromRealtimeDatabase();
  state.selectedPlayerId = ref.key;
  renderTabs();
  renderStats();
  setSaveStatus("選手を追加しました");
}

async function updatePlayerDetails(playerId, nextName, nextGrade, nextRole, nextHandedness, nextMemo) {
  if (!isStaff()) {
    return;
  }

  const name = nextName.trim();
  if (!name) {
    setSaveStatus("選手名を入力してください");
    return;
  }
  if (!nextGrade) {
    setSaveStatus("学年を選択してください");
    return;
  }

  await getPlayerRef(playerId).update({
    name,
    grade: nextGrade,
    role: nextRole,
    handedness: nextHandedness,
    memo: nextMemo.trim(),
  });

  await loadPlayersFromRealtimeDatabase();
  renderPlayerManagementList();
  renderTabs();
  renderStats();
  renderViewerContent();
  setSaveStatus("選手情報を更新しました");
}

async function deletePlayer(playerId, playerName) {
  if (!isStaff()) {
    return;
  }
  const confirmed = window.confirm(`${playerName} を完全削除します。よろしいですか？`);
  if (!confirmed) {
    return;
  }
  await getPlayerRef(playerId).remove();
  players = players.filter((player) => player.id !== playerId);
  delete state.records[playerId];
  if (state.selectedPlayerId === playerId) {
    state.selectedPlayerId = players[0]?.id ?? "";
  }
  renderPlayerManagementList();
  renderTabs();
  renderStats();
  setSaveStatus("選手を完全削除しました");
}

async function persistPlayerOrderList(reorderedPlayers) {
  await Promise.all(
    reorderedPlayers.map((player, index) =>
      getPlayerRef(player.id).update({
        order: index,
      }),
    ),
  );
  await loadPlayersFromRealtimeDatabase();
  renderPlayerManagementList();
  renderTabs();
  renderStats();
  renderViewerContent();
}

async function movePlayerOrder(playerId, direction) {
  if (!isStaff()) {
    return;
  }

  const currentIndex = players.findIndex((player) => player.id === playerId);
  const targetIndex = currentIndex + direction;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= players.length) {
    return;
  }

  const reordered = [...players];
  const [movedPlayer] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, movedPlayer);

  await persistPlayerOrderList(reordered);
  setSaveStatus("選手の並び順を更新しました");
}

/** 表示順を番号で指定（0が先頭）。Firebase の各選手の order を書き換えます。 */
async function applyPlayerDisplayOrder(playerId, newIndexRaw) {
  if (!isStaff()) {
    return;
  }
  const len = players.length;
  if (!len) {
    return;
  }
  let newIndex = Math.floor(Number(newIndexRaw));
  if (!Number.isFinite(newIndex)) {
    newIndex = 0;
  }
  newIndex = Math.max(0, Math.min(len - 1, newIndex));
  const currentIndex = players.findIndex((player) => player.id === playerId);
  if (currentIndex < 0) {
    return;
  }
  if (newIndex === currentIndex) {
    setSaveStatus("すでにその表示位置です");
    return;
  }
  const reordered = [...players];
  const [moved] = reordered.splice(currentIndex, 1);
  reordered.splice(newIndex, 0, moved);
  await persistPlayerOrderList(reordered);
  setSaveStatus("表示順を更新しました");
}

function toggleBenchStatus() {
  if (!isStaff()) {
    return;
  }
  const player = getCurrentPlayer();
  if (!player) {
    return;
  }
  const current = getPlayerStats(player.id);
  const nextBench = !current.isBench;
  state.records[player.id] = nextBench ? { isBench: true } : {};
  renderTabs();
  renderStats();
  refreshValidationState();
  queueAutoSave();
}

async function togglePlayerActive() {
  if (!isStaff()) {
    return;
  }
  const player = getCurrentPlayer();
  if (!player) {
    return;
  }
  const nextActive = player.active === false;
  await getPlayerRef(player.id).update({ active: nextActive });
  await loadPlayersFromRealtimeDatabase();
  state.selectedPlayerId = getVisiblePlayers()[0]?.id ?? "";
  renderTabs();
  renderStats();
  setSaveStatus(nextActive ? "選手を再表示しました" : "選手を非表示にしました");
}

async function initializeData() {
  if (!db) {
    setSaveStatus("Firebase未接続（設定待ち）");
    return;
  }

  await seedTournamentsIfNeeded();
  const tournaments = await loadTournaments();
  renderTournamentOptions(tournaments);
  const matches = await loadMatchesByTournament(state.selectedTournamentId);
  renderMatchOptions(matches);
  resetViewerFilters();
  fillTournamentEditInputs(getSelectedTournament());
  fillMatchEditInputs(null);
  state.viewerSelectedMatchIds = matches.map((match) => match.id);
  viewerSortKeyEl.value = state.viewerSortKey;
  viewerSortOrderEl.value = state.viewerSortOrder;
  await loadViewerRecordsForTournament();
  await loadPlayersFromRealtimeDatabase();
  syncStepByState();
  refreshValidationState();
}

async function createTournament() {
  if (!isStaff()) {
    setSaveStatus("スタッフのみ大会作成可能");
    return;
  }
  const name = newTournamentNameEl.value.trim();
  const date = tournamentDateEl.value;
  const matchType = tournamentMatchTypeEl.value;
  if (!name) {
    setSaveStatus("新規大会名を入力してください");
    return;
  }
  if (!date) {
    setSaveStatus("大会日を入力してください");
    return;
  }
  const ref = getTournamentsRef().push();
  await ref.set({
    id: ref.key,
    name,
    date,
    matchType,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  });
  newTournamentNameEl.value = "";
  setSaveStatus("大会を作成しました");
  tournamentCreateAreaEl.classList.add("hidden");
  toggleTournamentCreateButtonEl.textContent = `+ ${toggleTournamentCreateButtonEl.dataset.defaultLabel}`;
  const tournaments = await loadTournaments();
  state.selectedTournamentId = ref.key;
  resetViewerFilters();
  renderTournamentOptions(tournaments);
  fillTournamentEditInputs(getSelectedTournament());
  renderMatchOptions([]);
  state.viewerSelectedMatchIds = [];
  state.viewerTournamentRecords = {};
  renderViewerContent();
  fillMatchMetaInputs(null);
  fillMatchEditInputs(null);
  state.records = {};
  renderStats();
  applyPermission();
}

async function updateSelectedTournament() {
  if (!isStaff()) {
    setSaveStatus("スタッフのみ大会更新可能");
    return;
  }
  if (!state.selectedTournamentId) {
    setSaveStatus("先に大会を選択してください");
    return;
  }

  const name = editTournamentNameEl.value.trim();
  const date = editTournamentDateEl.value;
  const matchType = editTournamentMatchTypeEl.value;

  if (!name) {
    setSaveStatus("大会名を入力してください");
    return;
  }
  if (!date) {
    setSaveStatus("大会日を入力してください");
    return;
  }

  await getTournamentRef(state.selectedTournamentId).update({
    name,
    date,
    matchType,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  });

  const tournaments = await loadTournaments();
  resetViewerFilters();
  renderTournamentOptions(tournaments);
  fillTournamentEditInputs(getSelectedTournament());
  renderMatchOptions(currentMatches);
  renderRecordSummary();
  renderViewerContent();
  setSaveStatus("大会内容を更新しました");
}

async function deleteSelectedTournament() {
  if (!isStaff()) {
    setSaveStatus("スタッフのみ大会削除可能");
    return;
  }
  if (!state.selectedTournamentId) {
    setSaveStatus("先に大会を選択してください");
    return;
  }

  const tournament = getSelectedTournament();
  const tournamentName = tournament?.name ?? "この大会";
  const confirmed = window.confirm(
    `${tournamentName} を削除します。\n大会に紐づく試合と記録もすべて削除されます。よろしいですか？`,
  );
  if (!confirmed) {
    return;
  }

  const tournamentId = state.selectedTournamentId;
  await getTournamentRef(tournamentId).remove();
  await getMatchesRef(tournamentId).remove();
  await getTournamentRecordsRef(tournamentId).remove();

  const tournaments = await loadTournaments();
  renderTournamentOptions(tournaments);
  fillTournamentEditInputs(getSelectedTournament());

  const matches = await loadMatchesByTournament(state.selectedTournamentId);
  resetViewerFilters();
  renderMatchOptions(matches);
  state.selectedMatchId = "";
  fillMatchMetaInputs(null);
  fillMatchEditInputs(null);
  state.viewerSelectedMatchIds = matches.map((match) => match.id);
  state.viewerTournamentRecords = {};
  state.records = {};
  await loadViewerRecordsForTournament();
  renderStats();
  syncStepByState();
  applyPermission();

  tournamentEditAreaEl.classList.add("hidden");
  toggleTournamentEditButtonEl.textContent = toggleTournamentEditButtonEl.dataset.defaultLabel;
  setSaveStatus("大会を削除しました");
}

async function createMatchInSelectedTournament() {
  if (!isStaff()) {
    setSaveStatus("スタッフのみ試合作成可能");
    return;
  }
  if (!state.selectedTournamentId) {
    setSaveStatus("先に大会を選択してください");
    return;
  }
  const newMatchRef = getMatchesRef(state.selectedTournamentId).push();
  await newMatchRef.set({
    id: newMatchRef.key,
    ...buildMatchMetaPayload(),
    createdAt: firebase.database.ServerValue.TIMESTAMP,
  });
  state.selectedMatchId = newMatchRef.key;
  const matches = await loadMatchesByTournament(state.selectedTournamentId);
  renderMatchOptions(matches);
  state.viewerSelectedMatchIds = matches.map((match) => match.id);
  state.viewerSelectedPlayerId = "all";
  await loadViewerRecordsForTournament();
  const selected = matches.find((item) => item.id === state.selectedMatchId);
  fillMatchMetaInputs(selected);
  fillMatchEditInputs(selected);
  state.records = {};
  renderStats();
  applyPermission();
  setSaveStatus("試合を作成しました");
  matchCreateAreaEl.classList.add("hidden");
  toggleMatchCreateButtonEl.textContent = `+ ${toggleMatchCreateButtonEl.dataset.defaultLabel}`;
}

async function updateSelectedMatch() {
  if (!isStaff()) {
    setSaveStatus("スタッフのみ試合更新可能");
    return;
  }
  if (!state.selectedTournamentId) {
    setSaveStatus("先に大会を選択してください");
    return;
  }
  if (!state.selectedMatchId) {
    setSaveStatus("先に試合を選択してください");
    return;
  }

  const opponent = editOpponentEl.value.trim();
  const stage = editMatchStageEl.value;

  if (!opponent) {
    setSaveStatus("対戦相手を入力してください");
    return;
  }

  await getMatchRef(state.selectedTournamentId, state.selectedMatchId).update({
    opponent,
    stage,
    updatedAt: firebase.database.ServerValue.TIMESTAMP,
  });

  const matches = await loadMatchesByTournament(state.selectedTournamentId);
  renderMatchOptions(matches);
  const selected = matches.find((item) => item.id === state.selectedMatchId);
  fillMatchMetaInputs(selected);
  fillMatchEditInputs(selected);
  renderRecordSummary();
  renderViewerContent();
  setSaveStatus("試合内容を更新しました");
}

async function deleteSelectedMatch() {
  if (!isStaff()) {
    setSaveStatus("スタッフのみ試合削除可能");
    return;
  }
  if (!state.selectedTournamentId) {
    setSaveStatus("先に大会を選択してください");
    return;
  }
  if (!state.selectedMatchId) {
    setSaveStatus("先に試合を選択してください");
    return;
  }

  const selected = currentMatches.find((item) => item.id === state.selectedMatchId);
  const matchLabel = selected ? getMatchLabel(selected) : "この試合";
  const confirmed = window.confirm(`${matchLabel} を削除します。記録も含めて削除されます。よろしいですか？`);
  if (!confirmed) {
    return;
  }

  const matchId = state.selectedMatchId;
  await getMatchRef(state.selectedTournamentId, matchId).remove();
  await getMatchRecordsRef(state.selectedTournamentId, matchId).remove();

  const matches = await loadMatchesByTournament(state.selectedTournamentId);
  state.selectedMatchId = "";
  renderMatchOptions(matches);
  fillMatchMetaInputs(null);
  fillMatchEditInputs(null);
  state.viewerSelectedMatchIds = matches.map((match) => match.id);
  state.records = {};
  await loadViewerRecordsForTournament();
  renderStats();
  syncStepByState();
  applyPermission();

  matchEditAreaEl.classList.add("hidden");
  toggleMatchEditButtonEl.textContent = toggleMatchEditButtonEl.dataset.defaultLabel;
  setSaveStatus("試合を削除しました");
}

async function saveCurrentMatchRecords(isAutoSave = false) {
  if (!isStaff()) {
    setSaveStatus("スタッフのみ保存可能");
    return;
  }
  if (!state.selectedTournamentId) {
    setSaveStatus("先に大会を選択してください");
    return;
  }
  if (!state.selectedMatchId) {
    setSaveStatus("先に試合を作成/選択してください");
    return;
  }
  if (!db) {
    setSaveStatus("Firebase未接続（設定待ち）");
    return;
  }

  if (!refreshValidationState()) {
    clearAutoSaveCountdown();
    setSaveState("保存できません", "入力エラーを修正してください", "is-error");
    return;
  }

  try {
    clearAutoSaveCountdown();
    setSaveState(isAutoSave ? "自動保存中" : "保存中", "Firebase に保存しています", "is-saving");
    await getMatchRef(state.selectedTournamentId, state.selectedMatchId).update(buildMatchMetaPayload());
    await getMatchRecordsRef(state.selectedTournamentId, state.selectedMatchId).set(buildRecordsPayload());
    state.autoSaveTimerId = null;
    const savedAt = Date.now();
    setLastUpdatedAt(savedAt);
    pushSaveHistory(isAutoSave ? "自動保存しました" : "手動保存しました", savedAt);
    setSaveState(
      isAutoSave ? "自動保存完了" : "保存完了",
      `${formatTime(savedAt)} に保存しました`,
      "is-saved",
    );
  } catch (error) {
    console.error(error);
    state.autoSaveTimerId = null;
    const code = error?.code ?? "unknown";
    if (code === "permission-denied") {
      setSaveState("保存失敗", "Realtime Databaseルールで拒否されています", "is-error");
      return;
    }
    setSaveState("保存失敗", `エラーコード: ${code}`, "is-error");
  }
}

tournamentSelectEl.addEventListener("change", async () => {
  state.selectedTournamentId = tournamentSelectEl.value;
  const selectedTournament = currentTournaments.find((t) => t.id === state.selectedTournamentId);
  fillTournamentMetaInputs(selectedTournament);
  fillTournamentEditInputs(selectedTournament);
  if (!state.selectedTournamentId) {
    state.selectedMatchId = "";
  }
  const matches = await loadMatchesByTournament(state.selectedTournamentId);
  resetViewerFilters();
  renderMatchOptions(matches);
  state.viewerSelectedMatchIds = getViewerFilteredMatches().map((match) => match.id);
  await loadViewerRecordsForTournament();
  fillMatchMetaInputs(null);
  fillMatchEditInputs(null);
  await loadRecordsForMatch();
  applyPermission();
});

matchSelectEl.addEventListener("change", async () => {
  state.selectedMatchId = matchSelectEl.value;
  const selected = currentMatches.find((item) => item.id === state.selectedMatchId);
  fillMatchMetaInputs(selected);
  fillMatchEditInputs(selected);
  await loadRecordsForMatch();
  applyPermission();
});

createTournamentButtonEl.addEventListener("click", () => {
  void createTournament();
});

toggleTournamentCreateButtonEl.addEventListener("click", () => {
  toggleCreateArea(tournamentCreateAreaEl, toggleTournamentCreateButtonEl);
  if (!tournamentCreateAreaEl.classList.contains("hidden")) {
    newTournamentNameEl.focus();
  }
});

toggleTournamentEditButtonEl.addEventListener("click", () => {
  if (!state.selectedTournamentId) {
    setSaveStatus("先に大会を選択してください");
    return;
  }
  fillTournamentEditInputs(getSelectedTournament());
  toggleEditArea(tournamentEditAreaEl, toggleTournamentEditButtonEl);
  if (!tournamentEditAreaEl.classList.contains("hidden")) {
    editTournamentNameEl.focus();
  }
});

confirmTournamentButtonEl.addEventListener("click", async () => {
  if (!state.selectedTournamentId) {
    setSaveStatus("大会を選択してください");
    return;
  }
  const matches = await loadMatchesByTournament(state.selectedTournamentId);
  renderMatchOptions(matches);
  fillMatchMetaInputs(null);
  showStep(2);
});

createMatchButtonEl.addEventListener("click", () => {
  void createMatchInSelectedTournament();
});

toggleMatchCreateButtonEl.addEventListener("click", () => {
  toggleCreateArea(matchCreateAreaEl, toggleMatchCreateButtonEl);
  if (!matchCreateAreaEl.classList.contains("hidden")) {
    opponentEl.focus();
  }
});

toggleMatchEditButtonEl.addEventListener("click", () => {
  if (!state.selectedMatchId) {
    setSaveStatus("先に試合を選択してください");
    return;
  }
  const selected = currentMatches.find((item) => item.id === state.selectedMatchId);
  fillMatchEditInputs(selected);
  toggleEditArea(matchEditAreaEl, toggleMatchEditButtonEl);
  if (!matchEditAreaEl.classList.contains("hidden")) {
    editOpponentEl.focus();
  }
});

togglePlayerManagementButtonEl.addEventListener("click", () => {
  toggleCreateArea(playerManagementCreateAreaEl, togglePlayerManagementButtonEl);
  if (!playerManagementCreateAreaEl.classList.contains("hidden")) {
    newPlayerNameEl.focus();
  }
});

playerManagementAccordionButtonEl.addEventListener("click", () => {
  togglePlayerManagementAccordion();
});

guideAccordionButtonEl.addEventListener("click", () => {
  toggleGuideAccordion();
});

metricsAccordionButtonEl.addEventListener("click", () => {
  toggleMetricsAccordion();
});

createPlayerButtonEl.addEventListener("click", () => {
  void createPlayer();
});

updateTournamentButtonEl.addEventListener("click", () => {
  void updateSelectedTournament();
});

deleteTournamentButtonEl.addEventListener("click", () => {
  void deleteSelectedTournament();
});

updateMatchButtonEl.addEventListener("click", () => {
  void updateSelectedMatch();
});

deleteMatchButtonEl.addEventListener("click", () => {
  void deleteSelectedMatch();
});

selectAllViewerMatchesButtonEl.addEventListener("click", () => {
  state.viewerSelectedMatchIds = getViewerFilteredMatches().map((match) => match.id);
  renderViewerContent();
});

clearViewerMatchesButtonEl.addEventListener("click", () => {
  state.viewerSelectedMatchIds = [];
  renderViewerContent();
});

exportViewerCsvButtonEl.addEventListener("click", () => {
  openExportModal();
});

closeExportModalButtonEl.addEventListener("click", () => {
  closeExportModal();
});

cancelExportButtonEl.addEventListener("click", () => {
  closeExportModal();
});

selectAllExportTournamentsButtonEl.addEventListener("click", () => {
  state.exportSelectedTournamentIds = currentTournaments.map((t) => t.id);
  renderExportTournamentList();
  exportFilenameInputEl.value = buildDefaultExportFileBaseName();
});

exportHelpAccordionButtonEl.addEventListener("click", () => {
  toggleAccordionAnimated(exportHelpAccordionBodyEl, exportHelpAccordionIconEl);
});

confirmExportButtonEl.addEventListener("click", async () => {
  await executeExport();
});

exportRetryButtonEl.addEventListener("click", async () => {
  await executeExport();
});

viewerStageFilterEl.addEventListener("change", () => {
  state.viewerStageFilter = viewerStageFilterEl.value;
  state.viewerSelectedMatchIds = getViewerFilteredMatches().map((match) => match.id);
  renderViewerContent();
});

viewerOpponentFilterEl.addEventListener("change", () => {
  state.viewerOpponentFilter = viewerOpponentFilterEl.value;
  state.viewerSelectedMatchIds = getViewerFilteredMatches().map((match) => match.id);
  renderViewerContent();
});

viewerDetailMatchSelectEl.addEventListener("change", () => {
  state.viewerDetailMatchId = viewerDetailMatchSelectEl.value;
  renderViewerContent();
});

viewerPlayerSelectEl.addEventListener("change", () => {
  state.viewerSelectedPlayerId = viewerPlayerSelectEl.value;
  renderViewerContent();
});

viewerSortKeyEl.addEventListener("change", () => {
  state.viewerSortKey = viewerSortKeyEl.value;
  syncViewerSortControls();
  renderViewerContent();
});

viewerSortOrderEl.addEventListener("change", () => {
  state.viewerSortOrder = viewerSortOrderEl.value;
  syncViewerSortControls();
  renderViewerContent();
});

viewerTotalsAccordionButtonEl.addEventListener("click", () => {
  toggleViewerTotalsAccordion();
});

viewerRankingAccordionButtonEl.addEventListener("click", () => {
  toggleViewerRankingAccordion();
});

viewerDetailAccordionButtonEl.addEventListener("click", () => {
  toggleViewerDetailAccordion();
});

closePlayerProfileButtonEl.addEventListener("click", () => {
  closePlayerProfile();
});

playerProfileModalEl.addEventListener("click", (event) => {
  if (event.target === playerProfileModalEl || event.target.classList.contains("profile-modal-backdrop")) {
    closePlayerProfile();
  }
});

exportModalEl.addEventListener("click", (event) => {
  if (event.target === exportModalEl || event.target.classList.contains("profile-modal-backdrop")) {
    closeExportModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !playerProfileModalEl.classList.contains("hidden")) {
    closePlayerProfile();
  }
  if (event.key === "Escape" && !exportModalEl.classList.contains("hidden")) {
    closeExportModal();
  }
});

viewerSortButtonsEls.forEach((button) => {
  button.addEventListener("click", () => {
    const nextKey = button.dataset.sortKey;
    if (!nextKey) {
      return;
    }
    if (state.viewerSortKey === nextKey) {
      state.viewerSortOrder = state.viewerSortOrder === "desc" ? "asc" : "desc";
    } else {
      state.viewerSortKey = nextKey;
      state.viewerSortOrder = nextKey === "name" ? "asc" : "desc";
    }
    syncViewerSortControls();
    renderViewerContent();
  });
});

viewerDetailSortButtonsEls.forEach((button) => {
  button.addEventListener("click", () => {
    const nextKey = button.dataset.sortKey;
    if (!nextKey) {
      return;
    }
    if (state.viewerDetailSortKey === nextKey) {
      state.viewerDetailSortOrder = state.viewerDetailSortOrder === "desc" ? "asc" : "desc";
    } else {
      state.viewerDetailSortKey = nextKey;
      state.viewerDetailSortOrder = nextKey === "name" ? "asc" : "desc";
    }
    syncViewerDetailSortControls();
    renderViewerContent();
  });
});

showActiveOnlyButtonEl.addEventListener("click", () => {
  state.showActiveOnly = !state.showActiveOnly;
  showActiveOnlyButtonEl.textContent = state.showActiveOnly
    ? "全選手を表示"
    : "出場選手だけ表示";
  renderTabs();
  renderStats();
});

confirmMatchButtonEl.addEventListener("click", async () => {
  if (!state.selectedMatchId) {
    setSaveStatus("試合を選択してください");
    return;
  }
  await loadRecordsForMatch();
  showStep(3);
});

backToStep1ButtonEl.addEventListener("click", () => {
  showStep(1);
});

backToStep2ButtonEl.addEventListener("click", () => {
  showStep(2);
});

toggleBenchButtonEl.addEventListener("click", () => {
  toggleBenchStatus();
});

togglePlayerActiveButtonEl.addEventListener("click", () => {
  void togglePlayerActive();
});

saveMatchButtonEl.addEventListener("click", () => {
  void saveCurrentMatchRecords();
});

logout();
renderSaveHistory();
showStep(1);
toggleTournamentCreateButtonEl.dataset.defaultLabel = "新規大会を追加";
toggleTournamentEditButtonEl.dataset.defaultLabel = "選択中大会を編集";
toggleMatchCreateButtonEl.dataset.defaultLabel = "新規試合を追加";
toggleMatchEditButtonEl.dataset.defaultLabel = "選択中試合を編集";
togglePlayerManagementButtonEl.dataset.defaultLabel = "選手を登録";
if (!hasFirebaseConfig) {
  setSaveStatus("Firebase設定値をscript.jsに入力してください");
}
