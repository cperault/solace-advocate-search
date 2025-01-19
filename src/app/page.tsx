"use client";

import { AdvocateSearch } from "./components/Advocates/AdvocateSearch";

export default function Home() {
  return (
    <main className="advocate-search-container">
      <h1>Solace Advocates</h1>
      <AdvocateSearch />
    </main>
  );
}
