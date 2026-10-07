import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  createToken,
  hashToken,
  isValidToken,
  createLoginRequest,
  approveLogin,
  validSession,
  revokeSession,
  reserveEmailSlot,
  sameOrigin,
} from "../lib/auth-core.mjs";
const adminEmail = "owner@example.com";
test("Email approval: hashing, expiry, one use, session revocation, rate limits", async () => {
  const database = new PGlite();
  try {
    await database.exec(
      await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"),
    );
    const token = await createLoginRequest(database, adminEmail);
    assert(isValidToken(token));
    const stored = (await database.query("SELECT * FROM admin_login_requests"))
      .rows[0];
    assert.equal(stored.token_hash, hashToken(token));
    assert.notEqual(stored.token_hash, token);
    assert.equal(
      await approveLogin(database, token, "other@example.com"),
      null,
    );
    assert.equal(await approveLogin(database, "wrong", adminEmail), null);
    // 二 зэрэг хүсэлтээс нэг нь л session авна.
    const sessions = await Promise.all([
      approveLogin(database, token, adminEmail),
      approveLogin(database, token, adminEmail),
    ]);
    assert.equal(sessions.filter(Boolean).length, 1);
    const session = sessions.find(Boolean);
    assert.equal(await approveLogin(database, token, adminEmail), null);
    assert.equal(await validSession(database, session, adminEmail), true);
    assert.equal(
      await validSession(database, session, "other@example.com"),
      false,
    );
    assert.equal(
      await validSession(database, createToken(), adminEmail),
      false,
    );
    await revokeSession(database, session);
    assert.equal(await validSession(database, session, adminEmail), false);
    const expired = await createLoginRequest(database, adminEmail);
    await database.query(
      "UPDATE admin_login_requests SET expires_at=now()-interval '1 second'",
    );
    assert.equal(await approveLogin(database, expired, adminEmail), null);
    const fresh = await createLoginRequest(database, adminEmail);
    const expiredSession = await approveLogin(database, fresh, adminEmail);
    await database.query(
      "UPDATE admin_sessions SET expires_at=now()-interval '1 second'",
    );
    assert.equal(
      await validSession(database, expiredSession, adminEmail),
      false,
    );
    const reservations = await Promise.all([
      reserveEmailSlot(database, adminEmail),
      reserveEmailSlot(database, adminEmail),
    ]);
    assert.equal(reservations.filter(Boolean).length, 1);
    for (let index = 0; index < 4; index++) {
      await database.query(
        "UPDATE admin_email_limits SET last_sent_at=now()-interval '2 minutes'",
      );
      assert.equal(await reserveEmailSlot(database, adminEmail), true);
    }
    await database.query(
      "UPDATE admin_email_limits SET last_sent_at=now()-interval '2 minutes'",
    );
    assert.equal(await reserveEmailSlot(database, adminEmail), false);
    await database.query(
      "UPDATE admin_email_limits SET window_started_at=now()-interval '2 hours'",
    );
    assert.equal(await reserveEmailSlot(database, adminEmail), true);
  } finally {
    await database.close();
  }
});
test("Origin check rejects missing and foreign origins", () => {
  process.env.APP_URL = "https://portfolio.example.com";
  assert.equal(
    sameOrigin(
      new Request(process.env.APP_URL, {
        headers: { origin: process.env.APP_URL },
      }),
    ),
    true,
  );
  assert.equal(sameOrigin(new Request(process.env.APP_URL)), false);
  assert.equal(
    sameOrigin(
      new Request(process.env.APP_URL, {
        headers: { origin: "https://attacker.example.com" },
      }),
    ),
    false,
  );
});
