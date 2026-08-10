import { Post, PrismaClient, Role, User } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

// 1. Khởi tạo Prisma Client với Driver Adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu tiến trình Seeding dữ liệu mẫu...');

  // 2. Dọn dẹp dữ liệu cũ (Xóa theo thứ tự ngược lại của FK)
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Đã xóa sạch dữ liệu cũ!');

  // 3. LEVEL 1: Tạo User Admin cố định & 10 Users ngẫu nhiên
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@socialchat.com',
      password: 'admin_hashed_password', // Mật khẩu mã hóa giả lập
      name: 'System Admin',
      role: Role.ADMIN,
      profile: {
        create: {
          bio: 'Tài khoản quản trị viên hệ thống Social Chat App',
          avatarUrl: faker.image.avatar(),
          location: 'Hà Nội, Việt Nam',
        },
      },
    },
  });

  const createdUsers: User[] = [adminUser];

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: 'user_hashed_password',
        name: faker.person.fullName(),
        role: Role.USER,
        profile: {
          create: {
            bio: faker.lorem.sentence(),
            avatarUrl: faker.image.avatar(),
            location: faker.location.city(),
          },
        },
      },
    });
    createdUsers.push(user);
  }

  console.log(`✅ Đã tạo ${createdUsers.length} Users kèm Profiles!`);

  // 4. LEVEL 2: Tạo 25 Bài viết (Posts) ngẫu nhiên cho các Users
  const createdPosts: Post[] = [];
  for (let i = 0; i < 25; i++) {
    const randomUser = faker.helpers.arrayElement(createdUsers);
    const post = await prisma.post.create({
      data: {
        title: faker.lorem.sentence({ min: 3, max: 8 }),
        content: faker.lorem.paragraphs(2),
        published: faker.datatype.boolean(0.8), // 80% cơ hội published = true
        authorId: randomUser.id,
      },
    });
    createdPosts.push(post);
  }

  console.log(`✅ Đã tạo ${createdPosts.length} Posts!`);

  // 5. LEVEL 3: Tạo 50 Bình luận (Comments) ngẫu nhiên
  for (let i = 0; i < 50; i++) {
    const randomUser = faker.helpers.arrayElement(createdUsers);
    const randomPost = faker.helpers.arrayElement(createdPosts);

    await prisma.comment.create({
      data: {
        content: faker.lorem.sentence(),
        postId: randomPost.id,
        authorId: randomUser.id,
      },
    });
  }

  console.log('✅ Đã tạo 50 Comments!');

  // 6. LEVEL 3: Tạo 20 Tin nhắn Direct Chat (Messages) giữa các Users
  for (let i = 0; i < 20; i++) {
    const sender = faker.helpers.arrayElement(createdUsers);
    let receiver = faker.helpers.arrayElement(createdUsers);

    // Đảm bảo người gửi và người nhận không trùng nhau
    while (receiver.id === sender.id) {
      receiver = faker.helpers.arrayElement(createdUsers);
    }

    await prisma.message.create({
      data: {
        content: faker.lorem.sentence(),
        isRead: faker.datatype.boolean(0.5),
        senderId: sender.id,
        receiverId: receiver.id,
      },
    });
  }

  console.log('✅ Đã tạo 20 Direct Messages!');
  console.log('🎉 Tiến trình Seeding hoàn tất thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
