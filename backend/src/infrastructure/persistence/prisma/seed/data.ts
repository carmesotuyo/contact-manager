type UserSeedData = {
  email: string;
  password: string;
};

export const seedUsers: UserSeedData[] = [
  {
    email: 'john.doe@example.com',
    password: 'password123',
  },
  {
    email: 'jane.smith@example.com',
    password: 'password123',
  },
  {
    email: 'admin@example.com',
    password: 'password123',
  },
];
