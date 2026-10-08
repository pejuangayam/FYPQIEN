(function (window) {
  'use strict';

  const TREATMENTS = [
    { id: 'braces', name: 'Braces', color: '#0d9488' },
    { id: 'extraction', name: 'Extraction', color: '#ef4444' },
    { id: 'scaling', name: 'Scaling', color: '#3b82f6' },
    { id: 'filling', name: 'Filling', color: '#f59e0b' },
    { id: 'checkup', name: 'Check-up', color: '#22c55e' },
    { id: 'mos', name: 'Minor Oral Surgery', color: '#a855f7' }
  ];

  const PATIENTS = [
    { name: 'Aina Sofea Abdullah', phone: '+60 12-345 6789' },
    { name: 'Muhammad Faiz bin Harun', phone: '+60 13-456 7890' },
    { name: 'Nurul Hidayah binti Ahmad', phone: '+60 14-567 8901' },
    { name: 'Shahril Azwan bin Mohd Yusof', phone: '+60 11-234 5678' },
    { name: 'Siti Khadijah binti Rahman', phone: '+60 16-789 0123' },
    { name: 'Amirul Hakim bin Nasir', phone: '+60 18-901 2345' },
    { name: 'Farah Alyssa binti Zainal', phone: '+60 19-012 3456' },
    { name: 'Ahmad Danish bin Ismail', phone: '+60 17-345 6789' }
  ];

  function toDateISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(d, n) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  }

  function todayDate() {
    return new Date();
  }

  function tomorrowDate() {
    return addDays(todayDate(), 1);
  }

  function formatTime12h(hhmm) {
    if (!hhmm) return hhmm;
    const parts = hhmm.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const period = h >= 12 ? 'petang' : 'pagi';
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  }

  function formatReadableDate(d) {
    const opts = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-MY', opts);
  }

  function buildSeedAppointments() {
    const today = todayDate();
    const tomorrow = tomorrowDate();
    const todayISO = toDateISO(today);
    const tomorrowISO = toDateISO(tomorrow);

    const appointments = [];

    appointments.push({
      id: 'appt-today-1',
      dateISO: todayISO,
      time: '09:00',
      patientName: PATIENTS[0].name,
      phone: PATIENTS[0].phone,
      treatmentId: 'scaling',
      notes: 'Routine scaling for upper and lower arches',
      status: 'scheduled'
    });
    appointments.push({
      id: 'appt-today-2',
      dateISO: todayISO,
      time: '12:00',
      patientName: PATIENTS[1].name,
      phone: PATIENTS[1].phone,
      treatmentId: 'filling',
      notes: 'Occlusal filling on lower left molar',
      status: 'scheduled'
    });
    appointments.push({
      id: 'appt-today-3',
      dateISO: todayISO,
      time: '14:30',
      patientName: PATIENTS[0].name,
      phone: PATIENTS[0].phone,
      treatmentId: 'checkup',
      notes: "Same-day review check-up after this morning's scaling",
      status: 'scheduled'
    });

    appointments.push({
      id: 'appt-tom-1',
      dateISO: tomorrowISO,
      time: '09:30',
      patientName: PATIENTS[3].name,
      phone: PATIENTS[3].phone,
      treatmentId: 'extraction',
      notes: 'Simple extraction of upper premolar',
      status: 'scheduled'
    });
    appointments.push({
      id: 'appt-tom-2',
      dateISO: tomorrowISO,
      time: '11:00',
      patientName: PATIENTS[4].name,
      phone: PATIENTS[4].phone,
      treatmentId: 'mos',
      notes: 'Impacted wisdom tooth — review OPG X-ray night before',
      status: 'scheduled'
    });
    appointments.push({
      id: 'appt-tom-3',
      dateISO: tomorrowISO,
      time: '14:00',
      patientName: PATIENTS[5].name,
      phone: PATIENTS[5].phone,
      treatmentId: 'braces',
      notes: 'Adjustment appointment for fixed braces',
      status: 'scheduled'
    });

    return appointments;
  }

  /**
   * Builds a reminder object for a single appointment (BM WhatsApp template).
   * Kept here so the reminder queue derives from live appointments.
   */
  function buildReminderForAppt(appt, dateObj, status) {
    const first = String(appt.patientName || '').split(' ')[0] || 'Patient';
    const dateLabel = formatReadableDate(dateObj);
    const message =
      'Assalamualaikum ' + first +
      ', ini peringatan temujanji anda di Klinik Pergigian Sofea Taman Tas pada ' +
      dateLabel + ', jam ' + formatTime12h(appt.time) +
      '. Sila hadir 10 minit awal. Terima kasih.';
    return {
      id: 'rem-' + appt.id,
      appointmentId: appt.id,
      patientName: appt.patientName,
      phone: appt.phone,
      appointmentTime: appt.time,
      dateISO: appt.dateISO,
      message: message,
      status: status || 'Queued'
    };
  }

  const SEED_APPOINTMENTS = buildSeedAppointments();

  window.Clinic = window.Clinic || {};
  window.Clinic.TREATMENTS = TREATMENTS;
  window.Clinic.PATIENTS = PATIENTS;
  window.Clinic.APPOINTMENTS = SEED_APPOINTMENTS;
  window.Clinic.reminders = {
    buildReminderForAppt: buildReminderForAppt
  };
  window.Clinic.utils = {
    toDateISO: toDateISO,
    addDays: addDays,
    formatReadableDate: formatReadableDate,
    formatTime12h: formatTime12h,
    todayDate: todayDate,
    tomorrowDate: tomorrowDate
  };
})(window);