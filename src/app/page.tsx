import { setTimeout } from 'node:timers/promises';

// Ensure the page is always dynamic
export const dynamic = 'force-dynamic'; 

// Simulate slow data fetching (e.g., database query, API call)
async function getSlowData() {
  await setTimeout(1000);
  return { message: 'Data loaded' };
}

export default async function Home() {
  const data = await getSlowData();
  return (
    <div>
      <h1>Slow Page</h1>
      <p>{data.message}</p>
    </div>
  );
}
