import dotenv from "dotenv";
dotenv.config({ path: "/opt/qr-restaurant/shared/.env.local" });

import net from "net";
import mysql from "mysql2/promise";

const DB = {
  host: "localhost",
  user: "qr_user",
  password: process.env.DB_PASSWORD,
  database: "qr_restaurant",
};

const PRINTER_PORT = 9100;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function sendToPrinter(ip, port, content) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(port, ip, () => {
      client.write(content + "\n\n\n");
      client.end();
      resolve();
    });
    client.on("error", reject);
  });
}

async function run() {
  const db = await mysql.createConnection(DB);

  while (true) {
    try {
      await db.beginTransaction();

      const [rows] = await db.execute(`
        SELECT j.id, j.payload_json, p.ip_address AS ip, p.port AS printer_port
        FROM print_jobs j
        JOIN printer_settings p ON p.id = 1 AND p.enabled = 1
        WHERE j.status = 'queued'
          AND (j.next_run_at IS NULL OR j.next_run_at <= NOW())
        ORDER BY j.id
        LIMIT 1
        FOR UPDATE
      `);

      if (rows.length === 0) {
        await db.commit();
        await sleep(1000);
        continue;
      }

      const job = rows[0];

      await db.execute(`UPDATE print_jobs SET status='printing' WHERE id=?`, [
        job.id,
      ]);
      await db.commit();

      const payload = JSON.parse(job.payload_json);

      await sendToPrinter(job.ip, job.printer_port, payload.content);

      await db.execute(`UPDATE print_jobs SET status='done' WHERE id=?`, [
        job.id,
      ]);
    } catch (err) {
      console.error(err);
      await db.rollback();

      await db.execute(
        `
        UPDATE print_jobs
        SET status='failed',
            attempts = attempts + 1,
            last_error = ?,
            next_run_at = DATE_ADD(NOW(), INTERVAL 10 SECOND)
        WHERE status='printing'
      `,
        [String(err)],
      );

      await sleep(2000);
    }
  }
}

run();
