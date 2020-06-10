import { schema } from 'normalizr';

export const dispute = new schema.Entity('disputes', {}, { idAttribute: 'ID' });

export const task = new schema.Entity('tasks', { dispute: dispute }, { idAttribute: 'ID' });

export const language = new schema.Entity('languages', {}, { idAttribute: 'code' });

export const skill = new schema.Entity('skills', {}, { idAttribute: 'language' });
