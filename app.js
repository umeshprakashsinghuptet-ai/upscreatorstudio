/* =========================================
   UPS CREATOR STUDIO
   MAIN APPLICATION ENGINE
   PART 4A — CORE SETUP
   ========================================= */

import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

import {
  APP_CONFIG,
  validateConfig
} from "./config.js";

import {
  getRegionalTopicIdeas
} from "./regional-topic-bank.js";

/* =========================================
   1. APPLICATION INITIALIZATION
   ========================================= */

const configCheck = validateConfig();

let supabase = null;

if (configCheck.valid) {
  supabase = createClient(
    APP_CONFIG.SUPABASE_URL,
    APP_CONFIG.SUPABASE_PUBLISHABLE_KEY
  );
} else {
  console.warn(
    "Supabase configuration incomplete:",
    configCheck.errors
  );
}

/* =========================================
   2. APPLICATION STATE
   ========================================= */

const APP_STATE = {
  user: null,
  profile: null,
  projects: [],
  currentPage: "dashboard",
  currentStudio: null,

  wizard: {
    mode: "AUTO",
    step: 0,
    answers: {},
    questions: [],
    completed: false
  },

  isLoading: false,
  authMode: "login"
};

/* =========================================
   3. DOM HELPER FUNCTIONS
   ========================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  document.querySelectorAll(selector);

function getElement(id) {
  return document.getElementById(id);
}

/* =========================================
   4. SAFE HTML HELPER
   ========================================= */

function escapeHTML(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );

}

/* =========================================
   5. TOAST NOTIFICATION
   ========================================= */

function showToast(message, type = "info") {

  const toast = getElement("toast");

  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);

}

/* =========================================
   6. PAGE NAVIGATION
   ========================================= */

function showPage(pageName) {

  const pageId = `page-${pageName}`;

  const targetPage = getElement(pageId);

  if (!targetPage) {
    showToast("यह पेज अभी उपलब्ध नहीं है।");
    return;
  }

  $$("[id^='page-']").forEach((page) => {
    page.classList.remove("active");
  });

  targetPage.classList.add("active");

  APP_STATE.currentPage = pageName;

  const title = getElement("pageTitle");

  if (title) {
    title.textContent =
      pageName.charAt(0).toUpperCase() +
      pageName.slice(1);
  }

  const breadcrumb = getElement("breadcrumb");

  if (breadcrumb) {
    breadcrumb.textContent = pageName;
  }

  getElement("sidebar")?.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

/* =========================================
   7. NAVIGATION EVENTS
   ========================================= */

document.addEventListener("click", (event) => {

  const navItem = event.target.closest("[data-page]");

  if (navItem) {
    event.preventDefault();
    showPage(navItem.dataset.page);
  }

});

/* =========================================
   8. MOBILE SIDEBAR
   ========================================= */

getElement("sideToggle")?.addEventListener(
  "click",
  () => {
    getElement("sidebar")?.classList.toggle("open");
  }
);

/* =========================================
   9. PUBLIC WEBSITE NAVIGATION
   ========================================= */

getElement("mobileMenu")?.addEventListener(
  "click",
  () => {
    const nav = $(".topnav");
    nav?.classList.toggle("open");
  }
);

/* =========================================
   10. APPLICATION UTILITIES
   ========================================= */

function setLoading(status) {

  APP_STATE.isLoading = Boolean(status);

  document.body.classList.toggle(
    "app-loading",
    APP_STATE.isLoading
  );

}

function formatDate(dateValue) {

  if (!dateValue) return "—";

  return new Date(dateValue).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}

/* =========================================
   END OF PART 4A
========================================= */

/* =========================================
   PART 4B — AUTHENTICATION SYSTEM
========================================= */

/* 1. OPEN AUTH MODAL */


function openAuthModal(mode = "login") {

  const modal = getElement("authModal");

  if (!modal) return;

  modal.classList.remove("hidden");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  setAuthMode(mode);
}

/* 2. CLOSE AUTH MODAL */

function closeAuthModal() {

  const modal = getElement("authModal");

  if (!modal) return;

  modal.classList.remove("open");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

/* 3. LOGIN / SIGNUP MODE */

function setAuthMode(mode) {

  const isSignup = mode === "signup";

  const title = getElement("authTitle");
  const subtitle = getElement("authSubtitle");
  const submit = getElement("authSubmit");
  const switchButton = getElement("authSwitch");
  const message = getElement("authMessage");
  const profileFields = getElement("signupProfileFields");
  const firstName = getElement("authFirstName");
  const lastName = getElement("authLastName");
  const city = getElement("authCity");
  const forgotPassword = getElement("forgotPassword");

  if (profileFields) {
    profileFields.classList.toggle("hidden", !isSignup);
  }
  [firstName, lastName, city].forEach((field) => {
    if (field) {
      field.disabled = !isSignup;
      field.required = isSignup;
    }
  });
  if (forgotPassword) {
    forgotPassword.classList.toggle("hidden", isSignup);
  }

  if (title) {
    title.textContent = isSignup
      ? "Create Your Account"
      : "Welcome Back";
  }

  if (subtitle) {
    subtitle.textContent = isSignup
      ? "Join UPS Creator Studio"
      : "Login to your creative workspace";
  }

  if (submit) {
    submit.textContent = isSignup
      ? "Create Account"
      : "Login";
  }

  const passwordInput = getElement("authPassword");
  if (passwordInput) {
    passwordInput.autocomplete = isSignup ? "new-password" : "current-password";
  }

  if (switchButton) {
    switchButton.textContent = isSignup
      ? "Already have an account? Login"
      : "New here? Create an account";
  }

  if (message) {
    message.textContent = "";
  }

  APP_STATE.authMode = mode;
}

/* 4. AUTH BUTTON EVENTS */

getElement("loginOpen")?.addEventListener(
  "click",
  () => openAuthModal("login")
);

getElement("getStarted")?.addEventListener(
  "click",
  () => openAuthModal("signup")
);

getElement("heroStart")?.addEventListener(
  "click",
  () => openAuthModal("signup")
);

getElement("modalClose")?.addEventListener(
  "click",
  closeAuthModal
);

getElement("authModal")?.addEventListener("click", (event) => {
  if (event.target?.id === "authModal") closeAuthModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && getElement("authModal")?.classList.contains("open")) {
    closeAuthModal();
  }
});

getElement("authSwitch")?.addEventListener(
  "click",
  () => {

    const nextMode =
      APP_STATE.authMode === "signup"
        ? "login"
        : "signup";

    setAuthMode(nextMode);
  }
);

/* 4B. PASSWORD RECOVERY */

getElement("forgotPassword")?.addEventListener("click", async () => {
  if (!supabase) {
    showAuthMessage("Supabase configuration उपलब्ध नहीं है।");
    return;
  }

  const email = getElement("authEmail")?.value.trim();
  if (!email) {
    showAuthMessage("पहले अपना registered email भरें।");
    getElement("authEmail")?.focus();
    return;
  }

  const button = getElement("forgotPassword");
  if (button) button.disabled = true;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    showAuthMessage("यदि यह email registered है, तो password reset instructions भेज दिए गए हैं। अपना Inbox और Spam folder जाँचें।", "success");
  } catch (error) {
    showAuthMessage(error.message || "Password reset request पूरी नहीं हुई।");
  } finally {
    if (button) button.disabled = false;
  }
});

/* 5. AUTH MESSAGE */

function showAuthMessage(message, type = "error") {

  const box = getElement("authMessage");

  if (!box) return;

  box.textContent = message;
  box.dataset.type = type;
}

/* 6. AUTH FORM SUBMISSION */

