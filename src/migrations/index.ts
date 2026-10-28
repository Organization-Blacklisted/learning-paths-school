import * as migration_20261028_111608_initial from './20261028_111608_initial';

export const migrations = [
  {
    up: migration_20261028_111608_initial.up,
    down: migration_20261028_111608_initial.down,
    name: '20261028_111608_initial'
  },
];
