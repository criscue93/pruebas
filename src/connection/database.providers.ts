import { usuarios } from 'src/entitys/usuarios.entity';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.APP_HOST,
        port: parseInt(process.env.APP_PORT, 10),
        username: process.env.APP_USER,
        password: process.env.APP_PASSWORD,
        database: process.env.APP_DATABASE,
        entities: [usuarios],
        synchronize: JSON.parse(process.env.SINCRONIZE),
      });

      return dataSource.initialize();
    },
  },
];