getElement("authForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (!supabase) {
      showAuthMessage(
        "Supabase configuration check करें।"
      );
      return;
    }

    const email =
      getElement("authEmail")?.value.trim();

    const password =
      getElement("authPassword")?.value;

    if (!email || !password) {
      showAuthMessage(
        "Email और password दोनों भरें।"
      );
      return;
    }

    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      showAuthMessage("कृपया सही Email Address दर्ज करें।");
      getElement("authEmail")?.focus();
      return;
    }

    if (password.length < 8) {
      showAuthMessage(
        "Password कम से कम 8 characters का होना चाहिए।"
      );
      return;
    }

    const submit = getElement("authSubmit");

    if (submit) {
      submit.disabled = true;
      submit.textContent = "Please wait...";
    }

    try {

      let result;

      if (APP_STATE.authMode === "signup") {

        const firstName = getElement("authFirstName")?.value.trim() || "";
        const lastName = getElement("authLastName")?.value.trim() || "";
        const city = getElement("authCity")?.value.trim() || "";

        if (!firstName || !lastName || !city) {
          showAuthMessage("Registration के लिए First Name, Last Name और City भरें।");
          return;
        }

        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`.trim(),
              city
            },
            emailRedirectTo: window.location.origin
          }
        });

      } else {

        result = await supabase.auth.signInWithPassword({
          email,
          password
        });

      }

      if (result.error) {
        throw result.error;
      }

      if (APP_STATE.authMode === "signup") {

        if (!result.data.session) {

          showAuthMessage(
            "Account request सफल हुई। Email verification की जरूरत हो सकती है।",
            "success"
          );

        } else {

          showToast(
            "Account created successfully!",
            "success"
          );

          closeAuthModal();
        }

      } else {

        showToast(
          "Login successful!",
          "success"
        );

        closeAuthModal();
      }

    } catch (error) {

      showAuthMessage(
        error.message || "Authentication failed."
      );

    } finally {

      if (submit) {
        submit.disabled = false;

        submit.textContent =
          APP_STATE.authMode === "signup"
            ? "Create Account"
            : "Login";
      }

    }

  }
);

/* 7. LOAD USER PROFILE */

async function loadUserProfile(user) {

  if (!supabase || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Profile loading error:",
      error
    );

    return null;
  }

  APP_STATE.profile = data;

  return data;
}

/* 8. UPDATE AUTH UI */

function updateAuthUI(user, profile = null) {

  const publicView = getElement("publicView");
  const appView = getElement("appView");

  const isLoggedIn = Boolean(user);

   if (publicView) {
    publicView.classList.toggle("hidden", isLoggedIn);
  }

  if (appView) {
    appView.classList.toggle("hidden", !isLoggedIn);
  }

  if (!isLoggedIn) {
    APP_STATE.user = null;
    APP_STATE.profile = null;

    const adminNav = getElement("adminNav");
    if (adminNav) {
      adminNav.hidden = true;
      adminNav.classList.add("hidden");
    }

    if (typeof renderCloudStatus === "function") {
      renderCloudStatus();
    }

    return;
  }

  APP_STATE.user = user;
  APP_STATE.profile = profile;

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Creator";

  const welcomeName = getElement("welcomeName");
  const miniName = getElement("miniName");
  const miniRole = getElement("miniRole");

  if (welcomeName) {
    welcomeName.textContent = displayName;
  }

  if (miniName) {
    miniName.textContent = displayName;
  }

  if (miniRole) {
    miniRole.textContent =
      profile?.role || "tester";
  }

  const adminNav = getElement("adminNav");

  if (adminNav) {
    const isSuperAdmin = profile?.role === "super_admin";
    adminNav.hidden = !isSuperAdmin;
    adminNav.classList.toggle("hidden", !isSuperAdmin);
  }

  const adminStatus = getElement("adminStatus");

  if (adminStatus) {
    adminStatus.textContent =
      profile?.role === "super_admin"
        ? "Administrator access detected."
        : "Standard user access.";
  }

  if (typeof renderCloudStatus === "function") {
    renderCloudStatus();
  }

}

/* 9. LOGOUT */

async function logoutUser() {

  if (!supabase) return;

  const { error } = await supabase.auth.signOut();

  if (error) {
    showToast(error.message, "error");
    return;
  }

  APP_STATE.user = null;
  APP_STATE.profile = null;
  APP_STATE.projects = [];

  updateAuthUI(null);

  showToast("You have been logged out.");

}

/* 10. LOGOUT BUTTONS */

getElement("logoutBtn")?.addEventListener(
  "click",
  logoutUser
);

getElement("topLogout")?.addEventListener(
  "click",
  logoutUser
);

/* =========================================
   END OF PART 4B
   ========================================= */
/* =========================================
   PART 4C — SEVEN CREATIVE STUDIOS
   ========================================= */

/* 1. STUDIO INFORMATION */

const STUDIO_DATA = [

  {
    id: "video",
    name: "Video Studio",
    icon: "🎬",
    description: "Create engaging videos and reels.",
    outputs: ["Reels", "Shorts", "Long Videos"]
  },

  {
    id: "image",
    name: "Image Studio",
    icon: "🖼️",
    description: "Create creative AI image concepts.",
    outputs: ["AI Images", "Portraits", "Artwork"]
  },

  {
    id: "poster",
    name: "Poster Studio",
    icon: "🎨",
    description: "Design professional promotional posters.",
    outputs: ["Posters", "Banners", "Social Graphics"]
  },

  {
    id: "dance",
    name: "Dance Studio",
    icon: "💃",
    description: "Plan dance videos and choreography.",
    outputs: ["Dance Reels", "Choreography", "Music Scenes"]
  },

  {
    id: "film",
    name: "Film Maker Studio",
    icon: "🎥",
    description: "Develop cinematic film concepts.",
    outputs: ["Short Films", "Scenes", "Storyboards"]
  },

  {
    id: "podcast",
    name: "Podcast Studio",
    icon: "🎙️",
    description: "Create professional podcast scripts.",
    outputs: ["Interviews", "Discussions", "Episodes"]
  },

  {
    id: "education",
    name: "Education Studio",
    icon: "📚",
    description: "Create educational and learning content.",
    outputs: ["MCQ", "GK", "Lessons", "Explainers"]
  }

];

/* 2. CREATE STUDIO CARD */

function createStudioCard(studio) {

  return `
    <article class="studio-card panel">

      <div class="studio-icon">
        ${studio.icon}
      </div>

      <h3>${escapeHTML(studio.name)}</h3>

      <p>${escapeHTML(studio.description)}</p>

      <div class="studio-tags">
        ${studio.outputs.map(output => `
          <span class="tag">
            ${escapeHTML(output)}
          </span>
        `).join("")}
      </div>

      <button
        class="btn btn-primary studio-open"
        data-studio="${escapeHTML(studio.id)}"
        type="button"
      >
        Open Studio →
      </button>
      ${studio.id === "education" ? `<button class="btn btn-secondary" data-open-gyan-apex type="button">Open GYAN APEX Hub ↗</button>` : ""}

    </article>
  `;
}

/* 3. RENDER ALL STUDIOS */

function renderStudios() {

  const publicContainer =
    getElement("publicStudios");

  const appContainer =
    getElement("allStudios");

  const cards = STUDIO_DATA
    .map(createStudioCard)
    .join("");

  if (publicContainer) {
    publicContainer.innerHTML = cards;
  }

  if (appContainer) {
    appContainer.innerHTML = cards;
  }

}

/* 4. OPEN SELECTED STUDIO */

function openStudio(studioId) {

  const studio = STUDIO_DATA.find(
    item => item.id === studioId
  );

  if (!studio) {
    showToast("Studio not found.", "error");
    return;
  }

  APP_STATE.currentStudio = studio;

  APP_STATE.wizard = {
    mode: "AUTO",
    step: 0,
    answers: {
      studio: studio.id
    },
    questions: [],
    completed: false
  };

  showPage("wizard");

  const title = getElement("pageTitle");

  if (title) {
    title.textContent = studio.name;
  }

  const questionArea = getElement("questionArea");

  if (questionArea) {

    questionArea.innerHTML = `
      <div class="recommendation">

        <h3>
          ${studio.icon}
          ${escapeHTML(studio.name)}
        </h3>

        <p>
          ${escapeHTML(studio.description)}
        </p>

        <p><strong>Available outputs:</strong></p>

        <p>
          ${studio.outputs
            .map(escapeHTML)
            .join(" • ")}
        </p>

        <button
          class="btn btn-primary"
          id="startStudioWizard"
          type="button"
        >
          Start Auto-Pilot →
        </button>

      </div>
    `;
  }

  getElement("startStudioWizard")?.addEventListener(
    "click",
    () => startWizard(studio.id)
  );

}

/* 5. STUDIO CLICK EVENTS */

document.addEventListener("click", (event) => {

  const button = event.target.closest(
    "[data-studio]"
  );

  if (!button) return;

  const studioId = button.dataset.studio;

  if (!APP_STATE.user) {
    openAuthModal("login");
    showToast("पहले Login करें।");
    return;
  }

  openStudio(studioId);

});

/* 6. INITIAL STUDIO RENDER */

renderStudios();

/* =========================================
   END OF PART 4C
   ========================================= */
/* =========================================
   PART 4D — AUTO-PILOT WIZARD ENGINE
   ========================================= */

/* 1. WIZARD QUESTION BANK */

const CONTENT_TAXONOMY = {
  "Motivation & Success": {
    "Self Confidence": ["आत्मविश्वास कैसे बढ़ाएँ", "खुद पर भरोसा रखने की ताकत"],
    "Discipline & Habits": ["छोटी आदतों से बड़ा बदलाव", "अनुशासन की असली ताकत"],
    "Life Lessons": ["समय की कीमत", "अनुभव से मिलने वाली सीख"]
  },
  "Education & GK": {
    "General Knowledge": ["आज का महत्वपूर्ण सामान्य ज्ञान", "दुनिया के रोचक तथ्य"],
    "Science & Discovery": ["विज्ञान के अनोखे आविष्कार", "अंतरिक्ष के रहस्य"],
    "History & Culture": ["भारत का गौरवशाली इतिहास", "ऐतिहासिक घटनाओं से सीख"],
    "Student Learning": ["पढ़ाई में ध्यान कैसे बढ़ाएँ", "परीक्षा की स्मार्ट तैयारी"]
  },
  "Facts & Knowledge": {
    "Amazing Facts": ["प्रकृति के 5 अद्भुत तथ्य", "मानव शरीर के रोचक तथ्य"],
    "World Facts": ["दुनिया के अनोखे स्थान", "अलग-अलग देशों की अनोखी बातें"],
    "Mystery & Discovery": ["अनसुलझे रहस्यों की पड़ताल", "समुद्र की अनजानी दुनिया"]
  },
  "Entertainment": {
    "Comedy & Fun": ["रोजमर्रा की जिंदगी के मजेदार पल", "एक हल्का-फुल्का कॉमेडी सीन"],
    "Story & Drama": ["एक भावनात्मक छोटी कहानी", "दोस्ती पर आधारित कहानी"],
    "Music & Performance": ["संगीत का भावनात्मक प्रभाव", "एक यादगार परफॉर्मेंस"]
  },
  "Podcast & Conversation": {
    "Interview": ["सफलता की यात्रा पर बातचीत", "अनुभव और सीख का इंटरव्यू"],
    "Two-Person Talk": ["जीवन के अनुभवों पर संवाद", "समाज और बदलती सोच"],
    "Solo Podcast": ["आत्म-विकास पर विचार", "एक उपयोगी विषय पर चर्चा"]
  },
  "Business & Marketing": {
    "Entrepreneurship": ["बिजनेस शुरू करने की बुनियादी बातें", "ग्राहक की जरूरत समझना"],
    "Digital Marketing": ["डेटा-ड्रिवन कंटेंट की ताकत", "सोशल मीडिया रणनीति"],
    "Brand Promotion": ["प्रोडक्ट की खासियत बताने का तरीका", "ब्रांड स्टोरी"]
  },
  "Lifestyle & Vlog": {
    "Daily Vlog": ["एक दिन की खास झलक", "मेरी दिनचर्या के खास पल"],
    "Travel": ["एक खूबसूरत यात्रा", "स्थानीय जगहों की खोज"],
    "Food & Culture": ["स्थानीय खानपान की कहानी", "परंपरा और संस्कृति"]
  },
  "Dance & Music": {
    "Dance Style": ["ऊर्जावान डांस परफॉर्मेंस", "क्लासिकल और मॉडर्न फ्यूजन"],
    "Music Video": ["संगीत के साथ सिनेमैटिक दृश्य", "लय और भाव पर आधारित प्रस्तुति"],
    "Choreography": ["आसान स्टेप्स की कोरियोग्राफी", "ग्रुप डांस कॉन्सेप्ट"]
  },
  "Health & Awareness": {
    "General Wellness": ["स्वस्थ दिनचर्या की आदतें", "नींद और दिनचर्या का महत्व"],
    "Safety Awareness": ["डिजिटल सुरक्षा की जरूरी बातें", "सड़क सुरक्षा जागरूकता"],
    "Public Awareness": ["समाज के लिए उपयोगी संदेश", "जागरूक नागरिक की भूमिका"]
  },
  "School & College": {
    "School Activities": ["रंगोली प्रतियोगिता", "विज्ञान प्रदर्शनी", "खेल दिवस"],
    "Admissions & Events": ["प्रवेश जागरूकता", "अभिभावक-शिक्षक बैठक"],
    "College Learning": ["कौशल विकास", "करियर मार्गदर्शन"]
  }
};

const WIZARD_QUESTIONS = [
  {
    id: "purpose", title: "आपको किस उद्देश्य से Content चाहिए?",
    description: "सबसे पहले अपना लक्ष्य चुनें। इसी के अनुसार सिस्टम आगे की थीम, भाषा, शैली और आउटपुट सुझाएगा।",
    type: "select",
    options: ["Education / सीखना", "Motivation / प्रेरणा", "Entertainment / मनोरंजन", "Business Promotion / प्रचार", "Awareness / जागरूकता", "Personal Branding / अपनी पहचान", "Storytelling / कहानी", "Podcast / बातचीत", "School / College Activity", "Other / अन्य"],
    default: "Education / सीखना"
  },
  {
    id: "mode", title: "Creation Mode चुनें।",
    description: "AUTO में सिस्टम सुझाव देगा; MANUAL में आप हर setting खुद नियंत्रित करेंगे।",
    type: "select", options: ["AUTO", "MANUAL"], default: "AUTO"
  }
,
  {
    id: "output", title: "कौन-सा Format बनाना है?",
    description: "आप Video, Image, Poster, Reel या Podcast में से चुनें।",
    type: "select",
    options: ["Video", "Image", "Poster", "Reel", "Short Film", "Podcast", "Educational Content", "Carousel"],
    default: "Video"
  },
  {
    id: "activity", title: "किस प्रकार की Activity या प्रस्तुति चाहिए?",
    description: "जैसे Explainer, Interview, Competition, Story, Promo या Dance.",
    type: "select",
    options: ["Explainer / समझाने वाला", "Story / कहानी", "Interview / इंटरव्यू", "Two-Person Conversation / दो लोगों की बातचीत", "Competition / प्रतियोगिता", "Event Coverage / कार्यक्रम", "Product Promotion / प्रचार", "Dance Performance / डांस", "Vlog / यात्रा या दिनचर्या", "MCQ / Quiz", "Announcement / सूचना", "Auto Suggest"],
    default: "Auto Suggest"
  },
  {
    id: "platform", title: "किस Platform पर प्रकाशित करेंगे?",
    description: "Platform के अनुसार format और aspect ratio की recommendation मिलेगी।",
    type: "select", options: ["YouTube", "Facebook", "Instagram", "WhatsApp", "Website", "Multi-platform"],
    default: "Multi-platform"
  },
  {
    id: "audience", title: "Target Audience कौन है?",
    description: "किसके लिए content तैयार करना है?",
    type: "select", options: ["India", "USA", "Global Audience", "Students", "Parents", "Teachers", "Customers", "General Audience"],
    default: "India"
  },
  {
    id: "language", title: "Content की भाषा चुनें।",
    description: "Text, narration और captions इसी भाषा में तैयार होंगे।",
    type: "select", options: ["Hindi", "English", "Hindi + English"],
    default: "Hindi + English"
  },
  {
    id: "category", title: "Category खोजें या चुनें।",
    description: "Search box में theme/category लिखें; उसी category की subcategory और topics दिखेंगे।",
    type: "search-select", options: Object.keys(CONTENT_TAXONOMY).concat(["Auto-Detect"]),
    default: "Auto-Detect"
  },
  {
    id: "subcategory", title: "Subcategory चुनें।",
    description: "चुनी हुई Category के अंदर विषय की उप-श्रेणी चुनें।",
    type: "dynamic-select", options: [],
    default: ""
  },
  {
    id: "topic", title: "Specific Topic खोजें या लिखें।",
    description: "MANUAL में अपना exact topic देना जरूरी है। AUTO में सिस्टम नया topic सुझाएगा।",
    type: "topic-search", placeholder: "Specific topic लिखें या search करें...", optional: true
  },
  {
    id: "creativeDirection", title: "अपनी पूरी जरूरत Command Prompt / Text में बताएं।",
    description: "यहाँ script, scene, character, outfit, voice, location, reference image rules, on-screen text, CTA, brand details और कोई भी खास निर्देश लिख सकते हैं।",
    type: "textarea", placeholder: "उदाहरण: 10 सेकंड की 9:16 वीडियो। पहले 2 सेकंड में मजबूत Hook, फिर 5 सेकंड में मुख्य जानकारी और अंतिम 3 सेकंड में CTA। चेहरा reference photo जैसा रहे, कपड़े topic के अनुसार नए हों...", optional: true
  },
  {
    id: "visualStyle", title: "Visual Style और Scene कैसा चाहिए?",
    description: "उदाहरण: realistic, cinematic, documentary, classroom, studio, product showcase या minimal.",
    type: "text", placeholder: "Visual style, location, lighting, camera और scene लिखें...", optional: true
  },
  {
    id: "identityRules", title: "Reference Photo / Character / Brand के नियम?",
    description: "चेहरा, कपड़े, logo, school uniform, product या background में क्या preserve/change करना है?",
    type: "textarea", placeholder: "उदाहरण: चेहरा reference जैसा रहे; कपड़े topic के अनुसार नए हों; logo और uniform न बदलें...", optional: true
  },
  {
    id: "voiceStyle", title: "Voice और Delivery कैसी हो?",
    description: "Voice tone, speaker count, speed, emotion और lip-sync की जरूरत बताएं।",
    type: "text", placeholder: "उदाहरण: natural Hindi male voice, calm delivery, accurate lip-sync...", optional: true
  },
  {
    id: "textRules", title: "Screen Text / Captions के नियम?",
    description: "क्या text दिखाना है, क्या नहीं दिखाना है, spelling और timing की शर्तें बताएं।",
    type: "text", placeholder: "उदाहरण: केवल बोले गए शब्द subtitles में आएं; Hindi spelling सही हो...", optional: true
  },
  {
    id: "brandCTA", title: "Branding और Closing में क्या चाहिए?",
    description: "Logo, watermark, contact, CTA, end card या इन्हें बंद रखना है?",
    type: "text", placeholder: "उदाहरण: logo न लगाएं; अंत में Follow करें CTA रखें...", optional: true
  },
  {
    id: "purposeDetail", title: "वीडियो/पोस्ट से क्या परिणाम चाहते हैं?",
    description: "जैसे जानकारी देना, दर्शक जोड़ना, admission बताना या product समझाना।",
    type: "text", placeholder: "अपना अपेक्षित परिणाम लिखें...", optional: true
  },
  {
    id: "dialogue", title: "Dialogue या Narration कैसा चाहिए?",
    description: "Voice, script और on-screen text के लिए निर्देश दें।",
    type: "select", options: ["Voice-over", "On-camera speaking", "Two-person dialogue", "No voice / Text only", "Auto Suggest"],
    default: "Auto Suggest"
  },
  {
    id: "duration", title: "Duration चुनें।",
    description: "कुल अवधि चुनें। Image/Poster में यह चरण लागू नहीं होगा।",
    type: "select", options: ["10 Seconds", "15 Seconds", "30 Seconds", "60 Seconds", "2 Minutes", "5 Minutes", "10 Minutes"],
    default: "10 Seconds",
    condition: { output: ["Video", "Reel", "Short Film", "Podcast", "Educational Content"] }
  },
  {
    id: "aspectRatio", title: "Aspect Ratio चुनें।",
    description: "Platform के हिसाब से सुझाया गया ratio बदल सकते हैं।",
    type: "select", options: ["9:16", "16:9", "1:1", "3:4"],
    default: "9:16"
  },
];

/* 2. FILTER ACTIVE QUESTIONS */

function getActiveQuestions() {
  const answers = APP_STATE.wizard.answers || {};
  return WIZARD_QUESTIONS.filter(question => {
    if (question.condition) {
      const requiredValues = question.condition.output || [];
      if (!requiredValues.includes(answers.output)) return false;
    }
    return true;
  });
}

function getSubcategoryOptions(category) {
  const selected = CONTENT_TAXONOMY[category] || {};
  return Object.keys(selected);
}

function getTopicOptions(category, subcategory) {
  const base = (CONTENT_TAXONOMY[category] || {})[subcategory] || [];
  const audience = APP_STATE.wizard.answers?.audience || "India";
  const region = audience === "USA" ? "USA" : "India";
  const domainMap = {
    "Motivation & Success": "Motivation & Personal Growth",
    "Education & GK": "Education & Learning",
    "Facts & Knowledge": "General Knowledge",
    "Entertainment": "Entertainment & Creativity",
    "Podcast & Conversation": "Podcast & Conversation",
    "Business & Marketing": "Business & Entrepreneurship",
    "Lifestyle & Vlog": "Travel & Geography",
    "Dance & Music": "Music & Dance",
    "Health & Awareness": "Health & Wellness Education",
    "School & College": "Education & Learning"
  };
  const regional = getRegionalTopicIdeas(region, domainMap[category] || "Education & Learning", 1000);
  return [...new Set([...base, ...regional])];
}

function recommendWizardDefaults(answers) {
  const result = { ...answers };
  if (!result.category || result.category === "Auto-Detect") {
    const purpose = String(result.purpose || "");
    if (/school|college|education|learn|पढ़/i.test(purpose)) result.category = "School & College";
    else if (/motivation|प्रेरणा/i.test(purpose)) result.category = "Motivation & Success";
    else if (/business|promotion|brand|personal branding|प्रचार|पहचान/i.test(purpose)) result.category = "Business & Marketing";
    else if (/podcast|बातचीत/i.test(purpose)) result.category = "Podcast & Conversation";
    else if (/entertainment|story|storytelling|मनोरंजन|कहानी/i.test(purpose)) result.category = "Entertainment";
    else if (/awareness|जागरूकता/i.test(purpose)) result.category = "Health & Awareness";
    else result.category = "Education & GK";
  }
  const subs = getSubcategoryOptions(result.category);
  if (!result.subcategory || !subs.includes(result.subcategory)) result.subcategory = subs[0] || "";
  const topics = getTopicOptions(result.category, result.subcategory);
  if (!result.topic && topics.length) {
    const key = `ups_topic_history_${result.category}_${result.subcategory}`;
    let used = [];
    try { used = JSON.parse(localStorage.getItem(key) || "[]"); } catch {}
    const fresh = topics.filter(t => !used.includes(t));
    const pick = (fresh.length ? fresh : topics)[Math.floor(Math.random() * (fresh.length || topics.length))];
    result.topic = pick;
    used = [...used, pick].slice(-topics.length);
    try { localStorage.setItem(key, JSON.stringify(used)); } catch {}
  }
  if (!result.aspectRatio) result.aspectRatio = recommendAspectRatio(result.platform || "Multi-platform");
  if (!result.duration && ["Video","Reel","Short Film","Podcast","Educational Content"].includes(result.output)) result.duration = "10 Seconds";
  if (!result.dialogue || result.dialogue === "Auto Suggest") result.dialogue = result.output === "Podcast" ? "Two-person dialogue" : "Voice-over";
  return result;
}

/* 3. START WIZARD */

function startWizard(studioId) {

  const studio = STUDIO_DATA.find(
    item => item.id === studioId
  );

  if (!studio) return;

  APP_STATE.currentStudio = studio;

  APP_STATE.wizard.answers.studio = studio.id;
  APP_STATE.wizard.step = 0;
  APP_STATE.wizard.completed = false;

  renderWizardQuestion();

}

/* 4. SET WIZARD MODE */

function setWizardMode(mode) {

  APP_STATE.wizard.mode =
    mode === "MANUAL" ? "MANUAL" : "AUTO";

  APP_STATE.wizard.answers.mode =
    APP_STATE.wizard.mode;
  if (APP_STATE.wizard.mode === "AUTO") {
    APP_STATE.wizard.answers = recommendWizardDefaults(APP_STATE.wizard.answers);
  }
  renderWizardQuestion();

}

/* 5. SAVE CURRENT ANSWER */

function saveWizardAnswer() {
  const questions = getActiveQuestions();
  const question = questions[APP_STATE.wizard.step];
  if (!question) return true;
  const input = getElement("wizardAnswer");
  if (!input) return true;
  const value = input.value.trim();

  if (APP_STATE.wizard.mode === "MANUAL" && !value &&
      (question.id === "topic" || !question.optional)) {
    showToast(question.id === "topic"
      ? "MANUAL mode में Specific Topic देना जरूरी है।"
      : "MANUAL mode में कृपया यह जानकारी भरें।", "error");
    input.focus();
    return false;
  }

  if (value) {
    APP_STATE.wizard.answers[question.id] = value;
  } else if (APP_STATE.wizard.mode === "AUTO" && question.default) {
    APP_STATE.wizard.answers[question.id] = question.default;
  } else if (question.id === "topic" && APP_STATE.wizard.mode === "AUTO") {
    APP_STATE.wizard.answers.topic = "";
  }

  if (question.id === "category") {
    if (APP_STATE.wizard.answers.category === "Auto-Detect") {
      APP_STATE.wizard.answers = recommendWizardDefaults(APP_STATE.wizard.answers);
    }
    const subs = getSubcategoryOptions(APP_STATE.wizard.answers.category);
    if (!subs.includes(APP_STATE.wizard.answers.subcategory)) {
      APP_STATE.wizard.answers.subcategory = subs[0] || "";
    }
    APP_STATE.wizard.answers.topic = "";
  }
  if (question.id === "subcategory") APP_STATE.wizard.answers.topic = "";
  if (question.id === "mode") {
    APP_STATE.wizard.mode = APP_STATE.wizard.answers.mode || "AUTO";
  }
  return true;
}

/* 6. RENDER QUESTION */

function renderWizardQuestion() {

  const area = getElement("questionArea");

  if (!area) return;

  const questions = getActiveQuestions();

  const step = APP_STATE.wizard.step;

  const question = questions[step];

  if (!question) {
    finishWizard();
    return;
  }

  const savedValue =
    APP_STATE.wizard.answers[question.id] ||
    (APP_STATE.wizard.mode === "AUTO" ? (question.default || "") : "");

  let inputHTML = "";

  if (question.type === "search-select") {
    const options = question.options || [];
    inputHTML = `<input id="wizardAnswer" type="search" list="wizardAnswerOptions" autocomplete="off" placeholder="Category search करें..." value="${escapeHTML(savedValue)}"><datalist id="wizardAnswerOptions">${options.map(option => `<option value="${escapeHTML(option)}"></option>`).join("")}</datalist>`;
  } else if (question.type === "topic-search") {
    const topics = getTopicOptions(APP_STATE.wizard.answers.category, APP_STATE.wizard.answers.subcategory);
    inputHTML = `<input id="wizardAnswer" type="search" list="wizardTopicOptions" autocomplete="off" maxlength="200" placeholder="${escapeHTML(question.placeholder || "")}" value="${escapeHTML(savedValue)}"><datalist id="wizardTopicOptions">${topics.map(topic => `<option value="${escapeHTML(topic)}"></option>`).join("")}</datalist>`;
  } else if (question.type === "textarea") {
    inputHTML = `<textarea id="wizardAnswer" rows="7" maxlength="6000" placeholder="${escapeHTML(question.placeholder || "")}">${escapeHTML(savedValue)}</textarea><small class="field-hint">अधिकतम 6,000 characters. जितनी स्पष्ट जानकारी देंगे, उतना बेहतर brief बनेगा।</small>`;
  } else if (question.type === "dynamic-select") {
    const options = getSubcategoryOptions(APP_STATE.wizard.answers.category);
    inputHTML = `<select id="wizardAnswer"><option value="">Select subcategory</option>${options.map(option => `<option value="${escapeHTML(option)}" ${savedValue === option ? "selected" : ""}>${escapeHTML(option)}</option>`).join("")}</select>`;
  } else if (question.type === "select") {

    let availableOptions = question.options || [];
    if (question.id === "category" && APP_STATE.wizard.mode === "AUTO") availableOptions = [...availableOptions];
    inputHTML = `
      <select id="wizardAnswer">

        <option value="">
          Select an option
        </option>

        ${question.options.map(option => `
          <option
            value="${escapeHTML(option)}"
            ${savedValue === option ? "selected" : ""}
          >
            ${escapeHTML(option)}
          </option>
        `).join("")}

      </select>
    `;

  } else {

    inputHTML = `
      <input
        id="wizardAnswer"
        type="text"
        maxlength="200"
        placeholder="${escapeHTML(question.placeholder || "")}"
        value="${escapeHTML(savedValue)}"
      >
    `;

  }

  area.innerHTML = `

    <div class="wizard-question">

      <div class="question-count">
        Question ${step + 1} of ${questions.length}
      </div>

      <h2>${escapeHTML(question.title)}</h2>

      <p>${escapeHTML(question.description)}</p>

      <div class="wizard-input">
        ${inputHTML}
      </div>

      <div class="wizard-mode-control">

        <button
          type="button"
          class="btn btn-secondary"
          data-wizard-mode="AUTO"
        >
          AUTO ${APP_STATE.wizard.mode === "AUTO" ? "✓" : ""}
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          data-wizard-mode="MANUAL"
        >
          MANUAL ${APP_STATE.wizard.mode === "MANUAL" ? "✓" : ""}
        </button>

      </div>

      <p class="wizard-mode-label">
        Current Mode: ${APP_STATE.wizard.mode} — ${APP_STATE.wizard.mode === "AUTO" ? "सिस्टम smart suggestions और defaults चुनेगा।" : "आपके जवाब जरूरी होंगे और नियंत्रण आपके पास रहेगा।"}
      </p>

    </div>

  `;

  const stepLabel = getElement("wizardStep");

  if (stepLabel) {
    stepLabel.textContent =
      `${step + 1} / ${questions.length}`;
  }

  const progress = getElement("wizardProgress");

  if (progress) {
    progress.style.width =
      `${((step + 1) / questions.length) * 100}%`;
  }

  const backButton = getElement("wizardBack");

  if (backButton) {
    backButton.disabled = step === 0;
  }

}

/* 7. MODE BUTTON EVENTS */

document.addEventListener("click", event => {

  const button = event.target.closest(
    "[data-wizard-mode]"
  );

  if (!button) return;

  setWizardMode(button.dataset.wizardMode);

});

/* 8. NEXT QUESTION */

getElement("wizardNext")?.addEventListener(
  "click",
  () => {

    if (!saveWizardAnswer()) return;

    APP_STATE.wizard.step++;

    renderWizardQuestion();

  }
);

/* 9. PREVIOUS QUESTION */

getElement("wizardBack")?.addEventListener(
  "click",
  () => {

    saveWizardAnswer();

    if (APP_STATE.wizard.step > 0) {

      APP_STATE.wizard.step--;

      renderWizardQuestion();

    }

  }
);

/* 10. SKIP OPTIONAL QUESTION */

getElement("wizardSkip")?.addEventListener(
  "click",
  () => {

    const questions = getActiveQuestions();

    const question =
      questions[APP_STATE.wizard.step];

    if (question?.optional) {

      APP_STATE.wizard.step++;

      renderWizardQuestion();

    } else {

      showToast(
        "यह सवाल जरूरी है। इसे Skip नहीं कर सकते।"
      );

    }

  }
);

/* =========================================
   END OF PART 4D
   ========================================= */
/* =========================================
   PART 4E — CREATIVE BRIEF ENGINE
   ========================================= */

/* 1. AUTO TOPIC SUGGESTIONS */

const TOPIC_SUGGESTIONS = {
  Motivational: [
    "छोटी शुरुआत, बड़ी सफलता",
    "समय की कीमत समझिए",
    "आत्मविश्वास की ताकत"
  ],

  Educational: [
    "आज का महत्वपूर्ण सामान्य ज्ञान",
    "विज्ञान के रोचक तथ्य",
    "भारत का इतिहास"
  ],

  Entertainment: [
    "रोजमर्रा की जिंदगी के मजेदार पल",
    "एक दिलचस्प कहानी",
    "मनोरंजन की दुनिया"
  ],

  Facts: [
    "दुनिया के 5 रोचक तथ्य",
    "अंतरिक्ष के अनोखे रहस्य",
    "प्रकृति के अद्भुत तथ्य"
  ],

  Podcast: [
    "सफलता और संघर्ष पर बातचीत",
    "जीवन के अनुभव",
    "समाज और बदलती सोच"
  ],

  Music: [
    "संगीत की यादगार धुनें",
    "संगीत का भावनात्मक प्रभाव"
  ],

  Dance: [
    "ऊर्जावान डांस परफॉर्मेंस",
    "क्लासिकल और मॉडर्न डांस"
  ],

  Vlog: [
    "एक दिन की खास यात्रा",
    "मेरी दिनचर्या के खास पल"
  ],

  Business: [
    "बिजनेस शुरू करने की बुनियादी बातें",
    "ग्राहकों से बेहतर संवाद"
  ],

  "Auto-Detect": [
    "आज का नया और उपयोगी विषय",
    "एक रोचक जानकारी जो हर किसी को जाननी चाहिए",
    "सीखने योग्य एक महत्वपूर्ण बात"
  ]
};

/* 2. SELECT AUTO TOPIC */

function getAutoTopic(category) {
  const subcategories = CONTENT_TAXONOMY[category] || {};
  const audience = APP_STATE.wizard.answers?.audience || "India";
  const region = audience === "USA" ? "USA" : "India";
  const domainMap = {
    "Motivation & Success": "Motivation & Personal Growth",
    "Education & GK": "Education & Learning",
    "Facts & Knowledge": "General Knowledge",
    "Entertainment": "Entertainment & Creativity",
    "Podcast & Conversation": "Podcast & Conversation",
    "Business & Marketing": "Business & Entrepreneurship",
    "Lifestyle & Vlog": "Travel & Geography",
    "Dance & Music": "Music & Dance",
    "Health & Awareness": "Health & Wellness Education",
    "School & College": "Education & Learning"
  };
  const regionalTopics = getRegionalTopicIdeas(region, domainMap[category] || "Education & Learning", 1000);
  const allTopics = [...new Set([...Object.values(subcategories).flat(), ...regionalTopics])];
  if (allTopics.length) {
    const historyKey = `ups_topic_history_${region}_${category}`;
    let used = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(historyKey) || "[]");
      if (Array.isArray(parsed)) used = parsed.filter(x => typeof x === "string");
    } catch {}
    const fresh = allTopics.filter(topic => !used.includes(topic));
    const pool = fresh.length ? fresh : allTopics;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    try { localStorage.setItem(historyKey, JSON.stringify([...used, selected].slice(-allTopics.length))); } catch {}
    return selected;
  }
  const topics = TOPIC_SUGGESTIONS[category] || TOPIC_SUGGESTIONS["Auto-Detect"];
  return topics[Math.floor(Math.random() * topics.length)];
}

/* 3. RECOMMEND ASPECT RATIO */

function recommendAspectRatio(platform) {

  const recommendations = {
    "YouTube": "16:9",
    "Facebook": "9:16",
    "Instagram": "9:16",
    "Multi-platform": "9:16"
  };

  return recommendations[platform] || "9:16";

}

/* 4. BUILD CREATIVE BRIEF */

function buildCreativeBrief() {

  const answers = APP_STATE.wizard.answers;

  const category =
    answers.category || "Auto-Detect";

  let topic = answers.topic;

  if (!topic) {
    topic = getAutoTopic(category);
    answers.topic = topic;
  }

  const platform =
    answers.platform || "Multi-platform";

  const output =
    answers.output || "Video";

  const ratio =
    answers.aspectRatio ||
    recommendAspectRatio(platform);

  const studio =
    APP_STATE.currentStudio?.name || "Creative Studio";

  return {

    studio,
    purpose: answers.purpose || "General Content",
    activity: answers.activity || "Auto Suggest",
    platform,
    output,
    audience: answers.audience || "India",
    language: answers.language || "Hindi + English",
    category,
    subcategory: answers.subcategory || "",
    topic,
    creativeDirection: answers.creativeDirection || "",
    visualStyle: answers.visualStyle || "",
    identityRules: answers.identityRules || "",
    voiceStyle: answers.voiceStyle || "",
    textRules: answers.textRules || "",
    brandCTA: answers.brandCTA || "",
    purposeDetail: answers.purposeDetail || "",
    dialogue: answers.dialogue || "Voice-over",
    duration: answers.duration || "Not applicable",
    aspectRatio: ratio,
    mode: answers.mode || APP_STATE.wizard.mode,
    createdAt: new Date().toISOString()

  };

}

/* 5. RENDER CREATIVE BRIEF */

function renderCreativeBrief(brief) {

  const area = getElement("questionArea");

  if (!area) return;

  const lockResults = runCompleteLockAudit(brief);
  const lockPassed = lockResults.filter(item => item.passed).length;
  const lockFailed = lockResults.length - lockPassed;
  const rows = [
    ["Studio", brief.studio],
    ["Purpose", brief.purpose],
    ["Activity", brief.activity],
    ["Platform", brief.platform],
    ["Output", brief.output],
    ["Audience", brief.audience],
    ["Language", brief.language],
    ["Category", brief.category],
    ["Subcategory", brief.subcategory],
    ["Topic", brief.topic],
    ["Creative Direction", brief.creativeDirection || "Not specified"],
    ["Visual Style", brief.visualStyle || "Auto"],
    ["Identity / Reference Rules", brief.identityRules || "Auto"],
    ["Voice Style", brief.voiceStyle || "Auto"],
    ["Screen Text Rules", brief.textRules || "Auto"],
    ["Branding / CTA", brief.brandCTA || "Auto"],
    ["Purpose Detail", brief.purposeDetail],
    ["Dialogue / Narration", brief.dialogue],
    ["Duration", brief.duration],
    ["Aspect Ratio", brief.aspectRatio],
    ["Creation Mode", brief.mode]
  ];

  area.innerHTML = `

    <div class="recommendation">

      <h2>✨ Your Creative Brief</h2>

      <p>
        आपकी चुनी हुई जानकारी के आधार पर
        Production Brief तैयार है।
      </p>

      <div class="brief-details">

        ${rows.map(([label, value]) => `
          <div class="brief-row">
            <strong>${escapeHTML(label)}</strong>
            <span>${escapeHTML(value)}</span>
          </div>
        `).join("")}

      </div>

      <div class="ups-quality-audit panel">
        <h3>Core Module & Workflow Lock Review</h3>
        <p><strong>${CORE_MODULES.length}</strong> Core Modules · <strong>${WORKFLOW_LOCKS.length}</strong> Workflow Locks · <strong>${UPS_PRODUCTION_ENGINES.length}</strong> Production Engines · <strong>${UPS_WORKFLOW_STAGES.length}</strong> Workflow Stages</p>
        <p class="${lockFailed ? "audit-warning" : "audit-pass"}">${lockPassed}/${lockResults.length} Locks Passed · ${lockFailed} Need Review</p>
        <details><summary>View all Workflow Lock checks</summary><div class="ups-lock-audit-list">${lockResults.map(item => `<div class="ups-lock-audit-row"><span>${String(item.id).padStart(2,"0")} · ${escapeHTML(item.name)}</span><b class="${item.passed ? "audit-pass" : "audit-warning"}">${item.status}</b></div>`).join("")}</div></details>
        ${lockFailed ? `<p class="audit-warning">कुछ checks अभी पूरे नहीं हुए हैं। Brief edit करके जरूरी जानकारी जोड़ें।</p>` : `<p>All defined lock checks passed for this brief. यह internal rule check है, external rendering QA नहीं।</p>`}
      </div>

      <div class="wizard-controls">

        <button
          class="btn btn-secondary"
          id="editBrief"
          type="button"
        >
          ← Edit Answers
        </button>

        <button
          class="btn btn-primary"
          id="copyBrief"
          type="button"
        >
          Copy Brief
        </button>

        <button
          class="btn btn-secondary"
          id="downloadBrief"
          type="button"
        >
          Download TXT
        </button>

      </div>

    </div>

  `;

  getElement("editBrief")?.addEventListener(
    "click",
    () => {
      APP_STATE.wizard.step = 0;
      APP_STATE.wizard.completed = false;
      renderWizardQuestion();
    }
  );

  getElement("copyBrief")?.addEventListener(
    "click",
    async () => {

      try {

        await navigator.clipboard.writeText(
          formatBriefText(brief)
        );

        showToast("Creative Brief copied!", "success");

      } catch {

        showToast(
          "Copy सुविधा उपलब्ध नहीं है।",
          "error"
        );

      }

    }
  );

  getElement("downloadBrief")?.addEventListener(
    "click",
    () => downloadBriefText(brief)
  );

}

/* 6. FORMAT BRIEF TEXT */

function formatBriefText(brief) {

  return [
    "UPS CREATOR STUDIO",
    "CREATIVE PRODUCTION BRIEF",
    "",
    `Studio: ${brief.studio}`,
    `Purpose: ${brief.purpose || ""}`,
    `Activity: ${brief.activity || ""}`,
    `Platform: ${brief.platform}`,
    `Output: ${brief.output}`,
    `Audience: ${brief.audience}`,
    `Language: ${brief.language}`,
    `Category: ${brief.category}`,
    `Subcategory: ${brief.subcategory || ""}`,
    `Topic: ${brief.topic}`,
    `Creative Direction: ${brief.creativeDirection || ""}`,
    `Visual Style: ${brief.visualStyle || ""}`,
    `Identity Rules: ${brief.identityRules || ""}`,
    `Voice Style: ${brief.voiceStyle || ""}`,
    `Text Rules: ${brief.textRules || ""}`,
    `Brand / CTA: ${brief.brandCTA || ""}`,
    `Purpose Detail: ${brief.purposeDetail || ""}`,
    `Dialogue: ${brief.dialogue || ""}`,
    `Duration: ${brief.duration}`,
    `Aspect Ratio: ${brief.aspectRatio}`,
    `Mode: ${brief.mode}`,
    "",
    "Imagine. Create. Innovate."
  ].join("\n");

}

/* 7. DOWNLOAD BRIEF */

function downloadBriefText(brief) {

  const blob = new Blob(
    [formatBriefText(brief)],
    { type: "text/plain;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "UPS-Creative-Brief.txt";

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Brief downloaded!", "success");

}

/* 8. FINISH WIZARD */

function finishWizard() {

  if (APP_STATE.wizard.completed) return;

  APP_STATE.wizard.completed = true;

  if (APP_STATE.wizard.mode === "AUTO") {
    APP_STATE.wizard.answers = recommendWizardDefaults(APP_STATE.wizard.answers);
  }
  const brief = buildCreativeBrief();

  APP_STATE.wizard.brief = brief;

  renderCreativeBrief(brief);

}

/* =========================================
   END OF PART 4E
   ========================================= */
/* =========================================
   PART 4F — PROJECT MANAGEMENT SYSTEM
   ========================================= */

/* 1. PROJECT STORAGE KEY */

const PROJECT_STORAGE_KEY = "ups_creator_projects_v1";

/* 2. LOAD LOCAL PROJECTS */

function loadLocalProjects() {

  try {

    const saved = localStorage.getItem(
      PROJECT_STORAGE_KEY
    );

    APP_STATE.projects = saved
      ? JSON.parse(saved)
      : [];

    if (!Array.isArray(APP_STATE.projects)) {
      APP_STATE.projects = [];
    }

  } catch (error) {

    console.error("Project loading error:", error);

    APP_STATE.projects = [];

  }

  return APP_STATE.projects;
}

/* 3. SAVE PROJECTS TO LOCAL STORAGE */

function persistLocalProjects() {

  try {

    localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify(APP_STATE.projects)
    );

    return true;

  } catch (error) {

    console.error("Project saving error:", error);

    showToast(
      "Project save नहीं हो पाया। Browser storage check करें।",
      "error"
    );

    return false;

  }

}

/* 4. CREATE PROJECT FROM BRIEF */

function createProjectFromBrief(brief) {

  const project = {

    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `project_${Date.now()}`,

    title: brief.topic || "Untitled Project",

    studio: brief.studio,

    output: brief.output,

    platform: brief.platform,

    category: brief.category,

    brief: brief,

    status: "Draft",

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString()

  };

  return project;

}

/* 5. SAVE CURRENT PROJECT */

function saveCurrentProject() {

  const brief = APP_STATE.wizard.brief;

  if (!brief) {

    showToast(
      "पहले Creative Brief तैयार करें।",
      "error"
    );

    return;

  }

  const project = createProjectFromBrief(brief);

  APP_STATE.projects.unshift(project);

  if (!persistLocalProjects()) {

    APP_STATE.projects.shift();

    return;

  }

  showToast(
    "Project successfully saved!",
    "success"
  );

  renderDashboardProjects();

}

/* 6. ADD SAVE BUTTON TO CREATIVE BRIEF */

const originalRenderCreativeBrief =
  renderCreativeBrief;

renderCreativeBrief = function(brief) {

  originalRenderCreativeBrief(brief);

  const container = $(
    "#questionArea .recommendation"
  );

  if (!container) return;

  const saveButton = document.createElement("button");

  saveButton.type = "button";
  saveButton.id = "saveCurrentProject";
  saveButton.className = "btn btn-primary";
  saveButton.textContent = "💾 Save Project";

  container.appendChild(saveButton);

  saveButton.addEventListener(
    "click",
    saveCurrentProject
  );

};

/* 7. DELETE PROJECT */

function deleteProject(projectId) {

  const previousProjects = [...APP_STATE.projects];

  APP_STATE.projects =
    APP_STATE.projects.filter(
      project => project.id !== projectId
    );

  if (!persistLocalProjects()) {

    APP_STATE.projects = previousProjects;

    return;

  }

  showToast("Project deleted.", "success");

  renderDashboardProjects();

}

/* 8. RENDER PROJECT CARD */

function createProjectCard(project) {

  return `

    <article class="project-card panel">

      <div class="project-card-header">

        <span class="tag">
          ${escapeHTML(project.studio)}
        </span>

        <span class="tag">
          ${escapeHTML(project.status)}
        </span>

      </div>

      <h3>
        ${escapeHTML(project.title)}
      </h3>

      <p>
        ${escapeHTML(project.output)}
        ·
        ${escapeHTML(project.platform)}
      </p>

      <small>
        Created: ${formatDate(project.createdAt)}
      </small>

      <div class="project-actions">

        <button
          type="button"
          class="btn btn-secondary"
          data-view-project="${escapeHTML(project.id)}"
        >
          View Brief
        </button>

        <button
          type="button"
          class="btn btn-secondary"
          data-delete-project="${escapeHTML(project.id)}"
        >
          Delete
        </button>

      </div>

    </article>

  `;

}

/* 9. RENDER PROJECT LIST */

function renderDashboardProjects() {

  const recentContainer =
    getElement("recentProjects");

  const projectContainer =
    getElement("allProjects");

  const projects = APP_STATE.projects;

  if (recentContainer) {

    recentContainer.innerHTML = projects.length
      ? projects.slice(0, 5)
          .map(createProjectCard)
          .join("")
      : "<p>No projects saved yet.</p>";

  }

  if (projectContainer) {

    projectContainer.innerHTML = projects.length
      ? projects.map(createProjectCard).join("")
      : "<p>No projects saved yet.</p>";

  }

  const count = getElement("projectCount");

  if (count) {
    count.textContent = projects.length;
  }

}

/* 10. PROJECT ACTION EVENTS */

document.addEventListener("click", event => {

  const deleteButton = event.target.closest(
    "[data-delete-project]"
  );

  if (deleteButton) {

    const projectId =
      deleteButton.dataset.deleteProject;

    deleteProject(projectId);

    return;

  }

  const viewButton = event.target.closest(
    "[data-view-project]"
  );

  if (viewButton) {

    const project = APP_STATE.projects.find(
      item => item.id === viewButton.dataset.viewProject
    );

    if (!project) return;

    showPage("wizard");

    const area = getElement("questionArea");

    if (area) {
      renderCreativeBrief(project.brief);
    }

  }

});

/* 11. INITIAL PROJECT LOAD */

loadLocalProjects();

renderDashboardProjects();

/* =========================================
   END OF PART 4F
   ========================================= */
/* =========================================
   PART 4G — PROFILE & BRANDING SYSTEM
   ========================================= */

/* 1. PROFILE BRANDING STORAGE */

function getBrandingStorageKey() {

  const userId = APP_STATE.user?.id;

  return userId
    ? `ups_branding_${userId}`
    : "ups_branding_guest";

}

/* 2. LOAD BRANDING DATA */

function loadBrandingData() {

  try {

    const saved = localStorage.getItem(
      getBrandingStorageKey()
    );

    return saved ? JSON.parse(saved) : {
      brand: "",
      tagline: ""
    };

  } catch (error) {

    console.error("Branding load error:", error);

    return {
      brand: "",
      tagline: ""
    };

  }

}

/* 3. SAVE BRANDING DATA */

function saveBrandingData(data) {

  try {

    localStorage.setItem(
      getBrandingStorageKey(),
      JSON.stringify(data)
    );

    return true;

  } catch (error) {

    console.error("Branding save error:", error);

    return false;

  }

}

/* 4. LOAD PROFILE INTO FORM */

function renderProfileForm() {

  const profile = APP_STATE.profile || {};
  const branding = loadBrandingData();

  const nameInput = getElement("profileName");
  const brandInput = getElement("profileBrand");
  const taglineInput = getElement("profileTagline");

  if (nameInput) {
    nameInput.value = profile.full_name || "";
  }

  if (brandInput) {
    brandInput.value = branding.brand || "";
  }

  if (taglineInput) {
    taglineInput.value = branding.tagline || "";
  }

  // Restore the signed-in user's private Storage photo after profile load.
  if (profile.photo_path && typeof loadSavedProfilePhoto === "function") {
    loadSavedProfilePhoto();
  } else {
    const photoPreview = getElement("profilePhotoPreview");
    if (photoPreview) {
      photoPreview.style.backgroundImage = "";
      if (photoPreview.tagName === "IMG") photoPreview.removeAttribute("src");
    }
  }

}

/* 5. PROFILE MESSAGE */

function showProfileMessage(message, type = "info") {

  const box = getElement("profileMessage");

  if (!box) return;

  box.textContent = message;
  box.dataset.type = type;

}

/* 6. SAVE PROFILE */

getElement("profileForm")?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (!APP_STATE.user || !supabase) {

      showProfileMessage(
        "Profile update करने के लिए Login करें।",
        "error"
      );

      return;

    }

    const fullName =
      getElement("profileName")?.value.trim() || "";

    const brand =
      getElement("profileBrand")?.value.trim() || "";

    const tagline =
      getElement("profileTagline")?.value.trim() || "";

    if (!fullName) {

      showProfileMessage(
        "कृपया अपना नाम भरें।",
        "error"
      );

      return;

    }

    try {

      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: APP_STATE.user.id,
            full_name: fullName
          },
          {
            onConflict: "user_id"
          }
        )
        .select()
        .single();

      if (error) throw error;

      const brandingSaved = saveBrandingData({
        brand,
        tagline
      });

      if (!brandingSaved) {
        throw new Error(
          "Branding browser storage में सेव नहीं हो पाई।"
        );
      }

      APP_STATE.profile = data;

      updateAuthUI(
        APP_STATE.user,
        APP_STATE.profile
      );

      showProfileMessage(
        "Profile successfully updated!",
        "success"
      );

      showToast(
        "Profile saved successfully!",
        "success"
      );

    } catch (error) {

      console.error("Profile update error:", error);

      showProfileMessage(
        error.message || "Profile update failed.",
        "error"
      );

    }

  }
);

/* 7. PROFILE PHOTO LOCAL PREVIEW */

getElement("photoInput")?.addEventListener(
  "change",
  (event) => {

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      showToast(
        "कृपया image file चुनें।",
        "error"
      );

      event.target.value = "";

      return;

    }

    if (
      file.size >
      APP_CONFIG.MAX_PROFILE_IMAGE_SIZE
    ) {

      showToast(
        "Image का size 5 MB से कम होना चाहिए।",
        "error"
      );

      event.target.value = "";

      return;

    }

    const preview =
      getElement("profilePhotoPreview");

    if (!preview) return;

    const oldUrl = preview.dataset.previewUrl;

    if (oldUrl) {
      URL.revokeObjectURL(oldUrl);
    }

    const imageUrl = URL.createObjectURL(file);

    preview.dataset.previewUrl = imageUrl;

    if (preview.tagName === "IMG") {

      preview.src = imageUrl;

    } else {

      preview.style.backgroundImage =
        `url("${imageUrl}")`;

    }

    showToast(
      "Photo preview तैयार है। Cloud upload अभी सक्रिय नहीं है।"
    );

  }
);

/* 8. INITIAL PROFILE FORM */

renderProfileForm();
/* =========================================
   PART 4H — DASHBOARD SYSTEM
   ========================================= */

/* 1. DASHBOARD GREETING */

function getDashboardGreeting() {

  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";

  if (hour < 17) return "Good Afternoon";

  return "Good Evening";

}

/* 2. UPDATE DASHBOARD WELCOME */

function updateDashboardWelcome() {

  const greeting = getDashboardGreeting();

  const userName =
    APP_STATE.profile?.full_name ||
    APP_STATE.user?.user_metadata?.full_name ||
    APP_STATE.user?.email?.split("@")[0] ||
    "Creator";

  const welcomeName = getElement("welcomeName");

  if (welcomeName) {
    welcomeName.textContent =
      `${greeting}, ${userName}!`;
  }

}

/* 3. DASHBOARD STATISTICS */

function renderDashboardStats() {

  const projects = APP_STATE.projects || [];

  const totalProjects = projects.length;

  const draftProjects = projects.filter(
    project => project.status === "Draft"
  ).length;

  const completedProjects = projects.filter(
    project => project.status === "Completed"
  ).length;

  const statsContainer = $(
    "#page-dashboard .dashboard-stats"
  );

  if (statsContainer) {

    statsContainer.innerHTML = `

      <div class="metric-card panel">

        <span class="metric-label">
          Total Projects
        </span>

        <strong class="metric-value">
          ${totalProjects}
        </strong>

        <span class="metric-note">
          Your saved projects
        </span>

      </div>

      <div class="metric-card panel">

        <span class="metric-label">
          Draft Projects
        </span>

        <strong class="metric-value">
          ${draftProjects}
        </strong>

        <span class="metric-note">
          Projects in progress
        </span>

      </div>

      <div class="metric-card panel">

        <span class="metric-label">
          Completed Projects
        </span>

        <strong class="metric-value">
          ${completedProjects}
        </strong>

        <span class="metric-note">
          Finished projects
        </span>

      </div>

      <div class="metric-card panel">

        <span class="metric-label">
          Available Studios
        </span>

        <strong class="metric-value">
          ${STUDIO_DATA.length}
        </strong>

        <span class="metric-note">
          Creative production studios
        </span>

      </div>

    `;

  }

  const projectCount = getElement("projectCount");

  if (projectCount) {
    projectCount.textContent = totalProjects;
  }

}

/* 4. DASHBOARD STUDIO CARDS */

function renderDashboardStudios() {

  const container =
    getElement("dashboardStudios");

  if (!container) return;

  container.innerHTML = STUDIO_DATA.map(studio => `

    <button
      type="button"
      class="dashboard-studio-card panel"
      data-dashboard-studio="${escapeHTML(studio.id)}"
    >

      <span class="studio-icon">
        ${studio.icon}
      </span>

      <strong>
        ${escapeHTML(studio.name)}
      </strong>

      <small>
        ${escapeHTML(studio.description)}
      </small>

      <span class="studio-card-action">
        Open Studio →
      </span>

    </button>

  `).join("");

}

/* 5. DASHBOARD STUDIO EVENTS */

document.addEventListener("click", event => {

  const button = event.target.closest(
    "[data-dashboard-studio]"
  );

  if (!button) return;

  const studioId =
    button.dataset.dashboardStudio;

  if (!APP_STATE.user) {
    openAuthModal("login");
    return;
  }

  openStudio(studioId);

});

/* 6. RECENT PROJECTS */

function renderRecentProjects() {

  const container =
    getElement("recentProjects");

  if (!container) return;

  const recentProjects =
    APP_STATE.projects.slice(0, 5);

  if (!recentProjects.length) {

    container.innerHTML = `
      <div class="empty-state">

        <h3>No Projects Yet</h3>

        <p>
          अपना पहला Creative Project शुरू करें।
        </p>

        <button
          type="button"
          class="btn btn-primary"
          data-dashboard-action="create"
        >
          Create Your First Project
        </button>

      </div>
    `;

    return;

  }

  container.innerHTML = recentProjects
    .map(createProjectCard)
    .join("");

}

/* 7. DASHBOARD QUICK ACTIONS */

document.addEventListener("click", event => {

  const button = event.target.closest(
    "[data-dashboard-action]"
  );

  if (!button) return;

  const action = button.dataset.dashboardAction;

  if (action === "create") {

    showPage("studios");

  }

  if (action === "projects") {

    showPage("projects");

  }

  if (action === "profile") {

    showPage("profile");
    renderProfileForm();

  }

});

/* 8. COMPLETE DASHBOARD RENDER */

function renderDashboard() {

  updateDashboardWelcome();

  renderDashboardStats();

  renderDashboardStudios();

  renderRecentProjects();

}

/* 9. DASHBOARD REFRESH */

function refreshDashboard() {

  loadLocalProjects();

  renderDashboard();

}

/* 10. DASHBOARD INITIAL RENDER */

renderDashboard();

/* =========================================
   END OF PART 4H
   ========================================= */
/* =========================================
   PART 4I — 50 CORE MODULES ENGINE
   ========================================= */

/* 1. CORE MODULE DATABASE */

const CORE_MODULES = [

  // THEME & PLANNING

  {
    id: 1,
    name: "Theme Engine",
    category: "Planning",
    description: "Selects suitable creative themes."
  },
  {
    id: 2,
    name: "Topic Discovery",
    category: "Planning",
    description: "Suggests relevant content topics."
  },
  {
    id: 3,
    name: "Audience Intelligence",
    category: "Planning",
    description: "Defines the intended audience."
  },
  {
    id: 4,
    name: "Platform Strategy",
    category: "Planning",
    description: "Plans content for publishing platforms."
  },
  {
    id: 5,
    name: "Content Category",
    category: "Planning",
    description: "Organizes content by category."
  },

  // STORY & SCRIPT

  {
    id: 6,
    name: "Story Engine",
    category: "Script",
    description: "Develops the main story structure."
  },
  {
    id: 7,
    name: "Script Writer",
    category: "Script",
    description: "Creates production scripts."
  },
  {
    id: 8,
    name: "Dialogue Engine",
    category: "Script",
    description: "Creates natural dialogue."
  },
  {
    id: 9,
    name: "Hook Generator",
    category: "Script",
    description: "Creates attention-grabbing openings."
  },
  {
    id: 10,
    name: "Narration Planner",
    category: "Script",
    description: "Plans voice narration."
  },

  // IDENTITY & PERFORMANCE

  {
    id: 11,
    name: "Identity Engine",
    category: "Identity",
    description: "Defines identity preservation requirements."
  },
  {
    id: 12,
    name: "Character Consistency",
    category: "Identity",
    description: "Maintains character continuity."
  },
  {
    id: 13,
    name: "Voice Planner",
    category: "Performance",
    description: "Plans voice characteristics."
  },
  {
    id: 14,
    name: "Pronunciation Checker",
    category: "Performance",
    description: "Reviews pronunciation requirements."
  },
  {
    id: 15,
    name: "Lip-Sync Planner",
    category: "Performance",
    description: "Plans dialogue and lip-sync alignment."
  },

  // VISUAL PRODUCTION

  {
    id: 16,
    name: "Scene Engine",
    category: "Visual",
    description: "Organizes scenes and sequences."
  },
  {
    id: 17,
    name: "Shot Planner",
    category: "Visual",
    description: "Plans camera shots."
  },
  {
    id: 18,
    name: "Camera Movement",
    category: "Visual",
    description: "Defines camera movement requirements."
  },
  {
    id: 19,
    name: "Lighting Designer",
    category: "Visual",
    description: "Plans lighting conditions."
  },
  {
    id: 20,
    name: "Background Designer",
    category: "Visual",
    description: "Defines background environments."
  },

  // CINEMATIC PRODUCTION

  {
    id: 21,
    name: "Cinematic Engine",
    category: "Cinematic",
    description: "Plans cinematic visual presentation."
  },
  {
    id: 22,
    name: "Color Grading",
    category: "Cinematic",
    description: "Defines color treatment."
  },
  {
    id: 23,
    name: "VFX Planner",
    category: "Cinematic",
    description: "Plans visual effects."
  },
  {
    id: 24,
    name: "Transition Designer",
    category: "Cinematic",
    description: "Plans scene transitions."
  },
  {
    id: 25,
    name: "Motion Graphics",
    category: "Cinematic",
    description: "Plans animated graphic elements."
  },

  // AUDIO PRODUCTION

  {
    id: 26,
    name: "Music Planner",
    category: "Audio",
    description: "Plans background music."
  },
  {
    id: 27,
    name: "Sound Effects",
    category: "Audio",
    description: "Plans sound effects."
  },
  {
    id: 28,
    name: "Audio Mixing",
    category: "Audio",
    description: "Defines audio mixing requirements."
  },
  {
    id: 29,
    name: "Voice Synchronization",
    category: "Audio",
    description: "Aligns voice and scene timing."
  },
  {
    id: 30,
    name: "Audio Quality",
    category: "Audio",
    description: "Reviews audio quality requirements."
  },

  // ACCURACY & LANGUAGE

  {
    id: 31,
    name: "Accuracy Engine",
    category: "Accuracy",
    description: "Reviews factual and production accuracy."
  },
  {
    id: 32,
    name: "Fact Verification",
    category: "Accuracy",
    description: "Identifies facts requiring verification."
  },
  {
    id: 33,
    name: "Hindi Typography",
    category: "Language",
    description: "Checks Hindi text presentation."
  },
  {
    id: 34,
    name: "Caption Generator",
    category: "Language",
    description: "Prepares caption text."
  },
  {
    id: 35,
    name: "Multilingual Support",
    category: "Language",
    description: "Plans multilingual content."
  },

  // IMAGE & DESIGN

  {
    id: 36,
    name: "Image Composition",
    category: "Design",
    description: "Plans image composition."
  },
  {
    id: 37,
    name: "Poster Designer",
    category: "Design",
    description: "Plans poster layouts."
  },
  {
    id: 38,
    name: "Typography Designer",
    category: "Design",
    description: "Plans typography and text hierarchy."
  },
  {
    id: 39,
    name: "Brand Identity",
    category: "Design",
    description: "Maintains brand presentation."
  },
  {
    id: 40,
    name: "Visual Consistency",
    category: "Design",
    description: "Reviews visual consistency."
  },

  // QUALITY & EXPORT

  {
    id: 41,
    name: "Privacy Protection",
    category: "Security",
    description: "Reviews privacy requirements."
  },
  {
    id: 42,
    name: "Safe Content Review",
    category: "Security",
    description: "Checks content safety requirements."
  },
  {
    id: 43,
    name: "Artifact Detection",
    category: "Quality",
    description: "Identifies visual artifact risks."
  },
  {
    id: 44,
    name: "Continuity Audit",
    category: "Quality",
    description: "Reviews scene continuity."
  },
  {
    id: 45,
    name: "Visual QA",
    category: "Quality",
    description: "Reviews visual quality requirements."
  },

  // DELIVERY & PERFORMANCE

  {
    id: 46,
    name: "Duration Controller",
    category: "Delivery",
    description: "Checks target duration."
  },
  {
    id: 47,
    name: "Aspect Ratio Controller",
    category: "Delivery",
    description: "Checks output aspect ratio."
  },
  {
    id: 48,
    name: "Export Manager",
    category: "Delivery",
    description: "Plans final export settings."
  },
  {
    id: 49,
    name: "Compatibility Checker",
    category: "Delivery",
    description: "Reviews platform compatibility."
  },
  {
    id: 50,
    name: "Final Production Audit",
    category: "Delivery",
    description: "Reviews final production readiness."
  }

];

CORE_MODULES.push(
  { id: 51, name: "Identity Reference Library", category: "Identity", description: "Stores reference requirements for consistent characters." },
  { id: 52, name: "Wardrobe Continuity", category: "Identity", description: "Tracks outfit and appearance continuity." },
  { id: 53, name: "Emotion Direction", category: "Performance", description: "Defines believable emotional performance." },
  { id: 54, name: "Gesture Planner", category: "Performance", description: "Plans natural gestures and body language." },
  { id: 55, name: "Scene Breakdown", category: "Visual", description: "Breaks the concept into production scenes." },
  { id: 56, name: "Location Continuity", category: "Visual", description: "Maintains consistent locations and environments." },
  { id: 57, name: "Lens & Framing Planner", category: "Visual", description: "Defines lens feel, framing and composition." },
  { id: 58, name: "Depth & Focus Planner", category: "Visual", description: "Plans focus and depth-of-field requirements." },
  { id: 59, name: "Animation Planner", category: "Cinematic", description: "Defines motion and animation needs." },
  { id: 60, name: "Visual Effects Safety", category: "Cinematic", description: "Checks effects for clarity and safe presentation." },
  { id: 61, name: "Subtitle Timing", category: "Audio", description: "Aligns subtitles with spoken dialogue." },
  { id: 62, name: "Voice Casting Guide", category: "Audio", description: "Defines suitable voice qualities and delivery." },
  { id: 63, name: "Noise Control", category: "Audio", description: "Plans clean audio and noise reduction." },
  { id: 64, name: "Music Rights Reminder", category: "Audio", description: "Flags music licensing requirements." },
  { id: 65, name: "Source Research Planner", category: "Accuracy", description: "Identifies claims requiring reliable sources." },
  { id: 66, name: "Citation Planner", category: "Accuracy", description: "Plans attribution for factual content." },
  { id: 67, name: "Devanagari Proofreader", category: "Language", description: "Checks Hindi spelling and matras." },
  { id: 68, name: "English Proofreader", category: "Language", description: "Checks English grammar and spelling." },
  { id: 69, name: "Caption Style Guide", category: "Language", description: "Maintains caption readability and consistency." },
  { id: 70, name: "Localization Planner", category: "Language", description: "Adapts wording to the selected audience." },
  { id: 71, name: "Thumbnail Planner", category: "Design", description: "Plans a clear and engaging thumbnail." },
  { id: 72, name: "Poster Grid System", category: "Design", description: "Maintains alignment and spacing." },
  { id: 73, name: "Color Palette Manager", category: "Design", description: "Keeps colors consistent with the brief." },
  { id: 74, name: "Logo Safe-Area Guard", category: "Design", description: "Protects logo proportions and clear space." },
  { id: 75, name: "Brand Asset Registry", category: "Design", description: "Tracks supplied brand assets." },
  { id: 76, name: "Privacy Data Minimizer", category: "Security", description: "Avoids unnecessary personal data in outputs." },
  { id: 77, name: "Consent & Rights Check", category: "Security", description: "Flags assets needing permission." },
  { id: 78, name: "Age Suitability Review", category: "Security", description: "Checks content for audience appropriateness." },
  { id: 79, name: "Accessibility Planner", category: "Quality", description: "Plans readable text and accessible contrast." },
  { id: 80, name: "Flicker Risk Review", category: "Quality", description: "Flags rapid flashing and visual instability." },
  { id: 81, name: "Compression Quality Check", category: "Quality", description: "Plans output quality versus file size." },
  { id: 82, name: "Scene Duration Balancer", category: "Delivery", description: "Balances scene lengths against total runtime." },
  { id: 83, name: "Clip Boundary Planner", category: "Delivery", description: "Creates practical clip boundaries." },
  { id: 84, name: "Platform Safe-Zone Check", category: "Delivery", description: "Keeps text within platform-safe areas." },
  { id: 85, name: "Resolution Planner", category: "Delivery", description: "Selects suitable output resolution." },
  { id: 86, name: "Frame Rate Planner", category: "Delivery", description: "Defines frame rate requirements." },
  { id: 87, name: "Codec Planner", category: "Delivery", description: "Recommends compatible export settings." },
  { id: 88, name: "File Naming Manager", category: "Delivery", description: "Creates consistent output file names." },
  { id: 89, name: "Metadata Planner", category: "Delivery", description: "Prepares title and descriptive metadata." },
  { id: 90, name: "Render Checklist", category: "Delivery", description: "Checks readiness before rendering." },
  { id: 91, name: "Delivery Manifest", category: "Delivery", description: "Summarizes all production deliverables." },
  { id: 92, name: "Revision Tracker", category: "Workflow", description: "Tracks changes and revision notes." },
  { id: 93, name: "Approval Gate", category: "Workflow", description: "Requires review before final export." },
  { id: 94, name: "Dependency Manager", category: "Workflow", description: "Checks required inputs before each stage." },
  { id: 95, name: "Auto-Select Controller", category: "Workflow", description: "Chooses sensible defaults when safe." },
  { id: 96, name: "Fallback Planner", category: "Workflow", description: "Provides alternatives when a tool is unavailable." },
  { id: 97, name: "Error Recovery Planner", category: "Workflow", description: "Defines recovery steps for failed actions." },
  { id: 98, name: "Prompt Length Optimizer", category: "Workflow", description: "Keeps constrained prompts within limits." },
  { id: 99, name: "Prompt Variant Manager", category: "Workflow", description: "Creates detailed and compact prompt variants." },
  { id: 100, name: "JSON Schema Validator", category: "Workflow", description: "Checks exported package structure." }
);

/* 2. MODULE COUNT VALIDATION */

function validateCoreModules() {

  const expectedCount =
    APP_CONFIG.TOTAL_CORE_MODULES;

  const actualCount =
    CORE_MODULES.length;

  const uniqueIds = new Set(
    CORE_MODULES.map(module => module.id)
  );

  return {
    valid:
      actualCount === expectedCount &&
      uniqueIds.size === expectedCount,

    expected: expectedCount,

    actual: actualCount,

    unique: uniqueIds.size
  };

}

/* 3. RENDER CORE MODULES */

function renderCoreModules() {

  const container = getElement("moduleList");

  if (!container) return;

  container.innerHTML = CORE_MODULES.map(module => `

    <article class="module-card panel">

      <div class="module-card-header">

        <span class="module-number">
          ${String(module.id).padStart(2, "0")}
        </span>

        <span class="tag">
          ${escapeHTML(module.category)}
        </span>

      </div>

      <h3>
        ${escapeHTML(module.name)}
      </h3>

      <p>
        ${escapeHTML(module.description)}
      </p>

      <span class="module-status">
        Defined
      </span>

    </article>

  `).join("");

}

/* 4. MODULE SUMMARY */

function renderModuleSummary() {

  const result = validateCoreModules();

  const summary = getElement("moduleSummary");

  if (!summary) return;

  summary.textContent = result.valid
    ? `${result.actual}/100 Modules defined`
    : `Module validation issue: ${result.actual}/${result.expected}`;

}

/* 5. INITIALIZE MODULE SYSTEM */

function initializeCoreModules() {

  const result = validateCoreModules();

  console.log(
    "UPS Core Modules:",
    result
  );

  renderCoreModules();

  renderModuleSummary();

  if (!result.valid) {
    showToast(
      "Core Module count validation failed.",
      "error"
    );
  }

}

/* 6. RUN MODULE SYSTEM */

initializeCoreModules();

/* =========================================
   END OF PART 4I
   ========================================= */
/* =========================================
   PART 4J — 15 WORKFLOW LOCKS ENGINE
   ========================================= */

/* 1. WORKFLOW LOCK DATABASE */

const WORKFLOW_LOCKS = [

  {
    id: 1,
    name: "Theme Lock",
    rule: "Selected theme must remain consistent.",
    check: brief => Boolean(brief.category)
  },

  {
    id: 2,
    name: "Dialogue Lock",
    rule: "Dialogue requirements must be defined.",
    check: brief => Boolean(brief.language)
  },

  {
    id: 3,
    name: "Identity Lock",
    rule: "Identity preservation requirements must be considered.",
    check: brief => Boolean(brief.studio)
  },

  {
    id: 4,
    name: "Performance Lock",
    rule: "Performance requirements must be reviewed.",
    check: brief => Boolean(brief.output)
  },

  {
    id: 5,
    name: "UI Lock",
    rule: "Output presentation must match the selected format.",
    check: brief => Boolean(brief.aspectRatio)
  },

  {
    id: 6,
    name: "Continuity Lock",
    rule: "Scene continuity requirements must be reviewed.",
    check: brief => Boolean(brief.topic)
  },

  {
    id: 7,
    name: "Production Lock",
    rule: "Production brief must contain essential details.",
    check: brief =>
      Boolean(brief.studio && brief.output && brief.topic)
  },

  {
    id: 8,
    name: "Transitions Lock",
    rule: "Transition requirements must be considered.",
    check: brief => Boolean(brief.output)
  },

  {
    id: 9,
    name: "QA Lock",
    rule: "Quality review must be performed.",
    check: brief => Boolean(brief.platform)
  },

  {
    id: 10,
    name: "Final Lock",
    rule: "Final production brief must be available.",
    check: brief => Boolean(brief.createdAt)
  },

  {
    id: 11,
    name: "Duration Lock",
    rule: "Video duration must be defined when applicable.",
    check: brief => {

      const videoOutputs = [
        "Video",
        "Reel",
        "Short Film",
        "Podcast"
      ];

      if (!videoOutputs.includes(brief.output)) {
        return true;
      }

      return Boolean(brief.duration) &&
        brief.duration !== "Not applicable";

    }
  },

  {
    id: 12,
    name: "Voice Lock",
    rule: "Language and voice requirements must be reviewed.",
    check: brief => Boolean(brief.language)
  },

  {
    id: 13,
    name: "Logic Lock",
    rule: "Production settings must be logically consistent.",
    check: brief =>
      Boolean(brief.studio && brief.platform && brief.output)
  },

  {
    id: 14,
    name: "Safe-Frame Lock",
    rule: "Aspect ratio must be supported.",
    check: brief =>
      APP_CONFIG.SUPPORTED_ASPECT_RATIOS.includes(
        brief.aspectRatio
      )
  },

  {
    id: 15,
    name: "Export Lock",
    rule: "Export format requirements must be reviewed.",
    check: brief => Boolean(brief.output)

  }

];

WORKFLOW_LOCKS.push(
  { id: 16, name: "Research Lock", rule: "Factual claims must be marked for verification.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 17, name: "Brand Lock", rule: "Supplied brand assets and identity must be preserved.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 18, name: "Character Lock", rule: "Character appearance must remain consistent.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 19, name: "Voice-Continuity Lock", rule: "Voice and delivery must remain consistent.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 20, name: "Scene-Continuity Lock", rule: "Locations, props and scene state must remain consistent.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 21, name: "Caption Lock", rule: "On-screen text must be readable and correctly spelled.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 22, name: "Platform-Safe-Zone Lock", rule: "Important content must remain inside safe areas.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 23, name: "Privacy Lock", rule: "Personal and private information must be protected.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 24, name: "Rights Lock", rule: "Third-party assets must have appropriate rights or permission.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) },
  { id: 25, name: "Render-Readiness Lock", rule: "Required output settings and assets must be checked.", check: brief => Boolean(brief && (brief.topic || brief.output || brief.studio)) }
);

/* 2. VALIDATE LOCK COUNT */

function validateLockCount() {

  const expected =
    APP_CONFIG.TOTAL_WORKFLOW_LOCKS;

  const actual =
    WORKFLOW_LOCKS.length;

  const uniqueIds = new Set(
    WORKFLOW_LOCKS.map(lock => lock.id)
  );

  return {
    valid:
      actual === expected &&
      uniqueIds.size === expected,

    expected,
    actual,
    unique: uniqueIds.size
  };

}

/* 3. RUN WORKFLOW LOCK CHECKS */

function runWorkflowLocks(brief) {

  return WORKFLOW_LOCKS.map(lock => {

    let passed = false;

    try {

      passed = Boolean(lock.check(brief));

    } catch (error) {

      console.error(
        "Workflow Lock Error:",
        lock.name,
        error
      );

    }

    return {
      id: lock.id,
      name: lock.name,
      rule: lock.rule,
      passed,
      status: passed ? "PASS" : "REVIEW REQUIRED"
    };

  });

}

/* 4. RENDER WORKFLOW LOCKS */

function renderWorkflowLocks(results = null) {

  const container = getElement("lockList");

  if (!container) return;

  const lockResults = results ||
    WORKFLOW_LOCKS.map(lock => ({
      ...lock,
      status: "NOT CHECKED",
      passed: false
    }));

  container.innerHTML = lockResults.map(lock => `

    <article class="lock-card panel">

      <div class="lock-card-header">

        <span class="lock-number">
          ${String(lock.id).padStart(2, "0")}
        </span>

        <span class="tag">
          ${escapeHTML(lock.status)}
        </span>

      </div>

      <h3>
        ${escapeHTML(lock.name)}
      </h3>

      <p>
        ${escapeHTML(lock.rule)}
      </p>

    </article>

  `).join("");

}

/* 5. LOCK VALIDATION SUMMARY */

function renderLockSummary(results) {

  const summary = getElement("lockSummary");

  if (!summary) return;

  const passed = results.filter(
    item => item.passed
  ).length;

  const failed = results.length - passed;

  summary.textContent =
    `${passed}/${WORKFLOW_LOCKS.length} Passed · ${failed} Need Review`;

}

/* 6. RUN COMPLETE QUALITY CHECK */

function runCompleteLockAudit(brief) {

  const countCheck = validateLockCount();

  if (!countCheck.valid) {

    showToast(
      "Workflow Lock count validation failed.",
      "error"
    );

    return [];

  }

  const results = runWorkflowLocks(brief);

  renderWorkflowLocks(results);

  renderLockSummary(results);

  return results;

}

/* 7. INITIAL LOCK DISPLAY */

function initializeWorkflowLocks() {

  const countCheck = validateLockCount();

  console.log(
    "UPS Workflow Locks:",
    countCheck
  );

  renderWorkflowLocks();

}

/* 8. INITIALIZE */

initializeWorkflowLocks();

/* =========================================
   END OF PART 4J
   ========================================= */
/* =========================================
   PART 4K — SUPER ADMIN CONSOLE
   ========================================= */

/* 1. CHECK ADMIN PERMISSION */

function isSuperAdmin() {

  return (
    APP_STATE.user &&
    APP_STATE.profile?.role === "super_admin"
  );

}

/* 2. ADMIN ACCESS GUARD */

function requireAdminAccess() {

  if (!APP_STATE.user) {

    showToast(
      "Admin access के लिए Login करें।",
      "error"
    );

    openAuthModal("login");

    return false;
  }

  if (!isSuperAdmin()) {

    showToast(
      "आपके Account को Super Admin अनुमति नहीं है।",
      "error"
    );

    return false;
  }

  return true;

}

/* 3. ADMIN SYSTEM STATISTICS */

function getAdminStatistics() {

  return {

    totalProjects:
      APP_STATE.projects.length,

    totalStudios:
      STUDIO_DATA.length,

    totalModules:
      CORE_MODULES.length,

    totalLocks:
      WORKFLOW_LOCKS.length,

    currentRole:
      APP_STATE.profile?.role || "tester",

    applicationVersion:
      APP_CONFIG.VERSION

  };

}

/* 4. RENDER ADMIN DASHBOARD */

function renderAdminDashboard() {

  const container = getElement("page-admin");

  if (!container) return;

  if (!isSuperAdmin()) {

    container.innerHTML = `

      <div class="panel admin-notice">

        <h2>🔒 Restricted Area</h2>

        <p>
          यह क्षेत्र केवल अधिकृत Super Admin के लिए है।
        </p>

        <p>
          आपके Account को Super Admin अनुमति नहीं मिली है।
        </p>

      </div>

    `;

    return;
  }

  const stats = getAdminStatistics();

  container.innerHTML = `

    <section class="admin-console">

      <div class="dashboard-banner panel">

        <span class="tag">
          SUPER ADMIN
        </span>

        <h2>Admin Control Center</h2>

        <p>
          UPS Creator Studio System Overview
        </p>

      </div>

      <div class="dashboard-stats">

        <div class="metric-card panel">

          <span class="metric-label">
            Total Local Projects
          </span>

          <strong class="metric-value">
            ${stats.totalProjects}
          </strong>

        </div>

        <div class="metric-card panel">

          <span class="metric-label">
            Creative Studios
          </span>

          <strong class="metric-value">
            ${stats.totalStudios}
          </strong>

        </div>

        <div class="metric-card panel">

          <span class="metric-label">
            Core Modules
          </span>

          <strong class="metric-value">
            ${stats.totalModules}
          </strong>

        </div>

        <div class="metric-card panel">

          <span class="metric-label">
            Workflow Locks
          </span>

          <strong class="metric-value">
            ${stats.totalLocks}
          </strong>

        </div>

      </div>

      <div class="panel admin-section">

        <h3>Account Information</h3>

        <p>
          Role:
          <strong>
            ${escapeHTML(stats.currentRole)}
          </strong>
        </p>

        <p>
          Application Version:
          <strong>
            ${escapeHTML(stats.applicationVersion)}
          </strong>
        </p>

      </div>

      <div class="panel admin-section">

        <h3>System Health</h3>

        <p>
          Authentication:
          ${supabase ? "Configured" : "Not Configured"}
        </p>

        <p>
          Core Modules:
          ${validateCoreModules().valid
            ? "Count Validated"
            : "Validation Required"}
        </p>

        <p>
          Workflow Locks:
          ${validateLockCount().valid
            ? "Count Validated"
            : "Validation Required"}
        </p>

      </div>

      <div class="panel admin-section">

        <h3>Management Availability</h3>

        <ul>

          <li>
            Dashboard Overview — Available
          </li>

          <li>
            Local Project Monitoring — Available
          </li>

          <li>
            User Management — Pending Secure Backend
          </li>

          <li>
            Role Management — Pending Secure Backend
          </li>

          <li>
            Cloud Storage Management — Pending
          </li>

          <li>
            Audit Logs — Pending
          </li>

          <li>
            Backup & Recovery — Pending
          </li>

        </ul>

      </div>

      <div class="panel admin-section">

        <h3>Security Notice</h3>

        <p>
          Admin UI visibility is not a security boundary.
          Sensitive operations must be verified by a
          trusted server-side function.
        </p>

      </div>

      <button
        type="button"
        class="btn btn-primary"
        id="refreshAdminDashboard"
      >
        Refresh Admin Dashboard
      </button>

    </section>

  `;

  getElement("refreshAdminDashboard")
    ?.addEventListener(
      "click",
      () => {

        renderAdminDashboard();

        showToast(
          "Admin dashboard refreshed.",
          "success"
        );

      }
    );

}

/* 5. ADMIN NAVIGATION */

getElement("adminNav")?.addEventListener(
  "click",
  (event) => {

    if (!requireAdminAccess()) {

      event.preventDefault();

      return;
    }

    renderAdminDashboard();

  }
);

/* 6. ADMIN PAGE ACCESS */

document.addEventListener("click", event => {

  const navItem = event.target.closest(
    '[data-page="admin"]'
  );

  if (!navItem) return;

  if (!requireAdminAccess()) {

    event.preventDefault();

    showPage("dashboard");

    return;
  }

  renderAdminDashboard();

});

/* 7. ADMIN UI REFRESH */

function refreshAdminConsole() {

  if (!isSuperAdmin()) return;

  renderAdminDashboard();

}

/* =========================================
   END OF PART 4K
   ========================================= */
/* =========================================
   PART 4L — SUPABASE CLOUD PROJECTS
   ========================================= */

/* 1. CHECK CLOUD CONNECTION */

function isCloudReady() {

  return Boolean(
    supabase &&
    APP_STATE.user
  );

}

/* 2. CONVERT CLOUD PROJECT */

function mapCloudProject(row) {
  const payload = row.project_data || {};
  const brief = payload.brief || payload || {};
  return {
    id: row.id,
    title: row.project_name || payload.title || "Untitled Project",
    studio: payload.studio || brief.studio || "video",
    output: payload.output || brief.output || "Video",
    platform: payload.platform || brief.platform || "Multi-platform",
    category: payload.category || brief.category || "Auto-Detect",
    brief: payload.brief || brief,
    prompt: payload.prompt || "",
    status: payload.status || "Draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    source: "cloud"
  };
}

/* 3. LOAD CLOUD PROJECTS */

async function loadCloudProjects() {

  if (!isCloudReady()) {
    return [];
  }

  try {

    const { data, error } = await supabase
      .from("creator_projects")
      .select("*")
      .eq("user_id", APP_STATE.user.id)
      .order("created_at", {
        ascending: false
      });

    if (error) throw error;

    const cloudProjects = (data || [])
      .map(mapCloudProject);

    APP_STATE.projects = cloudProjects;

    persistLocalProjects();

    renderDashboardProjects();

    renderDashboard();

    return cloudProjects;

  } catch (error) {

    console.error(
      "Cloud project loading error:",
      error
    );

    showToast(
      "Cloud Projects load नहीं हुए।",
      "error"
    );

    return [];

  }

}

/* 4. SAVE PROJECT TO CLOUD */

async function saveProjectToCloud(project) {

  if (!isCloudReady()) {

    showToast(
      "Cloud save के लिए Login करें।",
      "error"
    );

    return null;

  }

  try {

    const { data, error } = await supabase
      .from("creator_projects")
      .insert({
        user_id: APP_STATE.user.id,
        project_name: project.title || "Untitled Project",
        project_data: {
          studio: project.studio,
          output: project.output,
          platform: project.platform,
          category: project.category,
          brief: project.brief || null,
          prompt: project.prompt || "",
          status: project.status || "Draft"
        }
      })
      .select()
      .single();

    if (error) throw error;

    return data;

  } catch (error) {

    console.error(
      "Cloud project saving error:",
      error
    );

    showToast(
      error.message || "Cloud save failed.",
      "error"
    );

    return null;

  }

}

/* 5. CONNECT LOCAL SAVE WITH CLOUD SAVE */

const previousSaveCurrentProject =
  saveCurrentProject;

saveCurrentProject = async function() {

  if (!APP_STATE.user) {

    showToast(
      "पहले Login करें।",
      "error"
    );

    return;

  }

  const brief = APP_STATE.wizard.brief;

  if (!brief) return;

  const project = createProjectFromBrief(brief);

  const cloudRecord =
    await saveProjectToCloud(project);

  if (!cloudRecord) {

    showToast(
      "Project Cloud में सेव नहीं हुआ।",
      "error"
    );

    return;

  }

  project.id = cloudRecord.id;

  project.source = "cloud";

  APP_STATE.projects.unshift(project);

  persistLocalProjects();

  renderDashboard();

  showToast(
    "Project Cloud में सफलतापूर्वक सेव हुआ!",
    "success"
  );

};

/* 6. DELETE CLOUD PROJECT */

async function deleteCloudProject(projectId) {

  if (!isCloudReady()) {
    return false;
  }

  try {

    const { error } = await supabase
      .from("creator_projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", APP_STATE.user.id);

    if (error) throw error;

    return true;

  } catch (error) {

    console.error(
      "Cloud delete error:",
      error
    );

    showToast(
      "Cloud Project delete नहीं हुआ।",
      "error"
    );

    return false;

  }

}

/* 7. CONNECT DELETE WITH CLOUD */

const previousDeleteProject =
  deleteProject;

deleteProject = async function(projectId) {

  const project = APP_STATE.projects.find(
    item => item.id === projectId
  );

  if (!project) return;

  if (project.source === "cloud") {

    const deleted =
      await deleteCloudProject(projectId);

    if (!deleted) return;

  }

  previousDeleteProject(projectId);

};

/* 8. CLOUD CONNECTION STATUS */

function getCloudStatus() {

  if (!supabase) {
    return "Supabase Not Configured";
  }

  if (!APP_STATE.user) {
    return "Login Required";
  }

  return "Connected";

}

/* 9. CLOUD STATUS DISPLAY */

function renderCloudStatus() {

  const status = getElement("cloudStatus");

  if (!status) return;

  status.textContent = getCloudStatus();

}

/* =========================================
   END OF PART 4L
   ========================================= */
/* =========================================
   PART 4M — PROFILE PHOTO CLOUD UPLOAD
   ========================================= */

/* 1. PROFILE PHOTO STATE */

APP_STATE.profilePhotoPath = null;

/* 2. GET PRIVATE PHOTO URL */

async function getPrivatePhotoUrl(photoPath) {

  if (!supabase || !photoPath) return null;

  try {

    const { data, error } = await supabase
      .storage
      .from(APP_CONFIG.STORAGE_BUCKET)
      .createSignedUrl(photoPath, 3600);

    if (error) throw error;

    return data.signedUrl;

  } catch (error) {

    console.error(
      "Private photo URL error:",
      error
    );

    return null;

  }

}

/* 3. SHOW PROFILE PHOTO */

async function showProfilePhoto(photoPath) {

  const preview =
    getElement("profilePhotoPreview");

  if (!preview || !photoPath) return;

  const imageUrl =
    await getPrivatePhotoUrl(photoPath);

  if (!imageUrl) return;

  if (preview.tagName === "IMG") {

    preview.src = imageUrl;

  } else {

    preview.style.backgroundImage =
      `url("${imageUrl}")`;

  }

}

/* 4. UPLOAD PROFILE PHOTO */

async function uploadProfilePhoto(file) {

  if (!supabase || !APP_STATE.user) {

    showToast(
      "Photo Upload के लिए Login करें।",
      "error"
    );

    return false;

  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!file || !allowedMimeTypes.includes(file.type)) {

    showToast(
      "केवल JPG, PNG और WebP फोटो अपलोड करें।",
      "error"
    );

    return false;

  }

  if (
    file.size > APP_CONFIG.MAX_PROFILE_IMAGE_SIZE
  ) {

    showToast(
      "Photo का Size 5 MB से कम होना चाहिए।",
      "error"
    );

    return false;

  }

  const extension =
    file.name.split(".").pop().toLowerCase();

  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp"
  ];

  if (!allowedExtensions.includes(extension)) {

    showToast(
      "केवल JPG, PNG और WEBP Images स्वीकार हैं।",
      "error"
    );

    return false;

  }

  const userId = APP_STATE.user.id;

  const previousPhotoPath = APP_STATE.profile?.photo_path || APP_STATE.profilePhotoPath || null;
  const filePath =
    `${userId}/profile-${Date.now()}.${extension}`;
  let uploadedObjectPath = null;

  try {

    showToast("Photo Upload हो रही है...");

    /* UPLOAD TO PRIVATE STORAGE */

    const { data: uploadData, error: uploadError } =
      await supabase
        .storage
        .from(APP_CONFIG.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        });

    if (uploadError) throw uploadError;
    uploadedObjectPath = uploadData.path;

    /* SAVE PHOTO PATH IN PROFILE */

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            photo_path: uploadData.path
          },
          {
            onConflict: "user_id"
          }
        )
        .select()
        .single();

    if (profileError) throw profileError;

    APP_STATE.profile = profileData;

    APP_STATE.profilePhotoPath =
      uploadData.path;

    // Remove the previous private object only after the new path is saved.
    if (previousPhotoPath && previousPhotoPath !== uploadData.path) {
      const { error: oldPhotoDeleteError } = await supabase
        .storage.from(APP_CONFIG.STORAGE_BUCKET).remove([previousPhotoPath]);
      if (oldPhotoDeleteError) {
        console.warn("Previous profile photo cleanup warning:", oldPhotoDeleteError);
      }
    }

    /* SHOW PRIVATE IMAGE */

    await showProfilePhoto(uploadData.path);

    showToast(
      "Profile Photo Cloud में सेव हो गई!",
      "success"
    );

    return true;

  } catch (error) {

    // Roll back the newly uploaded object if the profile row could not be saved.
    if (uploadedObjectPath && supabase && APP_CONFIG.STORAGE_BUCKET) {
      const { error: rollbackError } = await supabase
        .storage.from(APP_CONFIG.STORAGE_BUCKET)
        .remove([uploadedObjectPath]);
      if (rollbackError) {
        console.warn("Profile photo rollback cleanup warning:", rollbackError);
      }
    }

    console.error(
      "Profile Photo Upload Error:",
      error
    );

    showToast(
      error.message ||
      "Photo Upload नहीं हो पाई। Storage Policies जाँचें।",
      "error"
    );

    return false;

  }

}

/* 5. PHOTO INPUT CLOUD UPLOAD EVENT */

getElement("photoInput")?.addEventListener(
  "change",
  async (event) => {

    const file = event.target.files?.[0];

    if (!file) return;

    await uploadProfilePhoto(file);

  }
);

/* 6. DELETE PROFILE PHOTO */

async function deleteProfilePhoto() {
  if (!supabase || !APP_STATE.user) {
    showToast("Photo हटाने के लिए Login करें।", "error");
    return false;
  }

  const photoPath = APP_STATE.profile?.photo_path || APP_STATE.profilePhotoPath;
  if (!photoPath) {
    showToast("कोई Cloud Profile Photo उपलब्ध नहीं है।", "info");
    return false;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ photo_path: null })
      .eq("user_id", APP_STATE.user.id)
      .select()
      .single();
    if (error) throw error;

    const { error: storageError } = await supabase
      .storage.from(APP_CONFIG.STORAGE_BUCKET).remove([photoPath]);
    if (storageError) console.warn("Photo object cleanup warning:", storageError);

    APP_STATE.profile = data;
    APP_STATE.profilePhotoPath = null;
    const preview = getElement("profilePhotoPreview");
    if (preview) {
      preview.style.backgroundImage = "";
      if (preview.tagName === "IMG") preview.removeAttribute("src");
      preview.textContent = (APP_STATE.profile?.full_name || "U").trim().charAt(0).toUpperCase() || "U";
    }
    const input = getElement("photoInput");
    if (input) input.value = "";
    showToast("Profile Photo हटा दी गई।", "success");
    return true;
  } catch (error) {
    console.error("Profile Photo Delete Error:", error);
    showToast(error.message || "Profile Photo हटाई नहीं जा सकी।", "error");
    return false;
  }
}

getElement("removeProfilePhoto")?.addEventListener("click", deleteProfilePhoto);

/* 7. LOAD SAVED PROFILE PHOTO */

async function loadSavedProfilePhoto() {

  const photoPath =
    APP_STATE.profile?.photo_path;

  if (!photoPath) return;

  APP_STATE.profilePhotoPath = photoPath;

  await showProfilePhoto(photoPath);

}

/* 7. PHOTO UPLOAD STATUS */

function getProfilePhotoStatus() {

  if (!APP_STATE.user) {
    return "Login Required";
  }

  if (APP_STATE.profilePhotoPath) {
    return "Cloud Photo Available";
  }

  return "No Cloud Photo";

}

/* =========================================
   END OF PART 4M
   ========================================= */
/* =========================================
   PART 4N — PROMPT GENERATION ENGINE
   ========================================= */

/* 1. PROMPT GENERATION RULES */

const PROMPT_RULES = {

  video: [
    "Create a clear visual sequence.",
    "Include an engaging opening hook.",
    "Define camera movement and scene composition.",
    "Maintain visual continuity.",
    "Specify aspect ratio and duration.",
    "Include suitable audio and caption requirements."
  ],

  image: [
    "Create a detailed visual composition.",
    "Define subject, background and lighting.",
    "Specify visual style and framing.",
    "Maintain text and visual accuracy.",
    "Specify the required aspect ratio."
  ],

  poster: [
    "Create a professional poster layout.",
    "Use a clear visual hierarchy.",
    "Keep headline and supporting text readable.",
    "Use balanced typography and spacing.",
    "Preserve brand identity and spelling accuracy."
  ],

  dance: [
    "Describe the dance performance concept.",
    "Define movement style and energy.",
    "Plan camera framing and scene continuity.",
    "Specify music synchronization requirements.",
    "Avoid unnatural or inconsistent movement."
  ],

  film: [
    "Develop a cinematic scene concept.",
    "Define characters and scene setting.",
    "Plan camera angles and lighting.",
    "Maintain character and scene continuity.",
    "Include a clear beginning, middle and ending."
  ],

  podcast: [
    "Create a natural conversation structure.",
    "Include opening and introduction.",
    "Develop meaningful discussion points.",
    "Include examples and a closing.",
    "Use clear speaker labels and natural dialogue."
  ],

  education: [
    "Present information in a clear learning sequence.",
    "Use accurate and understandable explanations.",
    "Include relevant examples.",
    "Keep educational language age-appropriate.",
    "Add a short learning summary."
  ]

};

/* 2. GET STUDIO PROMPT CATEGORY */

function getPromptCategory(studioId) {

  const mapping = {
    video: "video",
    image: "image",
    poster: "poster",
    dance: "dance",
    film: "film",
    podcast: "podcast",
    education: "education"
  };

  return mapping[studioId] || "video";

}

/* 3. BUILD PRODUCTION PROMPT */

function buildProductionPrompt(brief) {

  if (!brief) {
    throw new Error("Creative Brief उपलब्ध नहीं है।");
  }

  const studioId =
    APP_STATE.currentStudio?.id ||
    brief.studioId ||
    "video";

  const category =
    getPromptCategory(studioId);

  const rules =
    PROMPT_RULES[category];

  const prompt = `UPS CREATOR STUDIO
PRODUCTION PROMPT

INTELLIGENCE & QUALITY DIRECTIVE
Use all applicable capabilities from the 100-module registry, 25 workflow locks, 12 production engines and 15 workflow stages. Select only relevant behaviors for this output, preserve user instructions, run factual/safety/identity/continuity checks, and do not invent unavailable external rendering capabilities.

PROJECT INFORMATION

Studio: ${brief.studio}
Purpose: ${brief.purpose || ""}
Activity: ${brief.activity || ""}
Platform: ${brief.platform}
Output: ${brief.output}
Target Audience: ${brief.audience}
Language: ${brief.language}
Category: ${brief.category}
Subcategory: ${brief.subcategory || ""}
Topic: ${brief.topic}
Creative Direction: ${brief.creativeDirection || ""}
Visual Style: ${brief.visualStyle || ""}
Identity Rules: ${brief.identityRules || ""}
Voice Style: ${brief.voiceStyle || ""}
Text Rules: ${brief.textRules || ""}
Brand / CTA: ${brief.brandCTA || ""}
Purpose Detail: ${brief.purposeDetail || ""}
Dialogue / Narration: ${brief.dialogue || ""}

PRODUCTION SETTINGS

Duration: ${brief.duration}
Aspect Ratio: ${brief.aspectRatio}
Creation Mode: ${brief.mode}

CREATIVE DIRECTION

Create professional, clear and engaging content
based on the selected topic and audience.

The final output should match the selected
platform, language and content format.

STUDIO-SPECIFIC INSTRUCTIONS

${rules.map((rule, index) =>
  `${index + 1}. ${rule}`
).join("\n")}

QUALITY REQUIREMENTS

1. Maintain content consistency.
2. Check spelling and language accuracy.
3. Follow the selected aspect ratio.
4. Review visual and audio requirements where applicable.
5. Respect privacy and content safety.
6. Review the final output before publishing.

FINAL OUTPUT

Prepare the requested ${brief.output} concept
for ${brief.platform}.

Topic: ${brief.topic}

Language: ${brief.language}

UPS Creator Studio
Imagine. Create. Innovate.`;

  return {
    studio: category,
    title: brief.topic,
    prompt,
    createdAt: new Date().toISOString()
  };

}

/* 4. GENERATE PROMPT FROM CURRENT BRIEF */


/* PACKAGE ACCESS EXPERIENCE — UI gate pending server-side entitlement wiring */
function getCurrentPackageAccess() {
  const profile = APP_STATE.profile || {};
  const role = String(profile.role || profile.user_role || "").toLowerCase();
  if (role === "super_admin" || profile.is_super_admin === true) {
    return { allowed: true, reason: "Super Admin access" };
  }
  const status = String(profile.package_status || profile.subscription_status || profile.plan_status || "").toLowerCase();
  const active = ["active", "approved", "paid", "trial", "lifetime"].includes(status) ||
    profile.package_active === true || profile.is_paid === true;
  return {
    allowed: active,
    status: status || "not_configured",
    packageName: profile.package_name || profile.package_code || "No active package",
    reason: active ? "Package active" : "Package approval required"
  };
}
function showPackageAccessPopup(access) {
  let modal = document.getElementById("upsPackageGateModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "upsPackageGateModal";
    modal.className = "ups-package-gate";
    modal.innerHTML = `<div class="ups-package-gate__card" role="dialog" aria-modal="true" aria-labelledby="upsPackageGateTitle"><button type="button" class="ups-package-gate__close" aria-label="Close">×</button><span class="tag">PACKAGE ACCESS</span><h2 id="upsPackageGateTitle">इस सुविधा के लिए सक्रिय Package जरूरी है</h2><p id="upsPackageGateMessage"></p><div class="ups-package-gate__actions"><button type="button" class="btn btn-primary" id="upsPackageGateContact">Admin Approval Required</button><button type="button" class="btn btn-secondary" id="upsPackageGateClose">Close</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector(".ups-package-gate__close")?.addEventListener("click", () => modal.classList.remove("is-open"));
    modal.querySelector("#upsPackageGateClose")?.addEventListener("click", () => modal.classList.remove("is-open"));
    modal.querySelector("#upsPackageGateContact")?.addEventListener("click", () => {
      showToast("अपने Super Admin से package status verify/approve करवाएँ।", "info");
      modal.classList.remove("is-open");
    });
  }
  const message = modal.querySelector("#upsPackageGateMessage");
  if (message) message.textContent = access.status === "not_configured"
    ? "आपके profile में package entitlement अभी सेट नहीं है। Super Admin से package assign और approve करवाएँ।"
    : `आपका package अभी active नहीं है (${access.status})। उपलब्ध package और expiry Super Admin से verify करवाएँ।`;
  modal.classList.add("is-open");
}
function requirePackageAccess(featureName = "prompt_export") {
  const access = getCurrentPackageAccess();
  if (access.allowed) return true;
  console.warn("Package gate blocked:", featureName, access);
  showPackageAccessPopup(access);
  return false;
}

