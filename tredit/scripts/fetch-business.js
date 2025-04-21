const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const businessId = '1a0c84b5-746d-4ae6-b1a0-e4b5f3c554d7';
    
    // Fetch business with its YouTube connection
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        socialMediaConnections: {
          where: {
            platform: 'YOUTUBE'
          }
        }
      }
    });

    console.log('Business Details:');
    console.log(JSON.stringify(business, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 