(function (window) {
  'use strict';

  const Clinic = window.Clinic || {};
  const app = Clinic.app || {};
  const utils = Clinic.utils || {};

  let currentDate = null;

  function getAppointmentsForDate(dateISO) {
    const list = Clinic.APPOINTMENTS || [];
    const result = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].dateISO === dateISO) {
        result.push(list[i]);
      }
    }
    return result;
  }

  function renderDateLabel() {
    const label = document.getElementById('dateLabel');
    if (label && utils.formatReadableDate) {
      label.textContent = utils.formatReadableDate(currentDate);
    }
  }

  function renderCards() {
    const listEl = document.getElementById('cardList');
    const emptyState = document.getElementById('emptyState');
    if (!listEl) return;
    listEl.innerHTML = '';
    const dateISO = utils.toDateISO(currentDate);
    const appts = getAppointmentsForDate(dateISO);
    // sort by time
    appts.sort(function (a, b) {
      return a.time.localeCompare(b.time);
    });

    if (appts.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }
    if (emptyState) emptyState.classList.add('hidden');

    appts.forEach(function (appt) {
      const treatment = app.getTreatmentById(appt.treatmentId);
      const card = document.createElement('article');
      card.className = 'dentist-card';
      card.style.borderLeftColor = treatment.color;
      if (appt.treatmentId === 'mos') {
        card.classList.add('complex');
      }
      const header = document.createElement('div');
      header.className = 'dentist-card-header';
      const time = document.createElement('span');
      time.className = 'dentist-time';
      time.textContent = appt.time;
      const pill = document.createElement('span');
      pill.className = 'treatment-pill';
      pill.style.background = treatment.color;
      pill.textContent = treatment.name;
      header.appendChild(time);
      header.appendChild(pill);

      const body = document.createElement('div');
      body.className = 'dentist-card-body';
      const patient = document.createElement('div');
      patient.className = 'dentist-patient';
      patient.textContent = appt.patientName;
      const phone = document.createElement('div');
      phone.className = 'dentist-meta';
      phone.textContent = appt.phone;
      body.appendChild(patient);
      body.appendChild(phone);
      if (appt.notes) {
        const notes = document.createElement('div');
        notes.className = 'dentist-meta';
        notes.textContent = appt.notes;
        body.appendChild(notes);
      }
      if (appt.treatmentId === 'mos') {
        const label = document.createElement('span');
        label.className = 'complex-label';
        label.textContent = 'Complex case — prepare';
        body.appendChild(label);
      }
      card.appendChild(header);
      card.appendChild(body);
      listEl.appendChild(card);
    });
  }

  function bindEvents() {
    const prev = document.getElementById('prevDay');
    const next = document.getElementById('nextDay');
    if (prev) {
      prev.addEventListener('click', function () {
        currentDate = utils.addDays(currentDate, -1);
        renderDateLabel();
        renderCards();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        currentDate = utils.addDays(currentDate, 1);
        renderDateLabel();
        renderCards();
      });
    }
  }

  function init() {
    const allowed = app.enforceRole ? app.enforceRole(['dentist'], function () {
      const denied = document.getElementById('accessDenied');
      const view = document.getElementById('dentistView');
      if (denied) denied.classList.remove('hidden');
      if (view) view.classList.add('hidden');
      if (app.initRoleBadge) app.initRoleBadge();
      if (app.initLogout) app.initLogout();
      if (app.initBackToIndex) app.initBackToIndex();
    }) : true;
    if (!allowed) return;
    const view = document.getElementById('dentistView');
    if (view) view.classList.remove('hidden');
    if (app.initRoleBadge) app.initRoleBadge();
    if (app.initLogout) app.initLogout();
    if (app.initBackToIndex) app.initBackToIndex();
    currentDate = utils.tomorrowDate();
    renderDateLabel();
    renderCards();
    bindEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);