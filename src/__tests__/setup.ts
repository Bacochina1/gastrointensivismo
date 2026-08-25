import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock do contexto Cloudflare para testes no Vitest (Node environment)
vi.mock("server-only", () => ({}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => {
    throw new Error("No Cloudflare bindings in unit test runner");
  },
  initOpenNextCloudflareForDev: () => undefined,
}));
