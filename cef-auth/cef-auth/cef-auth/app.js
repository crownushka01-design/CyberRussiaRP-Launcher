
"use strict";
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") === "register" ? "register" : "login";
const nick = params.get("nick") || "";
const nicknameElement = $("nickname");
if (/^[A-Za-z0-9_]{3,24}$/.test(nick)) {
  nicknameElement.textContent = nick;
  nicknameElement.style.visibility = "visible";
} else {
  // Don't flash a fake nickname while waiting for server-supplied identity.
  nicknameElement.textContent = "";
  nicknameElement.style.visibility = "hidden";
}
$("formTitle").textContent = mode === "login" ? "АВТОРИЗАЦИЯ" : "РЕГИСТРАЦИЯ";
$("submitButton").innerHTML = mode === "login" ? "ВОЙТИ В ИГРУ <span>➜</span>" : "СОЗДАТЬ АККАУНТ <span>➜</span>";
$("confirmWrap").classList.toggle("hidden", mode === "login");
$("confirm").required = mode === "register";
$("switchMode").style.display = "none"; // mode is determined by MySQL, not by the user
$("hint").textContent = "";
for (const [button,field] of [["togglePassword","password"],["toggleConfirm","confirm"]]) {
  $(button).addEventListener("click", () => { $(field).type = $(field).type === "password" ? "text" : "password"; });
}

// CEF gets no reliable OS keyboard-layout API. Update instantly on Alt+Shift
// when the shortcut reaches the page, and correct from actual typed characters.
let layout = 'ENG';
function paintLanguage() {
  $('layoutToggle').textContent = layout;
  $('layoutConfirm').textContent = layout;
}
function flipLanguage() {
  layout = layout === 'ENG' ? 'РУС' : 'ENG';
  paintLanguage();
}
paintLanguage();
for (const id of ['layoutToggle','layoutConfirm']) {
  $(id).title = 'ENG / РУС — нажмите, чтобы переключить отображение';
  $(id).addEventListener('click', () => {
    flipLanguage();
    $(id === 'layoutToggle' ? 'password' : 'confirm').focus();
  });
}
let altShiftHandled = false;
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.shiftKey && !altShiftHandled) {
    altShiftHandled = true;
    flipLanguage();
  }
});
document.addEventListener('keyup', (e) => {
  if (!e.altKey || !e.shiftKey) altShiftHandled = false;
});
window.addEventListener('blur', () => { altShiftHandled = false; });
for (const id of ['password','confirm']) {
  const field = $(id);
  field.autocomplete = 'off';
  field.spellcheck = false;
  field.addEventListener('input', () => {
    const letters = field.value.match(/[A-Za-zА-Яа-яЁё]/g);
    if (letters && letters.length) {
      layout = /[А-Яа-яЁё]/.test(letters[letters.length-1]) ? 'РУС' : 'ENG';
      paintLanguage();
    }
  });
}
$('layoutNote').textContent = '';

$("authForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const pass = $("password").value;
  if (pass.length < 6 || pass.length > 64 || /\s/.test(pass)) {
    $("hint").textContent = "Для CEF используйте 6–64 символа без пробелов.";
    return;
  }
  if (mode === "register" && pass !== $("confirm").value) {
    $("hint").textContent = "Пароли не совпадают.";
    return;
  }
  if (!window.cef || typeof window.cef.emit !== "function") {
    $("hint").textContent = "Откройте страницу через GTA с установленным CEF.";
    return;
  }
  window.cef.emit(mode === "login" ? "cyber:login" : "cyber:register", pass);
  $("password").value = "";
  $("confirm").value = "";
  $("hint").textContent = "Запрос отправлен на сервер...";
});


const hintNode = $("hint");
const syncHint = () => { hintNode.hidden = !hintNode.textContent.trim(); };
new MutationObserver(syncHint).observe(hintNode, {childList:true,characterData:true,subtree:true});
syncHint();
