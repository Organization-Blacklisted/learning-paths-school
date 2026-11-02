import * as migration_20261028_111608_initial from './20261028_111608_initial';
import * as migration_20261102_065832_contact_page from './20261102_065832_contact_page';
import * as migration_20261102_071925_principals_welcome from './20261102_071925_principals_welcome';

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
    name: '20261102_071925_principals_welcome'
  },
];
