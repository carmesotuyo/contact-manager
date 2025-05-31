"use client";

import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen p-page-padding">
      <div className="max-w-container mx-auto">
        <h1 className="text-welcome font-sans mb-section-gap">
          Welcome to <span className="text-primary">Contact Manager</span>
        </h1>
        <div className="bg-card-bg p-card-padding rounded-card">
          <h2 className="text-card-title mb-4">Getting Started</h2>
          <p className="text-body">
            Your modern contact management solution is ready to go!
          </p>
        </div>
      </div>
    </main>
  );
}
