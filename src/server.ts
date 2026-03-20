import app from "./app";

const PORT = 4000;

console.log("🚀 STARTING SERVER...");

app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ RUNNING ON", PORT);
});