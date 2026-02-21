import { kv } from "@vercel/kv";

const WALLET = "9WEE5Sgpk9K1EmZbzxguU29LQRzwNx5umRiUNFQ2qSed";
const RPC_URL = "https://api.mainnet-beta.solana.com";
const TX_KEY = "fartwheel:transactions";
const SEEN_KEY = "fartwheel:seen";

async function rpcCall(method, params) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function pollSolana() {
  const newBuys = [];

  try {
    const sigs = await rpcCall("getSignaturesForAddress", [WALLET, { limit: 20 }]);

    // Get already-seen signatures from KV
    const seenRaw = await kv.smembers(SEEN_KEY);
    const seen = new Set(seenRaw || []);

    for (const s of sigs) {
      if (seen.has(s.signature)) continue;

      try {
        const txData = await rpcCall("getTransaction", [
          s.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]);

        if (!txData?.meta) {
          // Still mark as seen so we don't retry
          await kv.sadd(SEEN_KEY, s.signature);
          continue;
        }

        const meta = txData.meta;
        const keys = txData.transaction?.message?.accountKeys || [];
        const idx = keys.findIndex((k) => (k.pubkey || k) === WALLET);

        if (idx >= 0 && meta.preBalances && meta.postBalances) {
          const diff = (meta.preBalances[idx] - meta.postBalances[idx]) / 1e9;
          if (diff > 0.001) {
            const time = new Date(
              (txData.blockTime || Date.now() / 1000) * 1000
            ).toISOString();

            newBuys.push({
              sol: diff,
              sig: s.signature.slice(0, 16) + "...",
              fullSig: s.signature,
              time,
              blockTime: txData.blockTime || Math.floor(Date.now() / 1000),
            });
          }
        }

        // Mark signature as seen
        await kv.sadd(SEEN_KEY, s.signature);
      } catch (e) {
        // Mark as seen even on error to avoid infinite retries
        await kv.sadd(SEEN_KEY, s.signature);
      }
    }
  } catch (e) {
    console.error("Poll error:", e.message);
  }

  return newBuys;
}

export async function GET() {
  try {
    // Poll for new transactions
    const newBuys = await pollSolana();

    // Get existing transactions from KV
    const existing = (await kv.get(TX_KEY)) || [];

    // Merge new buys (avoid duplicates by fullSig)
    const existingSigs = new Set(existing.map((t) => t.fullSig));
    const merged = [...existing];

    for (const buy of newBuys) {
      if (!existingSigs.has(buy.fullSig)) {
        merged.push(buy);
      }
    }

    // Sort by blockTime descending (newest first)
    merged.sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0));

    // Keep last 200 transactions max
    const trimmed = merged.slice(0, 200);

    // Store back
    if (newBuys.length > 0) {
      await kv.set(TX_KEY, trimmed);
    }

    // Format time for display
    const formatted = trimmed.map((t) => ({
      sol: t.sol,
      sig: t.sig,
      time: new Date(t.time).toLocaleTimeString("en-US", { hour12: false }),
      blockTime: t.blockTime,
    }));

    return Response.json({ transactions: formatted });
  } catch (e) {
    console.error("API error:", e);
    return Response.json({ transactions: [], error: e.message }, { status: 500 });
  }
}
