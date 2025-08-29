// scripts/testStats.ts
import { getUserStats } from "@/lib/stats";

(async () => {
  console.log(await getUserStats("some-user-uuid"));
})();
