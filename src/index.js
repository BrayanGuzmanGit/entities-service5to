const app = require('./server');
const env = require('./config/env.config');

app.listen(env.PORT, () => {
  console.log(`🚀 Entities Service corriendo en el puerto http://localhost:${env.PORT}`);
});