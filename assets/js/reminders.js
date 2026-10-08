(function (window) {
  'use strict';

  const Clinic = window.Clinic || {};
  const app = Clinic.app || {};
  const utils = Clinic.utils || {};

  function getReminders() {
    if (!Clinic.REMINDERS || Clinic.REMINDERS.length === 0) {
      if (Clinic.APPOINTMENTS && Clinic.utils && Clinic.reminders) {
        const tomDate = Clinic.utils.tomorrowDate();
        const tomISO = Clinic.utils.toDateISO(tomDate);
        const appts = Clinic.APPOINTMENTS.filter(a => a.dateISO === tomISO);
        Clinic.REMINDERS = appts.map(a => Clinic.reminders.buildReminderForAppt(a, tomDate, 'Queued'));
        if (Clinic.REMINDERS.length > 0) {
          Clinic.REMINDERS[0].status = 'Failed';
        }
      }
    }
    return Clinic.REMINDERS || [];
  }

  function refreshStats() {
    const chips = document.getElementById('statChips');
    if (!chips) return;
    chips.innerHTML = '';
    const reminders = getReminders();
    const queued = reminders.filter((r) => r.status === 'Queued').length;
    const sent = reminders.filter((r) => r.status === 'Sent').length;
    const failed = reminders.filter((r) => r.status === 'Failed').length;
    const stats = [
      { label: 'Queued', value: queued, cls: 'queued' },
      { label: 'Sent', value: sent, cls: 'sent' },
      { label: 'Failed', value: failed, cls: 'failed' }
    ];
    stats.forEach(function (s) {
      const chip = document.createElement('span');
      chip.className = 'stat-chip ' + s.cls;
      chip.textContent = s.label + ': ' + s.value;
      chips.appendChild(chip);
    });
  }

  function statusBadge(status) {
    const badge = document.createElement('span');
    badge.className = 'status-badge ' + status.toLowerCase();
    badge.textContent = status;
    return badge;
  }

  function renderRows() {
    const body = document.getElementById('remindersBody');
    if (!body) return;
    body.innerHTML = '';
    const reminders = getReminders();
    reminders.forEach(function (r) {
      const tr = document.createElement('tr');

      const tdPatient = document.createElement('td');
      tdPatient.textContent = r.patientName;

      const tdPhone = document.createElement('td');
      tdPhone.textContent = r.phone;

      const tdTime = document.createElement('td');
      tdTime.textContent = r.appointmentTime;

      const tdMsg = document.createElement('td');
      tdMsg.className = 'message-preview';
      tdMsg.textContent = r.message;

      const tdStatus = document.createElement('td');
      tdStatus.appendChild(statusBadge(r.status));

      const tdAction = document.createElement('td');
      if (r.status === 'Failed') {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'btn ghost';
        retryBtn.textContent = 'Retry';
        retryBtn.addEventListener('click', function () {
          retryBtn.disabled = true;
          retryBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Retrying...';
          setTimeout(function () {
            r.status = 'Sent';
            renderRows();
            refreshStats();
            if (app.showToast) {
              app.showToast('Reminder sent successfully — ' + r.patientName, 'success');
            }
          }, 1000);
        });
        tdAction.appendChild(retryBtn);
      } else if (r.status === 'Queued') {
        tdAction.textContent = '—';
      } else {
        tdAction.textContent = '—';
      }

      tr.appendChild(tdPatient);
      tr.appendChild(tdPhone);
      tr.appendChild(tdTime);
      tr.appendChild(tdMsg);
      tr.appendChild(tdStatus);
      tr.appendChild(tdAction);
      body.appendChild(tr);
    });
  }

  function simulateSendAll() {
    const sendBtn = document.getElementById('simulateSendAll');
    if (sendBtn) {
      const originalHTML = sendBtn.innerHTML;
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Dispatching...';

      setTimeout(function () {
        const reminders = getReminders();
        let changed = 0;
        reminders.forEach(function (r) {
          if (r.status === 'Queued') {
            r.status = 'Sent';
            changed++;
          }
        });
        renderRows();
        refreshStats();
        if (app.showToast) {
          if (changed > 0) {
            app.showToast(changed + ' reminder(s) sent — WhatsApp', 'success');
          } else {
            app.showToast('No queued reminders to send', 'info');
          }
        }
        sendBtn.innerHTML = originalHTML;
        sendBtn.disabled = false;
      }, 1500);
    }
  }

  function bindEvents() {
    const sendBtn = document.getElementById('simulateSendAll');
    if (sendBtn) {
      sendBtn.addEventListener('click', simulateSendAll);
    }
  }

  function init() {
    const allowed = app.enforceRole ? app.enforceRole(['admin'], function () {
      const denied = document.getElementById('accessDenied');
      const view = document.getElementById('remindersView');
      if (denied) denied.classList.remove('hidden');
      if (view) view.classList.add('hidden');
      if (app.initRoleBadge) app.initRoleBadge();
      if (app.initLogout) app.initLogout();
      if (app.initBackToIndex) app.initBackToIndex();
    }) : true;
    if (!allowed) return;
    const view = document.getElementById('remindersView');
    if (view) view.classList.remove('hidden');
    if (app.initRoleBadge) app.initRoleBadge();
    if (app.initLogout) app.initLogout();
    if (app.initBackToIndex) app.initBackToIndex();
    renderRows();
    refreshStats();
    bindEvents();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window);