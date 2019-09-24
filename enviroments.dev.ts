export const config = {
  dbPath: 'mongodb://127.0.0.1:27017',
  dbName: 'SCD',
  mongooseURL: 'mongodb://127.0.0.1:27017/SCD',
  permission: {
    docente: 0,
    admin: 1,
    superAdmin: 2
  }
};
