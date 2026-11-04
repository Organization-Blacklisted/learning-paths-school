import * as migration_20261028_111608_initial from './20261028_111608_initial';
import * as migration_20261102_065832_contact_page from './20261102_065832_contact_page';
import * as migration_20261102_071925_principals_welcome from './20261102_071925_principals_welcome';
import * as migration_20261103_044102_partnerships_page from './20261103_044102_partnerships_page';
import * as migration_20261103_050817_awards_recognition_page from './20261103_050817_awards_recognition_page';
import * as migration_20261104_043334_student_council_page from './20261104_043334_student_council_page';
import * as migration_20261104_050246_signature_events_page from './20261104_050246_signature_events_page';

export const migrations = [
  {
    up: migration_20261028_111608_initial.up,
    down: migration_20261028_111608_initial.down,
    name: '20261028_111608_initial',
  },
  {
    up: migration_20261102_065832_contact_page.up,
    down: migration_20261102_065832_contact_page.down,
    name: '20261102_065832_contact_page',
  },
  {
    up: migration_20261102_071925_principals_welcome.up,
    down: migration_20261102_071925_principals_welcome.down,
    name: '20261102_071925_principals_welcome',
  },
  {
    up: migration_20261103_044102_partnerships_page.up,
    down: migration_20261103_044102_partnerships_page.down,
    name: '20261103_044102_partnerships_page',
  },
  {
    up: migration_20261103_050817_awards_recognition_page.up,
    down: migration_20261103_050817_awards_recognition_page.down,
    name: '20261103_050817_awards_recognition_page',
  },
  {
    up: migration_20261104_043334_student_council_page.up,
    down: migration_20261104_043334_student_council_page.down,
    name: '20261104_043334_student_council_page',
  },
  {
    up: migration_20261104_050246_signature_events_page.up,
    down: migration_20261104_050246_signature_events_page.down,
    name: '20261104_050246_signature_events_page'
  },
];