function generateCurrentPrompt() {

  if (!requirePackageAccess("prompt_generation")) return null;

  const brief = APP_STATE.wizard.brief;

  if (!brief) {

    showToast(
      "पहले Creative Brief तैयार करें।",
      "error"
    );

    return null;

  }

  try {

    const result =
      buildProductionPrompt(brief);

    APP_STATE.generatedPrompt = result;

    return result;

  } catch (error) {

    console.error(
      "Prompt generation error:",
      error
    );

    showToast(
      error.message,
      "error"
    );

    return null;

  }

}

/* 5. RENDER GENERATED PROMPT */

function buildUPSClipPrompt(brief, clip, clipCount) {
  const base = [
    `Create a ${clip.duration_seconds}-second ${brief.output || "video"} clip (${clip.scene}/${clipCount}) about "${brief.topic || "the selected topic"}".`,
    `Purpose: ${brief.purpose || "inform and engage"}. Activity: ${brief.activity || "explainer"}.`,
    `Category: ${brief.category || "General"} > ${brief.subcategory || "General"}.`,
    `Audience: ${brief.audience || "general"}. Language: ${brief.language || "Hindi"}.`,
    `Format: ${brief.aspectRatio || "9:16"}. Platform: ${brief.platform || "Multi-platform"}.`,
    `Creative direction: ${brief.creativeDirection || "Use a clear, engaging and topic-appropriate visual approach."}`,
    `Visual style: ${brief.visualStyle || "Topic-appropriate premium visual style"}. Identity rules: ${brief.identityRules || "Maintain required identity and brand consistency"}.`,
    `Voice: ${brief.voiceStyle || brief.dialogue || "Natural and clear"}. Text rules: ${brief.textRules || "Accurate, readable captions"}. Branding/CTA: ${brief.brandCTA || "No invented logos; use only supplied brand assets"}.`,
    `Clip role: ${clip.scene === 1 ? "Opening hook; capture attention immediately." : clip.scene === clipCount ? "Closing; deliver a clear takeaway and polished CTA." : "Continue the story with one focused useful point."}`,
    `Visual: ${clip.visual} Action: ${clip.action}`,
    `Camera: ${clip.camera} Transition: ${clip.transition}`,
    `Dialogue/narration: ${clip.dialogue}. On-screen text: ${clip.on_screen_text}.`,
    `Audio: ${clip.audio}`,
    "Maintain factual accuracy, safe content, clear typography, natural motion, consistent identity/wardrobe/location where continuity is required, and clean audio.",
    "Do not add unsupported claims, random logos, misspelled captions or unrelated visuals."
  ];
  let prompt = base.join(" ");
  if (prompt.length > 900) {
    // Preserve the user-provided direction first; compact optional production descriptors.
    const fixed = [
      `Create ${clip.duration_seconds}s clip ${clip.scene}/${clipCount} about "${String(brief.topic || "topic").slice(0,100)}".`,
      `Purpose ${String(brief.purpose || "").slice(0,55)}; ${String(brief.category || "").slice(0,45)} > ${String(brief.subcategory || "").slice(0,45)}.`,
      `Language ${String(brief.language || "Hindi").slice(0,24)}; audience ${String(brief.audience || "general").slice(0,40)}; ${brief.aspectRatio || "9:16"}.`,
      `User direction: ${String(brief.creativeDirection || "").slice(0,150)}. Style: ${String(brief.visualStyle || "").slice(0,70)}. Identity: ${String(brief.identityRules || "").slice(0,80)}.`,
      `Visual ${String(clip.visual).slice(0,75)} Action ${String(clip.action).slice(0,70)}.`,
      `Camera ${String(clip.camera).slice(0,65)}; transition ${String(clip.transition).slice(0,45)}.`,
      `Dialogue ${String(brief.voiceStyle || clip.dialogue).slice(0,55)}; text ${String(brief.textRules || clip.on_screen_text).slice(0,60)}; brand ${String(brief.brandCTA || "").slice(0,45)}.`,
      "Accurate, safe, natural, consistent identity and clean audio."
    ];
    prompt = fixed.join(" ");
  }
  return prompt.length <= 900 ? prompt : prompt.slice(0, 900).trimEnd();
}

