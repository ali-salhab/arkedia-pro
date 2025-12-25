require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const url = "http://localhost:5001/api/auth/login";
const body = { email: "super@arkedia.com", password: "Password123!" };

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})
  .then(async (res) => {
    console.log("status", res.status);
    const data = await res.json().catch(() => null);
    console.log("data", data);
  })
  .catch((err) => console.error(err));
