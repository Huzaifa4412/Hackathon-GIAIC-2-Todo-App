const { execSync } = require('child_process');

const envVars = [
  {
    name: 'api-url',
    value: 'https://todo-api-backend.vercel.app',
    type: 'production'
  },
  {
    name: 'better-auth-url',
    value: 'https://hackathon2-todo-app.vercel.app',
    type: 'production'
  }
];

envVars.forEach(({ name, value, type }) => {
  try {
    console.log(`Setting ${name}...`);
    execSync(`echo "${value}" | vercel env add ${name} ${type}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`✓ Set ${name}`);
  } catch (error) {
    console.error(`✗ Failed to set ${name}:`, error.message);
  }
});
