import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCdfAzureSource1687351188874 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users',
      'source',
      new TableColumn({
        name: 'source',
        type: 'enum',
        enumName: 'source',
        enum: ['signup', 'invite', 'google', 'git', 'cdf_azure'],
        default: `'invite'`,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users',
      'source',
      new TableColumn({
        name: 'source',
        type: 'enum',
        enumName: 'source',
        enum: ['signup', 'invite', 'google', 'git'],
        default: `'invite'`,
        isNullable: false,
      })
    );
  }
}
