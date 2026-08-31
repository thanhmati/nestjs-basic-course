"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../src/generated/prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const faker_1 = require("@faker-js/faker");
require("dotenv/config");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Bắt đầu tiến trình Seeding dữ liệu mẫu...');
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    console.log('🧹 Đã xóa sạch dữ liệu cũ!');
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@socialchat.com',
            password: 'admin_hashed_password',
            name: 'System Admin',
            role: client_1.Role.ADMIN,
            profile: {
                create: {
                    bio: 'Tài khoản quản trị viên hệ thống Social Chat App',
                    avatarUrl: faker_1.faker.image.avatar(),
                    location: 'Hà Nội, Việt Nam',
                },
            },
        },
    });
    const createdUsers = [adminUser];
    for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker_1.faker.internet.email().toLowerCase(),
                password: 'user_hashed_password',
                name: faker_1.faker.person.fullName(),
                role: client_1.Role.USER,
                profile: {
                    create: {
                        bio: faker_1.faker.lorem.sentence(),
                        avatarUrl: faker_1.faker.image.avatar(),
                        location: faker_1.faker.location.city(),
                    },
                },
            },
        });
        createdUsers.push(user);
    }
    console.log(`✅ Đã tạo ${createdUsers.length} Users kèm Profiles!`);
    const createdPosts = [];
    for (let i = 0; i < 25; i++) {
        const randomUser = faker_1.faker.helpers.arrayElement(createdUsers);
        const post = await prisma.post.create({
            data: {
                title: faker_1.faker.lorem.sentence({ min: 3, max: 8 }),
                content: faker_1.faker.lorem.paragraphs(2),
                published: faker_1.faker.datatype.boolean(0.8),
                authorId: randomUser.id,
            },
        });
        createdPosts.push(post);
    }
    console.log(`✅ Đã tạo ${createdPosts.length} Posts!`);
    for (let i = 0; i < 50; i++) {
        const randomUser = faker_1.faker.helpers.arrayElement(createdUsers);
        const randomPost = faker_1.faker.helpers.arrayElement(createdPosts);
        await prisma.comment.create({
            data: {
                content: faker_1.faker.lorem.sentence(),
                postId: randomPost.id,
                authorId: randomUser.id,
            },
        });
    }
    console.log('✅ Đã tạo 50 Comments!');
    for (let i = 0; i < 20; i++) {
        const sender = faker_1.faker.helpers.arrayElement(createdUsers);
        let receiver = faker_1.faker.helpers.arrayElement(createdUsers);
        while (receiver.id === sender.id) {
            receiver = faker_1.faker.helpers.arrayElement(createdUsers);
        }
        await prisma.message.create({
            data: {
                content: faker_1.faker.lorem.sentence(),
                isRead: faker_1.faker.datatype.boolean(0.5),
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
//# sourceMappingURL=seed.js.map