import { schema } from 'normalizr';

export const skill = new schema.Entity('skill', {}, { idAttribute: 'language' });

export const task = new schema.Entity('task');
