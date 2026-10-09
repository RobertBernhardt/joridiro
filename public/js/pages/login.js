import { chrome, api, html, render, $, $$, bindForm } from '../lib.js';

const params = new URLSearchParams(location.search);
const next = /^\/(?!\/)/.test(params.get('next') || '') ? params.get('next') : '/dashboard';
const user = await chrome();
if (user) location.replace(next);

render($('#main'), html`<section class="auth">
  <div class="card">
    <div class="tabs" role="tablist">
      <button role="tab" data-tab="login" aria-selected="true">Log in</button>
      <button role="tab" data-tab="register" aria-selected="false">Sign up</button>
    </div>
    <form id="login" novalidate>
      <div class="field"><label for="le">Email</label><input class="input" id="le" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="lp">Password</label><input class="input" id="lp" name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn btn-primary btn-block" type="submit">Log in</button>
    </form>
    <form id="register" novalidate hidden>
      <div class="field"><label for="rn">Name</label><input class="input" id="rn" name="name" autocomplete="name" required></div>
      <div class="field"><label for="re">Email</label><input class="input" id="re" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="rp">Password</label><input class="input" id="rp" name="password" type="password" autocomplete="new-password" minlength="8" required>
        <span class="hint">At least 8 characters.</span></div>
      <button class="btn btn-primary btn-block" type="submit">Create account</button>
    </form>
    <p class="demo-hint">Demo data: log in as <b>organizer@demo.joridiro</b> or <b>player@demo.joridiro</b>, password <b>demo1234</b>.</p>
  </div>
</section>`);

const tab = (name) => {
  $$('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
  $('#login').hidden = name !== 'login';
  $('#register').hidden = name !== 'register';
};
$$('.tabs button').forEach((b) => b.addEventListener('click', () => tab(b.dataset.tab)));
if (params.get('tab') === 'register') tab('register');

bindForm($('#login'), async (v) => { await api('POST', '/api/auth/login', v); location.assign(next); });
bindForm($('#register'), async (v) => { await api('POST', '/api/auth/register', v); location.assign(next); });
