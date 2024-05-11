const roles = [
   'save',
   'add',
   'delete',
   'openDialog',
   'navigation',
   'accept',
   'cancel',
   'reset'
] as const;

export type ButtonRole = typeof roles[number];
