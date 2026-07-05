const { createClient } = require('@libsql/client');

async function test() {
  try {
    const libsql = createClient({
      url: 'file:./dev.db',
    });
    console.log("LibSQL client created successfully");
    const result = await libsql.execute("SELECT 1");
    console.log("Query result:", result);
  } catch (e) {
    console.error("Failed:", e);
  }
}
test();