function buildUPSProductionPackage(result, brief) {
  const totalSeconds = (() => {
    const raw = String(brief.duration || "30").toLowerCase();
    const match = raw.match(/\d+(?:\.\d+)?/);
    const amount = Number(match ? match[0] : 30);
    return Math.max(1, /min|मिनट/.test(raw) ? Math.round(amount * 60) : Math.round(amount));
  })();
  const clipSeconds = 10;
  const clipCount = Math.ceil(totalSeconds / clipSeconds);
  const clips = Array.from({ length: clipCount }, (_, index) => {
    const duration = Math.min(clipSeconds, totalSeconds - index * clipSeconds);
    return {
      scene: index + 1,
      duration_seconds: duration,
      visual: `Scene ${index + 1}: show ${brief.topic || "the selected topic"} with clear subject focus.`,
      action: "Natural, believable movement; maintain continuity.",
      camera: index === 0 ? "Establishing shot with a gentle push-in." : "Smooth continuation shot; avoid abrupt camera changes.",
      dialogue: index === 0 ? "Deliver the opening hook." : "Continue the main message naturally.",
      audio: "Clear voice, balanced background music and relevant subtle sound effects.",
      on_screen_text: brief.topic || "Main topic",
      transition: index === clipCount - 1 ? "Clean ending / fade out." : "Match-cut or smooth transition."
    };
  });
  clips.forEach(clip => { clip.prompt = buildUPSClipPrompt(brief, clip, clipCount); });
  const detailed = result.prompt;
  const short = [
    `Create ${brief.output || "video"} about ${brief.topic || "the selected topic"}.`,
    `Audience: ${brief.audience || "general"}; Language: ${brief.language || "Hindi"}; Platform: ${brief.platform || "Multi-platform"}.`,
    `Style: professional, engaging, clear visuals, natural performance, accurate text, consistent identity and smooth continuity.`,
    `Duration: ${brief.duration || "30 seconds"}; Aspect ratio: ${brief.aspectRatio || "9:16"}.`,
    "Include a strong hook, useful main message, readable captions, suitable audio and a polished closing."
  ].join(" ");
  const ultra = `Create ${brief.output || "video"} on "${brief.topic || "topic"}"; ${brief.language || "Hindi"}, ${brief.duration || "30s"}, ${brief.aspectRatio || "9:16"}. Strong hook, clear visuals, natural delivery, readable text, consistent scenes, suitable audio and polished ending.`;
  // Build a purpose-written compact prompt instead of blindly cutting the long prompt.
  // Keep the topic, language, duration, aspect ratio, creative direction and every clip boundary.
  const compactTopic = String(brief.topic || "selected topic").replace(/\\s+/g, " ").trim();
  const compactOutput = String(brief.output || "video").replace(/\\s+/g, " ").trim();
  const compactLanguage = String(brief.language || "Hindi").replace(/\\s+/g, " ").trim();
  const compactAudience = String(brief.audience || "general audience").replace(/\\s+/g, " ").trim();
  const clipMap = clips.map(c => `${c.scene}:${c.duration_seconds}s`).join(",");
  const ytCore = [
    `Create ${compactOutput} about "${compactTopic}".`,
    `Language: ${compactLanguage}. Audience: ${compactAudience}.`,
    `Duration: ${totalSeconds}s; format: ${brief.aspectRatio || "9:16"}; platform: ${brief.platform || "multi-platform"}.`,
    "Strong hook, clear story, natural motion, readable captions, clean voice/audio, polished ending.",
    "Keep character, clothing, voice, location, lighting and props consistent.",
    `Clip sequence: ${clipMap}.`
  ];
  let ytCreate = ytCore.join(" ");
  // If user-entered fields are unusually long, shrink optional fields first while preserving all clip timings.
  if (ytCreate.length > 900) {
    const maxTopic = Math.max(40, 900 - (ytCreate.length - compactTopic.length) - 3);
    const safeTopic = compactTopic.slice(0, maxTopic);
    ytCore[0] = `Create ${compactOutput.slice(0, 50)} about "${safeTopic}".`;
    ytCore[1] = `Language: ${compactLanguage.slice(0, 30)}. Audience: ${compactAudience.slice(0, 60)}.`;
    ytCreate = ytCore.join(" ");
  }
  if (ytCreate.length > 900) {
    ytCreate = [
      `Create ${compactOutput.slice(0, 30)}: "${compactTopic.slice(0, 180)}".`,
      `Language ${compactLanguage.slice(0, 20)}; audience ${compactAudience.slice(0, 35)}.`,
      `Duration ${totalSeconds}s; ${brief.aspectRatio || "9:16"}; ${brief.platform || "multi-platform"}.`,
      "Strong hook, clear story, natural motion, readable captions, clean audio, polished ending; preserve identity and continuity.",
      `Clips ${clipMap}.`
    ].join(" ");
  }
  // Last-resort hard cap only for pathological user input; clip timing and core instructions are prioritized.
  if (ytCreate.length > 900) ytCreate = ytCreate.slice(0, 900).trimEnd();
  const geminiImage = `Create a high-quality ${brief.aspectRatio || "9:16"} ${brief.output || "creative"} visual about "${brief.topic || "the selected topic"}". Audience: ${brief.audience || "general"}. Language/text: ${brief.language || "Hindi"}. Composition: clear focal subject, balanced layout, professional lighting, strong depth, accurate readable typography, clean background, premium finish. Preserve supplied identity and brand assets exactly where provided; do not invent logos or factual claims.`;
  const geminiVideo = `Create a ${brief.duration || "30 seconds"} ${brief.aspectRatio || "9:16"} video about "${brief.topic || "the selected topic"}". Style: professional and realistic. Structure: strong opening hook, clear progression, useful main message and polished closing. Maintain consistent characters, clothing, voice, location, lighting and props across ${clipCount} clips. Use natural motion, stable camera movement, accurate Hindi/English text, synchronized dialogue, clean audio and smooth transitions. Clip plan: ${clips.map(c => `${c.scene}=${c.duration_seconds}s`).join(", ")}.`;
  return {
    product: "UPS Creator Studio",
    schema_version: "1.0",
    created_at: new Date().toISOString(),
    brief,
    prompt_variants: { detailed, short, ultra_short: ultra, yt_create_900: ytCreate },
    gemini: { image_prompt: geminiImage, video_prompt: geminiVideo },
    sequence: { total_duration_seconds: totalSeconds, clip_duration_target_seconds: clipSeconds, clip_count: clipCount, clips },
    architecture: {
      modules_defined: CORE_MODULES.length,
      core_module_manifest: CORE_MODULES.map(({ id, name, category, description }) => ({ id, name, category, description })),
      locks: runWorkflowLocks(brief),
      engines: UPS_PRODUCTION_ENGINES,
      workflow_stages: UPS_WORKFLOW_STAGES
    },
    production_note: "Prompts and storyboard plan only. Actual image/video rendering requires a connected generation/render provider."
  };
}

