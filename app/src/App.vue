<template>
  <RouterView />
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f4f9;
}

.auth-page {
  overflow-x: clip;
  isolation: isolate;
}

.auth-light-panel {
  view-transition-name: auth-light-panel;
}

.auth-orange-panel {
  view-transition-name: auth-orange-panel;
  position: relative;
  overflow: hidden;
}

.auth-orange-panel::before {
  position: absolute;
  inset: -25%;
  content: '';
  pointer-events: none;
  background:
    radial-gradient(circle at 72% 24%, rgb(255 255 255 / 12%), transparent 24%),
    radial-gradient(circle at 14% 82%, rgb(253 121 23 / 18%), transparent 29%);
}

.auth-content {
  position: relative;
  z-index: 1;
}

.auth-logo {
  view-transition-name: auth-logo;
}

.auth-heading {
  view-transition-name: auth-heading;
}

.auth-subtitle {
  view-transition-name: auth-subtitle;
}

.auth-google {
  view-transition-name: auth-google;
}

.auth-divider {
  view-transition-name: auth-divider;
}

.auth-cpf {
  view-transition-name: auth-cpf;
}

.auth-password {
  view-transition-name: auth-password;
}

.auth-consent {
  view-transition-name: auth-consent;
}

.auth-primary {
  view-transition-name: auth-primary;
}

.auth-switch {
  view-transition-name: auth-switch;
}

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-group(auth-light-panel),
::view-transition-group(auth-orange-panel) {
  z-index: 1;
}

::view-transition-group(auth-logo),
::view-transition-group(auth-heading),
::view-transition-group(auth-subtitle),
::view-transition-group(auth-google),
::view-transition-group(auth-divider),
::view-transition-group(auth-cpf),
::view-transition-group(auth-password),
::view-transition-group(auth-consent),
::view-transition-group(auth-primary),
::view-transition-group(auth-switch) {
  z-index: 2;
}

::view-transition-old(auth-logo),
::view-transition-new(auth-logo) {
  animation: none;
  opacity: 1;
  mix-blend-mode: normal;
}

::view-transition-group(auth-light-panel),
::view-transition-group(auth-orange-panel),
::view-transition-group(auth-logo),
::view-transition-group(auth-heading),
::view-transition-group(auth-subtitle),
::view-transition-group(auth-google),
::view-transition-group(auth-divider),
::view-transition-group(auth-cpf),
::view-transition-group(auth-password),
::view-transition-group(auth-consent),
::view-transition-group(auth-primary),
::view-transition-group(auth-switch) {
  animation-duration: 760ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(auth-light-panel),
  ::view-transition-group(auth-orange-panel),
  ::view-transition-group(auth-logo),
  ::view-transition-group(auth-heading),
  ::view-transition-group(auth-subtitle),
  ::view-transition-group(auth-google),
  ::view-transition-group(auth-divider),
  ::view-transition-group(auth-cpf),
  ::view-transition-group(auth-password),
  ::view-transition-group(auth-consent),
  ::view-transition-group(auth-primary),
  ::view-transition-group(auth-switch) {
    animation-duration: 1ms;
  }
}
</style>