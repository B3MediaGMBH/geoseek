export interface FreeCheckRequest {
  companyName: string;
  website?: string;
  industry: string;
  city: string;
}

export interface PromptResult {
  prompt: string;
  response: string;
  mentioned: boolean;
  position: number | null; // 1, 2, 3 or null if not mentioned
  sentiment: "positiv" | "neutral" | "negativ";
  competitors: string[];
}

export interface FreeCheckResult {
  companyName: string;
  industry: string;
  city: string;
  overall_score: number;
  mention_rate: number;
  prompts: PromptResult[];
  competitors: { name: string; count: number }[];
  recommendations: string[];
  platform: string;
}
