import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'bewave.app@gmail.com' },
    update: {},
    create: {
      name: 'Admin Bewave',
      email: 'bewave.app@gmail.com',
      passwordHash,
      role: 'admin',
      isActive: true,
    },
  })

  console.log(`Admin criado: ${admin.email} (id: ${admin.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
