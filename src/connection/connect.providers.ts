import { DataSource } from 'typeorm';

export const connectProviders = [
  {
    provide: 'CONNECT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource,
    inject: ['DATA_SOURCE'],
  },
];
