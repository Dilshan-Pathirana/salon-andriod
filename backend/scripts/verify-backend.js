async function run() {
  const health = await fetch('http://localhost:3000/api/health').then((res) => res.json());

  const login = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: '0712345678', password: 'admin12345' }),
  }).then((res) => res.json());

  const token = login?.data?.accessToken;
  const users = await fetch('http://localhost:3000/api/v1/users', {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());

  const output = {
    health: health.success,
    login: login.success,
    usersCount: users?.data?.length,
    users: (users?.data || []).map((user) => ({
      phoneNumber: user.phoneNumber,
      role: user.role,
    })),
  };

  console.log(JSON.stringify(output, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
