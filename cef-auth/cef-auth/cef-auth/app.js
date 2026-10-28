
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
$("hint").textContent = mode === "login" ? "Введите пароль вашего аккаунта." : "Придумайте пароль от 6 до 64 символов.";
for (const [button,field] of [["togglePassword","password"],["toggleConfirm","confirm"]]) {
  $(button).addEventListener("click", () => { $(field).type = $(field).type === "password" ? "text" : "password"; });
}

// Native Windows layout only: Chromium receives actual typed characters.
// Indicator detects the layout from entered text; never changes the password.
let detectedLayout = 'AUTO';
for (const id of ['layoutToggle','layoutConfirm']) {
  $(id).textContent = 'AUTO';
  $(id).title = 'Используется системная раскладка Windows';
  $(id).addEventListener('click', () => {
    $('layoutNote').textContent = 'Переключайте язык через Alt+Shift в Windows';
    $('password').focus();
  });
}
for (const id of ['password','confirm']) {
 const field=$(id);
 field.autocomplete='off'; field.spellcheck=false;
 field.addEventListener('input', ev => {
  const d=ev.data || '';
  if (/[а-яё]/i.test(d)) detectedLayout='RU';
  else if (/[a-z]/i.test(d)) detectedLayout='EN';
  $('layoutToggle').textContent=detectedLayout;
  $('layoutConfirm').textContent=detectedLayout;
  $('layoutNote').textContent='Язык введённого текста: '+detectedLayout+' · смена Alt+Shift (Windows)';
 });
}
$('layoutNote').textContent='Системная раскладка Windows · Alt+Shift';

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

