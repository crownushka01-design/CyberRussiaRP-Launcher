
"use strict";
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") === "register" ? "register" : "login";
const nick = params.get("nick") || "Игрок";
if (/^[A-Za-z0-9_]{3,24}$/.test(nick)) $("nickname").textContent = nick;
$("formTitle").textContent = mode === "login" ? "АВТОРИЗАЦИЯ" : "РЕГИСТРАЦИЯ";
$("submitButton").innerHTML = mode === "login" ? "ВОЙТИ В ИГРУ <span>➜</span>" : "СОЗДАТЬ АККАУНТ <span>➜</span>";
$("confirmWrap").classList.toggle("hidden", mode === "login");
$("confirm").required = mode === "register";
$("switchMode").style.display = "none"; // mode is determined by MySQL, not by the user
$("hint").textContent = "";
for (const [button,field] of [["togglePassword","password"],["toggleConfirm","confirm"]]) {
  $(button).addEventListener("click", () => { $(field).type = $(field).type === "password" ? "text" : "password"; });
}

// CEF cannot reliably query the active Windows keyboard layout before typing.
// We display the language of the actual characters typed, without changing them.
let layout = 'ENG';
function updateLanguage(text) {
  const chars = Array.from(text).reverse();
  const latest = chars.find(c => /[A-Za-zА-Яа-яЁё]/.test(c));
  if (latest) layout = /[А-Яа-яЁё]/.test(latest) ? 'РУС' : 'ENG';
  $('layoutToggle').textContent = layout;
  $('layoutConfirm').textContent = layout;
  $('layoutNote').textContent = 'Язык ввода: ' + layout + ' · Alt + Shift переключает Windows';
}
for (const id of ['layoutToggle','layoutConfirm']) {
  $(id).textContent = layout;
  $(id).title = 'Текущий язык по введённым символам; смена через Alt + Shift';
  $(id).addEventListener('click', () => {
    $('layoutNote').textContent = 'Переключите раскладку в Windows: Alt + Shift';
    $(id === 'layoutToggle' ? 'password' : 'confirm').focus();
  });
}
for (const id of ['password','confirm']) {
  const field = $(id);
  field.autocomplete = 'off';
  field.spellcheck = false;
  field.addEventListener('input', () => updateLanguage(field.value));
}
$('layoutNote').textContent = 'ENG / РУС: язык определяется по введённым символам';

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
