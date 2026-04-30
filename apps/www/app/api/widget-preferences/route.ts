import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type WidgetPreferences = {
    enabled: boolean;
};

const DEFAULT_PREFERENCES: WidgetPreferences = {
    enabled: true,
};

function getPreferencesFilePath() {
    return path.join(os.homedir(), ".posturepad", "widget-preferences.json");
}

async function readPreferences(): Promise<WidgetPreferences> {
    try {
        const raw = await fs.readFile(getPreferencesFilePath(), "utf8");
        const parsed = JSON.parse(raw) as Partial<WidgetPreferences>;
        return {
            enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_PREFERENCES.enabled,
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

export async function GET() {
    const preferences = await readPreferences();
    return NextResponse.json(preferences);
}

export async function POST(request: Request) {
    const body = (await request.json().catch(() => null)) as Partial<WidgetPreferences> | null;

    if (typeof body?.enabled !== "boolean") {
        return NextResponse.json(
            { error: "Expected boolean 'enabled' field." },
            { status: 400 },
        );
    }

    const preferences: WidgetPreferences = {
        enabled: body.enabled,
    };

    const filePath = getPreferencesFilePath();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(preferences, null, 2)}\n`, "utf8");

    return NextResponse.json(preferences);
}
