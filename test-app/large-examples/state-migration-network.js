import StateMigration from './state-migration-data.json';

const StatesNames = StateMigration.map(d => d['State of residence']);
export const stateMigration = StateMigration.reverse().map(row => {
  return StatesNames.map(state => row[state]);
});
