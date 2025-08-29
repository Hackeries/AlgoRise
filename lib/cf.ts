// lib/cf.ts
export async function cfUserInfo(handle: string) {
  const url = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (data.status !== "OK" || !data.result?.[0]) {
    throw new Error("Codeforces user not found");
  }
  return data.result[0];
}

export async function cfUserStatus(handle: string) {
  const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error("Codeforces status error");
  }
  return data.result;
}
