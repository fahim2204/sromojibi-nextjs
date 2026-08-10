"use client";

import { Card, CardBody as CardContent } from "@nextui-org/react";

interface AdPlaceholderProps {
  position: "top" | "bottom";
}

export default function AdPlaceholder({ position }: AdPlaceholderProps) {
  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <Card className="glass border border-gray-200 bg-white/70 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center text-gray-600">
            <div className="text-4xl mb-2">📢</div>
            <p className="text-sm font-medium">Advertisement Space</p>
            <p className="text-xs text-gray-400 mt-1">
              {position === "top" ? "Above Results" : "Below Insights"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
