import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class usuarios {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar' })
  usuario: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  nombreCompleto: string;

  @Column({ type: 'varchar' })
  nombres: string;

  @Column({ type: 'varchar' })
  paterno: string;

  @Column({ type: 'varchar' })
  materno: string;

  @Column({ type: 'varchar' })
  numeroDocumento: string;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'int' })
  celular: number;

  @Column({ type: 'varchar' })
  email: string;

  @Column({
    default: 1,
    type: 'tinyint',
    unsigned: true,
    comment: '0 = INACTIVO - 1 = ACTIVO',
  })
  estado: number;

  @Column({ type: 'int' })
  funcionarioIdCreate: number;

  @Column({ type: 'int' })
  funcionarioIdUpdate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
