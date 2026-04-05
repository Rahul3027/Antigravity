const fs = require('fs');
fetch("http://localhost:3000/api/auth/register", {
  method: "POST", headers: {"Content-Type":"application/json"},
  body: JSON.stringify({name:"test",email:"test2999@example.com",password:"pw"})
}).then(r => r.json()).then(t => {
  fs.writeFileSync('error_trace.json', JSON.stringify(t, null, 2));
});