function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderGeneratedPrompt(result) {
  const area = getElement("questionArea");
  if (!area || !result) return;
  const brief = APP_STATE.wizard.brief || {};
  const pack = buildUPSProductionPackage(result, brief);
  const options = [
    ["detailed", "Detailed"],
    ["short", "Short"],
    ["ultra_short", "Ultra Short"],
    ["yt_create_900", "YT Create ≤900"]
  ];
  area.innerHTML = `
    <div class="recommendation ups-production-package">
      <span class="tag">UPS PRODUCTION PACKAGE</span>
      <h2>${escapeHTML(result.title)}</h2>
      <p>एक ही Brief से अलग-अलग Prompt Formats, Gemini Prompts, Clip Sequence और JSON Export तैयार करें।</p>
      <label for="upsPromptVariant"><strong>Prompt Format</strong></label>
      <select id="upsPromptVariant">${options.map(([v,l])=>`<option value="${v}">${l}</option>`).join("")}</select>
      <textarea id="generatedPromptText" rows="14" spellcheck="true">${escapeHTML(pack.prompt_variants.detailed)}</textarea>
      <div class="wizard-controls">
        <button type="button" class="btn btn-primary" id="copyGeneratedPrompt">Copy Prompt</button>
        <button type="button" class="btn btn-secondary" id="downloadGeneratedPrompt">Download TXT</button>
        <button type="button" class="btn btn-secondary" id="saveUPSProductionJSON">Download JSON</button>
        <button type="button" class="btn btn-secondary" id="copyUPSProductionJSON">Copy JSON</button>
        <button type="button" class="btn btn-secondary" id="upsStoryboardPreview">Storyboard Preview</button>
        <button type="button" class="btn btn-secondary" id="backToCreativeBrief">Back to Brief</button>
      </div>
      <p id="upsPromptCount" aria-live="polite"></p>
      <div class="ups-prompt-tabs">
        <h3>Gemini Image Prompt</h3><textarea id="upsGeminiImage" rows="5">${escapeHTML(pack.gemini.image_prompt)}</textarea>
        <button type="button" class="btn btn-secondary" id="copyGeminiImage">Copy Image Prompt</button>
        <h3>Gemini Video Prompt</h3><textarea id="upsGeminiVideo" rows="6">${escapeHTML(pack.gemini.video_prompt)}</textarea>
        <button type="button" class="btn btn-secondary" id="copyGeminiVideo">Copy Video Prompt</button>
        <h3>Multi-Clip Sequence (${pack.sequence.clip_count} clips)</h3>
        <div id="upsClipList">${pack.sequence.clips.map(c=>`<article class="panel ups-clip-card"><b>Clip ${c.scene} · ${c.duration_seconds}s</b><p>${escapeHTML(c.visual)}</p><small>${escapeHTML(c.camera)} · ${escapeHTML(c.transition)}</small><label for="upsClipPrompt${c.scene}">Clip Prompt (maximum 900 characters)</label><textarea id="upsClipPrompt${c.scene}" rows="7">${escapeHTML(c.prompt)}</textarea><p class="clip-count" id="upsClipCount${c.scene}">${c.prompt.length}/900 characters</p><div class="wizard-controls"><button type="button" class="btn btn-secondary" data-copy-clip="${c.scene}">Copy Clip ${c.scene}</button><button type="button" class="btn btn-secondary" data-download-clip="${c.scene}">Download Clip ${c.scene}</button></div></article>`).join("")}</div>
        <button type="button" class="btn btn-primary" id="downloadAllClipPrompts">Download All Clip Prompts</button>
        <div id="upsStoryboard" hidden></div>
      </div>
    </div>`;
  const variantSelect = getElement("upsPromptVariant");
  const promptBox = getElement("generatedPromptText");
  const count = getElement("upsPromptCount");
  const updateVariant = () => {
    promptBox.value = pack.prompt_variants[variantSelect.value];
    const n = promptBox.value.length;
    count.textContent = variantSelect.value === "yt_create_900"
      ? `YT Create prompt: ${n}/900 characters ${n <= 900 ? "— LIMIT PASS" : "— LIMIT EXCEEDED"}`
      : `Character count: ${n}`;
  };
  variantSelect.addEventListener("change", updateVariant);
  updateVariant();
  const copy = async (text, label) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = text;
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand("copy");
        temporary.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      showToast(label + " copied!", "success");
    } catch {
      showToast("Copy नहीं हो पाया। Text select करके copy करें।", "error");
    }
  };
  pack.sequence.clips.forEach(clip => {
    const box = getElement(`upsClipPrompt${clip.scene}`);
    const counter = getElement(`upsClipCount${clip.scene}`);
    box?.addEventListener("input", () => {
      if (counter) counter.textContent = `${box.value.length}/900 characters ${box.value.length <= 900 ? "— PASS" : "— LIMIT EXCEEDED"}`;
      if (box.value.length > 900) box.setCustomValidity("इस Clip Prompt की सीमा 900 characters है।");
      else box.setCustomValidity("");
    });
  });
  area.querySelectorAll("[data-copy-clip]").forEach(button => button.addEventListener("click", () => {
    const box = getElement(`upsClipPrompt${button.dataset.copyClip}`);
    if (box && box.value.length <= 900) copy(box.value, `Clip ${button.dataset.copyClip}`);
    else showToast("Clip Prompt 900 characters से अधिक है।", "error");
  }));
  area.querySelectorAll("[data-download-clip]").forEach(button => button.addEventListener("click", () => {
    const box = getElement(`upsClipPrompt${button.dataset.downloadClip}`);
    if (!box || box.value.length > 900) { showToast("पहले Clip Prompt को 900 characters के अंदर रखें।", "error"); return; }
    downloadTextFile(box.value, `UPS-Clip-${button.dataset.downloadClip}-Prompt.txt`);
  }));
  getElement("downloadAllClipPrompts")?.addEventListener("click", () => {
    const all = pack.sequence.clips.map(c => {
      const box = getElement(`upsClipPrompt${c.scene}`);
      return `CLIP ${c.scene} (${c.duration_seconds}s)\\n${box?.value || c.prompt}`;
    }).join("\\n\\n");
    if (pack.sequence.clips.some(c => (getElement(`upsClipPrompt${c.scene}`)?.value || c.prompt).length > 900)) {
      showToast("एक या अधिक Clip Prompt 900 characters से अधिक हैं।", "error"); return;
    }
    downloadTextFile(all, "UPS-All-Clip-Prompts.txt");
  });
  getElement("copyGeneratedPrompt")?.addEventListener("click",()=>copy(promptBox.value,"Prompt"));
  getElement("downloadGeneratedPrompt")?.addEventListener("click",()=>{
    const blob=new Blob([promptBox.value],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="UPS-Production-Prompt.txt"; a.click(); URL.revokeObjectURL(url);
  });
  getElement("saveUPSProductionJSON")?.addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(pack,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="UPS-Production-Package.json"; a.click(); URL.revokeObjectURL(url);
  });
  getElement("copyUPSProductionJSON")?.addEventListener("click",()=>copy(JSON.stringify(pack,null,2),"Production JSON"));
  getElement("copyGeminiImage")?.addEventListener("click",()=>copy(getElement("upsGeminiImage").value,"Gemini Image Prompt"));
  getElement("copyGeminiVideo")?.addEventListener("click",()=>copy(getElement("upsGeminiVideo").value,"Gemini Video Prompt"));
  getElement("upsStoryboardPreview")?.addEventListener("click",()=>{
    const preview=getElement("upsStoryboard"); preview.hidden=false;
    preview.innerHTML=`<h3>Storyboard Preview</h3><p>यह दृश्य-योजना का Preview है, वास्तविक MP4 Render नहीं।</p>`+
      pack.sequence.clips.map(c=>`<article class="panel"><b>SCENE ${c.scene} · ${c.duration_seconds}s</b><p>${escapeHTML(c.visual)}</p><p>Action: ${escapeHTML(c.action)}</p><p>Camera: ${escapeHTML(c.camera)}</p><p>Dialogue: ${escapeHTML(c.dialogue)}</p><p>Text: ${escapeHTML(c.on_screen_text)}</p></article>`).join("");
  });
  getElement("backToCreativeBrief")?.addEventListener("click",()=>renderCreativeBrief(APP_STATE.wizard.brief));
}

/* 6. ADD GENERATE BUTTON TO BRIEF */

const previousPromptBriefRenderer =
  renderCreativeBrief;

renderCreativeBrief = function(brief) {

  previousPromptBriefRenderer(brief);

  const container = $(
    "#questionArea .recommendation"
  );

  if (!container) return;

  const button = document.createElement("button");

  button.type = "button";
  button.id = "generateProductionPrompt";
  button.className = "btn btn-primary";
  button.textContent = "✨ Generate Production Prompt";

  container.appendChild(button);

  button.addEventListener(
    "click",
    () => {

      const checks = runCompleteLockAudit(APP_STATE.wizard.brief || {});
      const failed = checks.filter(item => !item.passed);
      if (failed.length) {
        showToast(`${failed.length} Workflow Locks need review. Brief edit करें।`, "error");
        return;
      }
      const result = generateCurrentPrompt();

      if (result) {
        renderGeneratedPrompt(result);
      }

    }
  );

};

/* 7. PROMPT ENGINE STATUS */

function getPromptEngineStatus() {

  return {
    available: true,
    generationType: "Rule-Based Templates",
    externalAIConnected: false,
    supportedStudios: Object.keys(PROMPT_RULES)
  };

}

/* 8. INITIAL PROMPT ENGINE CHECK */

console.log(
  "UPS Prompt Engine:",
  getPromptEngineStatus()
);

/* =========================================
   END OF PART 4N
   ========================================= */
/* =========================================
   PART 4O — PROMPT LIBRARY & HISTORY
========================================= */

const PROMPT_LIBRARY_KEY = "ups_creator_prompt_library_v1";

