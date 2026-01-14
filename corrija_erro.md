Estou enfrentando um erro no backend usando Node.js + Express + Prisma + MongoDB.

❗ Erro apresentado
PrismaClientKnownRequestError (P2023):
Malformed ObjectID: provided hex string representation must be exactly 12 bytes,
instead got: "friends", length 7.


O erro ocorre nesta linha:

await prisma.user.findUnique({
  where: { id: targetUserId }
});


E a requisição que dispara o erro é:

GET /api/users/friends

📂 Código do controller (user.controller.ts)
export const getProfile = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        coverPhoto: true,
        bio: true,
        gender: true,
        birthDate: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            friendshipsAsUser: true,
            friendshipsAsFriend: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
};

🧬 Schema Prisma (MongoDB)
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  firstName String
  lastName  String
  email     String   @unique

  friendshipsAsUser   Friendship[] @relation("UserFriends")
  friendshipsAsFriend Friendship[] @relation("FriendOf")
}

model Friendship {
  id       String @id @default(auto()) @map("_id") @db.ObjectId
  userId   String @db.ObjectId
  friendId String @db.ObjectId

  user   User @relation("UserFriends", fields: [userId], references: [id])
  friend User @relation("FriendOf", fields: [friendId], references: [id])
}

🎯 O que eu preciso que você faça

Identifique a causa raiz do erro

Explique por que o Prisma está tentando usar "friends" como ObjectId

Aponte o problema na definição ou ordem das rotas do Express

Mostre a forma correta de declarar essas rotas

Sugira boas práticas para evitar esse erro no futuro, como:

ordem correta das rotas

rotas mais seguras (/me, /users/:id/friends)

validação de ObjectId antes do Prisma

Quero uma explicação detalhada, didática e técnica, como se estivesse revisando um backend de produção.