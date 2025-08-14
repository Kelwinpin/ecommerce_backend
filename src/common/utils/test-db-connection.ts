import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com o banco de dados...');
    
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    console.log('📊 Informações do banco:', result);
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Tabelas existentes:', tables);
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão encerrada');
  }
}

testConnection();