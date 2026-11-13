
// ========================================
// GEOMDAN RISE FC - MAIN SCRIPT
// ========================================

// SUPABASE 연결
const SUPABASE_URL = "https://gqsecxgzegyzzwlmfavr.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_8BKTlYkIEEwNS-dDauIfFg_3FSdkcDJ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ========================================
// PLAYER MANAGEMENT
// ========================================

let players = [];

const playerGrid = document.getElementById("player-grid");
const filterButtons = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("player-modal");

let currentPosition = "ALL";

function escapePlayerHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// 선수 목록 불러오기
async function loadPlayers() {
  if (!playerGrid) return;

  playerGrid.innerHTML = "선수단 정보를 불러오는 중입니다.";

  const { data, error } = await supabaseClient
    .from("players")
    .select("*")
    .order("number", { ascending: true });

  if (error) {
    console.error("선수 조회 오류:", error);
    playerGrid.innerHTML = "선수 정보를 불러오지 못했습니다.";
    return;
  }

  players = data || [];
  renderPlayers(currentPosition);

  console.log("선수 데이터 로딩 완료", players);
}

// 선수 카드 출력
function renderPlayers(position = "ALL") {
  if (!playerGrid) return;

  currentPosition = position;

  const filteredPlayers = position === "ALL"
    ? players
    : players.filter(player => player.position === position);

  if (filteredPlayers.length === 0) {
    playerGrid.innerHTML = `
      <p style="color:#999;text-align:center;padding:40px;">
        등록된 선수가 없습니다.
      </p>`;
    return;
  }

  playerGrid.innerHTML = filteredPlayers.map(player => `
    <div class="player-card" data-player-id="${escapePlayerHTML(player.id)}">
      <div class="player-photo">
        ${
          player.photo_url
          ? `<img src="${escapePlayerHTML(player.photo_url)}"
               alt="${escapePlayerHTML(player.name)}"
               style="width:100%;height:100%;object-fit:cover;"
               onerror="this.style.display='none'">`
          : `<strong>RISE</strong>
             <span>${String(player.number).padStart(2, "0")}</span>`
        }
      </div>
      <div class="player-info">
        <small>${escapePlayerHTML(player.position)}</small>
        <h3>
  <span style="color:#c9a646; margin-right:8px;">
    #${String(player.number).padStart(2, "0")}
  </span>

  ${escapePlayerHTML(player.name)}

  ${
    player.is_captain
    ? `<span style="
        display:inline-block;
        margin-left:8px;
        padding:3px 7px;
        background:#c9a646;
        color:#080808;
        font-size:11px;
        font-weight:900;
        border-radius:4px;
        vertical-align:middle;
      ">C</span>`
    : ""
  }
</h3>
        <p>GEOMDAN RISE FC</p>
      </div>
    </div>
  `).join("");
}

// 포지션 필터
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    renderPlayers(button.dataset.position);
  });
});

// 선수 상세 팝업
if (playerGrid) {
  playerGrid.addEventListener("click", event => {
    const card = event.target.closest(".player-card");
    if (!card) return;

    const player = players.find(
      p => String(p.id) === card.dataset.playerId
    );

    if (!player || !modal) return;

    document.getElementById("modal-number").textContent =
      String(player.number).padStart(2, "0");

    document.getElementById("modal-name").textContent = player.name;
    document.getElementById("modal-position").textContent = player.position;
    document.getElementById("modal-description").textContent =
      player.description || "선수 소개가 준비 중입니다.";

    modal.classList.add("show");
  });
}

// 팝업 닫기
const modalClose = document.getElementById("modal-close");

if (modalClose && modal) {
  modalClose.addEventListener("click", () => {
    modal.classList.remove("show");
  });

  modal.addEventListener("click", event => {
    if (event.target === modal) modal.classList.remove("show");
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal) {
    modal.classList.remove("show");
  }
});

// 선수 데이터 최초 로딩
loadPlayers();


// ========================================
// RISE FC INTRO VIDEO
// ========================================

const introScreen = document.getElementById("intro-screen");
const introVideo = document.getElementById("intro-video");
const mainWebsite = document.getElementById("main-website");
const skipButton = document.getElementById("skip-intro");

function finishIntro() {
  if (!introScreen || introScreen.classList.contains("hide")) return;

  introScreen.classList.add("hide");

  if (mainWebsite) mainWebsite.classList.add("show");

  setTimeout(() => {
    introScreen.style.display = "none";
  }, 800);

  if (introVideo) introVideo.pause();
}

async function startIntro() {
  if (!introVideo) {
    finishIntro();
    return;
  }

  try {
    introVideo.muted = false;
    introVideo.volume = 1;
    await introVideo.play();
  } catch (error) {
    console.log("무음 재생 시도");

    introVideo.muted = true;

    try {
      await introVideo.play();
    } catch (error) {
      console.log("영상 재생 실패:", error);
      finishIntro();
    }
  }
}

if (skipButton) {
  skipButton.addEventListener("click", finishIntro);
}

if (introVideo) {
  introVideo.addEventListener("ended", finishIntro);
  introVideo.addEventListener("error", finishIntro);
}

window.addEventListener("load", startIntro);


// ========================================
// RISE FC LOGIN & SIGNUP
// ========================================

const authModal = document.getElementById("auth-modal");
const loginOpen = document.getElementById("login-open");
const signupOpen = document.getElementById("signup-open");
const authClose = document.getElementById("auth-close");

const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");

const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authSubmit = document.getElementById("auth-submit");

const authName = document.getElementById("auth-name");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authMessage = document.getElementById("auth-message");

let authMode = "login";

function setAuthMode(mode) {
  authMode = mode;

  if (!authMessage || !authTitle || !authSubmit) return;

  authMessage.textContent = "";

  if (mode === "login") {
    authTitle.textContent = "RISE FC LOGIN";
    authSubmit.textContent = "로그인";

    loginTab?.classList.add("active");
    signupTab?.classList.remove("active");

    authName?.classList.add("hidden");
    if (authName) authName.required = false;
  } else {
    authTitle.textContent = "JOIN RISE FC";
    authSubmit.textContent = "회원가입";

    signupTab?.classList.add("active");
    loginTab?.classList.remove("active");

    authName?.classList.remove("hidden");
    if (authName) authName.required = true;
  }
}

loginOpen?.addEventListener("click", () => {
  setAuthMode("login");
  authModal?.classList.add("show");
});

signupOpen?.addEventListener("click", () => {
  setAuthMode("signup");
  authModal?.classList.add("show");
});

loginTab?.addEventListener("click", () => setAuthMode("login"));
signupTab?.addEventListener("click", () => setAuthMode("signup"));

authClose?.addEventListener("click", () => {
  authModal?.classList.remove("show");
});

authModal?.addEventListener("click", event => {
  if (event.target === authModal) authModal.classList.remove("show");
});

// 로그인 및 회원가입
authForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const email = authEmail.value.trim();
  const password = authPassword.value;
  const name = authName?.value.trim() || "";

  authSubmit.disabled = true;
  authMessage.textContent = "처리 중입니다.";

  try {
    if (authMode === "signup") {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) throw error;

      authMessage.textContent = data.session
        ? "회원가입이 완료되었습니다!"
        : "회원가입 완료! 이메일 인증을 확인해 주세요.";
    } else {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;

      authMessage.textContent = "로그인 성공! 환영합니다.";

      console.log("로그인 사용자:", data.user);

      setTimeout(() => {
        authModal?.classList.remove("show");
        authForm.reset();
        setAuthMode("login");
      }, 1200);
    }
  } catch (error) {
    console.error("인증 오류:", error);
    authMessage.textContent = error.message;
  } finally {
    authSubmit.disabled = false;
  }
});

setAuthMode("login");


// ========================================
// MEMBER LOGIN STATUS
// ========================================

const headerAuthUser = document.createElement("span");
headerAuthUser.className = "auth-user-name";

const headerLogoutBtn = document.createElement("button");
headerLogoutBtn.className = "logout-btn";
headerLogoutBtn.textContent = "로그아웃";

const headerActions = document.querySelector(".header-actions");

const loginButton = document.getElementById("login-open");
const signupButton = document.getElementById("signup-open");

const joinButton = headerActions?.querySelector(".join-btn");

if (headerActions && joinButton) {
  headerActions.insertBefore(headerAuthUser, joinButton);
  headerActions.insertBefore(headerLogoutBtn, joinButton);
}

function updateHeaderAuth(user) {
  if (!headerActions) return;

  if (user) {
    const memberName =
      user.user_metadata?.full_name || user.email.split("@")[0];

    headerAuthUser.textContent = memberName + "님 환영합니다";

    headerAuthUser.style.display = "inline-block";
    headerLogoutBtn.style.display = "inline-block";

    if (loginButton) loginButton.style.display = "none";
    if (signupButton) signupButton.style.display = "none";
  } else {
    headerAuthUser.style.display = "none";
    headerLogoutBtn.style.display = "none";

    if (loginButton) loginButton.style.display = "inline-block";
    if (signupButton) signupButton.style.display = "inline-block";
  }
}

// 로그아웃
headerLogoutBtn.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("로그아웃에 실패했습니다: " + error.message);
    return;
  }

  authModal?.classList.remove("show");
  alert("로그아웃되었습니다.");
});

// 로그인 상태 확인
async function checkLoginStatus() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("로그인 상태 확인 오류:", error);
    return;
  }

  updateHeaderAuth(data.session?.user || null);
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  updateHeaderAuth(session?.user || null);
});

checkLoginStatus();

console.log("GEOMDAN RISE FC 전체 기능 연결 완료!");

// ========================================
// MAIN PAGE - UPCOMING MATCHES
// ========================================

const mainMatchList = document.getElementById("match-list");
const mainMatchBox = document.querySelector(".match-box");

async function loadMainMatches() {

  if (!mainMatchList) return;

  mainMatchList.innerHTML = `
    <p style="text-align:center;padding:30px;color:#aaa;">
      경기 일정을 불러오는 중입니다.
    </p>
  `;

  try {

    const { data, error } = await supabaseClient
      .from("matches")
      .select("*")
      .eq("is_published", true)
      .order("match_date", { ascending: true });

    if (error) throw error;

    const today = new Date().toLocaleDateString("en-CA");

    // 다가오는 경기만 추출
    const upcomingMatches = (data || [])
      .filter(match => {

        const matchDate = String(match.match_date || "").slice(0, 10);

        return (
          matchDate >= today &&
          match.status !== "finished"
        );

      })
      .sort((a, b) =>
        String(a.match_date).localeCompare(String(b.match_date))
      )
      .slice(0, 3);

    // 경기가 없을 때
    if (upcomingMatches.length === 0) {

      mainMatchList.innerHTML = `
        <div class="match-empty">
          등록된 경기 일정이 없습니다.
        </div>
      `;

      if (mainMatchBox) {
        mainMatchBox.style.display = "none";
      }

      return;
    }

    // 대표 경기 표시
    const nextMatch = upcomingMatches[0];

    if (mainMatchBox) {

      mainMatchBox.style.display = "flex";

      const teamBoxes = mainMatchBox.querySelectorAll("div");

      if (teamBoxes.length >= 2) {

        teamBoxes[0].innerHTML = `
          <strong>RISE FC</strong>
          <span>검단 라이즈FC</span>
        `;

        teamBoxes[1].innerHTML = `
          <strong>${escapePlayerHTML(nextMatch.opponent)}</strong>
          <span>상대 구단</span>
        `;

      }

    }

    // 경기 목록 출력
    mainMatchList.innerHTML = upcomingMatches.map(match => `

      <article style="
        background:#151515;
        border:1px solid #333;
        border-radius:10px;
        padding:22px;
        margin-bottom:15px;
      ">

        <span style="
          display:inline-block;
          background:#333;
          color:#c9a646;
          padding:6px 10px;
          font-size:11px;
          border-radius:4px;
          margin-bottom:12px;
        ">
          UPCOMING MATCH
        </span>

        <h3 style="
          color:white;
          font-size:20px;
          margin-bottom:14px;
        ">
          GEOMDAN RISE FC vs ${escapePlayerHTML(match.opponent)}
        </h3>

        <p style="
          color:#bbb;
          font-size:14px;
          line-height:2;
        ">
          📅 ${escapePlayerHTML(match.match_date)}
          ${escapePlayerHTML(match.match_time || "")}
          <br>
          📍 ${escapePlayerHTML(match.venue || "장소 미정")}
        </p>

      </article>

    `).join("");

    console.log("메인 경기 일정 로딩 완료:", upcomingMatches);

  } catch (error) {

    console.error("메인 경기 일정 오류:", error);

    mainMatchList.innerHTML = `
      <p style="color:#ff7777;text-align:center;padding:30px;">
        경기 정보를 불러오지 못했습니다.
      </p>
    `;

  }

}

// 최초 경기 데이터 로딩
loadMainMatches();

// 경기 데이터 실시간 업데이트
supabaseClient
  .channel("main-page-match-updates")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "matches"
    },
    () => {
      loadMainMatches();
    }
  )
  .subscribe();