function getPromptLibrary() {
  try {
    const data = JSON.parse(
      localStorage.getItem(PROMPT_LIBRARY_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Prompt Library Error:", error);
    return [];
  }
}

function savePromptLibrary(data) {
  try {
    localStorage.setItem(
      PROMPT_LIBRARY_KEY,
      JSON.stringify(data)
    );
    return true;
  } catch (error) {
    showToast("Prompt save नहीं हो पाया। Storage चेक करें।");
    return false;
  }
}

function savePromptToLibrary() {
  const promptElement = $("generatedPromptText");

  if (!promptElement) {
    showToast("पहले Production Prompt generate करें।");
    return;
  }

  const promptText =
    promptElement.value ||
    promptElement.textContent ||
    "";

  if (!promptText.trim()) {
    showToast("कोई Prompt उपलब्ध नहीं है।");
    return;
  }

  const library = getPromptLibrary();

  const item = {
    id: "prompt_" + Date.now(),
    title:
      (APP_STATE.currentStudio?.name || "Creative") +
      " Production Prompt",
    studio:
      APP_STATE.currentStudio?.name || "Creative Studio",
    prompt: promptText,
    createdAt: new Date().toISOString()
  };

  library.unshift(item);

  // अधिकतम 100 prompts सेव होंगे
  const updatedLibrary = library.slice(0, 100);

  if (savePromptLibrary(updatedLibrary)) {
    showToast("Prompt Library में सेव हो गया!");
    renderPromptLibrary();
  }
}

function renderPromptLibrary() {
  const page = $("page-projects");

  if (!page) return;

  let librarySection = $("promptLibrarySection");

  if (!librarySection) {
    librarySection = document.createElement("section");
    librarySection.id = "promptLibrarySection";
    librarySection.className = "prompt-library-section";

    page.appendChild(librarySection);
  }

  const library = getPromptLibrary();

  librarySection.innerHTML = `
    <div class="section-heading">
      <div>
        <h2>Prompt Library</h2>
        <p>आपके सेव किए गए Production Prompts</p>
      </div>
      <span class="library-count">
        ${library.length} Saved
      </span>
    </div>

    ${
      library.length
        ? library.map(item => `
          <article class="prompt-library-card">
            <div class="prompt-library-info">
              <h3>${escapeHTML(item.title)}</h3>
              <p>${escapeHTML(item.studio)}</p>
              <small>
                ${formatDate(item.createdAt)}
              </small>
            </div>

            <div class="prompt-library-actions">
              <button
                class="btn btn-secondary"
                data-prompt-view="${escapeHTML(item.id)}">
                View
              </button>

              <button
                class="btn btn-secondary"
                data-prompt-copy="${escapeHTML(item.id)}">
                Copy
              </button>

              <button
                class="btn btn-danger"
                data-prompt-delete="${escapeHTML(item.id)}">
                Delete
              </button>
            </div>
          </article>
        `).join("")
        : `
          <div class="empty-state">
            <h3>Library अभी खाली है</h3>
            <p>Production Prompt बनाकर उसे यहाँ सेव करें।</p>
          </div>
        `
    }
  `;

  librarySection.onclick = async (event) => {
    const viewButton = event.target.closest("[data-prompt-view]");
    const copyButton = event.target.closest("[data-prompt-copy]");
    const deleteButton = event.target.closest("[data-prompt-delete]");

    const id =
      viewButton?.dataset.promptView ||
      copyButton?.dataset.promptCopy ||
      deleteButton?.dataset.promptDelete;

    if (!id) return;

    const items = getPromptLibrary();
    const selected = items.find(item => item.id === id);

    if (!selected) return;

    if (viewButton) {
      showSavedPrompt(selected);
    }

    if (copyButton) {
      try {
        await navigator.clipboard.writeText(selected.prompt);
        showToast("Prompt Copy हो गया!");
      } catch (error) {
        showToast("Copy नहीं हुआ। Prompt को View करके कॉपी करें।");
      }
    }

    if (deleteButton) {
      const confirmed = confirm(
        "क्या आप इस Prompt को Delete करना चाहते हैं?"
      );

      if (!confirmed) return;

      const updated = items.filter(item => item.id !== id);

      if (savePromptLibrary(updated)) {
        renderPromptLibrary();
        showToast("Prompt Delete हो गया।");
      }
    }
  };
}

function showSavedPrompt(item) {
  const oldModal = $("savedPromptModal");

  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");

  modal.id = "savedPromptModal";
  modal.className = "auth-modal open";

  modal.innerHTML = `
    <div class="auth-modal-content prompt-view-modal">
      <button
        class="modal-close"
        id="savedPromptClose">
        ×
      </button>

      <h2>${escapeHTML(item.title)}</h2>
      <p>${escapeHTML(item.studio)}</p>

      <textarea
        id="savedPromptContent"
        readonly
        rows="12">${escapeHTML(item.prompt)}</textarea>

      <div class="prompt-library-actions">
        <button
          class="btn btn-primary"
          id="savedPromptCopy">
          Copy Prompt
        </button>

        <button
          class="btn btn-secondary"
          id="savedPromptDownload">
          Download
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  $("savedPromptClose").onclick = () => modal.remove();

  $("savedPromptCopy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt);
      showToast("Prompt Copy हो गया!");
    } catch (error) {
      showToast("Copy उपलब्ध नहीं है।");
    }
  };

  $("savedPromptDownload").onclick = () => {
    const blob = new Blob(
      [item.prompt],
      { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "UPS-Production-Prompt.txt";
    link.click();

    URL.revokeObjectURL(url);
    showToast("Prompt Download शुरू हो गया!");
  };
}

/* Add Save to Library button */

const previousPromptRender = renderGeneratedPrompt;

renderGeneratedPrompt = function(result) {
  previousPromptRender(result);

  const container = $("generatedPromptText")?.parentElement;

  if (!container) return;

  if ($("savePromptLibraryBtn")) return;

  const button = document.createElement("button");

  button.id = "savePromptLibraryBtn";
  button.className = "btn btn-primary";
  button.textContent = "Save to Prompt Library";

  button.addEventListener("click", savePromptToLibrary);

  container.appendChild(button);
};

/* Add Prompt Library to Projects Page */

const previousProjectsRender = renderDashboardProjects;
if (typeof previousProjectsRender === "function") {
renderDashboardProjects = function() {
   previousProjectsRender();
    renderPromptLibrary();
  };
}

/* Initial Library Setup */

document.addEventListener("DOMContentLoaded", () => {
  renderPromptLibrary();
});

console.log("PART 4O — Prompt Library & History Loaded");
/* =========================================
   PART 4P — QUALITY AUDIT & PRODUCTION CHECK
========================================= */

function runQualityAudit() {
  const checks = [];

  const promptElement = $("generatedPromptText");

  const promptText = promptElement
    ? (promptElement.value || promptElement.textContent || "").trim()
    : "";

  const studio = APP_STATE.currentStudio;
  const answers = APP_STATE.wizard?.answers || {};

  // 1. Studio Check
  checks.push({
    name: "Studio Selection",
    passed: Boolean(studio),
    detail: studio
      ? "Creative Studio selected."
      : "Studio selection अभी बाकी है।"
  });

  // 2. Production Prompt Check
  checks.push({
    name: "Production Prompt",
    passed: promptText.length > 30,
    detail: promptText.length > 30
      ? "Production Prompt तैयार है।"
      : "पहले Production Prompt generate करें।"
  });

  // 3. Configuration Check
  const configResult = validateConfig();

  checks.push({
    name: "Supabase Configuration",
    passed: Boolean(configResult.valid),
    detail: configResult.valid
      ? "Configuration validation passed."
      : "Supabase URL या Publishable Key जाँचें।"
  });

  // 4. Project Information Check
  const projectName =
    answers.topic ||
    answers.subject ||
    answers.activity ||
    "";

  checks.push({
    name: "Project Topic",
    passed: Boolean(String(projectName).trim()),
    detail: projectName
      ? "Project topic उपलब्ध है।"
      : "Project topic अभी सेट नहीं है।"
  });

  // 5. Language Check
  const language =
    answers.language ||
    APP_CONFIG.DEFAULT_LANGUAGE;

  checks.push({
    name: "Language Selection",
    passed: Boolean(language),
    detail: language
      ? "Language preference उपलब्ध है।"
      : "Language select करें।"
  });

  // 6. Output Check
  const output =
    answers.output ||
    answers.format ||
    "";

  checks.push({
    name: "Output Format",
    passed: Boolean(output),
    detail: output
      ? "Output format selected."
      : "Output format select करें।"
  });

  // 7. Core Modules Count Check
  const moduleContainer = $("moduleList");
  const moduleCount = moduleContainer
    ? moduleContainer.children.length
    : 0;

  checks.push({
    name: "Core Modules Display",
    passed: moduleCount === 100,
    detail: moduleCount === 100
      ? "100 Modules displayed."
      : `अभी ${moduleCount} modules दिखाई दे रहे हैं।`
  });

  // 8. Workflow Locks Count Check
  const lockContainer = $("lockList");
  const lockCount = lockContainer
    ? lockContainer.children.length
    : 0;

  checks.push({
    name: "Workflow Locks Display",
    passed: lockCount === 25,
    detail: lockCount === 25
      ? "25 Workflow Locks displayed."
      : `अभी ${lockCount} locks दिखाई दे रहे हैं।`
  });

  const passed = checks.filter(item => item.passed).length;
  const failed = checks.length - passed;

  const percentage = Math.round(
    (passed / checks.length) * 100
  );

  return {
    checks,
    passed,
    failed,
    total: checks.length,
    percentage,
    status: failed === 0 ? "READY" : "NEEDS ATTENTION"
  };
}

function renderQualityAudit() {
  const audit = runQualityAudit();

  let container = $("qualityAuditSection");

  if (!container) {
    container = document.createElement("section");
    container.id = "qualityAuditSection";
    container.className = "quality-audit-section";

    const target = $("generatedPromptText")?.parentElement;

    if (target) {
      target.appendChild(container);
    } else {
      const page = $("page-wizard");

      if (!page) return;

      page.appendChild(container);
    }
  }

  container.innerHTML = `
    <div class="section-heading">
      <div>
        <h2>Production Quality Audit</h2>
        <p>Creative Brief और Production Readiness Check</p>
      </div>

      <span class="audit-score">
        ${audit.percentage}%
      </span>
    </div>

    <div class="audit-summary">
      <div>
        <strong>${audit.passed}</strong>
        <span>Passed</span>
      </div>

      <div>
        <strong>${audit.failed}</strong>
        <span>Needs Attention</span>
      </div>

      <div>
        <strong>${audit.total}</strong>
        <span>Total Checks</span>
      </div>
    </div>

    <div class="audit-status">
      ${audit.status === "READY"
        ? "🟢 PRODUCTION CHECK PASSED"
        : "🟡 IMPROVEMENTS REQUIRED"}
    </div>

    <div class="audit-check-list">
      ${audit.checks.map(check => `
        <div class="audit-check-item">
          <span>
            ${check.passed ? "🟢" : "🔴"}
          </span>

          <div>
            <strong>${escapeHTML(check.name)}</strong>
            <p>${escapeHTML(check.detail)}</p>
          </div>
        </div>
      `).join("")}
    </div>

    <button
      type="button"
      class="btn btn-secondary"
      id="refreshQualityAudit">
      Re-Run Quality Audit
    </button>
  `;

  const refreshButton = $("refreshQualityAudit");

  if (refreshButton) {
    refreshButton.addEventListener(
      "click",
      renderQualityAudit
    );
  }

  return audit;
}

/* Add Audit Button to Production Prompt */

const previousAuditPromptRender = renderGeneratedPrompt;

renderGeneratedPrompt = function(result) {
  previousAuditPromptRender(result);

  const container = $("generatedPromptText")?.parentElement;

  if (!container) return;

  if ($("runQualityAuditBtn")) return;

  const button = document.createElement("button");

  button.id = "runQualityAuditBtn";
  button.type = "button";
  button.className = "btn btn-secondary";
  button.textContent = "Run Production Quality Audit";

  button.addEventListener("click", renderQualityAudit);

  container.appendChild(button);
};

/* Audit Summary Helper */

function getQualityAuditSummary() {
  const audit = runQualityAudit();

  return {
    score: audit.percentage + "%",
    passed: audit.passed,
    needsAttention: audit.failed,
    totalChecks: audit.total,
    status: audit.status
  };
}

console.log(
  "PART 4P — Quality Audit & Production Check Loaded"
);
/* =========================================
   PART 4Q — FINAL INITIALIZATION
   UPS CREATOR STUDIO
========================================= */

(async function initializeUPSStudio() {

  console.log("UPS Creator Studio Initializing...");

  // 1. Basic Application Setup
  function initializeBasicUI() {
    const yearElement = $("year");

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

    if (typeof renderStudios === "function") {
      renderStudios();
    }

    if (typeof renderDashboard === "function") {
      renderDashboard();
    }

    if (typeof renderCoreModules === "function") {
  renderCoreModules();
}

if (typeof renderWorkflowLocks === "function") {
  renderWorkflowLocks();
}

if (typeof renderDashboardProjects === "function") {
  renderDashboardProjects();
}

    if (typeof renderPromptLibrary === "function") {
      renderPromptLibrary();
    }

    if (typeof renderCloudStatus === "function") {
      renderCloudStatus();
    }
  }

  // 2. Restore Existing Supabase Session
  async function restoreUserSession() {

    if (!supabase) {
      console.warn("Supabase is not configured.");

      showToast(
        "Supabase configuration pending. Public mode available."
      );

      return;
    }

    try {
      const { data, error } =
        await supabase.auth.getSession();

      if (error) throw error;

      const session = data?.session;

      if (session?.user) {
        APP_STATE.user = session.user;

        if (typeof updateAuthUI === "function") {
          updateAuthUI(session.user);
        }

        let restoredProfile = null;
        if (typeof loadUserProfile === "function") {
          restoredProfile = await loadUserProfile(session.user);
        }

        if (typeof updateAuthUI === "function") {
          updateAuthUI(session.user, restoredProfile);
        }

        if (typeof loadCloudProjects === "function") {
          await loadCloudProjects();
        }

        if (typeof renderDashboard === "function") {
          renderDashboard();
        }

        console.log("Existing session restored.");

      } else {
        APP_STATE.user = null;

        if (typeof updateAuthUI === "function") {
          updateAuthUI(null);
        }
      }

    } catch (error) {
      console.error("Session Restore Error:", error);

      showToast("Login session check नहीं हो पाया।");
    }
  }

  // 3. Listen for Authentication Changes
  function initializeAuthListener() {

    if (!supabase) return;

    supabase.auth.onAuthStateChange(
      async (event, session) => {

        console.log("Auth Event:", event);

        APP_STATE.user = session?.user || null;

        if (typeof updateAuthUI === "function") {
          updateAuthUI(session?.user || null);
        }

        if (session?.user) {

          if (event === "SIGNED_IN" ||
              event === "TOKEN_REFRESHED") {

            setTimeout(async () => {

              try {
                let activeProfile = null;
                if (typeof loadUserProfile === "function") {
                  activeProfile = await loadUserProfile(session.user);
                }

                if (typeof updateAuthUI === "function") {
                  updateAuthUI(session.user, activeProfile);
                }

                if (typeof loadCloudProjects === "function") {
                  await loadCloudProjects();
                }

                if (typeof renderDashboard === "function") {
                  renderDashboard();
                }

              } catch (error) {
                console.error(
                  "User Data Sync Error:",
                  error
                );
              }

            }, 0);
          }

        } else if (event === "SIGNED_OUT") {

          APP_STATE.projects = [];

          if (typeof renderDashboard === "function") {
            renderDashboard();
          }

        }
      }
    );
  }

  // 4. Validate Core System
  function validateCoreSystem() {

    const results = {
      config: typeof APP_CONFIG !== "undefined",
      studio: Array.isArray(STUDIO_DATA),
      modules: Array.isArray(CORE_MODULES),
      locks: Array.isArray(WORKFLOW_LOCKS),
      promptEngine:
        typeof buildProductionPrompt === "function",
      qualityAudit:
        typeof runQualityAudit === "function"
    };

    const passed = Object.values(results)
      .filter(Boolean).length;

    console.table(results);

    console.log(
      "Core System Check:",
      passed + "/" + Object.keys(results).length
    );

    return results;
  }

  // 5. Initialize Application
  initializeBasicUI();

  validateCoreSystem();

  // Register listener before restoring session
  initializeAuthListener();

  await restoreUserSession();

  // 6. Final Status
  APP_STATE.initialized = true;

  console.log(
    "UPS Creator Studio Initialization Complete."
  );

  window.UPS_CREATOR_STUDIO = {
    version: APP_CONFIG.VERSION,
    state: APP_STATE,
    validate: validateCoreSystem,
    qualityAudit: runQualityAudit,
    promptLibrary: getPromptLibrary,
    buildPrompt: buildProductionPrompt
  };

  showToast("UPS Creator Studio तैयार है!");

})().catch(error => {

  console.error(
    "UPS Creator Studio Fatal Initialization Error:",
    error
  );

});
/* =========================================
   UPS MOBILE REPAIR CENTER
   DIAGNOSIS + SAFE AUTO FIX
========================================= */

(function UPSMobileRepairCenter() {

  if (window.UPS_REPAIR_CENTER) return;

  const errors = [];
  const MAX_ERRORS = 30;

  // Capture JavaScript errors
  window.addEventListener("error", function(e) {
    errors.unshift({
      type: "JavaScript Error",
      message: e.message || "Unknown error",
      file: e.filename || "Unknown file",
      line: e.lineno || 0,
      time: new Date().toLocaleString()
    });

    errors.length = Math.min(errors.length, MAX_ERRORS);
  });

  // Capture rejected promises
  window.addEventListener("unhandledrejection", function(e) {
    errors.unshift({
      type: "Promise Error",
      message: String(e.reason || "Unknown rejection"),
      file: "Promise",
      line: 0,
      time: new Date().toLocaleString()
    });

    errors.length = Math.min(errors.length, MAX_ERRORS);
  });

  function scanWebsite() {
    const results = [];
    const all = document.querySelectorAll("*");

    // Duplicate IDs
    const ids = {};

    document.querySelectorAll("[id]").forEach(el => {
      const id = el.id;
      ids[id] = (ids[id] || 0) + 1;
    });

    Object.keys(ids).forEach(id => {
      if (ids[id] > 1) {
        results.push({
          level: "ERROR",
          title: "Duplicate HTML ID",
          detail: id + " (" + ids[id] + " times)"
        });
      }
    });

    // Buttons without accessible text
    document.querySelectorAll("button").forEach((btn, i) => {
      if (!btn.textContent.trim() &&
          !btn.getAttribute("aria-label") &&
          !btn.querySelector("img[alt]")) {
        results.push({
          level: "WARNING",
          title: "Button label missing",
          detail: "Button #" + (i + 1)
        });
      }
    });

    // Links without destination
    document.querySelectorAll("a").forEach((link, i) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        results.push({
          level: "WARNING",
          title: "Link destination missing",
          detail: "Link #" + (i + 1)
        });
      }
    });

    // Images without alt
    document.querySelectorAll("img").forEach((img, i) => {
      if (!img.hasAttribute("alt")) {
        results.push({
          level: "WARNING",
          title: "Image ALT missing",
          detail: "Image #" + (i + 1)
        });
      }
    });

    // Empty important containers
    [
      "publicView",
      "appView",
      "sidebar",
      "page-dashboard",
      "page-wizard"
    ].forEach(id => {
      if (!document.getElementById(id)) {
        results.push({
          level: "ERROR",
          title: "Important HTML element missing",
          detail: "#" + id
        });
      }
    });

    // JavaScript error report
    errors.forEach(err => {
      results.push({
        level: "ERROR",
        title: err.type,
        detail: err.message + " | " + err.file +
          " | Line: " + err.line
      });
    });

    // Supabase check
    if (!window.UPS_CREATOR_STUDIO) {
      results.push({
        level: "WARNING",
        title: "Application API not initialized",
        detail: "Final initialization object unavailable."
      });
    }

    // Mobile viewport check
    const viewport = document.querySelector(
      'meta[name="viewport"]'
    );

    if (!viewport) {
      results.push({
        level: "WARNING",
        title: "Mobile viewport missing",
        detail: "Check index.html viewport meta tag."
      });
    }

    return results;
  }

  // Safe repairs only
  function runSafeRepairs() {
    let repaired = 0;

    // Buttons without type can accidentally submit forms
    document.querySelectorAll("button").forEach(btn => {
      if (!btn.hasAttribute("type")) {
        btn.setAttribute("type", "button");
        repaired++;
      }
    });

    // Add empty alt to decorative images
    document.querySelectorAll("img:not([alt])").forEach(img => {
      img.setAttribute("alt", "");
      repaired++;
    });

    return repaired;
  }

  function createRepairCenter() {
    if (document.getElementById("upsRepairButton")) return;

    const style = document.createElement("style");

    style.textContent = `
      #upsRepairButton {
        position:fixed;
        right:16px;
        bottom:18px;
        z-index:99998;
        border:0;
        border-radius:30px;
        padding:14px 19px;
        background:#6d5dfc;
        color:white;
        font-size:14px;
        font-weight:700;
        box-shadow:0 5px 25px #0005;
        cursor:pointer;
      }

      #upsRepairPanel {
        position:fixed;
        inset:0;
        z-index:99999;
        background:#080d1b;
        color:#fff;
        padding:18px;
        overflow-y:auto;
        font-family:Arial,sans-serif;
        display:none;
      }

      #upsRepairPanel h2 {
        font-size:23px;
        margin:12px 0;
      }

      .ups-repair-card {
        background:#172238;
        border:1px solid #34435f;
        border-radius:12px;
        padding:13px;
        margin:10px 0;
        overflow-wrap:anywhere;
      }

      .ups-repair-card small {
        color:#b9c7df;
        display:block;
        margin-top:6px;
      }

      .ups-repair-action {
        width:100%;
        padding:14px;
        margin:7px 0;
        border:0;
        border-radius:9px;
        font-weight:bold;
        font-size:15px;
        cursor:pointer;
      }

      .ups-repair-primary {
        background:#6d5dfc;
        color:white;
      }

      .ups-repair-secondary {
        background:#263550;
        color:white;
      }
    `;

    document.head.appendChild(style);

    const button = document.createElement("button");

    button.id = "upsRepairButton";
    button.type = "button";
    button.textContent = "🔧 Repair Center";

    const panel = document.createElement("div");

    panel.id = "upsRepairPanel";

    panel.innerHTML = `
      <h2>🔧 UPS Repair Center</h2>
      <p>Website Diagnosis & Safe Repair</p>

      <div id="upsRepairSummary" class="ups-repair-card">
        अभी वेबसाइट की जाँच नहीं हुई है।
      </div>

      <button class="ups-repair-action ups-repair-primary"
        id="upsRunScan">
        🔍 Scan Website
      </button>

      <button class="ups-repair-action ups-repair-secondary"
        id="upsSafeFix">
        🛠️ Apply Safe Fixes
      </button>

      <button class="ups-repair-action ups-repair-secondary"
        id="upsCopyReport">
        📋 Copy Error Report
      </button>

      <button class="ups-repair-action ups-repair-secondary"
        id="upsClosePanel">
        Close
      </button>

      <div id="upsRepairResults"></div>
    `;

    document.body.append(button, panel);

    button.onclick = () => {
      panel.style.display = "block";
      displayScan();
    };

    document.getElementById("upsClosePanel").onclick = () => {
      panel.style.display = "none";
    };

    document.getElementById("upsRunScan").onclick =
      displayScan;

    document.getElementById("upsSafeFix").onclick = () => {
      const count = runSafeRepairs();

      displayScan();

      alert(
        count + " सुरक्षित सुधार लागू किए गए।"
      );
    };

    document.getElementById("upsCopyReport").onclick =
      async () => {
        const report = JSON.stringify(
          {
            date: new Date().toISOString(),
            url: location.href,
            errors,
            diagnosis: scanWebsite()
          },
          null,
          2
        );

        try {
          await navigator.clipboard.writeText(report);
          alert("Report Copy हो गई।");
        } catch (e) {
          const area = document.createElement("textarea");
          area.value = report;
          panel.appendChild(area);
          area.select();
          alert("Report Select हो गई। Copy करें।");
        }
      };
  }

  function displayScan() {
    const results = scanWebsite();

    const summary =
      document.getElementById("upsRepairSummary");

    const output =
      document.getElementById("upsRepairResults");

    const errorCount = results.filter(
      x => x.level === "ERROR"
    ).length;

    const warningCount = results.filter(
      x => x.level === "WARNING"
    ).length;

    summary.textContent =
      "कुल समस्याएँ: " + results.length +
      " | Errors: " + errorCount +
      " | Warnings: " + warningCount;

    if (!results.length) {
      output.innerHTML = `
        <div class="ups-repair-card">
          🟢 कोई समस्या इस Scan में नहीं मिली।
          <small>यह पूर्ण Functionality Test नहीं है।</small>
        </div>
      `;
      return;
    }

    output.innerHTML = results.map(item => {
      const card = document.createElement("div");

      card.className = "ups-repair-card";

      const title = document.createElement("strong");
      title.textContent =
        (item.level === "ERROR" ? "🔴 " : "🟡 ") +
        item.title;

      const detail = document.createElement("small");
      detail.textContent = item.detail;

      card.append(title, detail);

      return card.outerHTML;
    }).join("");
  }

  function start() {
    createRepairCenter();

    window.UPS_REPAIR_CENTER = {
      scan: scanWebsite,
      repair: runSafeRepairs,
      errors: errors
    };

    console.log("UPS Mobile Repair Center Ready.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();


/* =========================================
   UPS COMPLETE ARCHITECTURE REGISTRY
   100 MODULES · 25 LOCKS · 12 ENGINES · 15 STAGES
   ========================================= */
const UPS_PRODUCTION_ENGINES = [
  ["Theme & Strategy Engine","Selects theme, audience, platform and objective."],
  ["Research & Accuracy Engine","Identifies factual claims and verification needs."],
  ["Story & Script Engine","Builds hooks, structure, narration and dialogue."],
  ["Identity & Character Engine","Maintains supplied identity and character references."],
  ["Performance & Voice Engine","Plans emotion, delivery, pronunciation and lip-sync."],
  ["Scene & Cinematography Engine","Plans scenes, shots, camera and composition."],
  ["Visual Design Engine","Plans typography, layout, color and brand placement."],
  ["Audio & Music Engine","Plans voice, music, effects and synchronization."],
  ["Continuity Engine","Tracks character, wardrobe, location, props and visual continuity."],
  ["Platform & Duration Engine","Calculates runtime, aspect ratio, clip boundaries and safe zones."],
  ["Quality & Safety Engine","Checks clarity, accessibility, privacy, rights and content safety."],
  ["Export & Delivery Engine","Prepares prompt variants, JSON package and render handoff."]
].map((item,index)=>({id:index+1,name:item[0],description:item[1],mode:"rule-based orchestration"}));

const UPS_PODCAST_ENGINES = [
  ["Podcast Content Intelligence", "Plans episode angle, audience, format and discussion value."],
  ["Identity Consistency", "Maintains consistent speaker identity and supplied reference constraints."],
  ["Voice Direction", "Defines speaker tone, pace, pronunciation and delivery guidance."],
  ["Word-Level Audio Sync", "Requires real generated-audio timestamps; never invents word timings."],
  ["Lip-Sync Planning", "Prepares mouth-motion alignment requirements for compatible render tools."],
  ["Expression Direction", "Plans natural facial expressions matched to the spoken meaning."],
  ["Body Language Direction", "Plans gestures, posture and natural speaker movement."],
  ["Animated Text Direction", "Plans readable on-screen text synchronized to verified dialogue."],
  ["Language Accuracy", "Checks Hindi/English wording, spelling, pronunciation and names."],
  ["Cinematic Visual Direction", "Plans studio, camera, lighting, framing and visual continuity."],
  ["Audio & Music Direction", "Plans clean speech, levels, ambience, music and sound effects."],
  ["Transition & Continuity", "Checks speaker turns, scene transitions and continuity."],
  ["Podcast Quality Assurance", "Reviews clarity, factual accuracy, accessibility and output requirements."],
  ["Speaker & Turn Management", "Maintains correct speaker order and conversational turn-taking."],
  ["Audio Alignment & Timecode", "Maps captions and visual events to actual audio timecodes."],
  ["Render & Export Handoff", "Prepares render settings and delivery checklist for an external renderer."]
].map((item,index)=>({id:index+1,name:item[0],description:item[1],mode:"planning / validation; external rendering required"}));

const UPS_WORKFLOW_STAGES = [
  "Input & Reference Intake","Country / Audience / Language","Platform & Output Selection",
  "Category & Topic Intelligence","Auto Theme Recommendation","Creative Brief Generation",
  "Research & Accuracy Review","Hook / Story / Script Development","Identity / Voice / Character Setup",
  "Scene & Clip Breakdown","Visual / Audio Direction","Prompt Variant Generation",
  "Workflow Lock Validation","Quality & Safety Audit","Package Export & Render Handoff"
].map((name,index)=>({id:index+1,name}));

window.UPS_SYSTEM_ARCHITECTURE = {
  modules: CORE_MODULES,
  locks: WORKFLOW_LOCKS,
  engines: UPS_PRODUCTION_ENGINES,
  podcastEngines: UPS_PODCAST_ENGINES,
  stages: UPS_WORKFLOW_STAGES,
  counts: {
    modules: CORE_MODULES.length,
    locks: WORKFLOW_LOCKS.length,
    engines: UPS_PRODUCTION_ENGINES.length,
    podcastEngines: UPS_PODCAST_ENGINES.length,
    stages: UPS_WORKFLOW_STAGES.length
  },
  capabilityNote: "Prompt generation and orchestration are local rule-based functions. Real external AI generation and MP4 rendering require secure provider integration."
};


/* GYAN APEX EMBEDDED EDUCATION HUB — single-entry deployment */
const UPS_GYAN_APEX_EMBEDDED_HTML = "<!doctype html>\n<html lang=\"hi\">\n<head>\n<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>GYAN APEX — Public No-Password Education Auto-Pilot</title>\n<style>\n:root{--bg:#07101f;--panel:#11213a;--line:#304967;--txt:#f4f7ff;--muted:#b7c5d9;--mint:#72f0c5;--gold:#ffd46f;--red:#ff9b9b}\n*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at top,#18375c,#07101f 65%);color:var(--txt);font:15px/1.55 system-ui,-apple-system,\"Noto Sans Devanagari\",sans-serif}main{max-width:1200px;margin:auto;padding:14px}.card,.hero{background:linear-gradient(145deg,#152944,#0d1829);border:1px solid var(--line);border-radius:17px;padding:16px;margin:12px 0;box-shadow:0 10px 28px #0003}.hero{padding:22px;background:linear-gradient(120deg,#19395f,#101a2c)}h1{font-size:clamp(24px,4vw,36px);line-height:1.2;margin:0 0 8px}h2{font-size:21px;margin:0 0 10px}h3{font-size:16px;margin:14px 0 7px}.sub,.note{color:var(--muted)}.badges{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.badge{border:1px solid #427d70;color:var(--mint);padding:4px 9px;border-radius:99px;font-size:12px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.field label{display:block;font-weight:750;margin:9px 0 5px}input,select,textarea{width:100%;background:#071322;border:1px solid #3a526f;color:var(--txt);border-radius:10px;padding:11px;font:inherit}textarea{min-height:90px;resize:vertical}.buttons{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}button{background:var(--mint);color:#062019;border:0;border-radius:10px;padding:11px 14px;font-weight:850;cursor:pointer}button.secondary{background:#263d5b;color:var(--txt);border:1px solid #49617e}button.copygreen{background:#22c55e;color:#052e16;border:1px solid #86efac}button.copygreen:hover{background:#16a34a;color:#fff}button.gold{background:var(--gold);color:#2b2107}.output{white-space:pre-wrap;overflow-wrap:anywhere;background:#060d17;border:1px solid #2b405b;padding:12px;border-radius:10px;min-height:75px;font:13px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}.hint{border-left:3px solid var(--gold);padding:9px 11px;background:#292416;border-radius:5px;color:#fff0c7}.checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.check{background:#091526;border:1px solid #2b405d;border-radius:9px;padding:8px;font-size:13px}.hidden{display:none!important}.err{color:var(--red)}@media(max-width:700px){main{padding:8px}.grid,.checks{grid-template-columns:1fr}.card{padding:12px}}\n\n/* PREMIUM UI/UX UPGRADE — Design by Umesh Prakash Singh */\n:root{--bg:#070b16;--panel:#101a2c;--line:#2b3a55;--txt:#f6f8ff;--muted:#aab8cf;--mint:#70f0c4;--gold:#f6ca72;--red:#ff9b9b;--blue:#83b7ff;--radius:20px}\nhtml{scroll-behavior:smooth;scroll-padding-top:100px}body{background:radial-gradient(ellipse at 12% -10%,#1d4267 0,transparent 38%),radial-gradient(ellipse at 90% 8%,#33284c 0,transparent 30%),linear-gradient(160deg,#070b16,#0b1322 55%,#070b16);font-size:15px;letter-spacing:.01em}main{max-width:1440px;padding:22px clamp(12px,2.5vw,34px) 56px}.card,.hero{border:1px solid #2b3d5b;border-radius:var(--radius);padding:clamp(16px,2vw,28px);margin:18px 0;background:linear-gradient(145deg,rgba(20,34,56,.97),rgba(11,20,35,.97));box-shadow:0 16px 42px rgba(0,0,0,.22),inset 0 1px rgba(255,255,255,.035)}.hero{position:relative;overflow:hidden;padding:clamp(24px,4vw,48px);background:linear-gradient(120deg,rgba(24,54,88,.98),rgba(18,25,45,.98) 58%,rgba(40,32,61,.95))}.hero:after{content:\"\";position:absolute;right:-70px;top:-100px;width:280px;height:280px;border:1px solid rgba(112,240,196,.2);border-radius:50%;box-shadow:0 0 0 30px rgba(112,240,196,.025),0 0 0 65px rgba(112,240,196,.02);pointer-events:none}.hero h1{font-size:clamp(28px,4vw,48px);letter-spacing:-.035em;max-width:900px}.hero .sub{max-width:1000px}.sub,.note{color:var(--muted)}h2{font-size:clamp(19px,2vw,25px);letter-spacing:-.02em;padding-bottom:10px;border-bottom:1px solid rgba(130,160,200,.17)}h3{font-size:16px;letter-spacing:.005em}.badge{background:rgba(112,240,196,.06);border-color:rgba(112,240,196,.35);padding:6px 11px;font-weight:700}.grid{gap:16px}.field{min-width:0}.field label{font-size:13px;letter-spacing:.02em;color:#e4ecfa}input,select,textarea{min-height:46px;background:#080f1d;border:1px solid #3b4f6e;border-radius:12px;padding:12px 13px;transition:border-color .18s,box-shadow .18s}textarea{min-height:110px}input:focus,select:focus,textarea:focus,button:focus-visible,a:focus-visible{outline:2px solid var(--mint);outline-offset:2px;border-color:var(--mint);box-shadow:0 0 0 3px rgba(112,240,196,.1)}button{min-height:44px;border-radius:12px;padding:11px 16px;transition:transform .15s,filter .15s,background .15s;box-shadow:0 4px 12px rgba(0,0,0,.12)}button:hover{filter:brightness(1.06);transform:translateY(-1px)}button:active{transform:translateY(0)}button.secondary{background:#1b2c45;border-color:#425a7a}button.copygreen{background:#22c55e;color:#052e16;border-color:#86efac;font-weight:900}.output{font-size:13px;line-height:1.75;border-radius:13px;border-color:#2a3b57;background:#070d18;padding:15px;min-height:84px}.hint{border-left:3px solid var(--gold);border-radius:0 12px 12px 0;background:rgba(246,202,114,.08);color:#fff0c7;padding:12px 15px}.check{padding:11px;border-radius:12px;line-height:1.45}.checks{gap:9px}.check input{width:auto;min-height:0;accent-color:#70f0c4;margin-right:7px}.hidden{display:none!important}.err{color:var(--red)}\n.apex-nav{position:sticky;top:8px;z-index:50;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;margin:12px 0 20px;border:1px solid rgba(115,147,190,.3);border-radius:16px;background:rgba(8,15,28,.91);backdrop-filter:blur(16px);box-shadow:0 10px 30px rgba(0,0,0,.2)}.apex-nav .brand{font-weight:950;letter-spacing:.08em;color:var(--mint);padding:7px 10px;margin-right:auto}.apex-nav a{color:#eaf1ff;text-decoration:none;border:1px solid transparent;border-radius:10px;padding:8px 11px;font-size:13px;font-weight:750}.apex-nav a:hover{border-color:#3a5b75;background:rgba(112,240,196,.07);color:var(--mint)}.section-kicker{font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:var(--mint);font-weight:900;margin-bottom:6px}.status-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(112,240,196,.3);border-radius:999px;padding:5px 10px;font-size:12px;color:var(--mint);background:rgba(112,240,196,.06)}\n#lock{background:radial-gradient(ellipse at top,#1a3c5e,#070b16 66%)!important}#lock .card{border-color:#355274;background:linear-gradient(145deg,#142944,#0b1423);box-shadow:0 25px 80px #0006}#lock h1{letter-spacing:-.03em}#lock button{font-size:15px;letter-spacing:.04em}\n@media(min-width:1000px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.apex-nav{padding:10px 16px}}@media(max-width:700px){main{padding:8px 10px 32px}.card{padding:15px;margin:12px 0}.hero{padding:23px 18px}.hero:after{opacity:.45;right:-160px}.grid,.checks{grid-template-columns:1fr}.apex-nav{top:4px;gap:5px;padding:7px}.apex-nav .brand{width:100%;padding:3px 6px}.apex-nav a{flex:1 1 auto;text-align:center;padding:9px 7px;font-size:12px}.buttons button{flex:1 1 145px}.output{font-size:12px;padding:12px}input,select,textarea{font-size:16px}}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{transition:none!important;animation:none!important}}\n\n</style></head><body>\n<main id=\"app\">\n<div class=\"card\" role=\"status\" style=\"border-color:#b78b35;background:rgba(80,58,16,.22)\"><strong>PUBLIC ACCESS · NO PASSWORD</strong><p class=\"sub\" style=\"margin:6px 0 0\">यह संस्करण बिना लॉगिन चलता है। ऑनलाइन प्रकाशित करने पर लिंक रखने वाला कोई भी व्यक्ति इसे खोल सकता है। संवेदनशील या निजी जानकारी यहाँ न रखें।</p></div>\n<nav class=\"apex-nav\" aria-label=\"Main navigation\"><span class=\"brand\">GYAN APEX</span><a href=\"#control\">Control Panel</a><a href=\"#profiles\">Profiles</a><a href=\"#outputs\">Generated Outputs</a><a href=\"#qa-section\">QA Review</a></nav>\n<section class=\"hero\"><h1>GYAN EDUCATION<br>APEX ULTRA HYBRID AUTO-PILOT · FINAL</h1><div class=\"sub\">School Admissions: Prep–IX & XI • College / Higher Education • Subjects • Activities • Admissions • Parents • Transport • Safety • Faculty • Campus • Exams • Events • Posters • Reels • Notices</div><div class=\"badges\"><span class=\"badge\">School + College Category Library</span><span class=\"badge\">1000+ Topic Combinations</span><span class=\"badge\">Institution-specific lists</span><span class=\"badge\">9:16 default</span><span class=\"badge\">One-click build</span><span class=\"badge\">Hindi + English</span></div><p class=\"hint\"><b>Institution lock:</b> Gyan Public School admission range confirmed by user and cross-checked with official admission page: Prep/Nursery-to-IX and XI; exact session availability must be reconfirmed before publishing. Gyan Mahavidyalaya = higher education/college courses. B.Ed, B.Sc, M.Com, D.El.Ed, BCA and subjects such as Chemistry, Physics, Biology are user-provided examples; exact course availability, affiliation, eligibility, fees, seats, dates and faculty must be verified from official college sources before publication. Never mix school and college branding unintentionally.</p><p class=\"sub\"><b>Design & Development by Umesh Prakash Singh</b> · Final APEX Build</p></section>\n<section class=\"card\" id=\"control\"><div class=\"section-kicker\">Workspace · Configure</div><h2>01 · MASTER CONTROL PANEL</h2><div class=\"grid\">\n<div class=\"field\"><label for=\"institution\">Institution</label><select id=\"institution\"><option value=\"school\">Gyan Public School — Prep–IX & XI admissions</option><option value=\"college\">Gyan Mahavidyalaya — College / Higher Education</option><option value=\"both\">Combined campaign — both institutions</option></select></div>\n<div class=\"field\"><label for=\"outputType\">Output type</label><select id=\"outputType\"><option>Poster / Thumbnail</option><option>Video / Reel Prompt</option><option>Poster + Video + Caption Bundle</option><option>Educational Carousel</option><option>Parent / Student Notice</option><option>Admission Information Pack</option><option>Activity Calendar Pack</option><option>Event Recap</option><option>Subject Explainer</option><option>Course Awareness Poster</option></select></div>\n<div class=\"field\"><label for=\"category\">Category</label><select id=\"category\"></select></div><div class=\"field\"><label for=\"topic\">Activity / Subject / Topic</label><select id=\"topic\"></select></div>\n<div class=\"field\"><label for=\"customTopic\">Custom topic (optional)</label><input id=\"customTopic\" placeholder=\"e.g. Class 4 reading / B.Sc Chemistry practical\"></div>\n<div class=\"field\"><label for=\"course\">Course / Class / Subject</label><select id=\"course\"></select></div>\n<div class=\"field\"><label for=\"campaign\">Session / Campaign</label><input id=\"campaign\" value=\"School Session 2027–28 / College session — verify official dates\"></div>\n<div class=\"field\"><label for=\"ratio\">Aspect ratio</label><select id=\"ratio\"><option>9:16 Vertical Story / Reel</option><option>3:4 Portrait Post</option><option>1:1 Square</option><option>16:9 Landscape</option></select></div>\n<div class=\"field\"><label for=\"platform\">Platform</label><select id=\"platform\"><option>All platforms</option><option>Instagram Reels / Stories</option><option>Facebook Reels / Posts</option><option>YouTube Shorts</option><option>WhatsApp Parent / Student Group</option><option>School / College Website</option></select></div>\n<div class=\"field\"><label for=\"language\">Language</label><select id=\"language\"><option>Hindi + English</option><option>Hindi</option><option>English</option></select></div>\n<div class=\"field\"><label for=\"style\">Visual style</label><select id=\"style\"><option>Ultra Premium Hybrid Cinematic</option><option>Bright Child-Friendly Education</option><option>Premium Academic Editorial</option><option>Photorealistic Documentary</option><option>Clean Infographic</option><option>Festive / Cultural</option><option>Modern College Campaign</option></select></div>\n<div class=\"field\"><label for=\"duration\">Video duration</label><select id=\"duration\"><option>10 seconds</option><option>15 seconds</option><option>20 seconds</option><option>30 seconds</option></select></div>\n<div class=\"field\"><label for=\"dialogue\">Exact dialogue / text (optional)</label><textarea id=\"dialogue\" placeholder=\"Exact wording डालें। खाली होने पर suggested copy को स्पष्ट रूप से suggestion label किया जाएगा।\"></textarea></div>\n<div class=\"field\"><label for=\"date\">Activity date (optional)</label><input id=\"date\" type=\"date\"></div>\n<div class=\"field\"><label for=\"reference\">Reference files</label><select id=\"reference\"><option>No reference files attached</option><option>Original logo, building and uniform will be attached</option><option>Original student/activity photo will be attached</option><option>Original college/campus/course photos will be attached</option><option>All original reference assets will be attached</option></select></div>\n<div class=\"field\"><label for=\"contact\">Address / contact footer (selected institution only)</label><select id=\"contact\"><option value=\"full\">Full verified institution address + phone + website</option><option value=\"short\">Short address: Near Gyan Mahavidyalaya, Agra Road, Aligarh</option><option value=\"web\">Website only</option><option value=\"none\">No contact footer</option></select><small class=\"sub\">School चुना है तो केवल School का पता/फोन; College चुना है तो केवल College का पता/फोन। Combined campaign में दोनों संस्थानों के अलग assets बनाएं।</small></div>\n</div>\n<h3>Mandatory locks</h3><div class=\"checks\">\n<label class=\"check\"><input type=\"checkbox\" checked> Institution separation lock</label><label class=\"check\"><input type=\"checkbox\" checked> School admission scope: Prep–IX & XI (verify current session)</label><label class=\"check\"><input type=\"checkbox\" checked> College courses require verification</label><label class=\"check\"><input type=\"checkbox\" checked> Original logo only if supplied</label><label class=\"check\"><input type=\"checkbox\" checked> Real building/campus reference only</label><label class=\"check\"><input type=\"checkbox\" checked> Uniform consistency for school students</label><label class=\"check\"><input type=\"checkbox\" checked> Keep supplied real photos unaltered where possible</label><label class=\"check\"><input type=\"checkbox\" checked> Child photo permission and privacy</label><label class=\"check\"><input type=\"checkbox\" checked> Verify dates, fees, eligibility and claims</label><label class=\"check\"><input type=\"checkbox\" checked> No fake results, testimonials or facilities</label><label class=\"check\"><input type=\"checkbox\" checked> Hindi spelling and safe margins</label><label class=\"check\"><input type=\"checkbox\" checked> No identity matching claims without references</label>\n</div><div class=\"buttons\"><button onclick=\"build()\">BUILD ALL OUTPUTS</button><button class=\"copygreen\" onclick=\"copyOut('poster')\">🟢 COPY POSTER</button><button class=\"copygreen\" onclick=\"copyOut('video')\">🟢 COPY VIDEO</button><button class=\"copygreen\" onclick=\"copyOut('ytcreate')\">🟢 COPY YT CREATE ≤900</button><button class=\"copygreen\" onclick=\"copyOut('sequence')\">🟢 COPY SEQUENCE</button><button class=\"copygreen\" onclick=\"copyOut('caption')\">🟢 COPY CAPTION</button><button class=\"copygreen\" onclick=\"copyOut('all')\">🟢 COPY COMPLETE PACK</button><button class=\"gold\" onclick=\"resetAll()\">RESET</button></div></section>\n<section class=\"card\" id=\"profiles\"><div class=\"section-kicker\">Verified identity · Keep institutions separate</div><h2>02 · INSTITUTION PROFILE</h2><div class=\"grid\"><div><h3>Gyan Public School</h3><div class=\"output\">Admission range: Prep–IX and XI (as confirmed; recheck current session availability)\nSchool address: Agra Road, Aligarh – 202002 (U.P.); short locator option: Near Gyan Mahavidyalaya, Agra Road, Aligarh\nPhone: +91 70088 00300\nWebsite: gpsaligarh.com</div></div><div><h3>Gyan Mahavidyalaya</h3><div class=\"output\">College address: Agra Road, Aligarh, Uttar Pradesh 202002 (official site lists Agra Road, Aligarh)\nPhone: +91 92194 19405 / +91 94125 96440\nUser-mentioned course examples: B.Ed, B.Sc, M.Com, D.El.Ed, BCA.\nUser-mentioned subjects: Chemistry, Physics, Biology; add other subjects only after checking current course/subject offerings.</div></div></div></section>\n<section class=\"card\" id=\"outputs\"><div class=\"section-kicker\">Production desk · Copy-ready deliverables</div><h2>03 · GENERATED OUTPUTS</h2><h3>Auto-detection / scope report</h3><div id=\"report\" class=\"output\">BUILD ALL OUTPUTS दबाएँ।</div><h3>Poster / Thumbnail Prompt</h3><div id=\"poster\" class=\"output\">—</div><h3>Video / Reel Prompt — Detailed</h3><div id=\"video\" class=\"output\">—</div><h3>YT Create Prompt (automatic ≤900 characters, no institution/developer name)</h3><div id=\"ytcreate\" class=\"output\">—</div><div id=\"ytcount\" class=\"hint\">YT Create character count: Build outputs दबाएँ।</div><h3>Sequential Clip / Continuity Plan</h3><div id=\"sequence\" class=\"output\">—</div><h3>Caption + Hashtags</h3><div id=\"caption\" class=\"output\">—</div><h3>Carousel / Notice copy</h3><div id=\"notice\" class=\"output\">—</div><h3>Activity / Subject checklist</h3><div id=\"activity\" class=\"output\">—</div><h3>Suggested Month-by-Month Calendar</h3><div id=\"calendar\" class=\"output\">—</div><h3>Final QA</h3><div id=\"qa\" class=\"output\">—</div></section>\n<section class=\"card\" id=\"qa-section\"><div class=\"section-kicker\">Pre-publish gate · Final checklist</div><h2>04 · COMPLETE COVERAGE CHECKLIST</h2><div id=\"coverage\" class=\"checks\"></div></section>\n<section class=\"card\"><h2>05 · IMPORTANT WORKFLOW</h2><div class=\"output\">1. अपने approved email/password से सुरक्षित sign in करें।\n2. Institution चुनें—School, College या Combined.\n3. Category, activity/topic और class/course चुनें।\n4. Custom topic, exact dialogue, date और output format जरूरत के अनुसार भरें।\n5. BUILD ALL OUTPUTS दबाएँ; prompts और captions बनेंगे।\n6. वास्तविक logo, building, uniform, students, lab या campus फोटो external image/video generator में manually attach करें।\n7. पोस्ट करने से पहले official course availability, eligibility, dates, fee, contact, policy और spelling verify करें।\n8. यह HTML prompt/copy बनाता है—AI image/video render नहीं करता और किसी external service को control नहीं करता।<br>9. किसी भी डिवाइस पर उपयोग के लिए इस HTML को HTTPS static hosting पर publish करें और Supabase Authentication → URL Configuration में वास्तविक hosted URL जोड़ें। Password recovery file:// local file से काम नहीं करेगी।</div></section>\n\n<section class=\"card\"><h2>06 · OFFICIAL PROFILE & DIGITAL PRESENCE CHECK</h2>\n<p class=\"sub\">यह सेक्शन वेबसाइटों पर दिखे links और verified content areas को अलग रखता है। किसी social account का वर्तमान admin/ownership, followers, posting activity या Google rating इस HTML से live verify नहीं होता।</p>\n<div class=\"grid\">\n<div><h3>Gyan Public School</h3><div class=\"output\">Official website: https://gpsaligarh.com/\nInstagram linked from school website: https://www.instagram.com/gyanpublicschoolaligarh\nFacebook linked from school website: https://facebook.com/gyanpublicschoolaligarh\nYouTube linked from school website: https://www.youtube.com/@gpsaligarh\nGoogle Maps link on school website: https://maps.app.goo.gl/8oB2DYdFwQrfCbCr7\nPhone on website: +91 70088 00300\nEmail on website: gyanpublicschoolaligarh@gmail.com</div></div>\n<div><h3>Gyan Mahavidyalaya</h3><div class=\"output\">Official website: https://gyanmahavidhyalaya.com/\nCourse / programme page: https://gyanmahavidhyalaya.com/Curriculum.aspx\nAdmission enquiry: https://gyanmahavidhyalaya.com/ApplyOnline.aspx\nDownloads / activity resources: https://gyanmahavidhyalaya.com/Downloads.aspx\nContact: https://gyanmahavidhyalaya.com/CONTACT-Us.aspx\nFacebook group linked from college website: https://www.facebook.com/groups/237127733054225\nCollege website Instagram button resolved only to Instagram home in this check; exact official handle remains UNVERIFIED.\nPhone: +91-9219419405 | Email: gyanmv@gmail.com</div></div>\n</div>\n<h3>Google / Social / Website content checklist</h3>\n<div class=\"checks\">\n<div class=\"check\">Google Business Profile: name, category, address, phone, hours, map pin, website, photos, posts, Q&A and review responses. Check/edit only with authorized account access.</div>\n<div class=\"check\">Instagram: bio, logo/avatar, institution-specific handle, contact button, highlights, reels, story covers, captions, hashtags, accessibility and consent.</div>\n<div class=\"check\">Facebook: page details, address/contact, pinned admission post, event posts, albums, inbox responses, reviews/recommendations where enabled.</div>\n<div class=\"check\">YouTube: channel branding, About section, Shorts, thumbnails, playlist groups and official links. School link found: @gpsaligarh.</div>\n<div class=\"check\">Website: homepage, About, admissions, courses/classes, prospectus, calendar, notices, gallery, facilities, contact, forms, privacy and broken-link checks.</div>\n<div class=\"check\">WhatsApp: use official opt-in communication, parent/student notice templates and approved contact; avoid public sharing of personal student data.</div>\n<div class=\"check\">School-specific: class-wise learning, reading, homework, assessment, PTM, bus safety, uniforms, child safeguarding, sports, art, clubs, festivals and student achievements.</div>\n<div class=\"check\">College-specific: courses, eligibility, fees, prospectus, affiliation, subject combinations, admission dates, exam notices, practicals, library, departments, NSS, journals and campus activities.</div>\n<div class=\"check\">Content calendar: daily/weekly/monthly themes, national days, institutional calendar, admission milestones, exam windows and post-event recaps; confirm every date.</div>\n<div class=\"check\">Creative production: poster, thumbnail, reel/video, carousel, story/status, caption, hashtags, voice/dialogue, subtitle, CTA and output-specific QA.</div>\n<div class=\"check\">SEO/local discovery: institution name consistency, location keywords, page titles, meta descriptions, image alt text, map pin, contact consistency and review response process.</div>\n<div class=\"check\">Trust and compliance: no fake claims, invented results, unverified facilities, unapproved fee/date, false accreditation, unconsented child photos or altered school logo.</div>\n</div>\n<p class=\"hint\">Profile audit status: WEBSITE LINKS FOUND; social profile pages were not fully inspectable in this check. Do not assume followers, ratings, recent activity, account ownership or profile completeness without opening each account directly while signed into an authorized account.</p>\n</section>\n<section class=\"card\"><h2>07 · FINAL RELEASE & MANUAL PASS CHECK</h2>\n<div class=\"checks\">\n<div class=\"check\">PASS — HTML structure and embedded JavaScript syntax checked.</div>\n<div class=\"check\">PASS — School and college topic libraries remain separated by institution selection.</div>\n<div class=\"check\">PASS — Build, copy, reset, category/topic and course selectors are wired in the local page.</div>\n<div class=\"check\">PASS — Output includes poster, video, caption, notice, activity checklist, calendar suggestion and QA.</div>\n<div class=\"check\">PASS — Official college website pages and course/contact pages cross-checked against the current public site.</div>\n<div class=\"check\">PASS WITH LIMITATION — School social links are listed as linked from its website; live profile status is not certified.</div>\n<div class=\"check\">MANUAL CHECK REQUIRED — Google Business Profile ownership, hours, map pin, photos, reviews and current edits require authorised account access.</div>\n<div class=\"check\">MANUAL CHECK REQUIRED — Instagram/Facebook/YouTube current ownership, posting activity, followers, messages and profile completeness.</div>\n<div class=\"check\">MANUAL CHECK REQUIRED — Verify dates, official school class range, current college courses, fees, eligibility, affiliations, contact details and approved calendar before publishing.</div>\n<div class=\"check\">MANUAL CHECK REQUIRED — Test the generated prompt in the target image/video tool and inspect the final render on mobile.</div>\n</div>\n<p class=\"hint\">“PASS” means the local HTML/JavaScript structure and listed workflow were reviewed; it does not mean external profiles, Google listings, institution facts, or future generated media are automatically certified. This tool does not connect to Google/Meta accounts or fetch live analytics.</p>\n<p class=\"sub\" style=\"text-align:center;margin-top:18px\"><b>Design & Development by Umesh Prakash Singh</b><br>GYAN APEX · ULTRA HYBRID EDUCATION AUTO-PILOT · FINAL<br>Standalone HTML + Supabase Auth • Hosting and live login/recovery must be tested • Use only authorised institutional information</p>\n</section>\n\n</main>\n<script>\nconst schoolCats={\n\"Admissions & Enrolment\":[\"Admission open announcement\",\"Admission process overview\",\"Application form awareness\",\"Documents checklist reminder\",\"Eligibility reminder — verify official policy\",\"Parent enquiry FAQ\",\"Campus visit invitation\",\"New session welcome\",\"Admission counselling desk\",\"Application submission steps\",\"Admission deadline reminder — verify date\",\"New student orientation\",\"School session launch\",\"How to prepare for school entry\",\"Admission myths vs facts\",\"School admission contact card\",\"Admission information carousel\",\"Parent-school communication\",\"Admission helpdesk explainer\",\"Admission campaign hero poster\"],\n\"Classroom Learning\":[\"Interactive lesson\",\"Question of the day\",\"Think-pair-share activity\",\"Group learning\",\"Hands-on lesson\",\"Class discussion etiquette\",\"Problem-solving challenge\",\"Daily learning recap\",\"Learning objective of the day\",\"Visual learning activity\",\"Peer teaching\",\"Classroom curiosity corner\",\"Concept map activity\",\"Teacher-led demonstration\",\"Student explanation moment\",\"Learning station rotation\",\"Classroom teamwork\",\"Lesson recap reel\",\"Learning through examples\",\"Student reflection\"],\n\"Reading & Library\":[\"Daily reading habit\",\"Read-aloud session\",\"Storybook discussion\",\"Library reading hour\",\"New vocabulary activity\",\"Reading comprehension challenge\",\"Silent reading routine\",\"Paired reading\",\"Hindi reading practice\",\"English reading practice\",\"Book review by students\",\"Reading fluency practice\",\"Reading corner showcase\",\"Reading with expression\",\"Reading week campaign\",\"Family reading encouragement\",\"Word of the day\",\"Story sequencing\",\"Dictionary skills\",\"Reading progress celebration\"],\n\"Writing & Language\":[\"Hindi handwriting\",\"English handwriting\",\"Creative writing prompt\",\"Paragraph writing\",\"Essay-writing activity\",\"Letter writing basics\",\"Story ending challenge\",\"Vocabulary journal\",\"Punctuation practice\",\"Picture-based writing\",\"Daily journal habit\",\"Poem writing\",\"Spelling practice\",\"Grammar activity\",\"Hindi poem recitation\",\"English extempore\",\"Hindi Diwas activity\",\"Spell Bee\",\"Storytelling\",\"Show and tell\"],\n\"Mathematics\":[\"Mental maths challenge\",\"Tables practice\",\"Number sense activity\",\"Shape hunt\",\"Fractions with objects\",\"Measurement activity\",\"Pattern recognition\",\"Math puzzle\",\"Addition strategies\",\"Subtraction strategies\",\"Multiplication concept\",\"Division with groups\",\"Geometry drawing\",\"Time-reading practice\",\"Money maths\",\"Data chart interpretation\",\"Logical reasoning\",\"Maths relay\",\"Estimate then measure\",\"Maths quiz\"],\n\"Science & Environment\":[\"Science question of the day\",\"Plant observation journal\",\"Water cycle model\",\"States of matter concept\",\"Simple machines\",\"Magnets exploration\",\"Light and shadow\",\"Sound around us\",\"Weather observation\",\"Human senses\",\"Animal habitats\",\"Seed germination observation\",\"Reduce-reuse-recycle\",\"Science lab safety\",\"Observation vs conclusion\",\"Space and planets\",\"Science fair project\",\"Nature walk discoveries\",\"World Environment Day\",\"Plantation activity\"],\n\"Sports & Fitness\":[\"Volleyball activity\",\"Football skills\",\"Cricket practice\",\"Chess competition\",\"Carrom competition\",\"Yoga for focus\",\"Warm-up routine\",\"Relay race\",\"Sportsmanship lesson\",\"Teamwork through sports\",\"Rules before play\",\"Hydration reminder\",\"Fair play pledge\",\"National Sports Day\",\"Inclusive games\",\"Sports day preparation\",\"Balance and coordination\",\"Fitness activity\",\"Sports recap\",\"Celebrating effort\"],\n\"Art, Craft & Creativity\":[\"Colour day\",\"Drawing competition\",\"Paper craft\",\"Best out of waste\",\"Greeting card making\",\"Origami\",\"Nature collage\",\"Poster-making activity\",\"Clay modelling\",\"Creative bookmark\",\"Festival craft\",\"Classroom display board\",\"Pattern art\",\"Leaf printing\",\"Paper flowers\",\"Student art gallery\",\"Floral rangoli\",\"Rakhi making\",\"Sit and draw\",\"Creative activity of the week\"],\n\"Parents & Communication\":[\"Parent-teacher meeting notice\",\"How to prepare for PTM\",\"Home reading routine\",\"Homework support tips\",\"Parent orientation\",\"School diary reminder\",\"Attendance partnership\",\"Screen-time balance\",\"Morning routine for children\",\"Exam preparation support\",\"Parent feedback invitation\",\"School event invitation\",\"Parent notice summary\",\"Official communication channels\",\"Document submission reminder\",\"Uniform reminder\",\"Books and stationery reminder\",\"School timing notice — verify\",\"Holiday notice — verify\",\"Parent permission for photos\"],\n\"School Bus & Transport\":[\"School bus safety rules\",\"Queue safely at bus stop\",\"Boarding and exiting with supervision\",\"Safe pickup authorisation\",\"Never run near a moving bus\",\"Wait in designated safe area\",\"Road-crossing awareness\",\"Respectful bus behaviour\",\"Keep aisle clear\",\"Emergency instructions from staff\",\"Parent pickup reminder\",\"Transport route info — verify\",\"Bus timing update — official only\",\"School gate traffic safety\",\"Transport enquiry contact card\",\"Driver distraction awareness\",\"Bus safety week\",\"Student transport checklist\",\"Safe arrival reminder\",\"Transport policy FAQ — verify\"],\n\"Safety, Health & Hygiene\":[\"Trusted adults at school\",\"Photo and online privacy\",\"Bullying prevention awareness\",\"Safe playground habits\",\"Road safety\",\"Handwashing steps\",\"Clean drinking water reminder\",\"Keep classroom tidy\",\"Cough and sneeze etiquette\",\"Personal hygiene routine\",\"Clean desk challenge\",\"Healthy daily routine\",\"Rest and hydration reminder\",\"Clean hands before eating\",\"School cleanliness drive\",\"Lab safety reminder\",\"Emergency drill awareness\",\"Report a concern to trusted staff\",\"No personal details in public posts\",\"Guardian consent reminder\"],\n\"Assembly, Values & Life Skills\":[\"Morning assembly highlights\",\"Thought for the day\",\"Student anchoring practice\",\"Value of the week\",\"Public speaking practice\",\"Respect and kindness\",\"Honesty in everyday choices\",\"Responsibility for belongings\",\"Teamwork challenge\",\"Patience and practice\",\"Listening with empathy\",\"Gratitude activity\",\"Non-violent communication\",\"Punctuality habit\",\"Courage to ask questions\",\"Fairness in games\",\"Polite language\",\"Good manners\",\"Unity and patriotism\",\"Moral values activity\"],\n\"Exams & Progress\":[\"Exam timetable reminder — verify\",\"Study plan tips\",\"Revision timetable\",\"Read a question carefully\",\"Exam stationery checklist\",\"Time management\",\"Academic honesty\",\"Learning from mistakes\",\"Revision flashcards\",\"Parents supporting exam readiness\",\"Assessment feedback awareness\",\"Result declaration — verify\",\"How to read a report card\",\"Progress conversation guide\",\"Celebrate effort and growth\",\"Set a learning goal\",\"Avoid public ranking/shaming\",\"Exam encouragement\",\"Post-exam reflection\",\"Teacher consultation reminder\"],\n\"Events, Festivals & National Days\":[\"Independence Day activity\",\"Republic Day poster\",\"Constitution Day awareness\",\"Gandhi Jayanti learning\",\"Ambedkar Jayanti awareness\",\"Children's Day celebration\",\"Teachers' Day appreciation\",\"Diwali craft activity\",\"Holi safety and respect\",\"Eid greeting activity\",\"Christmas celebration\",\"Raksha Bandhan craft\",\"Janmashtami activity\",\"Dussehra learning activity\",\"Basant Panchami activity\",\"Guru Purnima\",\"Festival dates must be verified\",\"Cultural diversity poster\",\"School event invitation\",\"Event recap with consent\"],\n\"Student Achievements & Clubs\":[\"Student effort spotlight\",\"Competition participation\",\"Reading milestone\",\"Artwork showcase with consent\",\"Sportsmanship recognition\",\"Team project highlight\",\"Science model showcase\",\"Quiz participation\",\"Public speaking milestone\",\"Kindness recognition\",\"Creative writing showcase\",\"Music performance highlight\",\"Chess achievement — verify\",\"Carrom achievement — verify\",\"Award ceremony recap\",\"Celebrate effort inclusively\",\"Quiz competition\",\"Debate competition\",\"Science club idea\",\"Student leadership activity\"],\n\"Digital Learning & Website\":[\"Digital citizenship basics\",\"Keyboard practice\",\"Computer lab rules\",\"Fact-check a web claim\",\"Responsible AI awareness\",\"Privacy before posting\",\"Digital presentation activity\",\"Coding logic puzzle\",\"Online kindness\",\"Avoid unknown links\",\"School website awareness\",\"Official contact card\",\"Verified school calendar\",\"School social media guidelines\",\"No fake screenshots\",\"Digital footprint awareness\",\"School news recap\",\"Reel cover design\",\"Caption and hashtag pack\",\"Verify links before posting\"],\n\"Teachers & Campus\":[\"Teacher introduction with consent\",\"Teachers' Day appreciation\",\"Teacher planning behind a lesson\",\"Classroom preparation\",\"Staff teamwork\",\"Teaching aid creation\",\"Teacher-student encouragement\",\"Campus orientation with real photos\",\"School building photo feature\",\"Library tour if available\",\"Science lab tour if available\",\"Computer room tour if available\",\"Campus map — verified\",\"Noticeboard tour\",\"Playground safety\",\"Facility care message\",\"Never invent facilities\",\"Teacher appreciation\",\"School values\",\"School profile introduction\"],\n\"Pre-primary / Early Years\":[\"Colour recognition\",\"Shapes around us\",\"Story circle\",\"Action rhymes\",\"Fine motor skills craft\",\"Sorting and matching\",\"Play-based counting\",\"Picture talk\",\"Show and tell\",\"Safe sensory play with supervision\",\"My school routine\",\"Sharing and turn-taking\",\"Simple puzzle time\",\"Nature observation\",\"Alphabet sound awareness\",\"Early reading corner\",\"Good habits story\",\"Movement and rhythm\",\"Weekly creative activity\",\"Family-school transition support\"],\n\"Primary Classes 1–5\":[\"Reading buddies\",\"Hands-on maths\",\"Science observation\",\"Classroom helper roles\",\"Creative writing\",\"Group art project\",\"Vocabulary wall\",\"Nature journal\",\"Story sequencing\",\"GK picture quiz\",\"Team-building game\",\"Library passport\",\"Poem recitation\",\"Show and tell\",\"Healthy habits poster\",\"Community helpers\",\"Map skills\",\"Weekly reflection\",\"Tables practice\",\"Drawing competition\"],\n\"Middle Classes 6–8\":[\"Project-based learning\",\"Debate and discussion\",\"Science investigation planning\",\"Research skills\",\"Digital citizenship\",\"Peer tutoring\",\"Book review\",\"Maths reasoning challenge\",\"Environment survey — real data only\",\"Student-led assembly\",\"Group presentation\",\"Creative writing workshop\",\"Quiz league\",\"Art and design challenge\",\"Leadership activity\",\"Media literacy\",\"Study skills\",\"Team sportsmanship\",\"Coding logic puzzle\",\"Career curiosity session\"],\n\"Secondary Classes 9–10\":[\"Board-exam study habits — verify board\",\"Concept revision\",\"Science practical preparation\",\"Maths problem-solving\",\"English writing practice\",\"Hindi literature discussion\",\"Time management\",\"Academic integrity\",\"Note-making methods\",\"Career exploration without promises\",\"Supportive exam message\",\"Peer study group\",\"Question analysis\",\"Practice paper — approved source\",\"Digital research literacy\",\"Project documentation\",\"Presentation skills\",\"Teacher consultation reminder\",\"Learning goal tracker\",\"Subject revision plan\"],\n\"Class XI Learning (verify current subjects)\":[\"Subject awareness — verify offered streams\",\"Physics concept explainer\",\"Chemistry concept explainer\",\"Biology concept explainer\",\"Mathematics problem-solving\",\"English communication\",\"Hindi writing practice\",\"Practical file organisation\",\"Lab safety\",\"Study plan for board exams\",\"Academic integrity\",\"Career awareness\",\"Entrance exam awareness — verify details\",\"Scholarship awareness — verify\",\"Time management\",\"Project and practical preparation\",\"Research skills\",\"Peer learning group\",\"Subject selection guidance — official policy only\",\"College pathway awareness\"]\n};\nconst collegeCats={\n\"College Admissions\":[\"Admission enquiry guide\",\"Application process overview\",\"Eligibility checklist — verify official prospectus\",\"Required documents — verify\",\"Admission deadline — verify\",\"Fee structure — official source only\",\"Scholarship information — verify\",\"Counselling desk information\",\"Course selection awareness\",\"New session orientation\",\"Application form guide\",\"Admission FAQ\",\"Campus visit invitation\",\"Student document checklist\",\"Merit list notice — official only\",\"Seat availability — verify\",\"Affiliation and recognition — verify\",\"Anti-ragging awareness\",\"College contact card\",\"Admission campaign poster\"],\n\"Teacher Education — B.Ed\":[\"B.Ed course awareness — availability verify\",\"Teacher education introduction\",\"Lesson planning basics\",\"Classroom management concepts\",\"Child development learning topic\",\"Teaching-learning materials\",\"Micro-teaching overview\",\"Assessment and feedback concepts\",\"Inclusive education awareness\",\"Educational psychology topic\",\"Teaching practice preparation\",\"School internship awareness — verify\",\"Reflective teaching journal\",\"Digital pedagogy\",\"Classroom communication\",\"Education philosophy topic\",\"Teaching aptitude practice\",\"Teacher ethics awareness\",\"Curriculum planning concept\",\"B.Ed admission checklist — verify\"],\n\"Teacher Education — D.El.Ed\":[\"D.El.Ed course awareness — availability verify\",\"Foundational literacy topic\",\"Foundational numeracy topic\",\"Child-centred pedagogy\",\"Early childhood learning\",\"Teaching aid preparation\",\"Story-based teaching\",\"Activity-based learning\",\"Classroom observation journal\",\"Inclusive classroom awareness\",\"Learning assessment basics\",\"Lesson plan template\",\"School experience preparation\",\"Teacher communication skills\",\"Play-based pedagogy\",\"Multilingual classroom awareness\",\"Child safeguarding basics\",\"Teaching practice reflection\",\"D.El.Ed admission checklist — verify\",\"Education policy topic — source-check\"],\n\"Science — B.Sc\":[\"B.Sc course awareness — verify subjects\",\"Physics concept explainer\",\"Chemistry concept explainer\",\"Biology concept explainer\",\"Botany topic — verify course offering\",\"Zoology topic — verify course offering\",\"Mathematics concept explainer\",\"Environmental science topic — verify\",\"Practical file guidance\",\"Laboratory safety\",\"Scientific method\",\"Observation and inference\",\"Research poster\",\"Science quiz\",\"Lab equipment awareness\",\"Data interpretation\",\"Project presentation\",\"Scientific writing basics\",\"B.Sc admission checklist — verify\",\"Career pathways — no guarantees\"],\n\"Physics\":[\"Motion and force concept\",\"Work, energy and power\",\"Waves and sound\",\"Light and optics\",\"Electricity fundamentals\",\"Magnetism concept\",\"Thermal physics basics\",\"Units and measurement\",\"Experimental observation\",\"Graph interpretation\",\"Physics practical safety\",\"Scientific instruments\",\"Numerical problem-solving\",\"Modern physics overview\",\"Physics quiz\",\"Concept vs misconception\",\"Lab report format\",\"Physics in everyday life\",\"Formula revision card\",\"Topic difficulty level should match class/course\"],\n\"Chemistry\":[\"Atomic structure\",\"Periodic table trends\",\"Chemical bonding\",\"Acids, bases and salts\",\"Chemical reactions\",\"Solutions concept\",\"Organic chemistry introduction\",\"Chemical equilibrium\",\"Environmental chemistry\",\"Lab safety and PPE\",\"Measurement in chemistry\",\"Observation and inference\",\"Chemistry practical file\",\"Chemical equation balancing\",\"Chemistry quiz\",\"Chemistry in daily life\",\"Mole concept practice\",\"Separation techniques\",\"Labelling and storage awareness\",\"Never give unsafe experiment instructions\"],\n\"Biology\":[\"Cell structure\",\"Plant biology topic\",\"Human physiology topic\",\"Genetics basics\",\"Ecology and ecosystem\",\"Biodiversity awareness\",\"Microbiology concept\",\"Nutrition concept\",\"Photosynthesis\",\"Human health education — non-diagnostic\",\"Biology practical file\",\"Microscope safety\",\"Classification of organisms\",\"Evolution concept\",\"Biology diagram practice\",\"Scientific observation\",\"Environment and conservation\",\"Biology quiz\",\"Research poster\",\"Biology career awareness — no guarantees\"],\n\"Commerce — M.Com\":[\"M.Com course awareness — verify\",\"Accounting concept\",\"Financial management basics\",\"Business environment\",\"Marketing concept\",\"Human resource management\",\"Business research methods\",\"Corporate governance\",\"Taxation awareness — current source required\",\"Entrepreneurship basics\",\"Financial statement literacy\",\"Economics concept\",\"Commerce quiz\",\"Case study discussion\",\"Research proposal basics\",\"Business communication\",\"Spreadsheet skills\",\"Ethics in business\",\"M.Com admission checklist — verify\",\"Career pathways — no guarantees\"],\n\"Computer Applications — BCA\":[\"BCA course awareness — verify\",\"Programming fundamentals\",\"Algorithm and flowchart\",\"Database concepts\",\"Web development basics\",\"Computer networks overview\",\"Cyber safety awareness\",\"Operating system concepts\",\"Data structures basics\",\"Software development lifecycle\",\"UI/UX design awareness\",\"Debugging mindset\",\"Digital privacy\",\"Project presentation\",\"Coding logic challenge\",\"Computer lab safety\",\"Version control concept\",\"AI literacy\",\"BCA admission checklist — verify\",\"Career pathways — no guarantees\"],\n\"College Academics & Campus\":[\"College orientation\",\"Library and study skills\",\"Faculty introduction with consent\",\"Department introduction — verify\",\"Laboratory tour — if available\",\"Student project showcase\",\"Academic calendar notice — verify\",\"Examination notice — official only\",\"Practical schedule — verify\",\"Research and reading culture\",\"Seminar announcement — verify\",\"Guest lecture recap — verify\",\"Campus cleanliness\",\"Student clubs — verify\",\"Sports and cultural activities\",\"Career guidance session — verify\",\"Mentoring awareness — verify\",\"Student support contact — verify\",\"College event recap\",\"Campus facilities — real photos only\"],\n\"College Student Life\":[\"Time management for college\",\"Note-making methods\",\"Presentation skills\",\"Group project planning\",\"Academic integrity\",\"Research citation basics\",\"Library research\",\"Peer learning\",\"Communication skills\",\"Student wellbeing support\",\"Digital portfolio basics\",\"Internship awareness — verify\",\"Career exploration\",\"Alumni interaction — consent\",\"College cultural event\",\"Sports activity recap\",\"Volunteer activity — approved\",\"Student achievement — verify\",\"Scholarship awareness — verify\",\"Campus conduct\"],\n\"College Exams & Documents\":[\"Exam timetable — official only\",\"Admit card reminder — official process\",\"Practical file checklist\",\"Internal assessment awareness\",\"Project submission reminder\",\"Academic calendar — verify\",\"Result notice — official only\",\"Revaluation process — verify\",\"Attendance policy — verify\",\"Library clearance — verify\",\"Migration certificate process — verify\",\"Transfer certificate process — verify\",\"Marksheet collection — official only\",\"Document checklist — verify\",\"Exam preparation plan\",\"Academic honesty\",\"Research project formatting\",\"Presentation preparation\",\"Student portal awareness — verify\",\"Contact office for exact requirements\"],\n\"College Parent & Student Notices\":[\"Admission notice — verify\",\"Fee notice — official only\",\"Holiday notice — official only\",\"College reopening notice — verify\",\"Exam schedule — verify\",\"Document submission reminder\",\"Scholarship deadline — verify\",\"Campus event invitation\",\"Student safety notice\",\"Anti-ragging awareness\",\"Transport details — verify\",\"Hostel information only if available\",\"Faculty contact details — approved only\",\"Student grievance process — verify\",\"Official website awareness\",\"Notice board update\",\"Course eligibility FAQ — verify\",\"Affiliation / recognition details — verify\",\"No unverified placement claims\",\"Contact office for official information\"]\n};\nconst courseList={\nschool:[\"Prep / Pre-primary — verify exact stage\",\"Class 1\",\"Class 2\",\"Class 3\",\"Class 4\",\"Class 5\",\"Class 6\",\"Class 7\",\"Class 8\",\"Class 9\",\"Class XI — admission range listed; verify current session\",\"All approved school classes: Prep–IX & XI\"],\ncollege:[\"B.Ed — user-mentioned; verify current offering\",\"D.El.Ed — user-mentioned; verify current offering\",\"B.Sc — user-mentioned; verify subject combinations\",\"M.Com — user-mentioned; verify current offering\",\"BCA — user-mentioned; verify current offering\",\"Physics — subject offering to verify\",\"Chemistry — subject offering to verify\",\"Biology — subject offering to verify\",\"Botany — verify\",\"Zoology — verify\",\"Mathematics — verify\",\"Computer Science — verify\",\"Commerce / Accounting — verify\",\"Education / Pedagogy — verify\",\"English — verify\",\"Hindi — verify\",\"Economics — verify\",\"Environmental Science — verify\",\"Other subject — type in custom topic\",\"College-wide\"],\nboth:[\"School Prep–IX & XI + College — make separate assets\",\"School: Prep / Pre-primary — verify\",\"School: Class 1\",\"School: Class 5\",\"School: Class 8\",\"School: Class IX\",\"School: Class XI — verify current session\",\"College: B.Ed — verify\",\"College: D.El.Ed — verify\",\"College: B.Sc — verify\",\"College: M.Com — verify\",\"College: BCA — verify\",\"College: Physics / Chemistry / Biology — verify\"]\n};\n// PUBLIC NO-PASSWORD MODE: no login gate or Supabase credentials are used in this file.\n// Anyone with the published URL can open and use this front-end. Do not store confidential data here.\n\nfunction inst(){return document.getElementById('institution').value}\nfunction data(){return inst()==='school'?schoolCats:inst()==='college'?collegeCats:{...schoolCats,...Object.fromEntries(Object.entries(collegeCats).map(([k,v])=>['COLLEGE · '+k,v]))}}\nfunction fillCategories(){let d=data(),s=document.getElementById('category'),old=s.value;s.innerHTML='';Object.keys(d).forEach(k=>s.add(new Option(k,k)));if(d[old])s.value=old;fillTopics();fillCourses()}\nfunction fillTopics(){let d=data(),cat=document.getElementById('category').value,sel=document.getElementById('topic');sel.innerHTML='';(d[cat]||[]).forEach(t=>sel.add(new Option(t,t)))}\nfunction fillCourses(){let sel=document.getElementById('course');sel.innerHTML='';(courseList[inst()]||courseList.both).forEach(t=>sel.add(new Option(t,t)))}\nfunction selectedLocks(){return [...document.querySelectorAll('.check input[type=checkbox]')].map((x,i)=>({i,checked:x.checked,label:x.parentElement.textContent.trim()}))}\n\nfunction makeCalendar(institution, cat, topic, course, campaign){\n const months = [\"April\",\"May\",\"June\",\"July\",\"August\",\"September\",\"October\",\"November\",\"December\",\"January\",\"February\",\"March\"];\n const school = [\n  [\"Session welcome, baseline learning, classroom routines, reading habit, creative writing\"],\n  [\"Colour/art activities, family reading, environment awareness, summer learning ideas\"],\n  [\"Environment, yoga/fitness awareness, nature observation, holiday reading suggestions\"],\n  [\"School reopening (verify date), reading challenge, maths practice, chess/quiz activities\"],\n  [\"Independence Day preparation, patriotic learning, art/craft, quiz, sportsmanship\"],\n  [\"Hindi/English reading, literacy awareness, drawing, cricket/football, exam readiness\"],\n  [\"Gandhi Jayanti learning, animal welfare awareness, volleyball/sports, maths quiz\"],\n  [\"Diya/craft/rangoli, current affairs quiz, Children’s Day planning, cultural activities\"],\n  [\"Science quiz, poem recitation, storytelling, spelling, Christmas craft (if scheduled)\"],\n  [\"Reopening after winter break (verify), handwriting, show-and-tell, Republic Day preparation\"],\n  [\"Reading, storytelling, Basant Panchami learning (date-check), discipline and honesty\"],\n  [\"Annual exam preparation (verify calendar), revision, wellbeing, results notice (official only)\"]\n ];\n const college = [\n  [\"Session and course orientation, prospectus verification, study-skills workshop\"],\n  [\"Library orientation, reading and research skills, academic integrity\"],\n  [\"Subject awareness, lab safety, environment learning, student support information\"],\n  [\"Course/subject revision, seminar or workshop only if officially scheduled\"],\n  [\"National-day learning, student clubs/sports only if available and verified\"],\n  [\"Literacy, research writing, presentations, academic planning\"],\n  [\"Subject quiz, science/commerce/computer topic explainer, college notice verification\"],\n  [\"Current-affairs quiz, cultural activity, student project showcase\"],\n  [\"Science/commerce/computer learning topic, project documentation, exam readiness\"],\n  [\"Reopening notice only if verified, study skills, presentation practice\"],\n  [\"Course-subject awareness, career exploration without placement promises\"],\n  [\"Exam preparation and document reminders based on official college calendar\"]\n ];\n const combined = [\n  [\"Separate school and college session welcome assets; do not mix logos or audiences\"],\n  [\"School family reading and college library/research content as separate creatives\"],\n  [\"School environment activity and college subject explainer as separate creatives\"],\n  [\"School reading/sports activities; college academic workshop only if verified\"],\n  [\"Separate school-aged student visuals and college-aged student visuals\"],\n  [\"School literacy activities; college research and presentation content\"],\n  [\"School quiz/sports; college subject awareness, separate branding\"],\n  [\"School craft/cultural activity; college student life only if approved\"],\n  [\"School science/reading; college project/research content\"],\n  [\"School winter reopening only if confirmed; college study-skills content\"],\n  [\"School classroom activity; college course and subject awareness\"],\n  [\"School exam planning; college exam notices only from official source\"]\n ];\n const rows = institution===\"school\" ? school : institution===\"college\" ? college : combined;\n return \"MONTH-BY-MONTH CONTENT CALENDAR — SUGGESTION ONLY\\nCampaign: \"+campaign+\"\\nFocus topic: \"+topic+\" | Category: \"+cat+\" | Class/course: \"+course+\"\\n\\n\"+\n months.map((m,i)=>m+\":\\n• \"+rows[i][0]+\"\\n• Add one activity, one learning tip, one student/teacher highlight (with consent), and one parent/student notice if needed.\\n• Verify actual dates against the institution’s approved calendar before publishing.\").join(\"\\n\\n\")+\n \"\\n\\nIMPORTANT: This is a planning suggestion, not an official dated calendar. Do not present any listed activity as scheduled unless the school/college confirms it.\";\n}\n\nfunction build(){let institution=inst(),org=institution==='school'?'GYAN PUBLIC SCHOOL, ALIGARH — ADMISSIONS: PREP–IX & XI (VERIFY SESSION)':institution==='college'?'GYAN MAHAVIDYALAYA — COLLEGE / HIGHER EDUCATION':'BOTH INSTITUTIONS — CREATE SEPARATE BRANDED ASSETS';let cat=document.getElementById('category').value,topic=document.getElementById('customTopic').value.trim()||document.getElementById('topic').value,course=document.getElementById('course').value,fmt=document.getElementById('outputType').value,ratio=document.getElementById('ratio').value,platform=document.getElementById('platform').value,lang=document.getElementById('language').value,style=document.getElementById('style').value,dur=document.getElementById('duration').value,dialogue=document.getElementById('dialogue').value.trim(),date=document.getElementById('date').value,campaign=document.getElementById('campaign').value,ref=document.getElementById('reference').value,contact=document.getElementById('contact').value;\nlet schoolInfo='School address: Agra Road, Aligarh – 202002 (U.P.); short locator option: Near Gyan Mahavidyalaya, Agra Road, Aligarh. Phone: +91 70088 00300. Website: gpsaligarh.com.';\nlet collegeInfo='College address: Campus – Agra Road, Aligarh, Uttar Pradesh (use full locality only after confirming official listing). Phone: 092194 19405. Courses mentioned by user include B.Ed, D.El.Ed, B.Sc, M.Com, BCA; subjects mentioned include Physics, Chemistry, Biology. Verify current availability, subject combinations, eligibility, fees, affiliation, dates and contact before publication.';\nlet brand=institution==='school'?schoolInfo:institution==='college'?collegeInfo:schoolInfo+'\\\\nSeparate college details only on a separate college creative: '+collegeInfo;\nlet footer='';\nif(contact==='none') footer='No contact footer requested.';\nelse if(contact==='web') footer=institution==='school'?'Website: https://gpsaligarh.com/':institution==='college'?'Website: https://gyanmahavidhyalaya.com/':'Create two separate assets; School website: https://gpsaligarh.com/; College website: https://gyanmahavidhyalaya.com/';\nelse if(contact==='short') footer=institution==='school'?'Near Gyan Mahavidyalaya, Agra Road, Aligarh | +91 70088 00300 | gpsaligarh.com':institution==='college'?'Agra Road, Aligarh | +91 92194 19405 | gyanmahavidhyalaya.com':'Create separate assets: School — Near Gyan Mahavidyalaya, Agra Road, Aligarh | +91 70088 00300 | gpsaligarh.com; College — Agra Road, Aligarh | +91 92194 19405 | gyanmahavidhyalaya.com';\nelse footer=institution==='school'?'Near Gyan Mahavidyalaya, Agra Road, National Highway 93, Aligarh, Uttar Pradesh 202002 | +91 70088 00300 | https://gpsaligarh.com/':institution==='college'?'Agra Road, Aligarh, Uttar Pradesh 202002 | +91 92194 19405 | +91 94125 96440 | https://gyanmahavidhyalaya.com/':'Create two separate branded assets and keep each footer separate. School: Near Gyan Mahavidyalaya, Agra Road, National Highway 93, Aligarh, Uttar Pradesh 202002 | +91 70088 00300 | https://gpsaligarh.com/. College: Agra Road, Aligarh, Uttar Pradesh 202002 | +91 92194 19405 / +91 94125 96440 | https://gyanmahavidhyalaya.com/.';\nlet safe='50+ INTELLIGENCE / PRODUCTION LOCKS: institution identity; correct address; correct contact; correct logo; logo geometry; logo colours; building identity; uniform colour; uniform design; student face identity; hair; skin tone; age-appropriate appearance; body proportions; original photo content; original activity moment; pose; hand/finger count; object placement; classroom layout; background continuity; lighting continuity; camera angle; lens perspective; crop safety; text spelling; Hindi matras; English spelling; typography hierarchy; contrast; safe margins; aspect ratio; platform safe zones; clip duration; scene timing; voice continuity; pronunciation; lip-sync; dialogue accuracy; subtitle timing; music under speech; SFX relevance; transition logic; no random cuts; no flicker; no morphing; no duplicate people; no extra limbs; no object teleportation; no fake UI; no fake certificates; no fabricated data; no invented facilities; no invented dates; no unverified fees; no false affiliation; no invented testimonials; no unwanted watermarks; no unrelated brand; child privacy; guardian permission; accessibility; final mobile QA; export QA; reference fidelity; approved CTA; institution-specific footer; sequence continuity; no school/college cross-branding. STRICT FACT LOCK: Do not invent facilities, school/college affiliations, results, placements, fees, dates, seats, age eligibility, subject combinations, faculty credentials or testimonials. Mark unverified details for manual confirmation. Use uploaded original logo/building/uniform/photo only as references; no reference means no exact-match claim. For children, require school/guardian permission and protect private details.';\nlet copy=dialogue?('PRESERVE EXACT SUPPLIED TEXT VERBATIM: '+dialogue):('SUGGESTED COPY (not user-supplied; review before publishing): '+topic+' — सीखने, अभ्यास और बेहतर तैयारी की ओर एक कदम।');\nlet poster=`POSTER / THUMBNAIL PROMPT\nINSTITUTION LOCK: ${org}\nCAMPAIGN: ${campaign}\nCATEGORY: ${cat}\nTOPIC: ${topic}\nCLASS / COURSE: ${course}\nOUTPUT: ${fmt}; RATIO: ${ratio}; PLATFORM: ${platform}; LANGUAGE: ${lang}\nVISUAL STYLE: ${style}. Create a polished, clear, mobile-readable education creative with one strong focal point, excellent hierarchy, clean negative space, safe margins, balanced contrast and theme-matched lighting. Use real children/students only when appropriate and permitted; use age-appropriate respectful visuals. School posters should show school-aged children; college posters should show college-aged students and the correct academic context. Do not mix school uniform imagery into a college course poster.\nTEXT / DIALOGUE: ${copy}\nREFERENCE STATUS: ${ref}. If real reference assets are attached, preserve the supplied logo, building, uniform and people as closely as the tool permits; do not claim a guarantee. If no references are attached, use generic non-identifiable educational visuals and do not invent a real school logo or claim an exact building match. ORIGINAL PHOTO LOCK: when a user attaches a child/activity photo, preserve the actual child/person identity, face, hair, skin tone, pose, clothing/uniform, action, objects, and meaningful scene details. Do not beautify, replace, redraw, swap faces, change clothing, change the activity, add/remove people, or synthesize a different moment. Only perform the requested crop/layout/typography/background treatment; if the tool cannot preserve the photo, use it as an unaltered photo panel rather than regenerating it. Never claim perfect preservation if the image tool cannot guarantee it.\nCONTACT RULE: ${footer}\nADDRESS LOCK: Show only the selected institution's address. Use 'Near Gyan Mahavidyalaya, Agra Road, Aligarh' as a short School locator when appropriate. Never place the college phone/address on a school poster or vice versa.\n${safe}\nDo not use fake certificates, fake logos, fabricated statistics, fake UI, watermarks or unrelated brand names. Leave text clean and editable if the generator cannot render Hindi accurately.`;\nlet video=`VIDEO / REEL PROMPT\nCreate a ${dur} ${ratio} ${style} school/college awareness video for ${org}.\nTopic: ${topic}. Category: ${cat}. Class/course: ${course}. Platform: ${platform}. Language: ${lang}.\nScene plan: 0–2s clear visual hook and topic; 2–5s show relevant age-appropriate learning/activity visuals; 5–8s communicate one useful takeaway; final seconds show a simple closing frame and verified institution-specific contact only if approved. For duration other than 10 seconds, proportionally adapt scene timing.\nVoice: warm, natural Hindi/English as selected; music subtle and lower than voice; captions readable and speech-synced. Motivated transitions only; natural movement; no random effects.\nExact dialogue: ${dialogue||'[No exact dialogue supplied. Do not invent spoken dialogue; generate a visual-only plan and request approved dialogue separately.]'}\nReference assets: ${ref}. PHOTO / IDENTITY LOCK: use supplied child/activity photos as fixed source footage or stills; do not regenerate or alter identity, face, hair, skin, clothing/uniform, pose, action, objects or event details. Prefer the original photo/video clip unaltered with motion limited to camera pan/zoom and graphic overlays. Do not face-swap, morph, beautify, replace people, invent activity, or change uniform. Preserve logo/building references as closely as tool allows; do not claim perfect identity preservation. No references = do not assume a reference face or exact school visual.\n${safe}`;\nlet ytcreate=`${dur} ${ratio} educational reel. Topic: ${topic}. Use the selected institution's own approved visual references only. Keep school/college branding separate. Preserve attached child/activity photos exactly; do not change face, hair, skin, uniform, pose, action, objects or event. Use original photo/clip with gentle pan/zoom and clean overlays; no face swap, morphing, invented people, fake logo, fake facts or watermark. Natural Hindi/English voice only if approved dialogue is supplied; otherwise no invented speech. Clear speech-synced captions, subtle music under voice, smooth motivated transitions, consistent lighting and scene continuity. Show only selected institution's verified contact. Mobile-safe framing, readable text, no flicker, no extra limbs, no object teleportation. Verify all dates and claims before publish.`;\nif(ytcreate.length>900){ytcreate=ytcreate.slice(0,897).trimEnd()+'...';}\nlet sequence=`SEQUENTIAL CLIP / CONTINUITY PLAN — ${dur} total\nMASTER LOCKS: Same selected institution, same approved logo/building, same uniform, same people/identity, same colour palette, same voice, same lighting logic, same topic and exact dialogue. No character morphing, no outfit changes, no location jumps without motivated transition, no duplicated/missing people, no changes to attached activity photo.\n${dur==='10 seconds'?'CLIP 1 (0–10s): hook → one clear activity/learning moment → approved closing frame.':dur==='15 seconds'?'CLIP 1 (0–10s): hook and context. CLIP 2 (10–15s): one takeaway and closing frame; match previous frame.':dur==='20 seconds'?'CLIP 1 (0–10s): hook/context. CLIP 2 (10–20s): activity/detail → takeaway → closing; match last/first frames.':'CLIP 1 (0–10s): hook/context. CLIP 2 (10–20s): activity/action. CLIP 3 (20–30s): takeaway and closing. Match end frame to next start frame.'}\nFor tools with limited duration/sequence support, generate one clip at a time using the previous clip's final frame as the next reference if the tool supports it. Never assume a tool supports multi-clip continuity; adapt to its actual capabilities. Use approved dialogue verbatim: ${dialogue||'No dialogue supplied; do not invent spoken words.'}\nOUTPUT QA: verify duration, aspect ratio, identity/photo fidelity, uniform/logo, captions, audio, address, contact and safe margins. This sequence prompt is guidance; external generator capabilities vary.`;\nlet caption=`${org}\n${topic}\n${dialogue||'हर दिन सीखने, अभ्यास करने और आगे बढ़ने का नया अवसर है। (Suggested copy—review before posting.)'}\n${contact==='none'?'':footer}\n#gyanpublicschool #gyanmahavidyalaya #education #studentactivities #learning #aligarh #schoollife #collegeeducation\nOnly retain hashtags relevant to selected institution/topic. Verify all claims and official contact details before publishing.`;\nlet notice=`INFORMATION / CAROUSEL COPY — DRAFT\nInstitution: ${org}\nTopic: ${topic}\nCategory: ${cat}\nClass/Course: ${course}\n1. Main point: ${topic}\n2. What students/parents should know: add only institution-approved facts.\n3. Date / time: ${date||'Not supplied — do not invent.'}\n4. Eligibility / documents / fee / route / facility: verify with official office before publishing.\n5. Contact: ${contact==='none'?'Not shown.':footer}\n${dialogue?'Exact user text to preserve: '+dialogue:'Suggested wording is a draft and must be approved before publication.'}\n${safe}`;\nlet activity=`ACTIVITY / SUBJECT CHECKLIST\nInstitution: ${org}\nCategory: ${cat}\nTopic: ${topic}\nClass/course: ${course}\nDate: ${date||'Not specified'}\nChecklist:\n□ Confirm activity/topic is suitable for selected class/course.\n□ Confirm date, venue, timings, materials and responsible staff with official calendar.\n□ For schoolchildren: check supervision, safety and photo consent.\n□ For lab/practical subjects: teacher supervision and approved safety instructions only.\n□ Do not publish names, marks, personal information or images without authorisation.\n□ Verify contact and all institutional claims.\nNote: topic list is a planning library, not proof that an event/course is scheduled or offered.`;\nlet report=`Selected institution: ${org}\nCategory: ${cat}\nTopic: ${topic}\nClass/course: ${course}\nOutput: ${fmt} | Ratio: ${ratio} | Platform: ${platform} | Style: ${style}\nDialogue: ${dialogue?'User-supplied exact text present':'No exact dialogue supplied'}\nReferences: ${ref}\nDate: ${date||'Not supplied'}\nTopic is a planning suggestion unless verified by the official calendar/prospectus.`;\nlet locks=selectedLocks();let lockSummary=locks.map(x=>(x.checked?'☑ ':'☐ ')+x.label).join('\\n');\nlet qa=`PRE-PUBLISH QA\n☐ Correct institution and logo\n☐ School/college theme not mixed unintentionally\n☐ Class range/course and subject offering verified\n☐ Date, fee, eligibility, documents, affiliation and facilities verified\n☐ Address and phone confirmed for this institution\n☐ Hindi spelling, punctuation and typography checked\n☐ Real photo consent and child privacy checked\n☐ Uniform/building/logo reference used where supplied\n☐ No fake results, statistics, testimonials or promises\n☐ Final render reviewed on mobile for cropping, contrast and readability\n☐ Website, Google Business Profile, Instagram, Facebook and YouTube links reviewed by authorised admin\\n☐ Current profile ownership, contact, address, map pin, hours and activity verified manually\\nMandatory lock selections:\\n${lockSummary}\\nStatus: NOT AUTO-APPROVED. Manual verification required.`;\ndocument.getElementById('report').textContent=report;document.getElementById('poster').textContent=poster;document.getElementById('video').textContent=video;document.getElementById('ytcreate').textContent=ytcreate;document.getElementById('ytcount').textContent='YT Create character count: '+ytcreate.length+' / 900 characters (auto-limited). No institution/developer name included in this short prompt.';document.getElementById('sequence').textContent=sequence;document.getElementById('caption').textContent=caption;document.getElementById('notice').textContent=notice;document.getElementById('activity').textContent=activity;\ndocument.getElementById('calendar').textContent=makeCalendar(institution,cat,topic,course,campaign);document.getElementById('qa').textContent=qa;\ndocument.getElementById('coverage').innerHTML=Object.entries(data()).map(([k,v])=>`<div class=\"check\"><b>${k}</b><br>${v.length} topics: ${v.slice(0,5).join(' • ')} …</div>`).join('');\n}\nfunction copyOut(id){let t;if(id==='all')t=['report','poster','video','ytcreate','sequence','caption','notice','activity','calendar','qa'].map(x=>document.getElementById(x).textContent).join('\\n\\n====================\\n\\n');else t=document.getElementById(id).textContent;if(id==='ytcreate' && t.length>900){t=t.slice(0,897).trimEnd()+'...';}navigator.clipboard.writeText(t).then(()=>alert('Copied!')).catch(()=>{let ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Copied!')})}\nfunction resetAll(){if(!confirm('Form reset करना है?'))return;document.getElementById('customTopic').value='';document.getElementById('dialogue').value='';document.getElementById('date').value='';document.getElementById('institution').value='school';fillCategories();document.getElementById('outputType').selectedIndex=0;document.getElementById('ratio').selectedIndex=0;document.getElementById('campaign').value='School Session 2027–28 / College session — verify official dates';['report','poster','video','ytcreate','sequence','caption','notice','activity','calendar','qa'].forEach(id=>document.getElementById(id).textContent='—')}\ndocument.getElementById('institution').addEventListener('change',fillCategories);document.getElementById('category').addEventListener('change',fillTopics);\nfillCategories();document.getElementById('coverage').innerHTML=Object.entries(schoolCats).map(([k,v])=>`<div class=\"check\"><b>${k}</b><br>${v.length} topics</div>`).join('');\n</script></body></html>";
function openEmbeddedGyanApex() {
  let modal = document.getElementById("upsGyanApexModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "upsGyanApexModal";
    modal.className = "ups-gyan-modal";
    modal.innerHTML = `<div class="ups-gyan-modal__bar"><strong>GYAN APEX — Education Auto-Pilot</strong><button type="button" class="btn btn-secondary" id="closeGyanApex">Close ✕</button></div><iframe title="GYAN APEX Education Hub" id="upsGyanApexFrame" loading="lazy"></iframe>`;
    document.body.appendChild(modal);
    document.getElementById("closeGyanApex")?.addEventListener("click", () => modal.classList.remove("is-open"));
  }
  const frame = document.getElementById("upsGyanApexFrame");
  if (frame && !frame.srcdoc) frame.srcdoc = UPS_GYAN_APEX_EMBEDDED_HTML;
  modal.classList.add("is-open");
}
document.addEventListener("click", event => {
  if (event.target.closest("[data-open-gyan-apex]")) openEmbeddedGyanApex();
});


/* GLOBAL QUICK SEARCH — sidebar menu and studio cards */
document.addEventListener("input", event => {
  if (event.target?.id !== "upsSidebarSearch") return;
  const query = event.target.value.trim().toLocaleLowerCase();
  document.querySelectorAll("#sidebar .side-link").forEach(item => {
    const match = !query || item.textContent.toLocaleLowerCase().includes(query);
    item.hidden = !match;
  });
  document.querySelectorAll("#allStudios .studio-card, #publicStudios .studio-card").forEach(card => {
    const match = !query || card.textContent.toLocaleLowerCase().includes(query);
    card.hidden = !match;
  });
});
