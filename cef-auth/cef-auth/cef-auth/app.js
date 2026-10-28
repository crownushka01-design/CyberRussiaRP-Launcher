'use strict';
// UI DEMO ONLY: do not send credentials to arbitrary URLs or store them in localStorage.
const $ = id => document.getElementById(id);
let mode = 'login';
function configure(next) {
  mode = next;
  $('formTitle').textContent = mode === 'login' ? 'АВТОРИЗАЦИЯ' : 'РЕГИСТРАЦИЯ';
  $('submitButton').innerHTML = mode === 'login' ? 'ВОЙТИ В ИГРУ <span>→</span>' : 'СОЗДАТЬ АККАУНТ <span>→</span>';
  $('switchMode').textContent = mode === 'login' ? 'СОЗДАТЬ АККАУНТ' : 'УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ';
  $('confirmWrap').classList.toggle('hidden', mode === 'login');
  $('confirm').required = mode !== 'login';
  $('password').value = ''; $('confirm').value = '';
  $('hint').textContent = 'Демонстрация интерфейса — подключение к серверу ещё не настроено.';
}
$('switchMode').addEventListener('click', () => configure(mode === 'login' ? 'register' : 'login'));
for(const [button,field] of [['togglePassword','password'],['toggleConfirm','confirm']]){
  $(button).addEventListener('click', () => $(field).type = $(field).type === 'password' ? 'text' : 'password');
}
$('authForm').addEventListener('submit', event => {
  event.preventDefault();
  const pass = $('password').value;
  if(mode === 'register' && pass !== $('confirm').value){$('hint').textContent='Пароли не совпадают.';return;}
  $('hint').textContent='Демо-режим: пароль не отправлен. Подключение к Pawn будет реализовано после проверки CEF.';
  $('password').value = ''; $('confirm').value = '';
});
// Integration point: set nick after trusted CEF/Pawn message, never hardcode player names in production.
window.setCyberNickname = function(nick){
  if(typeof nick === 'string' && /^[A-Za-z0-9_]{3,24}$/.test(nick)) $('nickname').textContent = nick;
};
