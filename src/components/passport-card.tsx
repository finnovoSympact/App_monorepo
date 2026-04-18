// Compact Sanad Passport summary card — used in bank leads + dashboard
// TODO §6: full passport page at /passport/[id]
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  passportId: string;
  smeId: string;
  score: number;
  pd12m: number;
  issuedAt: string;
  verified: boolean;
}

export function PassportCard({ passportId, smeId, score, pd12m, issuedAt, verified }: Props) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Sanad Passport</CardTitle>
          <Badge variant={verified ? "default" : "destructive"} className="text-xs">
            {verified ? "Verified" : "Invalid"}
          </Badge>
        </div>
        <p className="text-muted-foreground font-mono text-xs">{passportId}</p>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">SME</span>
          <span>{smeId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Score</span>
          <span className="font-semibold">{score}/1000</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">PD 12m</span>
          <span>{(pd12m * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Issued</span>
          <span>{new Date(issuedAt).toLocaleDateString("fr-TN")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
